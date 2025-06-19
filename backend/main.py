from fastapi import, HTTPException
from sqlmodel import SQLModel, Session, create_engine
from app.models import Game
from app.game_logic import BowlingGame
from app.llm import summrize_score #if using LLM

app = FastAPI()
engine = create_engine("sqlite:///game.db")
SQLModel.metadata.create_all(engine)

@app.post("/games")
def create_game():
  game = Game(rolls="")
  with Session(engine) as session:
    session.add(game)
    session.commit()
    session.refresh(game)
  return {"game_id": game.id}

@app.post("/games/{game_id}/rolls")
def add_roll(game_id: str, pins: int):
  with Session(engine) as session:
    game = session.get(Game, game_id)
    if not game:
      raise HTTPException(status_code=404, detail="Game not found")
    try:
      game.add_roll(pins)
      session.add(game)
      session.commit()
      session.refresh(game)
    except ValueError as e:
      raise HTTPException(status_code=400, detail=str(e))
  return {"message": "Roll added"}

@app.get("/games/{game_id}/score")
def get_score(game_id: str):
  with Session(engine) as session:
    game = session.get(Game, game_id)
    if not game:
      raise HTTPException(status_code=404, detail="Game not found")
    logic = BowlingGame(game.get_rolls())
    return {"score": logic.score(), "frames": logic.get_frames()}

@app.get("/games/{game_id}/summary")
def summary(game_id: str):
  with Seesion(engine) as session:
    game = session.get(Game, game_id)
    if not game:
      raise HTTPException(status_code=404, detail="Game not found")
    logic = BowlingGame(game.get_rolls())
    return {
      "summary": summrize_score(logic.get_frames(), logic.score())
    }