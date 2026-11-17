import json
import os
from typing import Dict, Any, List
from pathlib import Path
from ..config import EXPORTS_DIR

class CutdownEngineService:
    def __init__(self):
        self.exports_dir = EXPORTS_DIR
        self.exports_dir.mkdir(parents=True, exist_ok=True)

    def generate_all_cuts(
        self,
        clip_id: str,
        title: str,
        transcript_snippet: str,
        start_time: float,
        end_time: float
    ) -> Dict[str, Any]:
        """
        Creates multi-platform aspect ratio configurations, platform-styled captions,
        SRT files, and copy-ready distribution packs.
        """
        duration = round(end_time - start_time, 1)

        # 1. Platform Specific Cuts
        cuts = [
            {
                "id": f"{clip_id}-9-16",
                "aspectRatio": "9:16",
                "platform": "tiktok",
                "title": f"[9:16 Short] {title}",
                "durationSeconds": duration,
                "captionText": f"🔥 The 60% creative tax solo creators pay every single day. Stop editing manually and run autonomous agents instead! #creator #ai #automation #sidehustle #productivity",
                "hashtags": ["#creator", "#ai", "#automation", "#sidehustle", "#productivity", "#solopreneur"],
                "srtContent": self._generate_srt(start_time, end_time, transcript_snippet, max_words_per_line=3),
                "previewUrl": f"/api/static/cuts/{clip_id}_9_16.mp4",
                "safeZoneYPercent": 68,
                "targetResolution": "1080x1920"
            },
            {
                "id": f"{clip_id}-reels",
                "aspectRatio": "9:16",
                "platform": "reels",
                "title": f"[9:16 Reels] {title}",
                "durationSeconds": duration,
                "captionText": f"Look at this retention heatmap bloom 🧠 If your thumbnails aren't tested with foveal saliency, you're leaving 40% CTR on the table. Link in bio for the free open-source setup.",
                "hashtags": ["#creatoreconomy", "#aitools", "#reelsgrowth", "#entrepreneurship", "#videoediting"],
                "srtContent": self._generate_srt(start_time, end_time, transcript_snippet, max_words_per_line=4),
                "previewUrl": f"/api/static/cuts/{clip_id}_reels.mp4",
                "safeZoneYPercent": 65,
                "targetResolution": "1080x1920"
            },
            {
                "id": f"{clip_id}-1-1",
                "aspectRatio": "1:1",
                "platform": "linkedin",
                "title": f"[1:1 Feed] {title}",
                "durationSeconds": duration,
                "captionText": f"Most founders waste 15+ hours a week repurposing content across 4 different platforms.\n\nHere is how autonomous agents track active speakers, calculate tension curves, and format multi-aspect cutdowns with zero manual timeline editing.\n\nKey takeaways:\n1. Spectral residual heatmaps predict visual fatigue.\n2. In-persona community agents triage comments.\n3. 100% free stack via local CPU models.\n\nWhat is your biggest creative bottleneck right now?",
                "hashtags": ["#AI", "#Productivity", "#FounderJourney", "#OpenSource", "#ContentStrategy"],
                "srtContent": self._generate_srt(start_time, end_time, transcript_snippet, max_words_per_line=6),
                "previewUrl": f"/api/static/cuts/{clip_id}_1_1.mp4",
                "safeZoneYPercent": 50,
                "targetResolution": "1080x1080"
            },
            {
                "id": f"{clip_id}-4-5",
                "aspectRatio": "4:5",
                "platform": "reels",
                "title": f"[4:5 Portrait] {title}",
                "durationSeconds": duration,
                "captionText": f"Why solo creators in 2026 are outproducing 10-person media agencies using autonomous local agent orchestration.",
                "hashtags": ["#creatorstack", "#soloentrepreneur", "#videomarketing"],
                "srtContent": self._generate_srt(start_time, end_time, transcript_snippet, max_words_per_line=5),
                "previewUrl": f"/api/static/cuts/{clip_id}_4_5.mp4",
                "safeZoneYPercent": 55,
                "targetResolution": "1080x1350"
            },
            {
                "id": f"{clip_id}-16-9",
                "aspectRatio": "16:9",
                "platform": "shorts",
                "title": f"[16:9 Landscape Master] {title}",
                "durationSeconds": duration,
                "captionText": f"Full master segment from '{title}'. Breakdown of tension beat analytics and real-time visual saliency testing.",
                "hashtags": ["#YouTubeStrategy", "#VideoProduction", "#TechBreakdown"],
                "srtContent": self._generate_srt(start_time, end_time, transcript_snippet, max_words_per_line=8),
                "previewUrl": f"/api/static/cuts/{clip_id}_16_9.mp4",
                "safeZoneYPercent": 80,
                "targetResolution": "1920x1080"
            }
        ]

        # 2. Master SRT file content
        full_srt = self._generate_srt(start_time, end_time, transcript_snippet, max_words_per_line=5)
        
        # 3. Copy-Ready Caption Pack
        caption_pack = {
            "tiktok": cuts[0]["captionText"],
            "reels": cuts[1]["captionText"],
            "linkedin": cuts[2]["captionText"],
            "x": f"Solo creators lose 60% of creative hours wrestling with cutdowns and comments.\n\nWe built CreatorPilot: autonomous agents that calculate tension peaks, render heatmaps, and reply in your persona.\n\n100% free & MIT licensed. 🧵👇",
            "shorts": cuts[4]["captionText"]
        }

        # Save SRT to exports
        srt_file_path = self.exports_dir / f"{clip_id}.srt"
        with open(srt_file_path, "w", encoding="utf-8") as f:
            f.write(full_srt)

        return {
            "clipId": clip_id,
            "cuts": cuts,
            "srtContent": full_srt,
            "srtDownloadUrl": f"/api/static/exports/{clip_id}.srt",
            "captionPack": caption_pack
        }

    def _generate_srt(
        self,
        start_time: float,
        end_time: float,
        text: str,
        max_words_per_line: int = 5
    ) -> str:
        """
        Converts text and time range into standard SubRip (.srt) caption format.
        """
        words = text.split()
        if not words:
            return ""

        chunks = [" ".join(words[i:i + max_words_per_line]) for i in range(0, len(words), max_words_per_line)]
        chunk_duration = (end_time - start_time) / max(1, len(chunks))

        srt_lines = []
        for idx, chunk in enumerate(chunks):
            sub_start = start_time + (idx * chunk_duration)
            sub_end = min(end_time, sub_start + chunk_duration)

            start_str = self._format_timestamp(sub_start)
            end_str = self._format_timestamp(sub_end)

            srt_lines.append(f"{idx + 1}")
            srt_lines.append(f"{start_str} --> {end_str}")
            srt_lines.append(chunk)
            srt_lines.append("")

        return "\n".join(srt_lines)

    def _format_timestamp(self, seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

cutdown_engine = CutdownEngineService()
