import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
# assert os.getenv("OPEN_APi_KEY"), "Missing OPENAI_API_key"
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_score(frames, score):
  prompt = format_frames_for_prompt(frames, score)
  response = client.chat.completions.create(
    model="gpt-4",
    messages=[
      {"role": "system", "content": "You are a helpful assistant who summarizes bowling scores."},
      {"role": "user", "content": prompt}
    ],
    max_tokens=200,
  )
  return response.choices[0].message.content.replace("\n", " ").strip()

def format_frames_for_prompt(frames, final_score):
  lines = ["Ths player bowled 10 frames. Here are the details:\n"]

  for frame in frames:
    frame_num, rolls, cumulative = frame
    rolls_str = ", ".join(str(r) for r in rolls)
    label = "Final Score" if frame_num == 10 else f"score: {cumulative}"
    lines.append(f"Frame {frame_num}: rolls: [{rolls_str}], {label}")

  lines.append(f"\nOverall game score: {final_score}.")
  lines.append("Summarize the player's performance in a concise manner.Strike frames can earn more than 10 points due to bonus rolls. When summarizing, consider the actual frame score, not just the raw 10-pin value.")
  if len(frames) < 10:
    lines.append(f"\nNote: Only {len(frames)} frames were completed in this game.")

  
  return "\n".join(lines)