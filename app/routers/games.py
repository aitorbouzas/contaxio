import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException

from config import CMD_SUBTOPIC
from dependencies import mqtt_app, games_db, ws_manager
from models import Game, GameConfig, Puzzle
from mqtt import MQTTHandler
from schemas import GameCreateRequest

router = APIRouter(prefix="/games", tags=["Games"])


async def broadcast_game_state(game: Game):
    """Envía el estado completo del juego a todos los clientes conectados"""
    await ws_manager.broadcast(json.dumps({
        "type": "GAME_STATE_UPDATE",
        "payload": json.loads(game.model_dump_json())
    }))


@router.post("/create", response_model=Game)
async def create_game(request: GameCreateRequest):
    """
    1. Desactiva cualquier juego anterior.
    2. Crea uno nuevo con la configuración deseada.
    3. Inicializa los puzzles (Hardcoded por ahora).
    """

    await games_db.update_many(
        {"end_time": None},
        {"$set": {"end_time": datetime.now()}}
    )

    # TODO: Do not hardcode puzzles
    puzzles = {
        "cortocircuito": Puzzle(
            display_name="Cortocircuito",
            topic="sala/puzzles/cortocircuito"
        ),
    }
    new_game = Game(
        config=GameConfig(
            total_players=request.players,
            total_impostors=request.impostors
        ),
        puzzles=puzzles,
        players=[]
    )

    await games_db.insert_one(new_game.to_mongo())
    await broadcast_game_state(new_game)
    MQTTHandler.status_all_puzzles(new_game)
    return new_game


@router.post("/stop")
async def stop_game():
    """Busca el juego activo y lo termina."""
    active_game_data = await games_db.find_one({"end_time": None})

    if not active_game_data:
        raise HTTPException(status_code=404, detail="No active game found.")

    now = datetime.now()
    await games_db.update_one(
        {"_id": active_game_data["_id"]},
        {"$set": {"end_time": now}}
    )

    active_game_data["end_time"] = now
    game_obj = Game(**active_game_data)

    await broadcast_game_state(game_obj)

    game = Game(**active_game_data)
    MQTTHandler.deactivate_all_puzzles(game)
    return {"message": "Ended game", "game_id": game_obj.game_id}


@router.get("/current", response_model=Optional[Game])
async def get_current_game():
    """Endpoint para que el Frontend sepa el estado al cargar la página (F5)"""
    game_data = await games_db.find_one({"end_time": None})

    if not game_data:
        return None

    return Game(**game_data)


@router.post("/refresh-status")
async def request_devices_status():
    """
    Solicita a todos los dispositivos IoT de la partida que reporten su estado actual.
    """
    game_data = await games_db.find_one({"end_time": None})
    if game_data:
        game = Game(**game_data)
        MQTTHandler.status_all_puzzles(game)

    return {"message": "Status requested"}