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
        for chunk in chunks:
            sim_score = embedding_engine.cosine_similarity(query_vec, chunk.embedding_json)
            if sim_score > 0.10: # Minimum similarity threshold
                doc = db.query(DocumentModel).filter(DocumentModel.id == chunk.document_id).first()
                doc_title = doc.title if doc else "Lenny's Podcast Transcript"
                source_url = doc.source_url if doc else ""
                episode_id = doc.episode_id if doc else ""

                scored_chunks.append({
                    "chunk_id": chunk.id,
                    "score": round(sim_score, 4),
                    "content": chunk.content,
                    "document_title": doc_title,
                    "episode_id": episode_id,
                    "source_url": source_url,
                    "chunk_index": chunk.chunk_index,
                    "metadata": chunk.meta_info or {}
                })

        # Sort by similarity score descending
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        top_results = scored_chunks[:k]
        
        logger.info(f"RAG Retrieval query: '{query}' -> retrieved {len(top_results)} chunks (total candidates: {len(chunks)}).")
        return top_results

retriever = RAGRetriever()
