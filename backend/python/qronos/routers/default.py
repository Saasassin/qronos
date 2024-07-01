
from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=["Default Methods"])
async def read_root():
    return {"Qronos Bot Says": "Welcome to Qronos!"}

@router.get("/health", tags=["Default Methods"])
async def health_check():
    # TODO
    return {"status": "OK"}
 