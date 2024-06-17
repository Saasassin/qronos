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
    SETTINGS = Settings(_env_file="backend/python/.env", env=Env.dev)