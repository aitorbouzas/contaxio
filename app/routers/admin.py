from fastapi import APIRouter

from dependencies import games_db, definitions_db
from models import PuzzleDefinition

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/admin/init-puzzles")
async def init_puzzles_db():
    """Resetea la colección de definiciones de puzzles"""
    puzzles_data = [
        PuzzleDefinition(
            key="cortocircuito",
            display_name="Cortocircuito",
            topic="sala/puzzles/cortocircuito",
            connected=False  # Empieza desconectado por defecto
        ),
    ]

    await definitions_db.delete_many({})
    for p in puzzles_data:
        await definitions_db.insert_one(p.model_dump())

    return {"message": "Puzzles inicializados en DB", "count": len(puzzles_data)}
