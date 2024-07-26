import uuid
from uuid import UUID
import sqlalchemy as sa

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from qronos.db import Script, ScriptVersion, get_session
from sqlmodel import Session, select

router = APIRouter()

class ScriptWithVersion(BaseModel):
    """
    A model that combines a Script and its current ScriptVersion.
    """
    script: Script
    script_version: ScriptVersion
   
@router.get("/scripts", tags=["Script Methods"], response_model=list[Script])
async def read_scripts(session: Session = Depends(get_session), skip: int = 0, limit: int = 25, sort: str = "id", order: str = "ASC"):

    statement = select(Script).offset(skip).limit(limit).order_by(sa.text(sort + " " + order))
    results = session.exec(statement)  
    return results.all()
 
@router.get("/scripts/{script_id}", tags=["Script Methods"], response_model=ScriptWithVersion)
async def read_script(script_id: str, session: Session = Depends(get_session)):
    """
    Fetches a script by its ID with the current ScriptVersion.
    """
    statement = select(Script, ScriptVersion).where(Script.id == script_id).join(ScriptVersion).where(ScriptVersion.id == Script.current_version_id)
    [script, script_version] = session.exec(statement).first()
    return ScriptWithVersion(script=script, script_version=script_version)

@router.post("/scripts", tags=["Script Methods"], response_model=ScriptWithVersion)
async def create_script(script: Script, script_version: ScriptVersion, session: Session = Depends(get_session)):
    """
    Creates a new script and a new version.
    """
    script.id = uuid.uuid4()

    script_version.id = uuid.uuid4()
    script.current_version_id = script_version.id
    script_version.script_id = script.id

    session.add(script)
    session.add(script_version)
    session.commit()
    session.refresh(script)

    return ScriptWithVersion(script=script, script_version=script_version)

@router.put("/scripts/{script_id}", tags=["Script Methods"], response_model=ScriptWithVersion | None)
async def update_script(
    script_id: str, script: Script, script_version: ScriptVersion, session: Session = Depends(get_session)
):
    """
    Updates an existing script. If the code is different, a new version is created.
    """
    existing_script = session.exec(select(Script).where(Script.id == script_id)).first()
    if existing_script:
        existing_script.script_name = script.script_name
        existing_script.script_type = script.script_type

        script_version.id = uuid.uuid4()
        script_version.script_id = script_id
        session.add(script_version)
        existing_script.current_version_id = script_version.id

        session.add(existing_script)
        session.commit()
        session.refresh(existing_script)

        return ScriptWithVersion(script=existing_script, script_version=script_version)
    return None


@router.delete("/scripts/{script_id}", tags=["Script Methods"], response_model=Script | None)
async def delete_script(script_id: str, session: Session = Depends(get_session)):
    """
    Deletes a script and all of its versions.
    """
    existing_script = session.exec(select(Script).where(Script.id == script_id)).first()
    if existing_script:
        #     statement = select(Script, ScriptVersion).where(Script.id == script_id).join(ScriptVersion).where(ScriptVersion.id == Script.current_version_id)
        statement = select(ScriptVersion).where(ScriptVersion.script_id == script_id)
        versions = session.exec(statement).all()
        for version in versions:
            session.delete(version)
        session.delete(existing_script)
        session.commit()
    return None


@router.get("/script_versions/{script_id}", tags=["Script Methods"], response_model=list[ScriptVersion])
async def read_script_versions(script_id: str, session: Session = Depends(get_session)):
    """
    Fetches all versions of a script by its ID.
    """
    return session.exec(select(ScriptVersion).where(ScriptVersion.script_id == script_id)).all()
