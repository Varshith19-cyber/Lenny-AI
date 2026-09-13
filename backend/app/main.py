from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.db.database import init_db, SessionLocal
from app.ingestion.pipeline import ingestion_pipeline

from app.api.routes import health, sessions, chat, models, artifacts, ingestion

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="1.0.0",
    description="The Lenny Growth Assistant — AI-powered conversational web app grounded in Lenny's Podcast transcripts."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local frontend & vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(sessions.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(models.router, prefix=settings.API_V1_STR)
app.include_router(artifacts.router, prefix=settings.API_V1_STR)
app.include_router(ingestion.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing The Lenny Growth Assistant FastAPI Application...")
    init_db()
    
    # Auto-ingest seed transcripts if database empty
    db = SessionLocal()
    try:
        from app.db.models import ChunkModel
        chunk_count = db.query(ChunkModel).count()
        if chunk_count == 0:
            logger.info("Database empty on startup. Triggering auto-ingestion of seed transcripts...")
            ingestion_pipeline.run_pipeline(db)
    except Exception as e:
        logger.error(f"Startup ingestion error: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Welcome to The Lenny Growth Assistant API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
