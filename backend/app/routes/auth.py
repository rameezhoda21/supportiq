from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if uses exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # TODO: Hash password properly with passlib
    fake_hashed_pwd = f"hashed_{user_in.password}"
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=fake_hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    # MVP plain auth check (Replace with JWT + OAuth2PasswordRequestForm)
    user = db.query(User).filter(User.email == email).first()
    if not user or user.password_hash != f"hashed_{password}":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": user.id}
