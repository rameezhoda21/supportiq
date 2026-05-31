from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# USER SCHEMAS
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

# BUSINESS SCHEMAS
class BusinessCreate(BaseModel):
    business_name: str
    business_slug: str
    website_url: Optional[str] = None

class BusinessResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    business_slug: str
    created_at: datetime
    class Config:
        from_attributes = True

# CHAT SCHEMAS
class ChatRequest(BaseModel):
    business_id: int
    question: str

class ChatResponse(BaseModel):
    answer: str
    confidence_score: float
    sources: List[str]
    was_answered: bool

# DOCUMENT SCHEMAS
class DocumentResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    created_at: datetime
    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    business_id: int
    chunk_text: str
    chunk_index: int
    embedding_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatLogResponse(BaseModel):
    id: int
    business_id: int
    customer_question: str
    ai_answer: str
    confidence_score: float
    was_answered: bool
    created_at: datetime
    class Config:
        from_attributes = True
