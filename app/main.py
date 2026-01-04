from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from dependencies import ws_manager, mqtt_app
from mqtt import register_mqtt_handlers
from routers import games

templates = Jinja2Templates(directory="templates")
app = FastAPI()
app.include_router(games.router)
register_mqtt_handlers()
mqtt_app.init_app(app)

@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)