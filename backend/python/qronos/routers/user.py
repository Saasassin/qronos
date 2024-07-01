
from sqlmodel import Session, select
from fastapi import APIRouter

from backend.python.qronos.db import User, UserCreate, UserPublic, get_engine

router = APIRouter()

@router.get("/users", tags=["User Methods"], response_model=list[UserPublic])
async def read_users():
    with Session(get_engine()) as session:
        users = session.exec(select(User)).all()
        return users
    
@router.get("/users/{user_id}", tags=["User Methods"],response_model=UserPublic | None)
async def read_user(user_id: int):
    with Session(get_engine()) as session:
        return session.exec(select(User).where(User.id == user_id)).first()

@router.post("/user", tags=["User Methods"],response_model=UserPublic)
async def create_user(user_create: UserCreate):
    with Session(get_engine()) as session:
        user = User.model_validate(user_create)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user