import os
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# Ten moduł eksponuje obiekt `app` (ASGI) — uruchom serwer używając np.:
#   uvicorn main:app --host 0.0.0.0 --port 8000

app = FastAPI()

# 🔓 Włącz CORS, żeby frontend (np. localhost:5173) mógł się łączyć
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

# 📡 Prosty websocket echo
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    await ws.send_text("✅ Połączenie WebSocket nawiązane!")
    while True:
        data = await ws.receive_text()
        await ws.send_text(f"Echo: {data}")