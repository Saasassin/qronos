import asyncio

from typing import Annotated
from fastapi import Body, FastAPI
from qronos.db import create_db_and_tables
from pydantic import BaseModel
from qronos.routers import user, settings, history, runner
from fastapi.openapi.utils import get_openapi

tags_metadata = [    
    {"name": "Runner Methods"},
    {"name": "Script Methods"},
    {"name": "Run History Methods"},    
    {"name": "User Methods"},
    {"name": "Settings Methods"},
]

def qronos_openapi_schema():
   openapi_schema = get_openapi(
       title="The Amazing Programming Language Info API",
       version="1.0",
       routes=app.routes,
   )
   openapi_schema["info"] = {
       "title" : "Qronos REST API",
       "version" : "1.0",
       "description" : "REST API for the Qronos Script Execution Engine",
#       "termsOfService": "",
       "contact": {
           "name": "Get Help with this API",
           "url": "https://github.com/Saasassin/qronos",
           "email": ""
       },
       "license": {
           "name": "AGPL v3",
           "url": "https://github.com/Saasassin/qronos/blob/master/LICENSE"
       }
   }
   app.openapi_schema = openapi_schema
   return app.openapi_schema

app = FastAPI(openapi_tags=tags_metadata)
app.include_router(user.router)
app.include_router(settings.router)
app.include_router(history.router)
app.include_router(runner.router)

app.openapi = qronos_openapi_schema

@app.get("/")
async def read_root():
    return {"Qronos Bot Says": "Welcome to Qronos!"}
 

if __name__ == "__main__":
    create_db_and_tables()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)