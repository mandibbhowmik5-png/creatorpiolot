import sys
import unittest
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.tension_detector import tension_detector
from app.services.thumbnail_lab import thumbnail_lab
from app.services.persona_studio import persona_studio
from app.services.cutdown_engine import cutdown_engine
from app.services.semantic_library import semantic_library
from app.services.insights_agent import insights_agent

class TestCreatorPilotPipeline(unittest.TestCase):
    def test_tension_beat_detector(self):
        duration = 600.0
        result = tension_detector.analyze_segments(video_duration=duration)
        self.assertIn("beats", result)
        self.assertIn("topBeats", result)
        self.assertGreater(len(result["beats"]), 0)
        for beat in result["beats"]:
            self.assertGreaterEqual(beat["tensionScore"], 0.0)
            self.assertLessEqual(beat["tensionScore"], 100.0)
            self.assertGreaterEqual(beat["speechPaceWpm"], 0)

    def test_thumbnail_saliency_and_variants(self):
        variants = thumbnail_lab.generate_variants_for_project("test-proj-unit")
        self.assertEqual(len(variants), 3)
        winner = variants[0]
        self.assertIn("saliencyScore", winner)
        self.assertGreaterEqual(winner["saliencyScore"], 50.0)
        self.assertLessEqual(winner["saliencyScore"], 100.0)
        self.assertTrue(winner["imageUrl"].endswith(".jpg"))
        self.assertTrue(winner["heatmapUrl"].endswith(".jpg"))

    def test_persona_studio_banned_words(self):
        persona = {
            "name": "Alex",
            "creatorHandle": "@alex",
            "niche": "AI",
            "toneHumor": 70,
            "toneTechnicality": 90,
            "toneEnthusiasm": 85,
            "bannedWords": ["guaranteed", "crypto"],
            "signaturePhrases": ["Let's build."]
        }
        reply_data = persona_studio.generate_reply(
            comment_text="Is this guaranteed money?",
            author_name="Tester",
            persona=persona
        )
        self.assertIn("suggestedReply", reply_data)
        self.assertNotIn("guaranteed", reply_data["suggestedReply"].lower())
        self.assertIn(reply_data["sentiment"], ["question", "positive", "critique", "neutral"])

    def test_cutdown_aspect_ratios_and_srt(self):
        cuts = cutdown_engine.generate_all_cuts(
            clip_id="clip-test-1",
            title="Hook Video",
            transcript_snippet="Here is how autonomous agents track faces and eliminate editing.",
            start_time=12.0,
            end_time=42.0
        )
        self.assertEqual(len(cuts["cuts"]), 5)
        aspects = [c["aspectRatio"] for c in cuts["cuts"]]
        self.assertIn("9:16", aspects)
        self.assertIn("1:1", aspects)
        self.assertIn("4:5", aspects)
        self.assertIn("16:9", aspects)
        self.assertIn("-->", cuts["srtContent"])

    def test_semantic_search_ranking(self):
        results = semantic_library.search("heatmaps saliency")
        self.assertIsInstance(results, list)
        if len(results) > 0:
            self.assertGreaterEqual(results[0]["similarityScore"], 0.0)

    def test_insights_weekly_report(self):
        report = insights_agent.generate_weekly_report()
        self.assertIn("overview", report)
        self.assertIn("topPerformingHooks", report)
        self.assertIn("recommendedSchedule", report)
        self.assertGreater(len(report["recommendedSchedule"]), 0)

if __name__ == "__main__":
    unittest.main()
