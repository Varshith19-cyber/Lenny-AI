from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import ChunkModel, DocumentModel
from app.retrieval.embeddings import embedding_engine
from app.core.config import settings
from app.core.logging import logger

class RAGRetriever:
    def __init__(self, top_k: int = None):
        self.top_k = top_k or settings.MAX_RETRIEVAL_CHUNKS

    def search_relevant_chunks(self, db: Session, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        """
        Perform semantic vector search against stored transcript chunks in DB.
        Returns top matching chunks with formatted citation sources.
        """
        k = top_k or self.top_k
        query_vec = embedding_engine.generate_embedding(query)
        
        # Retrieve all chunks from DB
        chunks = db.query(ChunkModel).all()
        if not chunks:
            logger.info("No transcript chunks found in database.")
            return []
            
        scored_chunks = []
        query_lower = query.lower()

        for chunk in chunks:
            sim_score = embedding_engine.cosine_similarity(query_vec, chunk.embedding_json)
            doc = db.query(DocumentModel).filter(DocumentModel.id == chunk.document_id).first()
            doc_title = doc.title if doc else "Lenny's Podcast Transcript"
            source_url = doc.source_url if doc else ""
            episode_id = doc.episode_id if doc else ""

            # Speaker & Topic keyword boosting
            content_lower = chunk.content.lower()
            title_lower = doc_title.lower()
            boost = 0.0

            speaker_keywords = {
                "shreyas": ["shreyas", "doshi", "lno", "pre-mortem", "leverage task"],
                "elena": ["elena", "verna", "plg", "growth loop", "freemium", "funnel"],
                "patrick": ["patrick", "campbell", "pricing", "value metric", "monetization"],
                "cagan": ["marty", "cagan", "discovery", "feature factory", "empowered team"]
            }

            for speaker, kws in speaker_keywords.items():
                if any(kw in query_lower for kw in kws):
                    if any(kw in content_lower or kw in title_lower for kw in kws):
                        boost += 0.35

            final_score = round(sim_score + boost, 4)

            if final_score > 0.10:
                scored_chunks.append({
                    "chunk_id": chunk.id,
                    "score": final_score,
                    "content": chunk.content,
                    "document_title": doc_title,
                    "episode_id": episode_id,
                    "source_url": source_url,
                    "chunk_index": chunk.chunk_index,
                    "metadata": chunk.meta_info or {}
                })

        # Sort by boosted similarity score descending
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        top_results = scored_chunks[:k]
        
        logger.info(f"RAG Retrieval query: '{query}' -> retrieved {len(top_results)} chunks (total candidates: {len(chunks)}).")
        return top_results

retriever = RAGRetriever()
