from datetime import datetime, timezone
from uuid import UUID
from sqlmodel import Field, SQLModel, create_engine
from sqlalchemy.engine import Engine
from qronos.settings import SETTINGS, Settings, Env


# class User(SQLModel, table=True):
#     id: UUID = Field(default=None, primary_key=True)
#     username: str
#     password: str
#     email: str
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
#     created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


# class SystemSettings(SQLModel, table=True):
#     id: Column(Integer, Sequence('setting_id_seq'), primary_key=True)
#     key: str
#     value: str
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
#     created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


class RunHistory(SQLModel, table=True):
    id: UUID = Field(default=None, primary_key=True)
    stdout: str = Field(default=None, nullable=True)
    stderr: str = Field(default=None, nullable=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


_opts = {}
if SETTINGS.env == Env.dev:
    _opts["echo"] = True

engine = create_engine(SETTINGS.db_url, **_opts)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
