import os
import glob
import json
from typing import List, Dict, Any
from app.core.logging import logger

class TranscriptLoader:
    def __init__(self, data_dir: str = None):
        # Resolve absolute path to data/transcripts relative to project root
        if not data_dir:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            data_dir = os.path.join(base_dir, "data", "transcripts")
        self.data_dir = os.path.abspath(data_dir)

    def load_transcripts(self) -> List[Dict[str, Any]]:
        """Load text or json transcript files from data directory."""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir, exist_ok=True)
            logger.warning(f"Created empty transcripts directory at {self.data_dir}")
            return []

        transcripts = []
        
        # Load .txt files
        txt_files = glob.glob(os.path.join(self.data_dir, "*.txt"))
        for filepath in txt_files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                filename = os.path.basename(filepath)
                title = filename.replace(".txt", "").replace("_", " ").title()
                
                # Simple header parser if present
                episode_id = f"ep-{filename.replace('.txt', '')}"
                source_url = f"https://www.lennysnewsletter.com/p/{filename.replace('.txt', '')}"

                transcripts.append({
                    "title": f"Lenny's Podcast: {title}",
                    "episode_id": episode_id,
                    "source_url": source_url,
                    "content": content,
                    "metadata": {"filename": filename}
                })
            except Exception as e:
                logger.error(f"Error loading transcript {filepath}: {e}")

        # Load .json files
        json_files = glob.glob(os.path.join(self.data_dir, "*.json"))
        for filepath in json_files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    transcripts.extend(data)
                elif isinstance(data, dict):
                    transcripts.append(data)
            except Exception as e:
                logger.error(f"Error loading json transcript {filepath}: {e}")

        logger.info(f"Loaded {len(transcripts)} transcripts from {self.data_dir}")
        return transcripts

loader = TranscriptLoader()
