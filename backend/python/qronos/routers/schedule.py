import uuid
from uuid import UUID
import sqlalchemy as sa
from sqlalchemy import func

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from qronos.db import Script, ScriptPublic, ScriptVersion, ScriptSchedule, get_session
from sqlmodel import Session, select

router = APIRouter()

@router.post("/schedule", tags=["Schedule Methods"], response_model=ScriptSchedule | None)
async def create_script_schedule(script_schedule: ScriptSchedule, session: Session = Depends(get_session)):
    """
    Save a cron expression to schedule a script.
    """
    script_schedule.id = uuid.uuid4()
    session.add(script_schedule)
    session.commit()
    session.refresh(script_schedule)
    return script_schedule

@router.put("/schedule/{script_id}", tags=["Schedule Methods"], response_model=ScriptSchedule | None)
async def update_script_schedule(script_schedule: ScriptSchedule, session: Session = Depends(get_session)):
    """
    Update the cron expression for a script schedule.
    """
    existing_schedule = session.exec(select(ScriptSchedule).where(ScriptSchedule.script_id == script_schedule.script_id )).first()
    existing_schedule.cron_expression = script_schedule.cron_expression
    session.commit()
    return existing_schedule

@router.delete("/schedule/{script_id}", tags=["Schedule Methods"], response_model=ScriptSchedule | None)
async def delete_script_schedule(script_id: str, session: Session = Depends(get_session)):
    """
    Delete a script schedule.
    """
    script_schedule = session.get(ScriptSchedule, uuid.UUID(script_id))
    session.delete(script_schedule)
    session.commit()
    return None
