import numpy as np
import re
import math
from typing import List
from app.core.config import settings

class EmbeddingEngine:
    def __init__(self, dim: int = 384):
        self.dim = dim

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate deterministic 384-dimensional dense vector embedding.
        Uses subword hashing + token term frequency normalization for fast local vector operations.
        """
        cleaned_text = re.sub(r'[^\w\s]', ' ', text.lower())
        tokens = cleaned_text.split()
        
        vec = np.zeros(self.dim, dtype=np.float32)
        if not tokens:
            return vec.tolist()
            
        for token in tokens:
            # Generate deterministic feature indices via char ngram hashing
            hash_val = 0
            for char in token:
                hash_val = (hash_val * 31 + ord(char)) % self.dim
            vec[hash_val] += 1.0

            # Subword bi-grams
            if len(token) >= 3:
                for i in range(len(token) - 1):
                    bigram = token[i:i+2]
                    bg_hash = (hash_val * 37 + ord(bigram[0]) * 17 + ord(bigram[1])) % self.dim
                    vec[bg_hash] += 0.5
                    
        # L2 Normalization
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
            
        return [float(x) for x in vec]

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Calculate cosine similarity between two 384d vectors."""
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

embedding_engine = EmbeddingEngine(dim=settings.EMBEDDING_DIM)
