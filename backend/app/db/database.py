from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
from app.core.logging import logger

DATABASE_URL = settings.DATABASE_URL

# Check if PostgreSQL or SQLite
is_postgres = DATABASE_URL.startswith("postgresql")

if is_postgres:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
else:
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Initialize database tables and enable pgvector extension if Postgres."""
    if is_postgres:
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                logger.info("Successfully initialized pgvector extension on PostgreSQL.")
        except Exception as e:
            logger.warning(f"Could not enable pgvector extension automatically: {e}")
    
    Base.metadata.create_all(bind=engine)
    logger.info("Database schemas created successfully.")

def get_db():
    """Dependency for obtaining DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
