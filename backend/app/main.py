from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base
from app.routes import admin, auth, business, document_routes, chat_routes

# Create tables in the DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SupportIQ Backend API", version="1.0.0")

# Allow CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production update strictly to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(business.router)
app.include_router(document_routes.router)
app.include_router(chat_routes.router)
app.include_router(admin.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Welcome to SupportIQ API"}

@app.get("/health/database")
def public_database_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok", "message": "Database connection is healthy."}
