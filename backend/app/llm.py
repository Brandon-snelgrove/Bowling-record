import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
# assert os.getenv("OPEN_APi_KEY"), "Missing OPENAI_API_key"
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_score(frames, score):
  prompt = f"Here is a bowling game: frames-{frames}, score={score}. Summarize the player's performance."
  response = client.chat.completions.create(
    model="gpt-4",
    messages=[
      {"role": "system", "content": "You are a helpful assistant who summarizes bowling scores."},
      {"role": "user", "content": prompt}
    ],
    max_tokens=100,
  )
  return response.choices[0].message.content.replace("\n", " ").strip()