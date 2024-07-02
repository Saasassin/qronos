from fastapi import APIRouter, Depends
from qronos.db import User, UserCreate, UserPublic, get_session
from sqlmodel import Session, select

router = APIRouter()


@router.get("/users", tags=["User Methods"], response_model=list[UserPublic])
async def read_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users


@router.get("/users/{user_id}", tags=["User Methods"], response_model=UserPublic | None)
async def read_user(user_id: int, session: Session = Depends(get_session)):
    return session.exec(select(User).where(User.id == user_id)).first()


@router.post("/user", tags=["User Methods"], response_model=UserPublic)
async def create_user(user_create: UserCreate, session: Session = Depends(get_session)):
    user = User.model_validate(user_create)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
