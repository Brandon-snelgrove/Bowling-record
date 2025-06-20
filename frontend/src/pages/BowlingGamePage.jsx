import React, { useState } from 'react';

export default function BowlingGamePage({ gameId, playerName }) {
  console.log('Game ID:', gameId);
  const [frameFirstRoll, setFrameFirstRoll] = useState(null);
  const [rolls, setRolls] = useState([]);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');

  function isGameOver(rolls) {
    let frame = 0;
    let i = 0;

    while (frame < 10 && i < rolls.length ) {
      if (frame < 9) {
          if (rolls[i] === 10) { // Strike
           i++;
         } else if (rolls[i] + rolls[i + 1] === 10) { // Spare
            i += 2;
          } else {
            i += 2; // Open frame
          }
        } else { // last frame
          const remaining = rolls.slice(i);
          if (remaining.length < 2) return false; // Not enough rolls for the last frame

          const[r1, r2, r3] = remaining;
          if (r1 === 10 || r2 + r3 === 10) { //strike in the last frame
            return remaining.length > 3;
          } else {
            return remaining.length >= 2;
          }
      }
      frame++;
    }
    return frame === 10 && i >= rolls.length; 
  }

  const roll = async ( pins ) => {
    if (isGameOver([...rolls, pins])) {
      setMessage('Game over! Cannot roll anymore.');
      return;
    }
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

      setRolls(prev => {
        const updated = [...prev, pins];

        //if the frame is complete, fetch score
        const frameComplete = ((frameFirstRoll === null && pins === 10) || frameFirstRoll != null);

        if (frameComplete) {
          fetchScore();
        }
        return updated;
      })

      setMessage(`Roll ${pins} pins!`);

      if (frameFirstRoll == null) {
        if(pins === 10) {
          //strike -> next frame
          setFrameFirstRoll(null);
        } else {
          setFrameFirstRoll(pins);
        }
      } else {
        //second roll -> reset for new frame
        setFrameFirstRoll(null);
      }

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

  const fetchSummary = async () => {
    try {
      const res = await fetch(`http://localhost:8000/games/${gameId}/summary`);
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setMessage('Failed to fetch summary.');
    }
  }

  return (
    <div className="bowling-game-page">
      <h1>Bowling Game</h1>
      <p>Game ID: {gameId}</p>
      <p>Player Name: {playerName}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center',gap: '10px', flexWrap: 'wrap', margin: '1rem 0', flexDirection: 'row'}}>
        {[...Array(11)].map((_, index) => {
          const disabled = 
            isGameOver(rolls) || (frameFirstRoll !== null && index + frameFirstRoll > 10);
          return (
            <button
              key={index}
              disabled={
                isGameOver(rolls) ||
                (frameFirstRoll !== null && index + frameFirstRoll > 10) // Prevent rolling more than 10 pins in a frame
              }
              onClick={() => roll(index)}
              style={{
                width: '40px',
                height: '40px',
                fontSize: '16px',
                textAlign: 'center',
                borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: disabled ? '#ccc' : '#007bff', // Green background
                color: disabled ? '#666' : '#fff', // White text
                border: 'none'
              }}
            >
              {index}
            </button>
          )

        })}

      </div>

      <button onClick={fetchScore}>Fetch Score</button>
      {score !== null && <p>Current Score: {score}</p>}
      <p>{message}</p>
      <button className='summary-button' onClick={fetchSummary}>Show Summary</button>
      {summary && <p className='summary-text' style={{ marginTop: '1rem' }}>{summary}</p>}
    </div>
  );
}