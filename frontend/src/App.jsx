import React, { useState } from 'react';
import BowlingGamePage from './pages/BowlingGamePage';
import './App.css';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameId, setGameId] = useState(null);

  const startGame = async () => {
    if(playerName.trim() === '') {
      alert('Please enter a player name.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      const data = await response.json();
      console.log('Game started:', data);

      setGameId(data.game_id);
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  return (
    <div className="app">
      {!gameStarted ? (
        <div className="form-container">
          <h2>Create Bowling Game</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame}>Create Game</button>
        </div>
      ) : (
        <BowlingGamePage gameId={gameId} playerName={playerName} />
      )}
    </div>
  );
};

export default App;