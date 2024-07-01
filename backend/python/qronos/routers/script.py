from sqlmodel import Session, select
from fastapi import APIRouter

from backend.python.qronos.db import RunHistory, Script, ScriptVersion, get_engine

router = APIRouter()

@router.get("/scripts", tags=["Script Methods"], response_model=list[Script])
async def read_scripts(skip: int = 0, limit: int = 10):
    with Session(get_engine()) as session:
        statement = select(Script).offset(skip).limit(limit)
        results = session.exec(statement)
        return results.all()
    
@router.get("/scripts/{script_id}", tags=["Script Methods"], response_model=Script | None)
async def read_script(script_id: str):
    '''
    Fetches a script by its ID.
    '''
    with Session(get_engine()) as session:
        return session.exec(select(Script).where(Script.id == script_id)).first()
    
@router.post("/script", tags=["Script Methods"], response_model=Script)
async def create_script(script: Script):
    '''
    Creates a new script and a new version.
    '''
    with Session(get_engine()) as session:
        session.add(script)
        # TODO: add versioning
        session.commit()
        session.refresh(script)
        return script
    
@router.put("/script/{script_id}", tags=["Script Methods"], response_model=Script | None)
async def update_script(script_id: str, script: Script):
    '''
    Updates an existing script. If the code is different, a new version is created.
    '''
    with Session(get_engine()) as session:
        existing_script = session.exec(select(Script).where(Script.id == script_id)).first()
        if existing_script:
            existing_script.name = script.name
            existing_script.code = script.code
            # TODO: add versioning
            session.add(existing_script)
            session.commit()
            session.refresh(existing_script)
            return existing_script
        return None
    
@router.delete("/script/{script_id}", tags=["Script Methods"], response_model=Script | None)
async def delete_script(script_id: str):
    '''
    Deletes a script and all of its versions.
    '''
    with Session(get_engine()) as session:
        existing_script = session.exec(select(Script).where(Script.id == script_id)).first()
        if existing_script:
            session.delete(existing_script)
            # TODO: delete versions
            session.commit()
            return existing_script
        return None

@router.get("/script_versions/{script_id}", tags=["Script Methods"], response_model=list[ScriptVersion])
async def read_script_versions(script_id: str):
    '''
    Fetches all versions of a script by its ID.
    '''
    with Session(get_engine()) as session:
        return session.exec(select(ScriptVersion).where(ScriptVersion.script_id == script_id)).all()

