import time
from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()
_start_time = time.time()


@router.get("/health")
def health():
    return {
        "status": "ok",
        "uptime": time.time() - _start_time,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
