from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

_prompts: list[dict] = []
_next_id = 1


class PromptRequest(BaseModel):
    prompt: str


@router.get("/prompts")
def list_prompts():
    return {"prompts": _prompts}


@router.post("/prompts")
def log_prompt(body: PromptRequest):
    global _next_id
    entry = {
        "id": _next_id,
        "prompt": body.prompt,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _prompts.append(entry)
    _next_id += 1
    return {"success": True, "id": entry["id"]}
