"""Security utilities for authentication and password hashing."""
from datetime import datetime, timedelta, timezone
import hashlib
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings, get_secret_key
from app.db.database import get_db
from app.db.models import Account, User

# Bcrypt accepts up to 72 bytes; longer passwords are pre-hashed to stay compatible
_BCRYPT_MAX_BYTES = 72

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/accounts/login")


def _prepare_password(password: str) -> bytes:
    """Encode password and keep it within bcrypt limits."""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) <= _BCRYPT_MAX_BYTES:
        return password_bytes
    # Pre-hash long passwords to avoid silent truncation
    return hashlib.sha256(password_bytes).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return bcrypt.checkpw(_prepare_password(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password."""
    hashed = bcrypt.hashpw(_prepare_password(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=settings.ALGORITHM)

    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """Decode and validate JWT token, return username if valid."""
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        return username
    except JWTError:
        return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = decode_access_token(token)
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current active user (can be extended with is_active check)."""
    # You can add is_active field to User model and check here
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_account(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
)-> Account:
    """Retrieve Account based on the bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    email = decode_access_token(token)
    if email is None:
        raise credentials_exception

    account = db.query(Account).filter(Account.email == email).first()
    if account is None:
        raise credentials_exception

    return account
