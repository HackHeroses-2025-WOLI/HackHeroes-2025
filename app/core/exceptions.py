"""Custom exceptions for the application."""
from fastapi import HTTPException, status


class UserAlreadyExistsException(HTTPException):
    """Exception raised when trying to create a user that already exists."""
    def __init__(self, username: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with username '{username}' already exists"
        )


class InvalidCredentialsException(HTTPException):
    """Exception raised when login credentials are invalid."""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


class UserNotFoundException(HTTPException):
    """Exception raised when a user is not found."""
    def __init__(self, username: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{username}' not found"
        )
