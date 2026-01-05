from typing import List
from fastapi import APIRouter
from dependencies import definitions_db, games_db
from models import PuzzleDefinition

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/puzzles", response_model=List[PuzzleDefinition])
async def get_all_puzzles():
    """Devuelve la lista de configuración de puzzles"""
    cursor = definitions_db.find({})
    puzzles = []
    async for p in cursor:
        puzzles.append(PuzzleDefinition(**p))
    return puzzles


@router.post("/init-puzzles")
async def init_puzzles_db():
    """Resetea la colección de definiciones de puzzles (FACTORY RESET)"""
    puzzles_data = [
        PuzzleDefinition(
            key="cortocircuito",
            display_name="Cortocircuito",
            topic="sala/puzzles/cortocircuito",
            description="Puzzle de conectar cables y activar flujo.",
            connected=False
        ),
    ]

    await definitions_db.delete_many({})
    for p in puzzles_data:
        await definitions_db.insert_one(p.model_dump())

    return {"message": "Puzzles inicializados en DB", "count": len(puzzles_data)}
