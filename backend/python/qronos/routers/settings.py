
from sqlmodel import Session
from backend.python.qronos.db import SystemSetting, get_engine
from fastapi import APIRouter

router = APIRouter()

@router.get("/settings", tags=["Settings Methods"])
async def read_settings():
    with Session(get_engine()) as session:
        settings = session.exec(SystemSetting).first()
        if settings:
            return {"settings": settings.value}

@router.put("/settings", tags=["Settings Methods"])
async def update_settings(settings: SystemSetting):
    with Session(get_engine()) as session:
        session.add(settings)
        session.commit()
        session.refresh(settings)
        return {"settings": settings.value}