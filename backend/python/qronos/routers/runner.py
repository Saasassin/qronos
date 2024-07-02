import asyncio
from typing import Annotated

from fastapi import APIRouter, Body
from pydantic import BaseModel

router = APIRouter()


class RunRequest(BaseModel):
    cpu_limit: float
    memory_limit: str
    image_name: str


@router.post("/run", tags=["Runner Methods"], response_model=dict[str, str])
async def run_code(opts: Annotated[RunRequest | None, Body(embed=True)] = None):
    req = opts or RunRequest(cpu_limit=0.5, memory_limit="512m", image_name="hello-world:latest")
    process = await asyncio.create_subprocess_exec(
        "docker",
        "run",
        "--rm",
        "--cpus",
        str(req.cpu_limit),
        "--memory",
        req.memory_limit,
        req.image_name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=10)
    except asyncio.TimeoutError:
        process.kill()
        stdout, stderr = await process.communicate()

    return {"stdout": stdout.decode(), "stderr": stderr.decode()}
