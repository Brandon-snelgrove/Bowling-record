from fastapi import HTTPException, FastAPI, Body
from sqlmodel import SQLModel, Session, create_engine
from .models import Game
from .game_logic import BowlingGame
from .llm import summarize_score #if using LLM

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
def add_roll(game_id: str, pins: int = Body(..., embed=True)):
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
    try:
      # Assuming `BowlingGame` has a method to calculate the score
      bowling_game = BowlingGame(game.rolls)
      score = bowling_game.calculate_score()
      return {"game_id": game.id, "score": score}
    except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))

@app.get("/games/{game_id}/summary")
def summary(game_id: str):
  with Session(engine) as session:
    game = session.get(Game, game_id)
    if not game:
      raise HTTPException(status_code=404, detail="Game not found")
    logic = BowlingGame(game.get_rolls())
    frames = logic.get_frames()
    score = logic.score()
    summary = summarize_score(frames, score)
    return {
      "summary": summary
    }