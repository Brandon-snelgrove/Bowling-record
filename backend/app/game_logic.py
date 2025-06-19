class BowlingGame:
  def __init__(self, rolls=None):
    if rolls is None:
      self.rolls = []
    else:
      # try:
      #   self.rolls = [int(r) for r in rolls.split(',') if r.strip().isdigit()]
      # except Exception as e:
      #   raise ValueError(f"Invalid roll data: {rolls}") from e
      if isinstance(rolls, str):
        self.rolls = [int(r) for r in rolls.split(',') if r.strip().isdigit()]
      elif isinstance(rolls, list):
        self.rolls = [int(r) for r in rolls]
      else:
        raise ValueError("Rolls must be a comma-separated string or a list of intergers")

  def roll(self, pins):
    if pins < 0 or pins > 10:
      raise ValueError("Invalid pin count")
    self.rolls.append(pins)

  def calculate_score(self):
    score = 0
    i = 0

    for frame in range(10):
      # print(f"Frame {frame + 1}, Rolls: {self.rolls[i:i+3]}")
      if i >= len(self.rolls):
        break
      if self.rolls[i] == 10:
        #strike
        score += 10 + self._next_two(i)
        i += 1
      elif i+1 < len(self.rolls) and self.rolls[i] + self.rolls[i+1] == 10:
        # spare
        score += 10 + (self.rolls[i+2] if i+2 < len(self.rolls) else 0)
        i += 2
      else:
        # open frame
        score += self.rolls[i] + (self.rolls[i+1] if i+1 < len(self.rolls) else 0)
        i += 2
      # print(f"Score after frame {frame + 1}: {score}")
    return score

  def get_frames(self):
      frames = []
      i = 0
      for frame in range(10):
        if i >= len(self.rolls):
          break
        if self.rolls[i] == 10:
          frames.append([10])
          i += 1 
        elif i+1 < len(self.rolls):
          frames.append(self.rolls[i:i+2])
          i += 2
        else:
          frames.append([self.rolls[i]])
          i += 1
      #Add final bonus rolls if they exist
      if len(frames) == 10 and i < len(self.rolls):
        frames[-1].extend(self.rolls[i:])
      return frames  
      

  def _next_two(self, i):
    # Safely calculate the sum of the next two rolls
    return sum(self.rolls[i + 1:i + 3])