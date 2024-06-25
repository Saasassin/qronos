import logging
import os

from enum import Enum
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Env(str, Enum):
    dev = "dev"
    prod = "prod"

class Settings(BaseSettings):
    env: Env
    db_url: str
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

if os.getenv("ENV") == "prod":
    SETTINGS = Settings(_env_file=".env.prod", env=Env.prod)
else:
    env_path = "backend/python/.env"
    try:
        os.chdir(os.environ["BUILD_WORKSPACE_DIRECTORY"] + "/backend/python")
        env_path = ".env"
    except Exception as e:
        logging.warning("Could not change directory to backend/python", exc_info=e)
        logging.warning(f"fallback to default path: {env_path}")
    SETTINGS = Settings(_env_file=env_path, env=Env.dev)