from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.database import get_db
from app.db.models import ArtifactModel

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])

class ArtifactResponse(BaseModel):
    id: str
    session_id: str
    title: str
    artifact_type: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/{artifact_id}", response_model=ArtifactResponse)
def get_artifact(artifact_id: str, db: Session = Depends(get_db)):
    """Get specific artifact by ID."""
    artifact = db.query(ArtifactModel).filter(ArtifactModel.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact

@router.get("/session/{session_id}", response_model=List[ArtifactResponse])
def get_session_artifacts(session_id: str, db: Session = Depends(get_db)):
    """List artifacts generated within a session."""
    return db.query(ArtifactModel).filter(ArtifactModel.session_id == session_id).order_by(ArtifactModel.created_at.desc()).all()
