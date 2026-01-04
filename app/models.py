import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, List

from pydantic import BaseModel, Field, computed_field


class LogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.now)
    game_id: str
    source: str
    level: str = "INFO"
    message: str


class PuzzleStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SOLVED = "SOLVED"
    FAILED = "FAILED"
    SABOTAGED = "SABOTAGED"
    IDLE = "IDLE"


class Try(BaseModel):
    try_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_uid: str
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None
    outcome: PuzzleStatus = PuzzleStatus.IN_PROGRESS

    @computed_field
    def duration_seconds(self) -> Optional[int]:
        if not self.ended_at:
            return int((datetime.now() - self.started_at).total_seconds())
        return int((self.ended_at - self.started_at).total_seconds())


class Puzzle(BaseModel):
    display_name: str
    topic: str
    tries: List[Try] = Field(default_factory=list)

    @computed_field
    def status(self) -> PuzzleStatus:
        """
        Evalúa el estado actual del puzzle basándose EXCLUSIVAMENTE
        en el último intento realizado.
        """
        if not self.tries:
            return PuzzleStatus.IDLE

        return self.tries[-1].outcome


class Player(BaseModel):
    uid: str
    impostor: bool = False


class GameConfig(BaseModel):
    total_players: int
    total_impostors: int
    difficulty: str = "NORMAL"


class Game(BaseModel):
    game_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    config: GameConfig
    puzzles: Dict[str, Puzzle] = {}
    players: List[Player] = []

    @computed_field
    def duration_seconds(self) -> int:
        end = self.end_time if self.end_time else datetime.now()
        return int((end - self.start_time).total_seconds())

    def active(self) -> bool:
        return self.end_time is None