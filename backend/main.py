import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # na hackathonie możesz zostawić *, potem zawęź
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend działa 🚀"}

# 📡 Manager połączeń
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    await manager.send_personal_message("✅ Połączenie WebSocket nawiązane!", ws)
    try:
        while True:
            data = await ws.receive_text()
            # Rozsyłamy do wszystkich klientów
            await manager.broadcast(f"📩 {data}")
    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast("⚠️ Jeden z klientów się rozłączył")
