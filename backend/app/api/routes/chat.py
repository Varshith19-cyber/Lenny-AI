from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import asyncio
from app.db.database import get_db
from app.db.models import SessionModel, MessageModel
from app.agents.router import agent_router

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    session_id: str
    message: str
    provider: Optional[str] = "gemini" # "gemini", "ollama", "anthropic", or "openai"
    model: Optional[str] = None
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    session_id: str
    user_message_id: str
    assistant_message_id: str
    role: str = "assistant"
    content: str
    sources: List[Dict[str, Any]] = []
    provider: str
    model: str
    artifact_id: Optional[str] = None

@router.post("", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest, db: Session = Depends(get_db)):
    """Main conversational API endpoint."""
    session = db.query(SessionModel).filter(SessionModel.id == payload.session_id).first()
    if not session:
        # Auto-create session if missing
        session = SessionModel(id=payload.session_id, title=payload.message[:30] + "...")
        db.add(session)
        db.commit()

    # Save User message
    user_msg = MessageModel(
        session_id=payload.session_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Update session title if default
    if session.title == "New Conversation" or not session.title:
        session.title = payload.message[:35] + "..."
        db.commit()

    # Get conversation history
    history_records = db.query(MessageModel).filter(MessageModel.session_id == payload.session_id).order_by(MessageModel.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in history_records[:-1]] # exclude current user_msg

    # Execute Agent Router turn
    agent_result = await agent_router.execute_turn(
        db=db,
        session_id=payload.session_id,
        user_message=payload.message,
        history=history,
        provider_type=payload.provider,
        model_name=payload.model
    )

    # Save Assistant message
    assistant_msg = MessageModel(
        session_id=payload.session_id,
        role="assistant",
        content=agent_result["content"],
        sources_json=agent_result["sources"],
        meta_info={"provider": agent_result["provider"], "model": agent_result["model"], "intent": agent_result["intent"]}
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        session_id=payload.session_id,
        user_message_id=user_msg.id,
        assistant_message_id=assistant_msg.id,
        content=agent_result["content"],
        sources=agent_result["sources"],
        provider=agent_result["provider"],
        model=agent_result["model"],
        artifact_id=agent_result.get("artifact_id")
    )
