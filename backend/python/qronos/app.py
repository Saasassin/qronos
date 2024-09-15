from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from qronos.routers import default, history, runner, runtime, schedule, script, settings, user

tags_metadata = [
    {"name": "Runner Methods"},
    {"name": "Schedule Methods"},
    {"name": "Script Methods"},
    {"name": "Run History Methods"},
    {"name": "User Methods"},
    {"name": "Settings Methods"},
    {"name": "Default Methods"},
]


def qronos_openapi_schema():
    openapi_schema = get_openapi(
        title="The Amazing Programming Language Info API",
        version="1.0",
        routes=app.routes,
    )
    openapi_schema["info"] = {
        "title": "Qronos REST API",
        "version": "1.0",
        "description": "REST API for the Qronos Script Execution Engine",
        #       "termsOfService": "",
        "contact": {"name": "Get Help with this API", "url": "https://github.com/Saasassin/qronos", "email": ""},
        "license": {"name": "AGPL v3", "url": "https://github.com/Saasassin/qronos/blob/master/LICENSE"},
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# TODO: this needs to be an EVN var or something?
origins = ["*"]

app = FastAPI(openapi_tags=tags_metadata)
app.include_router(script.router)
app.include_router(schedule.router)
app.include_router(runner.router)
app.include_router(history.router)
app.include_router(user.router)
app.include_router(settings.router)
app.include_router(default.router)
app.include_router(runtime.router, prefix="/runtime")

# TODO: We should disable this and reverse proxy through the UI's dev server.
#       That will match more closely with how we deploy and eliminate the need for CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.openapi = qronos_openapi_schema
