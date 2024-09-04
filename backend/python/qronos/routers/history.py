from fastapi import APIRouter, Depends
from backend.python.qronos.routers.script import ScriptWithVersion
from qronos.db import RunHistory, Script, ScriptVersion, get_session
from sqlmodel import Session, select

router = APIRouter()

@router.get("/run_history", tags=["Run History Methods"], response_model=list[RunHistory])
async def read_run_history(skip: int = 0, limit: int = 10, session: Session = Depends(get_session)):
    statement = select(RunHistory).offset(skip).limit(limit)
    results = session.exec(statement)
    return results.all()

@router.get("/run_history/{script_id}", tags=["Run History Methods"], response_model=RunHistory | None)
async def read_run_history(script_id: str, session: Session = Depends(get_session)):
    statement = select(Script, ScriptVersion).where(Script.id == script_id).join(ScriptVersion).where(ScriptVersion.id == Script.current_version_id)
    [script, script_version] = session.exec(statement).first()
    script_with_version =  ScriptWithVersion(script=script, script_version=script_version)
    return session.exec(select(RunHistory).where(RunHistory.script_id == script_id and RunHistory.script_version_id == script_with_version.script_version.id)).all()

@router.get("/run_history/{script_id}/all", tags=["Run History Methods"], response_model=RunHistory | None)
async def read_run_history(script_id: str, session: Session = Depends(get_session)):
    return session.exec(select(RunHistory).where(RunHistory.script_id == script_id)).all()

@router.get("/run_history/{script_id}/{script_version_id}", tags=["Run History Methods"], response_model=RunHistory | None)
async def read_run_history(script_id: str, session: Session = Depends(get_session)):
    return session.exec(select(RunHistory).where(RunHistory.script_id == script_id and RunHistory.script_version_id == script_id)).all()

@router.post("/run_history", tags=["Run History Methods"], response_model=RunHistory)
async def create_run_history(run_history: RunHistory, session: Session = Depends(get_session)):
    session.add(run_history)
    session.commit()
    session.refresh(run_history)
    return run_history
