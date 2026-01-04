import json
import random
import string
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Body

from config import CMD_SUBTOPIC
from dependencies import mqtt_app, games_db, ws_manager
from models import Game, GameConfig, Puzzle, GameStatus, PuzzleStatus, Player
from mqtt import MQTTHandler, broadcast_game_state

router = APIRouter(prefix="/games", tags=["Games"])

@router.post("/lobby", response_model=Game)
async def create_lobby():
    """
    PASO 1: Abre la sala de espera.
    - Cierra juegos anteriores.
    - Pone puzzles en modo 'STARTING_GAME' (para que lean RFID).
    - Espera jugadores.
    """
    await games_db.update_many(
        {"status": {"$ne": GameStatus.ENDED}},
        {"$set": {"end_time": datetime.now(timezone.utc), "status": GameStatus.ENDED}}
    )

    puzzles = {
        "cortocircuito": Puzzle(
            display_name="Cortocircuito",
            topic="sala/puzzles/cortocircuito",
            status=PuzzleStatus.STARTING_GAME,
        ),
    }

    new_game = Game(
        config=GameConfig(total_players=0, total_impostors=0),
        puzzles=puzzles,
        players=[],
        status=GameStatus.LOBBY
    )

    await games_db.insert_one(new_game.to_mongo())
    await broadcast_game_state(new_game)
    MQTTHandler.command_all_puzzles(new_game, PuzzleStatus.STARTING_GAME)

    return new_game


@router.post("/start")
async def start_game(impostors_count: int = Body(..., embed=True)):
    """
    PASO 2: Inicia la partida real.
    - Asigna roles (impostores) aleatoriamente entre los jugadores registrados.
    - Pasa estado a RUNNING.
    - Activa puzzles.
    """
    game_data = await games_db.find_one({"status": "LOBBY"})
    if not game_data:
        raise HTTPException(status_code=400, detail="No LOBBY game found.")

    game = Game(**game_data)
    for p in game.players: p.impostor = False

    impostors = random.sample(game.players, k=impostors_count)
    for p in impostors:
        p.impostor = True

    game.config.total_players = len(game.players)
    game.config.total_impostors = impostors_count
    game.status = GameStatus.RUNNING
    game.start_time = datetime.now(timezone.utc)

    for p_key in game.puzzles:
        game.puzzles[p_key].status = PuzzleStatus.ACTIVE

    await games_db.replace_one({"_id": game_data["_id"]}, game.to_mongo())

    await broadcast_game_state(game)

    # Activar Hardware
    for puzzle in game.puzzles.values():
        mqtt_app.client.publish(f"{puzzle.topic}/{CMD_SUBTOPIC}", "IDLE")

    return game

@router.post("/cancel")
async def cancel_game():
    """Cancela el lobby o el juego actual"""
    game_data = await games_db.find_one({"status": {"$ne": GameStatus.ENDED}})
    if game_data:
        game = Game(**game_data)
        MQTTHandler.command_all_puzzles(game, "INACTIVE")

    games_db.delete_many({"status": "LOBBY"})

    await games_db.update_many(
        {"status": {"$ne": GameStatus.ENDED}},
        {"$set": {"end_time": datetime.now(timezone.utc), "status": GameStatus.ENDED}}
    )

    # Mandamos un evento especial al frontend para que limpie el estado
    await ws_manager.broadcast(json.dumps({
        "type": "GAME_CANCELLED",
        "payload": {}
    }))

    return {"message": "Game cancelled"}


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
        MQTTHandler.command_all_puzzles(game, "STATUS")

    return {"message": "Status requested"}


@router.post("/debug/add-player")
async def debug_add_player():
    """Simula el escaneo de una tarjeta RFID (Solo funciona en LOBBY)"""
    game_data = await games_db.find_one({"status": GameStatus.LOBBY})
    if not game_data:
        raise HTTPException(status_code=400, detail="No hay partida en Lobby")

    random_uid = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    new_player = Player(uid=random_uid)

    await games_db.update_one(
        {"_id": game_data["_id"]},
        {"$push": {"players": new_player.model_dump()}}
    )

    updated_game = await games_db.find_one({"_id": game_data["_id"]})
    await broadcast_game_state(Game(**updated_game))

    return {"message": "Player added", "uid": random_uid}


@router.post("/puzzles/{puzzle_key}/control")
async def control_puzzle(puzzle_key: str, action: str = Body(..., embed=True)):
    """
    Permite al GM forzar el estado de un puzzle.
    action puede ser: "ACTIVE", "SABOTAGED", "IDLE", "SOLVED"
    """
    game_data = await games_db.find_one({"status": {"$in": ["LOBBY", "RUNNING"]}})
    if not game_data:
        raise HTTPException(status_code=404, detail="No active game")

    game = Game(**game_data)

    if puzzle_key not in game.puzzles:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    target_status = PuzzleStatus(action)
    game.puzzles[puzzle_key].status = target_status

    await games_db.replace_one({"_id": game_data["_id"]}, game.to_mongo())
    await broadcast_game_state(game)
    MQTTHandler.command_all_puzzles(game, action)
    return {"message": f"Puzzle {puzzle_key} set to {action}"}