"""Account endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas import AccountCreate, AccountOut, AccountUpdate, AccountLogin, Token
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


@router.get(
    "/{email}",
    response_model=AccountOut,
    summary="Get account by email",
    description="Get account data by email address"
)
def get_account_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    """Get account by email."""
    account = AccountService.get_account_by_email(db, email)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{email}' not found"
        )
    return account


@router.get(
    "/",
    response_model=List[AccountOut],
    summary="Get all accounts",
    description="Get a list of all accounts (with pagination)"
)
def get_all_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all accounts with pagination."""
    accounts = AccountService.get_all_accounts(db, skip=skip, limit=limit)
    return accounts


@router.put(
    "/{email}",
    response_model=AccountOut,
    summary="Update account",
    description="Update account data"
)
def update_account(
    email: str,
    account_data: AccountUpdate,
    db: Session = Depends(get_db)
):
    """Update account data."""
    account = AccountService.update_account(db, email, account_data)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{email}' not found"
        )
    return account


@router.delete(
    "/{email}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete account",
    description="Delete user account"
)
def delete_account(
    email: str,
    db: Session = Depends(get_db)
):
    """Delete account."""
    success = AccountService.delete_account(db, email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{email}' not found"
        )
    return None
