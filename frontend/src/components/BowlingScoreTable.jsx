import React from 'react';
import Scorecard from '.';

const BowlingScoreTable = ({ rolls, score }) => {
  const frames = buildFrames(rolls);
  const frameScores = calculateFrameScores(rolls);

  return (
    <div className="bowling-board">
      <div className="frame-row">
        {frames.map((frame, index) => (
          <div key={index} className={`frame ${index === 9 ? 'last-frame' : ''}`}>
            <div className="rolls">
              {frame.map((r, i) => (
                <div key={i} className="roll">{r}</div>
              ))}
            </div>
            <div className="score">
              {frameScores[index] !== undefined ? frameScores[index] : ''}
            </div>
          </div>
        ))}
        <div className="total-score">
          <strong>{score ?? '-'}</strong>
        </div>
      </div>
    </div>
  );
};

export default BowlingScoreTable;

// Build array of 10 frames from flat roll list
function buildFrames(rolls) {
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

  // Frame 10
  const r1 = rolls[i] ?? '';
  const r2 = rolls[i + 1] ?? '';
  const r3 = rolls[i + 2] ?? '';
  frames.push([r1, r2, r3]);
  return frames;
}

// Calculate running frame scores (basic version)
function calculateFrameScores(rolls) {
  const scores = [];
  let total = 0;
  let i = 0;

  for (let frame = 0; frame < 10 && i < rolls.length; frame++) {
    if (rolls[i] === 10) { // strike
      const bonus = (rolls[i + 1] ?? 0) + (rolls[i + 2] ?? 0);
      total += 10 + bonus;
      scores.push(total);
      i += 1;
    } else {
      const first = rolls[i] ?? 0;
      const second = rolls[i + 1] ?? 0;
      const frameSum = first + second;
      if (frameSum === 10) { // spare
        total += 10 + (rolls[i + 2] ?? 0);
      } else {
        total += frameSum;
      }
      scores.push(total);
      i += 2;
    }
  }

  return scores;
}
