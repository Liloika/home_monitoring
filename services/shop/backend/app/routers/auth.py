from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import User
from ..auth import (hash_password, verify_password,
                    create_access_token, create_refresh_token,
                    decode_token, get_current_user)
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

def set_auth_cookies(response: Response, user: User):
    access = create_access_token({"sub": user.username, "email": user.email, "user_id": user.id})
    refresh = create_refresh_token({"sub": user.username})

    response.set_cookie(
        key="access_token", value=access,
        httponly=True,      # JS не может прочитать
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token", value=refresh,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 дней
        path="/api/auth/refresh",   # только для /refresh endpoint
    )
    return decode_token(access)  # вернём decoded для /debug/token

@router.post("/register", status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email уже используется")
    user = User(
        username=data.username, email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Аккаунт создан", "username": user.username}

@router.post("/login")
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    set_auth_cookies(response, user)
    return {"username": user.username}

@router.post("/refresh")
def refresh(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db)
):
    from jose import JWTError, jwt
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Нет refresh токена")
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Неверный тип токена")
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh токен истёк")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    set_auth_cookies(response, user)
    return {"username": user.username}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Выход выполнен"}

@router.get("/token-info")
def token_info(current_user: User = Depends(get_current_user)):
    """Только для разработки — возвращает decoded payload текущего токена."""
    from fastapi import Request
    return {"user": current_user.username, "email": current_user.email}
