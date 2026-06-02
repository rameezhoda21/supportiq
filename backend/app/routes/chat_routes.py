from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatRequest, ChatResponse, ChatLogResponse
from app.models import Business, ChatLog
from app.services.rag_service import ask_rag_pipeline
from app.services.chat_service import save_chat_log

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/ask", response_model=ChatResponse)
def ask_question(request: ChatRequest, db: Session = Depends(get_db)):
    # 1. Look up the business to verify it exists
    business = db.query(Business).filter(Business.id == request.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
        
    # Execute steps 1 through 7 inside the orchestrated rag_service pipeline 
    rag_result = ask_rag_pipeline(request.business_id, request.question, db)
    
    # 8. Save the chat log in PostgreSQL
    save_chat_log(
        db=db,
        business_id=business.id,
        question=request.question,
        answer=rag_result["answer"],
        score=rag_result["confidence_score"],
        was_answered=rag_result["was_answered"]
    )
    
    # Return formatted JSON
    return ChatResponse(
        answer=rag_result["answer"],
        confidence_score=rag_result["confidence_score"],
        sources=rag_result["sources"],
        was_answered=rag_result["was_answered"]
    )

@router.get("/logs/{business_id}", response_model=list[ChatLogResponse])
def get_chat_logs(business_id: int, db: Session = Depends(get_db)):
    logs = db.query(ChatLog).filter(ChatLog.business_id == business_id).order_by(ChatLog.created_at.desc()).all()
    return logs
