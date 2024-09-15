import logging
import os
from enum import Enum

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Env(str, Enum):
    dev = "dev"
    prod = "prod"
    test = "test"


class Settings(BaseSettings):
    env: Env
    db_url: str
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


def attempt_chdir(env_path: str):
    try:
        os.chdir(
            os.path.join(
                os.environ["BUILD_WORKSPACE_DIRECTORY"], os.path.dirname(env_path)
            )
        )
        return os.path.basename(env_path)
    except Exception as e:
        logging.warning("Could not change directory to backend/python", exc_info=e)
        logging.warning(f"fallback to default path: {env_path}")

    if os.path.exists(env_path):
        return env_path
    if os.path.exists(os.path.basename(env_path)):
        return os.path.basename(env_path)

    return env_path


def rewrite_paths(settings: Settings):
    url = settings.db_url
    if url.startswith("sqlite"):
        settings.db_url = "sqlite:///" + os.path.join(
            os.environ["BUILD_WORKSPACE_DIRECTORY"],
            "backend/python",
            url.split("///")[1],
        )

    return settings


if os.getenv("ENV") == "prod":
    SETTINGS = Settings(_env_file="backend/python/.env.prod", env=Env.prod)
if os.getenv("ENV") == "test":
    SETTINGS = Settings(_env_file="backend/python/.env.test", env=Env.test)
else:
    SETTINGS = Settings(_env_file="backend/python/.env", env=Env.dev)

rewrite_paths(SETTINGS)
