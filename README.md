# SupportIQ - AI Customer Support Chatbot

SupportIQ is a full-stack AI customer support platform for small businesses. It allows a business owner to upload knowledge-base documents such as FAQs, shipping policies, return policies, product information, and support notes. Customers can then ask questions through a chatbot, and the system answers using only the uploaded business documents.

The project uses a Retrieval-Augmented Generation (RAG) pipeline to reduce hallucinations and provide source-grounded answers.

---

## Problem Statement

Small businesses often receive the same customer questions repeatedly:

- How long does shipping take?
- What is the return policy?
- Is this product safe for daily use?
- What ingredients are used?
- Do you offer refunds or exchanges?

Many small businesses cannot afford advanced customer support tools. SupportIQ solves this by giving them an AI-powered chatbot that can answer questions based on their own uploaded documents.

---

## Features

- Upload TXT and PDF knowledge-base documents
- Extract and chunk document text
- Generate embeddings using `sentence-transformers`
- Store document vectors in Pinecone
- Ask customer questions through a chatbot API
- Retrieve relevant document chunks using semantic search
- Generate answers using Hugging Face models
- Return source file names with each answer
- Confidence scoring and fallback handling
- Save chat logs in SQL database
- Basic business and user database structure
- FastAPI backend with modular service structure
- Next.js frontend for dashboard and chatbot interface

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python
- SQLAlchemy
- SQLite for local development
- PostgreSQL-ready structure

### AI / ML

- Pinecone for vector search
- sentence-transformers for embeddings
- Hugging Face for answer generation
- Retrieval-Augmented Generation pipeline

---

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

Database health:

```text
GET http://127.0.0.1:8000/health/database
```

SQLite is used locally by default through:

```text
DATABASE_URL=sqlite:///./supportiq.db
```

To use PostgreSQL later, update `DATABASE_URL` in `backend/.env`.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

### Admin Portal

The admin portal is available at:

```text
http://localhost:3000/admin
```

For local development, use the admin key from `backend/.env`:

```text
ADMIN_API_KEY=dev-admin-key
```

The admin portal can:

- Verify the SQL database connection
- Show total users, businesses, documents, and chats
- List every registered business with owner email, document count, and chat count

Admin API endpoints:

```text
GET /admin/health/database
GET /admin/stats
GET /admin/businesses
```

All admin API calls require this header:

```text
X-Admin-Key: your-admin-key
```

---

## Architecture

```text
Business uploads document
        ↓
FastAPI backend receives file
        ↓
Text is extracted from TXT/PDF
        ↓
Text is split into smaller chunks
        ↓
Chunks are embedded using sentence-transformers
        ↓
Embeddings are stored in Pinecone
        ↓
Customer asks a question
        ↓
Question is embedded
        ↓
Pinecone retrieves relevant chunks
        ↓
Hugging Face model generates answer using retrieved context
        ↓
Answer, confidence score, and sources are returned
        ↓
Chat log is saved in SQL database
