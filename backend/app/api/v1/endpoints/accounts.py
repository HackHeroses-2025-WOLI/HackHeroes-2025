"""Account endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import (
    AccountCreate,
    AccountOut,
    AccountUpdate,
    AccountLogin,
    ActiveVolunteerOut,
    ActiveVolunteersResponse,
    Token,
)
from app.services.account_service import AccountService
from app.core.security import create_access_token, get_current_account
from app.core.logger import log_volunteer_login
from app.db.models import Account

router = APIRouter()


@router.post(
    "/register",
    response_model=AccountOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
    description="Create a new user account with email as the login"
)
def register_account(
    account_data: AccountCreate,
    db: Session = Depends(get_db)
):
    """Register a new account.

    - **email**: email (used as login)
    - **password**: strong password (min 8 characters, letters + digits)
    - **full_name**: name and surname
    - **phone**: 9-digit phone number (optional)
    - **city**: city (optional)
    """
    account = AccountService.create_account(db, account_data)
    return account


@router.post(
    "/login",
    response_model=Token,
    summary="Login",
    description="Login using your mail and password"
)
def login_account(
    login_data: AccountLogin,
    db: Session = Depends(get_db)
):
    """Login and receive a JWT token.
    - **email**: your email
    - **password**: your password
    """
    account = AccountService.authenticate_account(
        db, 
        login_data.email, 
        login_data.password
    )
    
    
    log_volunteer_login(account.email)
    
    access_token = create_access_token(data={"sub": account.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=AccountOut,
    summary="Get your account",
    description="Get your account data (requires authorization)"
)
def get_my_account(
    current_account: Account = Depends(get_current_account)
):
    """Return the account associated with the access token."""
    return current_account



@router.get(
    "/volunteers/active",
    response_model=ActiveVolunteersResponse,
    summary="Public: active volunteers",
    description="List volunteers that are currently active manually or via their schedule"
)
def list_active_volunteers(db: Session = Depends(get_db)):
    """Return non-sensitive data for currently active volunteers."""

    volunteer_snapshots, manual_count, schedule_count = AccountService.get_active_volunteers(db)
    public_payload: list[ActiveVolunteerOut] = []
    for snapshot in volunteer_snapshots:
        account = snapshot.account
        public_payload.append(
            ActiveVolunteerOut(
                email=account.email,
                full_name=account.full_name,
                phone=account.phone,
                city=account.city,
                availability=snapshot.availability,
                is_active=snapshot.manual_active,
                schedule_active_now=snapshot.schedule_active,
                is_active_now=snapshot.manual_active or snapshot.schedule_active,
            )
        )
    return ActiveVolunteersResponse(
        total_manual_active=manual_count,
        total_scheduled_active=schedule_count,
        volunteers=public_payload,
    )


@router.put(
    "/me",
    response_model=AccountOut,
    summary="Update account",
    description="Update account data"
)
def update_account(
    account_data: AccountUpdate,
    current_account: Account = Depends(get_current_account),
    db: Session = Depends(get_db)
):
    """Update account data."""
    account = AccountService.update_account(db, current_account.email, account_data)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{current_account.email}' not found"
        )
    return account


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete my account",
    description="Delete the account associated with the provided token"
)
def delete_my_account(
    current_account: Account = Depends(get_current_account),
    db: Session = Depends(get_db)
):
    """Delete the account identified by the access token."""

    success = AccountService.delete_account(db, current_account.email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{current_account.email}' not found"
        )
    return None
