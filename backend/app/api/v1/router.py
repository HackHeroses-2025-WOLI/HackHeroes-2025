"""Main API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, konta, zgloszenia, typy

# Create main API v1 router
api_router = APIRouter()

# Legacy authentication (for backwards compatibility)
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["🔐 Authentication (Legacy)"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["👤 Users (Legacy)"]
)

# New main endpoints
api_router.include_router(
    konta.router,
    prefix="/konta",
    tags=["👥 Konta (Accounts)"]
)

api_router.include_router(
    zgloszenia.router,
    prefix="/zgloszenia",
    tags=["📋 Zgłoszenia (Reports)"]
)

api_router.include_router(
    typy.router,
    prefix="/typy",
    tags=["🏷️ Typy (Types)"]
)
