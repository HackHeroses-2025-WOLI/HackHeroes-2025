"""Account service for business logic."""
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.db.models import Account
from app.schemas.account import (
    AccountCreate,
    AccountUpdate,
    AvailabilitySlot,
    deserialize_availability,
    is_active_now_from_slots,
    serialize_availability,
)
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import UserAlreadyExistsException, InvalidCredentialsException


@dataclass
class VolunteerActivity:
    """Activity snapshot for a single volunteer."""

    account: Account
    availability: List[AvailabilitySlot]
    manual_active: bool
    schedule_active: bool


class AccountService:
    """Service for account-related operations."""
    
    @staticmethod
    def _availability_to_json(
        schedule: Optional[List[AvailabilitySlot]],
        raw_json: Optional[str],
    ) -> Optional[str]:
        """Pick structured schedule if provided, otherwise raw JSON."""

        if schedule is not None:
            return serialize_availability(schedule)
        if raw_json is not None:
            return raw_json
        return "[]"

    @staticmethod
    def get_account_by_email(db: Session, email: str) -> Optional[Account]:
        """Get account by email."""
        return db.query(Account).filter(Account.email == email.lower()).first()
    
    @staticmethod
    def get_all_accounts(db: Session, skip: int = 0, limit: int = 100) -> List[Account]:
        """Get all accounts with pagination."""
        return db.query(Account).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_account(db: Session, account_data: AccountCreate) -> Account:
        """Create a new account."""
        # Check if account already exists
        existing_account = AccountService.get_account_by_email(db, account_data.email)
        if existing_account:
            raise UserAlreadyExistsException(account_data.email)
        
        # Hash password
        hashed_password = get_password_hash(account_data.password)
        
        # Create new account
        new_account = Account(
            email=account_data.email.lower(),
            full_name=account_data.full_name,
            phone=account_data.phone,
            password_hash=hashed_password,
            city=account_data.city,
            is_active=account_data.is_active,
            availability_json="[]",
            resolved_cases=0,
            resolved_cases_this_year=0
        )
        
        db.add(new_account)
        db.commit()
        db.refresh(new_account)
        
        return new_account
    
    @staticmethod
    def authenticate_account(db: Session, email: str, password: str) -> Account:
        """Authenticate an account with email and password."""
        account = AccountService.get_account_by_email(db, email)
        
        if not account:
            raise InvalidCredentialsException()
        
        if not verify_password(password, account.password_hash):
            raise InvalidCredentialsException()
        
        return account
    
    @staticmethod
    def update_account(db: Session, email: str, account_data: AccountUpdate) -> Optional[Account]:
        """Update account information."""
        account = AccountService.get_account_by_email(db, email)
        if not account:
            return None
        
        # Update fields if provided
        if account_data.full_name is not None:
            account.full_name = account_data.full_name
        if account_data.phone is not None:
            account.phone = account_data.phone
        if account_data.city is not None:
            account.city = account_data.city
        # Only allow updating availability via structured `availability` on the
        # update endpoint. Raw JSON is no longer accepted for updates.
        if account_data.availability is not None:
            account.availability_json = AccountService._availability_to_json(
                account_data.availability,
                None,
            )
        if account_data.password is not None:
            account.password_hash = get_password_hash(account_data.password)
        if account_data.is_active is not None:
            account.is_active = account_data.is_active
        
        db.commit()
        db.refresh(account)
        
        return account
    
    @staticmethod
    def delete_account(db: Session, email: str) -> bool:
        """Delete an account."""
        account = AccountService.get_account_by_email(db, email)
        if not account:
            return False
        
        db.delete(account)
        db.commit()
        return True
    
    @staticmethod
    def increment_resolved_cases(db: Session, email: str, year_only: bool = False) -> Optional[Account]:
        """Increment resolved cases counter."""
        account = AccountService.get_account_by_email(db, email)
        if not account:
            return None
        
        account.resolved_cases_this_year += 1
        if not year_only:
            account.resolved_cases += 1
        
        db.commit()
        db.refresh(account)
        return account

    @staticmethod
    def get_active_volunteers(
        db: Session,
        reference_dt: Optional[datetime] = None
    ) -> Tuple[List[VolunteerActivity], int, int]:
        """Return active volunteers along with counters.

        Returns:
            tuple[list[VolunteerActivity], manual_active_count, schedule_active_count]
        """

        moment = reference_dt or datetime.now()
        accounts = db.query(Account).all()
        active: List[VolunteerActivity] = []
        manual_count = 0
        schedule_count = 0
        for account in accounts:
            try:
                slots = deserialize_availability(account.availability_json)
            except ValueError:
                slots = []
            schedule_active = is_active_now_from_slots(slots, moment)
            manual_active = bool(account.is_active)
            if manual_active:
                manual_count += 1
            if schedule_active:
                schedule_count += 1
            if manual_active or schedule_active:
                active.append(
                    VolunteerActivity(
                        account=account,
                        availability=slots,
                        manual_active=manual_active,
                        schedule_active=schedule_active,
                    )
                )
        return active, manual_count, schedule_count
