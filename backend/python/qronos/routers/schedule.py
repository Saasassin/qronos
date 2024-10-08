import uuid

from fastapi import APIRouter, Depends
from qronos.db import ScriptSchedule, get_session
from sqlmodel import Session, select

router = APIRouter()


@router.get("/schedule/{script_id}", tags=["Schedule Methods"], response_model=ScriptSchedule | None)
async def get_script_schedule(script_id: str, session: Session = Depends(get_session)):
    """
    Get a script schedule by script ID.
    """
    return session.exec(select(ScriptSchedule).where(ScriptSchedule.script_id == script_id)).first()


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
    existing_schedule = session.exec(
        select(ScriptSchedule).where(ScriptSchedule.script_id == script_schedule.script_id)
    ).first()
    existing_schedule.cron_expression = script_schedule.cron_expression
    session.commit()
    return existing_schedule


@router.delete("/schedule/{script_id}", tags=["Schedule Methods"], response_model=ScriptSchedule | None)
async def delete_script_schedule(script_id: str, session: Session = Depends(get_session)):
    """
    Delete a script schedule.
    """
    existing_schedule = session.exec(select(ScriptSchedule).where(ScriptSchedule.script_id == script_id)).first()
    session.delete(existing_schedule)
    session.commit()
    return None
