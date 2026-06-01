from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.database import get_db
from app.models import Document, DocumentChunk, Business
from app.services.document_service import extract_text_from_pdf, extract_text_from_txt, chunk_text
from app.services.embedding_service import generate_embedding
from app.services.vector_store import upsert_document_chunks
import traceback

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    business_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
        
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
        
    try:
        # 1. Read file contents
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        filename_lower = file.filename.lower()
        file_extension = filename_lower.split(".")[-1]

        # 2. Extract text with proper error handling and delegation
        if filename_lower.endswith(".pdf"):
            text_content = extract_text_from_pdf(contents)
        elif filename_lower.endswith(".txt"):
            text_content = extract_text_from_txt(contents)
        else:
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

        # 3. Create chunks (500-800 words according to service default)
        chunks = chunk_text(text_content, target_chunk_size=600, overlap=100)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to process text chunks. The document might not contain valid readable text.")
            
        # 4. Save metadata and text to PostgreSQL Database
        doc = Document(
            business_id=business_id,
            file_name=file.filename,
            file_type=file_extension,
            raw_text=text_content
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        
        # 5. Generate embeddings for chunks and store in SQL
        embeddings = []
        chunk_objects = []
        for idx, chunk_text_data in enumerate(chunks):
            # Generate embedding
            embedding = generate_embedding(chunk_text_data)
            embeddings.append(embedding)
            
            # Store in SQL app DB
            chunk_objects.append(
                DocumentChunk(
                    document_id=doc.id,
                    business_id=business_id,
                    chunk_text=chunk_text_data,
                    chunk_index=idx,
                    embedding_id=f"biz_{business_id}_doc_{doc.id}_chunk_{idx}"
                )
            )
        db.add_all(chunk_objects)
        db.commit()

        # 6. Upsert into Pinecone Vector Store
        vectors_upserted = 0
        try:
            vectors_upserted = upsert_document_chunks(
                business_id=business_id,
                document_id=doc.id,
                chunks=chunks,
                embeddings=embeddings,
                source=doc.file_name
            )
        except Exception as e:
            # Let the user know the file was processed locally but vector search failed
            print(f"Warning: Pinecone upsert failed: {e}")
            traceback.print_exc()
        
        # 7. Return standard JSON response
        return {
            "file_name": doc.file_name,
            "chunks_created": len(chunks),
            "vectors_upserted": vectors_upserted,
            "document_id": doc.id,
            "message": "Document processed and stored successfully."
        }

    except ValueError as ve:
        # Catch our custom ValueErrors thrown in the document service (e.g. Empty file, extract failed)
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except SQLAlchemyError as se:
        # Catch local DB processing errors
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error occurred: {str(se)}")
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred during file processing.")

@router.get("/{business_id}")
def get_documents(business_id: int, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.business_id == business_id).all()
    return docs
