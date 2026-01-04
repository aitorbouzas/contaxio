import json
from datetime import datetime

from fastapi import APIRouter, HTTPException

from dependencies import games_db, ws_manager
from models import Game, GameConfig, Puzzle
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

    await games_db.insert_one(new_game.model_dump(mode='json'))
    await broadcast_game_state(new_game)
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
    return {"message": "Ended game", "game_id": game_obj.game_id}


@router.get("/current", response_model=Game)
async def get_current_game():
    """Endpoint para que el Frontend sepa el estado al cargar la página (F5)"""
    game_data = await games_db.find_one({"end_time": None})

    if not game_data:
        raise HTTPException(status_code=404, detail="No active game found.")

    return Game(**game_data)
