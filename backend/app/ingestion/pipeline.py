from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.models import DocumentModel, ChunkModel
from app.ingestion.loader import loader
from app.retrieval.chunker import chunker
from app.retrieval.embeddings import embedding_engine
from app.core.logging import logger

class IngestionPipeline:
    def run_pipeline(self, db: Session, transcripts_dir: str = None) -> Dict[str, Any]:
        """
        Execute reproducible ingestion pipeline:
        1. Load transcripts
        2. Clean & Extract metadata
        3. Chunk content
        4. Generate embeddings
        5. Persist to PostgreSQL / DB
        """
        if transcripts_dir:
            loader.data_dir = os.path.abspath(transcripts_dir)
        transcripts = loader.load_transcripts()
        
        if not transcripts:
            logger.warning("No transcripts found to ingest.")
            return {"status": "empty", "documents_processed": 0, "chunks_created": 0}

        docs_count = 0
        chunks_count = 0

        for t in transcripts:
            title = t.get("title", "Lenny's Podcast Transcript")
            episode_id = t.get("episode_id", "ep-unknown")
            source_url = t.get("source_url", "")
            content = t.get("content", "").strip()

            if not content:
                continue

            # Check if document already ingested (duplicate avoidance)
            existing_doc = db.query(DocumentModel).filter(DocumentModel.episode_id == episode_id).first()
            if existing_doc:
                db.delete(existing_doc) # Refresh / re-ingest
                db.commit()

            doc = DocumentModel(
                title=title,
                episode_id=episode_id,
                source_url=source_url,
                meta_info=t.get("metadata", {})
            )
            db.add(doc)
            db.flush()

            # Chunk document
            doc_chunks = chunker.chunk_transcript(content, metadata={
                "title": title,
                "episode_id": episode_id,
                "source_url": source_url
            })

            for c in doc_chunks:
                embedding = embedding_engine.generate_embedding(c["content"])
                chunk_model = ChunkModel(
                    document_id=doc.id,
                    chunk_index=c["chunk_index"],
                    content=c["content"],
                    embedding_json=embedding,
                    meta_info=c["metadata"]
                )
                db.add(chunk_model)
                chunks_count += 1

            docs_count += 1

        db.commit()
        logger.info(f"Ingestion complete: {docs_count} documents, {chunks_count} chunks persisted.")
        return {
            "status": "success",
            "documents_processed": docs_count,
            "chunks_created": chunks_count
        }

ingestion_pipeline = IngestionPipeline()
