"""Main API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import konta, typy, users, zgloszenia, auth
from app.api.v1.endpoints.websocket import ws
# Create main API v1 router
api_router = APIRouter()

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
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["🔐 Autoryzacja (Authorization)"]
)
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["👤 Users"]
    
)
api_router.include_router(
    ws.router,
    prefix="/ws",
    tags=["💬 WebSocket Chat"]
    
)