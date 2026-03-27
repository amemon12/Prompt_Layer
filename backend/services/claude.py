import os
from pathlib import Path
import anthropic

_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

_system_prompt = (Path(__file__).parent.parent / "systemprompt.txt").read_text().strip()


def refine_prompt(prompt: str) -> str:
    message = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=_system_prompt,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
