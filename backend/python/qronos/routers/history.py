from fastapi import APIRouter, Depends
from qronos.db import RunHistory, get_session
from sqlmodel import Session, select

router = APIRouter()


@router.get("/run_history", tags=["Run History Methods"], response_model=list[RunHistory])
async def read_run_history(skip: int = 0, limit: int = 10, session: Session = Depends(get_session)):
    statement = select(RunHistory).offset(skip).limit(limit)
    results = session.exec(statement)
    return results.all()


@router.get("/run_history/{script_id}", tags=["Run History Methods"], response_model=RunHistory | None)
async def read_run_history(script_id: str, session: Session = Depends(get_session)):
    return session.exec(select(RunHistory).where(RunHistory.script_id == script_id)).all()


@router.post("/run_history", tags=["Run History Methods"], response_model=RunHistory)
async def create_run_history(run_history: RunHistory, session: Session = Depends(get_session)):
    session.add(run_history)
    session.commit()
    session.refresh(run_history)
    return run_history
