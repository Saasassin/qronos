from datetime import datetime, timezone
from uuid import UUID
from sqlmodel import Field, SQLModel, Session, create_engine
from sqlalchemy.engine import Engine
from sqlalchemy import Column, StaticPool, String
from qronos.settings import SETTINGS, Env
from typing import Optional
import enum
from sqlmodel import SQLModel, Field, JSON, Enum, Column


class ScriptType(str, enum.Enum):
    """
    Enum for script type.
    API: An on-demand script deployed as an API. CANNOT be scheduled.
    RUNNABLE: A script that can be scheduled or run on-demand.
    """

    API = "API"
    RUNNABLE = "RUNNABLE"


class Script(SQLModel, table=True, extend_existing=True):
    __tablename__ = "script"
    __table_args__ = {"extend_existing": True}
    id: UUID = Field(default=None, primary_key=True)
    name: str = Field(sa_column=Column("name", String, unique=True, nullable=False))
    description: str = Field(nullable=True)
    script_type: ScriptType = Field(sa_column=Column(Enum(ScriptType), nullable=False))
    current_version_id: UUID = Field(default=None, foreign_key="script_version.id", nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


class ScriptSchedule(SQLModel, table=True, extend_existing=True):
    __tablename__ = "script_schedule"
    __table_args__ = {"extend_existing": True}
    id: UUID = Field(default=None, primary_key=True)
    script_id: UUID = Field(default=None, foreign_key="script.id", nullable=False)
    cron_expression: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


class ScriptVersion(SQLModel, table=True, extend_existing=True):
    __tablename__ = "script_version"
    __table_args__ = {"extend_existing": True}
    id: UUID = Field(default=None, primary_key=True)
    code_body: str
    script_id: UUID = Field(default=None, foreign_key="script.id", nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


class RunHistory(SQLModel, table=True, extend_existing=True):
    __tablename__ = "run_history"
    __table_args__ = {"extend_existing": True}
    id: UUID = Field(default=None, primary_key=True)
    script_id: UUID = Field(default=None, foreign_key="script.id", nullable=False)
    script_version_id: UUID = Field(default=None, foreign_key="script_version.id", nullable=False)
    stdout: str = Field(default=None, nullable=True)
    stderr: str = Field(default=None, nullable=True)
    started_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    finished_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc), nullable=True)
    total_run_time_in_seconds: float = Field(default=None, nullable=True)


class UserBase(SQLModel):
    email: str = Field(sa_column=Column("email", String, unique=True, nullable=False))
    password: str = Field(nullable=False)


class User(UserBase, table=True):
    __table_args__ = {"extend_existing": True}
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


class UserCreate(UserBase):
    pass


class UserPublic(UserBase):
    id: Optional[int]
    updated_at: datetime
    created_at: datetime


class SystemSetting(SQLModel, table=True):
    __tablename__ = "systemsetting"
    __table_args__ = {"extend_existing": True}
    id: int | None = Field(default=None, primary_key=True)
    date_format: str
    time_format: str
    local_timezone: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


_opts = {}
if SETTINGS.env != Env.prod:
    _opts["echo"] = True

if SETTINGS.env == Env.test:
    _opts["connect_args"] = {"check_same_thread": False}
    _opts["poolclass"] = StaticPool

engine = create_engine(SETTINGS.db_url, **_opts)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
