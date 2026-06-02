import hashlib
import os
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import PasswordResetToken, User
from app.schemas import (
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.security import hash_password, verify_password, create_access_token
from app.services.email_service import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Auth"])

PASSWORD_RESET_EXPIRE_MINUTES = 30
PASSWORD_RESET_MESSAGE = "If an account with that email exists, a password reset link has been sent."
INVALID_RESET_TOKEN_MESSAGE = "Invalid or expired password reset token."


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_password_reset_token(db: Session, user: User) -> str:
    raw_token = generate_reset_token()
    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_reset_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES),
    )
    db.add(reset_token)
    db.commit()
    return raw_token


def verify_password_reset_token(db: Session, token: str) -> PasswordResetToken | None:
    token_hash = hash_reset_token(token)
    reset_token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash)
        .first()
    )

    if not reset_token:
        return None
    if reset_token.used_at is not None:
        return None
    if reset_token.expires_at <= datetime.utcnow():
        return None

    return reset_token

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    hashed_pwd = hash_password(user_in.password)
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generate JWT Token payload
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer", 
        "user": user
    }


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()

    if user:
        raw_token = create_password_reset_token(db, user)
        frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
        reset_link = f"{frontend_base_url.rstrip('/')}/reset-password?token={raw_token}"
        print(f"Password reset link: {reset_link}")
        try:
            send_password_reset_email(user.email, reset_link)
        except Exception as exc:
            print(f"Password reset email was not sent: {exc}")

    return {"message": PASSWORD_RESET_MESSAGE}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    reset_token = verify_password_reset_token(db, request.token)
    if not reset_token:
        raise HTTPException(status_code=400, detail=INVALID_RESET_TOKEN_MESSAGE)

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail=INVALID_RESET_TOKEN_MESSAGE)

    user.password_hash = hash_password(request.new_password)
    reset_token.used_at = datetime.utcnow()
    db.commit()

    return {"message": "Password has been reset successfully."}
