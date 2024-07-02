from fastapi import APIRouter, Depends
from qronos.db import SystemSetting, get_session
from sqlmodel import Session

router = APIRouter()


@router.get("/settings", tags=["Settings Methods"])
async def read_settings(session: Session = Depends(get_session)):
    settings = session.exec(SystemSetting).first()
    if settings:
        return {"settings": settings.value}


@router.put("/settings", tags=["Settings Methods"])
async def update_settings(settings: SystemSetting, session: Session = Depends(get_session)):
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return {"settings": settings.value}
