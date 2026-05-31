from sqlalchemy.orm import Session
from app.models import ChatLog

def save_chat_log(db: Session, business_id: int, question: str, answer: str, score: float, was_answered: bool) -> ChatLog:
    """
    Step 8: Save the chat log in PostgreSQL.
    """
    chat_log = ChatLog(
        business_id=business_id,
        customer_question=question,
        ai_answer=answer,
        confidence_score=score,
        was_answered=was_answered
    )
    db.add(chat_log)
    db.commit()
    db.refresh(chat_log)
    return chat_log
