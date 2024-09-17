import os

from fastapi import APIRouter, Depends, Request, Response
from qronos.db import Script, ScriptVersion, get_session
from runtime.deno import run_script
from sqlmodel import Session, select

router = APIRouter()

deno_path = os.path.realpath(os.environ["DENO_CLI_PATH"])

# TODO: PULL SCRIPT FROM DB
SCRIPT = """
export default async function handleRequest(request) {
  return {status: 200, body: "Hello, world!"};
}
"""


@router.api_route(
    "/scripts/{script_id}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"], tags=["Runtime Methods"]
)
async def proxy(request: Request, script_id: str, session: Session = Depends(get_session)):
    statement = (
        select(ScriptVersion)
        .join(Script, Script.id == ScriptVersion.script_id)
        .where(Script.id == script_id)
        .where(Script.current_version_id == ScriptVersion.id)
    )
    script_version = session.exec(statement).first()
    if script_version is None:
        return Response(content="Script not found", status_code=404)
    return await run_script(deno_path, script_version.code_body, request)
