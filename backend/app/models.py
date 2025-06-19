from sqlmodel import SQLModel, Field
from typing import List
from uuid import uuid4

class Game(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    rolls: str = ""

    def get_rolls(self) -> List[int]:
        return [int(r) for r in self.rolls.split(",")] if self.rolls else []

    def add_roll(self, pins: int):
        rolls = self.get_rolls()
        rolls.append(pins)
        self.rolls = ",".join(map(str, rolls))