import json
import math
import re
from typing import List, Dict, Any, Optional
from ..database import get_connection

class SemanticLibraryService:
    def __init__(self):
        pass

    def auto_tag(self, text: str) -> List[str]:
        """
        Extracts high-intent thematic tags from clip transcripts, titles, or comments.
        """
        words = set(re.findall(r'\b[a-z]{4,}\b', text.lower()))
        tag_vocabulary = {
            "burnout": ["burnout", "exhausted", "grind", "hours", "unpaid", "tired"],
            "thumbnails": ["thumbnail", "heatmaps", "saliency", "ctr", "contrast", "visual"],
            "automation": ["automation", "agent", "agents", "pipeline", "autonomous", "tools"],
            "monetization": ["pricing", "money", "dollars", "formula", "revenue", "subscription"],
            "retention": ["retention", "hook", "tension", "drop", "gaze", "seconds"],
            "hardware": ["gpu", "cpu", "laptop", "whisper", "local", "opencv", "docker"],
            "growth": ["audience", "views", "algorithm", "scale", "viral", "browse"]
        }
        
        assigned_tags = []
        for tag, related in tag_vocabulary.items():
            if any(r in words or r in text.lower() for r in related):
                assigned_tags.append(tag)
                
        if not assigned_tags:
            assigned_tags = ["content-strategy", "creator-ops"]
            
        return assigned_tags

    def search(
        self,
        query: str,
        filter_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs natural-language semantic ranking over indexed clips, thumbnails, and comments.
        """
        conn = get_connection()
        cursor = conn.cursor()
        
        if filter_type and filter_type != "all":
            cursor.execute("SELECT * FROM semantic_items WHERE item_type = ?", (filter_type,))
        else:
            cursor.execute("SELECT * FROM semantic_items")
            
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return []

        query_tokens = set(re.findall(r'\b\w+\b', query.lower()))
        results = []

        for row in rows:
            title = row["title"]
            snippet = row["snippet"]
            tags = json.loads(row["tags"]) if row["tags"] else []
            item_text = f"{title} {snippet} {' '.join(tags)}".lower()
            item_tokens = set(re.findall(r'\b\w+\b', item_text))

            # Jaccard / Token Overlap Semantic Score
            intersection = query_tokens.intersection(item_tokens)
            score = len(intersection) / max(1, len(query_tokens))

            # Bonus for exact tag match
            tag_overlap = any(qt in tags for qt in query_tokens)
            if tag_overlap:
                score += 0.35

            # Base relevance for fuzzy browse if query is short
            final_similarity = round(min(0.99, max(0.40, score + 0.3)), 2)

            results.append({
                "id": row["id"],
                "type": row["item_type"],
                "title": title,
                "snippet": snippet,
                "tags": tags,
                "timestamp": row["timestamp"],
                "tensionScore": row["tension_score"],
                "similarityScore": final_similarity
            })

        results.sort(key=lambda x: (x["similarityScore"], x.get("tensionScore", 0)), reverse=True)
        return results

semantic_library = SemanticLibraryService()
