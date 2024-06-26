import asyncio

from typing import Annotated
from fastapi import Body, FastAPI
from qronos.db import create_db_and_tables
from pydantic import BaseModel
from sqlalchemy import engine_from_config
from sqlmodel import Session

from backend.python.qronos.db import SystemSetting, User, get_engine

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Yo!": "Mama!"}
 
class RunRequest(BaseModel):
    cpu_limit: float
    memory_limit: str
    image_name: str

@app.post("/run")
async def run_code(opts: Annotated[RunRequest | None, Body(embed=True)] = None):
    req = opts or RunRequest(cpu_limit=0.5, memory_limit="512m", image_name="hello-world:latest")
    process = await asyncio.create_subprocess_exec("docker", "run", "--rm", "--cpus", str(req.cpu_limit),
                                                   "--memory", req.memory_limit, req.image_name,
                                                   stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=10)
    except asyncio.TimeoutError:
        process.kill()
        stdout, stderr = await process.communicate()

    return {"stdout": stdout.decode(), "stderr": stderr.decode()}

@app.get("/users")
async def read_users():
    with Session(get_engine()) as session:
        users = session.exec(User).all()
        return {"users": users}
    
@app.get("/users/{user_id}")
async def read_user(user_id: int):
    with Session(get_engine()) as session:
        user = session.exec(User).get(user_id)
        return {"user": user}

@app.post("/user")
async def create_user(user: User):
    with Session(get_engine()) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"user": user}

@app.get("/settings")
async def read_settings():
    with Session(get_engine()) as session:
        settings = session.exec(SystemSetting).first()
        if settings:
            return {"settings": settings.value}

@app.put("/settings")
async def update_settings(settings: SystemSetting):
    with Session(get_engine()) as session:
        session.add(settings)
        session.commit()
        session.refresh(settings)
        return {"settings": settings.value}


if __name__ == "__main__":
    create_db_and_tables()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)