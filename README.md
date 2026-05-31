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
