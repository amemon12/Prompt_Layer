from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.claude import refine_prompt

router = APIRouter()


class RefineRequest(BaseModel):
    prompt: str


@router.post("/refine")
def refine(body: RefineRequest):
    try:
        refined = refine_prompt(body.prompt)
        return {"refined": refined}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
