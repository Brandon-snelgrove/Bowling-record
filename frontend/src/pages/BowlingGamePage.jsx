import React, { useState } from 'react';

export default function BowlingGamePage({ gameId, playerName }) {
  console.log('Game ID:', gameId);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState('');

  const roll = async ( pins ) => {
    try {
      const response = await fetch(`http://localhost:8000/games/${gameId}/rolls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pins: pins }),
      });
      if (!response.ok) {
        throw new Error('Failed to roll');
      }

      setMessage(`Roll ${pins} pins!`);
    } catch (error) {
      console.error('Error rolling:', error);
      setMessage('Failed to roll. Please try again.');
    }
  }

  const fetchScore = async () => {
    try {
      const res = await fetch(`http://localhost:8000/games/${gameId}/score`);
      const data = await res.json();
      setScore(data.score);
    } catch (error) {
      console.error('Error fetching score:', error);
      setMessage('Failed to fetch score. Please try again.');
    }
  }

  return (
    <div className="bowling-game-page">
      <h1>Bowling Game</h1>
      <p>Game ID: {gameId}</p>
      <p>Player Name: {playerName}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center',gap: '10px', flexWrap: 'wrap', margin: '1rem 0', flexDirection: 'row'}}>
        {[...Array(11)].map((_, index) => (
          <button
            key={index}
            onClick={() => roll(index)}
            style={{
              width: '40px',
              height: '40px',
              fontSize: '16px',
              textAlign: 'center',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {index}
          </button>
        ))}

      </div>

      <button onClick={fetchScore}>Fetch Score</button>
      {score !== null && <p>Current Score: {score}</p>}
      <p>{message}</p>
    </div>
  );
}