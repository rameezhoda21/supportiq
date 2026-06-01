from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    businesses = relationship("Business", back_populates="owner")


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    business_name = Column(String, index=True)
    business_slug = Column(String, unique=True, index=True)
    website_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="businesses")
    documents = relationship("Document", back_populates="business")
    chat_logs = relationship("ChatLog", back_populates="business")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    file_name = Column(String)
    file_type = Column(String)
    raw_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    business_id = Column(Integer, ForeignKey("businesses.id"))
    chunk_text = Column(Text)
    chunk_index = Column(Integer)
    embedding_id = Column(String) # ID of the embedding inside ChromaDB
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    customer_question = Column(Text)
    ai_answer = Column(Text)
    confidence_score = Column(Float)
    was_answered = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="chat_logs")
