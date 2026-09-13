from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.ingestion.pipeline import ingestion_pipeline

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])

@router.post("")
def trigger_ingestion(db: Session = Depends(get_db)):
    """Trigger reproducible transcript ingestion pipeline."""
    result = ingestion_pipeline.run_pipeline(db)
    return result
