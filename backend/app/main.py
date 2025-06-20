from fastapi import HTTPException, FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session
from .models import Game
from .game_logic import BowlingGame
from .llm import summarize_score, format_frames_for_prompt#if using LLM
from sqlalchemy import create_engine

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

engine = create_engine(
  "sqlite:///backend/app/database.db",
  connect_args={"check_same_thread": False}
  )
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
    score = logic.calculate_score()
    summary = summarize_score(frames, score)
    return {
      "summary": summary
    }
    # print(format_frames_for_prompt(frames, score))