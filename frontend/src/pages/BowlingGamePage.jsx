import React, { useState, useEffect} from 'react';
// import BowlingScoreTable from '../components/BowlingScoreTable';
import Scorecard from '../components';

export default function BowlingGamePage({ gameId, setGameId, playerName }) {
  console.log('Game ID:', gameId);
  const [frameFirstRoll, setFrameFirstRoll] = useState(null);
  const [rolls, setRolls] = useState([]);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [frames, setFrames] = useState([]);
  const [cumulativeScores, setCumulativeScores] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  


  useEffect(() => {
    const newFrames = convertToFrames(rolls);
    const newCumulative = calculateCumulativeScores(rolls);
    setFrames(newFrames);
    setCumulativeScores(newCumulative);
  }, [rolls]);
  

  function convertToFrames(rolls) {
    const frames = [];
    let i = 0;
  
    for (let frame = 0; frame < 9; frame++) {
      if (rolls[i] === 10) {
        frames.push(['X', '']);
        i += 1;
      } else {
        const first = rolls[i] ?? '';
        const second = rolls[i + 1] ?? '';
        if (first + second === 10) {
          frames.push([first, '/']);
        } else {
          frames.push([first, second]);
        }
        i += 2;
      }
    }
  
    let r1 = rolls[i] ?? '';
    let r2 = rolls[i + 1] ?? '';
    let r3 = rolls[i + 2] ?? '';

    // Strike logic
    const formattedR1 = r1 === 10 ? 'X' : r1;
    let formattedR2;
    if (r1 !== 10 && r1 + r2 === 10) {
      formattedR2 = '/';
    } else {
      formattedR2 = r2 === 10 ? 'X' : r2;
    }
    const formattedR3 = r3 === 10 ? 'X' : r3;

    frames.push([formattedR1, formattedR2, formattedR3]);

    
    return frames;
  }
  
  function calculateCumulativeScores(rolls) {
    const scores = [];
    let total = 0;
    let i = 0;
  
    for (let frame = 0; frame < 10 && i < rolls.length; frame++) {
      const r1 = rolls[i];
      const r2 = rolls[i + 1];
      const r3 = rolls[i + 2];
  
      // Frame 10 special case
      if (frame === 9) {
        if (rolls.length - i >= 2) {
          const sum = (r1 ?? 0) + (r2 ?? 0) + (r3 ?? 0);
          total += sum;
          scores.push(total);
        }
        break;
      }
  
      // Strike
      if (r1 === 10) {
        if (rolls.length > i + 2) {
          const bonus = (r2 ?? 0) + (r3 ?? 0);
          total += 10 + bonus;
          scores.push(total);
          i += 1;
        } else {
          break; // not enough rolls for bonus yet
        }
      }
  
      // Spare or open
      else if (r1 != null && r2 != null) {
        const frameSum = r1 + r2;
  
        if (frameSum === 10) {
          if (rolls.length > i + 2) {
            total += 10 + (r3 ?? 0);
            scores.push(total);
          } else {
            break; // not enough rolls for spare bonus
          }
        } else {
          total += frameSum;
          scores.push(total);
        }
  
        i += 2;
      } else {
        break; // incomplete frame
      }
    }
  
    return scores;
  }
  
  function isGameOver(rolls) {
    let frame = 0;
    let i = 0;
  
    // First 9 frames
    while (frame < 9 && i < rolls.length) {
      if (rolls[i] === 10) {
        i += 1;
      } else {
        i += 2;
      }
      frame++;
    }
  
    // 10th frame rules
    const tenth = rolls.slice(i);
    const [r1, r2, r3] = tenth;
  
    if (r1 == null || r2 == null) return false;
  
    const isStrikeOrSpare = r1 === 10 || r1 + r2 === 10;
    if (isStrikeOrSpare) {
      return tenth.length >= 3;
    } else {
      return tenth.length >= 2;
    }
  }
  
  function getCurrentFrameIndex(rolls) {
    let frame = 0;
    let i = 0;
  
    while (frame < 9 && i < rolls.length) {
      if (rolls[i] === 10) {
        i += 1;
      } else {
        i += 2;
      }
      frame++;
    }
  
    return frame;
  }
  

  function getFrame10RollIndex(rolls) {
    let frame = 0;
    let i = 0;
    while (frame < 9 && i < rolls.length) {
      if (rolls[i] === 10) {
        i += 1;
      } else {
        i += 2;
      }
      frame++;
    }
    // return how many rolls have happened in 10th frame so far
    return rolls.length - i;
  }
  

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

      setRolls(prev => {
        const updated = [...prev, pins];
      
        const currentFrame = getCurrentFrameIndex(updated);
      
        const frameComplete = (
          currentFrame < 9 &&
          ((frameFirstRoll === null && pins === 10) || frameFirstRoll != null)
        );
      
        if (frameComplete || currentFrame === 9) {
          setTimeout(fetchScore, 100);
        }
      
        // Handle frameFirstRoll logic only for frames 1–9
        if (currentFrame < 9) {
          if (frameFirstRoll == null) {
            if (pins === 10) {
              setFrameFirstRoll(null);
            } else {
              setFrameFirstRoll(pins);
            }
          } else {
            setFrameFirstRoll(null);
          }
        }
        
        if (isGameOver(updated)) {
          setTimeout(() => setMessage('Game over! Cannot roll anymore.'), 100);
        }
      
        return updated;
      });
      

      setMessage(`Roll ${pins} pins!`);

      const currentFrame = getCurrentFrameIndex([...rolls, pins]);

      if (currentFrame < 9) {
        if (frameFirstRoll == null) {
          if (pins === 10) {
            setFrameFirstRoll(null); // strike ends frame
          } else {
            setFrameFirstRoll(pins); // store first roll
          }
        } else {
          setFrameFirstRoll(null); // second roll ends frame
        }
      } else {
        // We're in the 10th frame — don't track frameFirstRoll anymore
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
    setLoadingSummary(true); // Start loading
    try {
      const res = await fetch(`http://localhost:8000/games/${gameId}/summary`);
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setMessage('Failed to fetch summary.');
    } finally {
      setLoadingSummary(false); // Stop loading
    }
  };
  

  const restartGame = async () => {
    try {
      const response = await fetch('http://localhost:8000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to start a new game');
      }
  
      const data = await response.json();
      setRolls([]);
      setScore(null);
      setMessage('');
      setSummary('');
      setFrames([]);
      setCumulativeScores([]);
      setFrameFirstRoll(null);
      setGameId(data.game_id);
    } catch (error) {
      console.error('Error restarting game:', error);
      setMessage('Failed to restart game.');
    }
  };


  return (
    <div className="bowling-game-page">
      <h1>🎳Bowling Game</h1>
      <Scorecard
        frames={frames}
        cumulativeScores={cumulativeScores}
        totalScore={score}
      />
      <p>Player Name: {playerName}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center',gap: '10px', flexWrap: 'wrap', margin: '1rem 0', flexDirection: 'row'}}>

      {[...Array(11)].map((_, index) => {
        const currentFrame = getFrame10RollIndex(rolls);
        const inTenthFrame = currentFrame === 9;
        const tenthFrameStartIndex = (() => {
          let frame = 0;
          let i = 0;
          while (frame < 9 && i < rolls.length) {
            if (rolls[i] === 10) i += 1;
            else i += 2;
            frame++;
          }
          return i;
        })();

        let disabled = isGameOver(rolls);

        if (!disabled) {
          if (!inTenthFrame) {
            if (frameFirstRoll !== null && index > 10 - frameFirstRoll) {
              disabled = true;
            }
          } else {
            // 10th frame logic
            const tenthFrameRolls = rolls.slice(tenthFrameStartIndex);
            const rollIndex = tenthFrameRolls.length;

            if (rollIndex === 1) {
              const r1 = tenthFrameRolls[0];
              if (r1 !== 10 && r1 + index > 10) {
                disabled = true; // prevent invalid second roll
              }
            }

            if (rollIndex === 2) {
              const r1 = tenthFrameRolls[0];
              const r2 = tenthFrameRolls[1];
              const isStrikeOrSpare = r1 === 10 || (r1 + r2 === 10);

              if (!isStrikeOrSpare) {
                disabled = true; // no third roll allowed if not strike/spare
              }
            }

            if (rollIndex >= 3) {
              disabled = true; // already completed 3 rolls
            }
          }
        }

        return (
          <button
            className='number-button'
            key={index}
            disabled={disabled}
            onClick={() => roll(index)}
            style={{
              width: '40px',
              height: '40px',
              fontSize: '16px',
              textAlign: 'center',
              borderRadius: '6px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: disabled ? '#ccc' : '#007bff',
              color: disabled ? '#666' : '#fff',
              border: 'none',
              margin: '2px'
            }}
          >
            {index}
          </button>
        );
      })}



      </div>
      <button
        className="summary-button"
        onClick={restartGame}
      >
        Restart Game
      </button>
      <div style={{ minHeight: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        <p style={{ margin: 0 }}>{message}</p>
      </div>

      <button
        className={`summary-button ${loadingSummary ? 'loading' : ''}`}
        onClick={fetchSummary}
        disabled={loadingSummary}
      >
        {loadingSummary ? 'Loading...' : 'Show Summary'}
      </button>

      <div style={{ minHeight: '100px', marginTop: '1rem' }}>
        {summary && (
          <p className='summary-text'>{summary}</p>
        )}
      </div>

    </div>
  );
}