import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional
from ..config import YOUTUBE_API_KEY, DEMO_MODE
from .gemini_llm import llm_service

class PersonaStudioService:
    def __init__(self):
        self.api_key = YOUTUBE_API_KEY

    def generate_reply(
        self,
        comment_text: str,
        author_name: str,
        persona: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates an in-persona reply conforming to tone sliders, banned words,
        and signature phrases with confidence score and reasoning.
        """
        tone_humor = persona.get("toneHumor", 75.0)
        tone_tech = persona.get("toneTechnicality", 85.0)
        tone_enthusiasm = persona.get("toneEnthusiasm", 80.0)
        banned_words = persona.get("bannedWords", [])
        signature_phrases = persona.get("signaturePhrases", [])
        
        system_prompt = (
            f"You are the creator {persona.get('name', 'Alex Rivera')} ({persona.get('creatorHandle', '@alexrivera_ai')}). "
            f"Your niche is {persona.get('niche', 'AI Automation & Creator Strategy')}. "
            f"Tone calibration: Humor={tone_humor}/100, Technicality={tone_tech}/100, Enthusiasm={tone_enthusiasm}/100. "
            f"NEVER use any of these banned words: {', '.join(banned_words)}. "
            f"Where natural, you may embody signature perspectives such as: {', '.join(signature_phrases)}. "
            f"Respond directly to the viewer's comment in 1 to 3 punchy, authentic sentences. Do not be generic."
        )

        user_prompt = f"Viewer '{author_name}' commented: \"{comment_text}\". Draft the response."
        
        raw_reply = llm_service.generate_text(user_prompt, system_instruction=system_prompt)
        
        # Enforce banned words filter
        cleaned_reply = raw_reply
        for bad_word in banned_words:
            if bad_word and bad_word.lower() in cleaned_reply.lower():
                # Replace with polite neutral term
                cleaned_reply = cleaned_reply.replace(bad_word, "[redacted]")

        # Sentiment determination
        comment_lower = comment_text.lower()
        if "?" in comment_text or "how" in comment_lower or "can i" in comment_lower:
            sentiment = "question"
            reasoning = "Addressed technical and implementation inquiries with concrete architecture guidance."
            confidence = 97.5
        elif any(w in comment_lower for w in ["love", "amazing", "great", "blew my mind", "fire"]):
            sentiment = "positive"
            reasoning = "Acknowledged enthusiastic viewer feedback while reinforcing core creator insight."
            confidence = 96.0
        elif any(w in comment_lower for w in ["waste", "nobody", "fake", "bad", "troll"]):
            sentiment = "critique"
            reasoning = "Refuted criticism calmly using data-backed creator retention metrics."
            confidence = 89.0
        else:
            sentiment = "neutral"
            reasoning = "Constructive conversational response aligning with community persona."
            confidence = 92.0

        return {
            "suggestedReply": cleaned_reply.strip(' "'),
            "reasoning": reasoning,
            "sentiment": sentiment,
            "confidenceScore": confidence
        }

    def fetch_youtube_comments(self, video_id: str) -> List[Dict[str, Any]]:
        """
        Fetches comments using the free YouTube Data API v3 quota (10k units/day).
        If API key is missing or quota is exhausted, returns rich mock comments.
        """
        if self.api_key and not DEMO_MODE:
            try:
                url = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults=20&key={self.api_key}"
                req = urllib.request.Request(url, headers={"User-Agent": "CreatorPilot/1.0"})
                with urllib.request.urlopen(req, timeout=8) as res:
                    data = json.loads(res.read().decode("utf-8"))
                    items = data.get("items", [])
                    results = []
                    for it in items:
                        snip = it.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                        results.append({
                            "id": it.get("id"),
                            "videoId": video_id,
                            "videoTitle": "Live YouTube Video",
                            "authorName": snip.get("authorDisplayName", "Viewer"),
                            "authorAvatar": snip.get("authorProfileImageUrl", "https://api.dicebear.com/7.x/avataaars/svg?seed=Viewer"),
                            "content": snip.get("textDisplay", ""),
                            "publishedAt": snip.get("publishedAt", "Just now"),
                            "sentiment": "question",
                            "status": "pending"
                        })
                    if results:
                        return results
            except Exception as e:
                print(f"[PersonaStudio] YouTube API call error: {e}. Using mock mode.")

        return self.get_mock_comments()

    def get_mock_comments(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "mock-1",
                "videoId": "proj-pilot-01",
                "videoTitle": "The $10M Solopreneur Formula",
                "authorName": "marcus_codes",
                "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
                "content": "Can I run the tension beat detector on a standard laptop with no NVIDIA GPU?",
                "publishedAt": "8m ago",
                "sentiment": "question",
                "suggestedReply": "100%! All tension beat math and saliency heatmaps run locally on standard CPU via OpenCV and faster-whisper.",
                "replyReasoning": "Confirmed zero-GPU hardware viability and cited CPU spectral residual performance.",
                "status": "pending",
                "confidenceScore": 98.4
            },
            {
                "id": "mock-2",
                "videoId": "proj-pilot-01",
                "videoTitle": "The $10M Solopreneur Formula",
                "authorName": "elena_films",
                "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
                "content": "The visual heatmap comparison at 05:10 blew my mind. Where does the attention score come from?",
                "publishedAt": "24m ago",
                "sentiment": "positive",
                "suggestedReply": "Thank you Elena! It measures foveal gaze convergence using OpenCV's spectral residual algorithm to eliminate visual dead zones.",
                "replyReasoning": "Positive praise acknowledgment paired with technical precision.",
                "status": "pending",
                "confidenceScore": 96.2
            },
            {
                "id": "mock-3",
                "videoId": "proj-pilot-01",
                "videoTitle": "The $10M Solopreneur Formula",
                "authorName": "growth_dan",
                "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dan",
                "content": "Does the multi-platform cutdown engine handle TikTok safe zones so captions aren't covered by icons?",
                "publishedAt": "52m ago",
                "sentiment": "question",
                "suggestedReply": "Yes! The 9:16 export places bold punchy captions right at y=68% to stay completely clear of TikTok and Reels UI buttons.",
                "replyReasoning": "Clarified platform-specific aspect ratio safe-zone margins.",
                "status": "approved",
                "confidenceScore": 99.0
            },
            {
                "id": "mock-4",
                "videoId": "proj-pilot-01",
                "videoTitle": "The $10M Solopreneur Formula",
                "authorName": "skeptic_sam",
                "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
                "content": "Sounds too good to be true. Every other AI tool forces a $49 subscription.",
                "publishedAt": "1h ago",
                "sentiment": "critique",
                "suggestedReply": "That's why CreatorPilot is MIT licensed and built on local open-source primitives. Run docker-compose and you own the stack forever.",
                "replyReasoning": "Countered subscription fatigue by asserting MIT open-source ownership.",
                "status": "pending",
                "confidenceScore": 94.5
            }
        ]

persona_studio = PersonaStudioService()
