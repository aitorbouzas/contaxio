from pydantic import BaseModel

class GameCreateRequest(BaseModel):
    players: int
    impostors: int
