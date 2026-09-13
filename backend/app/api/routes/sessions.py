from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.database import get_db
from app.db.models import SessionModel, MessageModel, ArtifactModel

router = APIRouter(prefix="/sessions", tags=["Sessions"])

class SessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sources_json: Optional[list] = []
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)):
    """Create a new chat session."""
    session = SessionModel(title=payload.title or "New Conversation")
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("", response_model=List[SessionResponse])
def list_sessions(db: Session = Depends(get_db)):
    """List all chat sessions ordered by updated_at descending."""
    return db.query(SessionModel).order_by(SessionModel.updated_at.desc()).all()

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Retrieve specific session."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/{session_id}/messages", response_model=List[MessageResponse])
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    """Retrieve all messages in a session."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db.query(MessageModel).filter(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc()).all()

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a chat session."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return None
