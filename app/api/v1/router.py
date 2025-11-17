"""Main API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import accounts, types, users, reports, auth
from app.api.v1.endpoints.websocket import ws
# Create main API v1 router
api_router = APIRouter()

api_router.include_router(
    accounts.router,
    prefix="/accounts",
    tags=["👥 Accounts"]
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["📋 Reports"]
)

api_router.include_router(
    types.router,
    prefix="/types",
    tags=["🏷️ Types"]
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