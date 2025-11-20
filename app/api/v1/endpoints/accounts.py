"""Account endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas import (
    AccountCreate,
    AccountOut,
    AccountUpdate,
    AccountLogin,
    ActiveVolunteerOut,
    Token,
)
from app.schemas.account import deserialize_availability
from app.services.account_service import AccountService
from app.core.security import create_access_token, get_current_account
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
    - **availability_type**: ID of availability type
    - **availability_json**: JSON with availability settings (optional)
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


# Endpoint removed: direct account lookup by email no longer exists


@router.get(
    "/volunteers/active",
    response_model=List[ActiveVolunteerOut],
    summary="Public: active volunteers",
    description="List volunteers that are currently active based on their availability"
)
def list_active_volunteers(db: Session = Depends(get_db)):
    """Return non-sensitive data for currently active volunteers."""

    volunteers = AccountService.get_active_volunteers(db)
    public_payload: List[ActiveVolunteerOut] = []
    for volunteer in volunteers:
        try:
            slots = deserialize_availability(volunteer.availability_json)
        except ValueError:
            slots = []
        public_payload.append(
            ActiveVolunteerOut(
                email=volunteer.email,
                full_name=volunteer.full_name,
                phone=volunteer.phone,
                city=volunteer.city,
                availability=slots,
                is_active_now=True,
            )
        )
    return public_payload


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
