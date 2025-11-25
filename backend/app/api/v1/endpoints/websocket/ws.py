from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .manager import manager

router = APIRouter()

@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"User: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("User disconnected")