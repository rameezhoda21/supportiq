from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Business
from app.schemas import BusinessCreate, BusinessResponse

router = APIRouter(prefix="/business", tags=["Business"])

@router.post("/create", response_model=BusinessResponse)
def create_business(user_id: int, b_in: BusinessCreate, db: Session = Depends(get_db)):
    new_business = Business(
        user_id=user_id,
        business_name=b_in.business_name,
        business_slug=b_in.business_slug,
        website_url=b_in.website_url
    )
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    return new_business

@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(business_id: int, db: Session = Depends(get_db)):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")
    return b
