import os
from dotenv import load_dotenv
import openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize_score(frames, score):
    prompt = f"Here is a bowling game: frames-{frames}, score={score}. Summarize the player's performance."
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant who summarizes bowling scores."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
    )
    return response.choices[0].message.content