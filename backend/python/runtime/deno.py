import json
import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import APIRouter, Request, Response

router = APIRouter()


async def run_script(deno_path: str, script: str, request: Request) -> Response:
    # Serialize the incoming request
    method = request.method
    headers = dict(request.headers)
    url = str(request.url)
    body = await request.body()

    request_data = {
        "method": method,
        "headers": headers,
        "url": url,
        # TODO: This is bad, the body should be treated as opaque bytes
        "body": body.decode("utf-8") if body else None,
    }

    # Also sucks, would be nice to serialize as binary, maybe could look into protobuf/msgpack or something.
    request_json = json.dumps(request_data)

    with tempfile.TemporaryDirectory() as dir:
        shutil.copy("backend/python/runtime/bootstrap.mts", dir)
        Path(os.path.join(dir, "script.ts")).write_text(script)

        command = [
            deno_path,
            "run",
            "--deny-net",
            "bootstrap.mts",
        ]

        try:
            result = subprocess.run(
                command,
                input=request_json.encode("utf-8"),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
                cwd=dir,
            )
        except subprocess.CalledProcessError as e:
            return Response(content=f"Error executing user script: {e.stderr.decode('utf-8')}", status_code=500)

        # Parse the response from Deno
        stdout_lines = result.stdout.decode("utf-8").strip().split("\n")
        stderr = result.stderr.decode("utf-8").strip()

        response_data = {}
        user_prints = []

        for line in stdout_lines:
            try:
                response_data = json.loads(line)
                break
            except json.JSONDecodeError as e:
                user_prints.append(line)

        for line in user_prints:
            logging.info("Script output " + line)

        if stderr:
            logging.warning("Error executing user script")

        # Construct the HTTP response
        status = response_data.get("status", 200)
        headers = response_data.get("headers", {})
        # Also should not be assumed to be string
        body = response_data.get("body", "")

        return Response(content=body, status_code=status, headers=headers)
