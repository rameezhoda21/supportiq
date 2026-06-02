import os
from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business, ChatLog, Document, User
from app.schemas import AdminBusinessResponse, AdminStatsResponse, MessageResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(x_admin_key: str | None = Header(default=None, alias="X-Admin-Key")):
    admin_key = os.getenv("ADMIN_API_KEY", "dev-admin-key")
    if not x_admin_key or x_admin_key != admin_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin API key.",
        )


@router.get("/health/database", response_model=MessageResponse)
def database_health(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    db.execute(text("SELECT 1"))
    return {"message": "Database connection is healthy."}


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    return {
        "total_users": db.query(User).count(),
        "total_businesses": db.query(Business).count(),
        "total_documents": db.query(Document).count(),
        "total_chats": db.query(ChatLog).count(),
    }


@router.get("/businesses", response_model=List[AdminBusinessResponse])
def list_registered_businesses(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    rows = (
        db.query(
            Business.id,
            Business.user_id,
            User.name.label("owner_name"),
            User.email.label("owner_email"),
            Business.business_name,
            Business.business_slug,
            Business.website_url,
            Business.created_at,
            func.count(func.distinct(Document.id)).label("document_count"),
            func.count(func.distinct(ChatLog.id)).label("chat_count"),
        )
        .join(User, User.id == Business.user_id)
        .outerjoin(Document, Document.business_id == Business.id)
        .outerjoin(ChatLog, ChatLog.business_id == Business.id)
        .group_by(
            Business.id,
            Business.user_id,
            User.id,
            User.name,
            User.email,
            Business.business_name,
            Business.business_slug,
            Business.website_url,
            Business.created_at,
        )
        .order_by(Business.created_at.desc())
        .all()
    )

    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "owner_name": row.owner_name,
            "owner_email": row.owner_email,
            "business_name": row.business_name,
            "business_slug": row.business_slug,
            "website_url": row.website_url,
            "document_count": row.document_count,
            "chat_count": row.chat_count,
            "created_at": row.created_at,
        }
        for row in rows
    ]
