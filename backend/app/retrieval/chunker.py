import re
from typing import List, Dict, Any

class TranscriptChunker:
    def __init__(self, chunk_size: int = 500, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_transcript(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk transcript text preserving speaker segments and paragraph boundaries.
        Returns list of chunks with metadata attached.
        """
        # Normalize line breaks
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        
        chunks = []
        current_chunk = ""
        chunk_idx = 0

        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 <= self.chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + para
            else:
                if current_chunk:
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "content": current_chunk,
                        "metadata": {
                            **metadata,
                            "chunk_index": chunk_idx,
                            "char_count": len(current_chunk)
                        }
                    })
                    chunk_idx += 1
                    
                # Handle overlap
                if len(current_chunk) > self.overlap:
                    overlap_text = current_chunk[-self.overlap:]
                    current_chunk = overlap_text + "\n\n" + para
                else:
                    current_chunk = para

        if current_chunk:
            chunks.append({
                "chunk_index": chunk_idx,
                "content": current_chunk,
                "metadata": {
                    **metadata,
                    "chunk_index": chunk_idx,
                    "char_count": len(current_chunk)
                }
            })

        return chunks

chunker = TranscriptChunker()
