import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, List, Any

from pydantic import BaseModel, Field, computed_field

class GameStatus(str, Enum):
    LOBBY = "LOBBY"
    RUNNING = "RUNNING"
    ENDED = "ENDED"

class LogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    game_id: str
    source: str
    level: str = "INFO"
    message: str


class PuzzleStatus(str, Enum):
    INACTIVE = "INACTIVE"
    STARTING_GAME = "STARTING_GAME"
    IDLE = "IDLE"
    ACTIVE = "ACTIVE"
    SOLVED = "SOLVED"
    SABOTAGED = "SABOTAGED"


class Try(BaseModel):
    try_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_uid: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    outcome: PuzzleStatus = PuzzleStatus.ACTIVE

    @computed_field
    def duration_seconds(self) -> Optional[int]:
        now = datetime.now(timezone.utc)
        start = self.started_at if self.started_at.tzinfo else self.started_at.replace(tzinfo=timezone.utc)

        if not self.ended_at:
            return int((now - start).total_seconds())

        end = self.ended_at if self.ended_at.tzinfo else self.ended_at.replace(tzinfo=timezone.utc)
        return int((end - start).total_seconds())


class Puzzle(BaseModel):
    display_name: str
    topic: str
    tries: List[Try] = Field(default_factory=list)
    status: PuzzleStatus = PuzzleStatus.INACTIVE

class Player(BaseModel):
    uid: str
    impostor: bool = False
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GameConfig(BaseModel):
    total_players: int = 0
    total_impostors: int
    difficulty: str = "NORMAL"


class Game(BaseModel):
    game_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    config: GameConfig
    puzzles: Dict[str, Puzzle] = {}
    players: List[Player] = []
    status: GameStatus = GameStatus.LOBBY

    @computed_field
    def duration_seconds(self) -> int:
        now = datetime.now(timezone.utc)
        start = self.start_time if self.start_time.tzinfo else self.start_time.replace(tzinfo=timezone.utc)

        end = self.end_time
        if end:
            end = end if end.tzinfo else end.replace(tzinfo=timezone.utc)
        else:
            end = now

        return int((end - start).total_seconds())

    @computed_field
    def active(self) -> bool:
        return self.end_time is None

    def to_mongo(self) -> dict:
        """
        Prepara el objeto para ser guardado en MongoDB.
        Elimina campos calculados para evitar redundancia y suciedad en la DB.
        """
        return self.model_dump(
            mode='json',
            exclude={
                "duration_seconds": True,
                "active": True,
                "puzzles": {
                    "__all__": {
                        "tries": {
                            "__all__": {
                                "duration_seconds": True
                            }
                        }
                    }
                }
            }
        )
