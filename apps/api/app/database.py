import sqlite3
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from .config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source_url TEXT,
        duration REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        average_tension REAL DEFAULT 0.0,
        speech_summary TEXT
    )
    """)

    # Tension Beats
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tension_beats (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        timestamp_start REAL NOT NULL,
        timestamp_end REAL NOT NULL,
        tension_score REAL NOT NULL,
        audio_energy_score REAL NOT NULL,
        speech_pace_wpm REAL NOT NULL,
        sentiment_shift_score REAL NOT NULL,
        laughter_or_pause_score REAL NOT NULL,
        hook_rating REAL NOT NULL,
        hook_summary TEXT,
        transcript_snippet TEXT,
        is_peak INTEGER DEFAULT 0,
        reel_export_url TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)

    # Thumbnail Variants
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS thumbnail_variants (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        label TEXT NOT NULL,
        frame_timestamp REAL NOT NULL,
        image_url TEXT NOT NULL,
        heatmap_url TEXT NOT NULL,
        saliency_score REAL NOT NULL,
        gemini_vision_score REAL NOT NULL,
        composite_score REAL NOT NULL,
        face_detected INTEGER DEFAULT 1,
        text_hook TEXT NOT NULL,
        color_grade TEXT NOT NULL,
        why_this_wins TEXT NOT NULL,
        ab_votes INTEGER DEFAULT 0,
        ab_impressions INTEGER DEFAULT 0,
        simulated_ctr REAL DEFAULT 0.0,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)

    # Persona Profile
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS persona_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        creator_handle TEXT NOT NULL,
        niche TEXT NOT NULL,
        tone_humor REAL NOT NULL,
        tone_enthusiasm REAL NOT NULL,
        tone_technicality REAL NOT NULL,
        tone_empathy REAL NOT NULL,
        banned_words TEXT NOT NULL,
        signature_phrases TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        sample_comments TEXT NOT NULL,
        autopilot_enabled INTEGER DEFAULT 0
    )
    """)

    # Community Comments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_comments (
        id TEXT PRIMARY KEY,
        video_id TEXT,
        video_title TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_avatar TEXT,
        content TEXT NOT NULL,
        published_at TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        suggested_reply TEXT NOT NULL,
        reply_reasoning TEXT NOT NULL,
        status TEXT NOT NULL,
        edited_reply TEXT,
        confidence_score REAL NOT NULL
    )
    """)

    # Semantic Items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS semantic_items (
        id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL,
        title TEXT NOT NULL,
        snippet TEXT NOT NULL,
        tags TEXT NOT NULL,
        timestamp REAL,
        tension_score REAL,
        metadata_json TEXT
    )
    """)

    # Content Calendar Slots
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS calendar_slots (
        id TEXT PRIMARY KEY,
        day_of_week TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        platform TEXT NOT NULL,
        recommended_topic TEXT NOT NULL,
        projected_engagement TEXT NOT NULL,
        format TEXT NOT NULL,
        hook_idea TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    seed_demo_data_if_empty()

def seed_demo_data_if_empty():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM projects")
    count = cursor.fetchone()[0]
    if count > 0:
        conn.close()
        return

    # Seed Default Project
    project_id = "proj-pilot-01"
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO projects (id, title, source_url, duration, status, created_at, average_tension, speech_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        project_id,
        "The $10M Solopreneur Formula: How AI Automates the Creative Grind",
        "https://youtube.com/watch?v=solopreneur-ai-masterclass",
        1840.0,
        "completed",
        now_iso,
        74.5,
        "Deep-dive into creator burnout, algorithmic distribution bottlenecks, and autonomous agent orchestration."
    ))

    # Seed Tension Beats (Timeline)
    demo_beats = [
        {
            "id": "beat-1",
            "start": 12.0, "end": 45.0,
            "tension": 89.2, "energy": 84.0, "pace": 178, "sentiment": 82.0, "laughter": 15.0, "hook": 94.0,
            "summary": "Explosive Hook: The 60% Creative Tax Solo Creators Pay Every Day",
            "snippet": "If you are spending 5 hours editing thumbnails and replying to comments instead of filming, you don't have a media business - you have an unpaid intern job.",
            "is_peak": 1,
            "reel_url": "/api/static/reels/reel-tax.mp4"
        },
        {
            "id": "beat-2",
            "start": 124.0, "end": 178.0,
            "tension": 76.4, "energy": 71.0, "pace": 160, "sentiment": 64.0, "laughter": 40.0, "hook": 78.0,
            "summary": "Contrarian Take: Why Manual Multi-Platform Repurposing Is Dead",
            "snippet": "Exporting 4 different aspect ratios manually in Premiere is a symptom of broken tooling. Agents should track active faces and crop 9:16 automatically.",
            "is_peak": 0,
            "reel_url": "/api/static/reels/reel-repurpose.mp4"
        },
        {
            "id": "beat-3",
            "start": 310.0, "end": 365.0,
            "tension": 96.8, "energy": 92.0, "pace": 194, "sentiment": 91.0, "laughter": 10.0, "hook": 98.0,
            "summary": "Climax Reveal: Real-Time Saliency Heatmaps Predict CTR Before Publishing",
            "snippet": "Look at this heat bloom right on the eye gaze vector! Spectral residual analysis spots visual fatigue before YouTube's algorithm punishes you.",
            "is_peak": 1,
            "reel_url": "/api/static/reels/reel-heatmaps.mp4"
        },
        {
            "id": "beat-4",
            "start": 540.0, "end": 598.0,
            "tension": 82.5, "energy": 78.0, "pace": 168, "sentiment": 75.0, "laughter": 22.0, "hook": 85.0,
            "summary": "Community Moat: Maintaining Creator Voice at 10,000 Comments a Day",
            "snippet": "Audience connection isn't built on generic 'Thanks for watching!'. You need few-shot persona calibration so replies sound undeniably human.",
            "is_peak": 1,
            "reel_url": "/api/static/reels/reel-community.mp4"
        },
        {
            "id": "beat-5",
            "start": 820.0, "end": 862.0,
            "tension": 68.0, "energy": 62.0, "pace": 145, "sentiment": 58.0, "laughter": 35.0, "hook": 71.0,
            "summary": "Operational Cadence: The Weekly Insights Feedback Loop",
            "snippet": "Stop guessing when your audience wakes up in Tokyo or New York. Let the insights agent correlate retention drops with topic shifts.",
            "is_peak": 0,
            "reel_url": "/api/static/reels/reel-cadence.mp4"
        }
    ]

    for b in demo_beats:
        cursor.execute("""
        INSERT INTO tension_beats (
            id, project_id, timestamp_start, timestamp_end, tension_score, audio_energy_score,
            speech_pace_wpm, sentiment_shift_score, laughter_or_pause_score, hook_rating,
            hook_summary, transcript_snippet, is_peak, reel_export_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["id"], project_id, b["start"], b["end"], b["tension"], b["energy"],
            b["pace"], b["sentiment"], b["laughter"], b["hook"],
            b["summary"], b["snippet"], b["is_peak"], b["reel_url"]
        ))

    # Seed Thumbnail Variants
    demo_thumbs = [
        {
            "id": "thumb-a",
            "label": "Variant A - Cyber Contrast",
            "timestamp": 314.5,
            "image": "/api/static/thumbnails/variant_a.jpg",
            "heatmap": "/api/static/thumbnails/heatmap_a.jpg",
            "saliency": 94.2,
            "gemini": 92.0,
            "composite": 93.1,
            "face": 1,
            "hook": "THE 60% TAX",
            "color": "cyber_cyan",
            "why": "High focal concentration on expressive facial reaction + high-contrast text hook in top third eliminates visual competition.",
            "votes": 342,
            "impressions": 2840,
            "ctr": 12.04
        },
        {
            "id": "thumb-b",
            "label": "Variant B - Neon Magenta Hook",
            "timestamp": 16.0,
            "image": "/api/static/thumbnails/variant_b.jpg",
            "heatmap": "/api/static/thumbnails/heatmap_b.jpg",
            "saliency": 86.8,
            "gemini": 84.5,
            "composite": 85.6,
            "face": 1,
            "hook": "STOP EDITING NOW",
            "color": "electric_magenta",
            "why": "Aggressive urgency trigger with warm split-tone grading, but slight eye-gaze drift drops fine-grained saliency.",
            "votes": 218,
            "impressions": 2510,
            "ctr": 8.68
        },
        {
            "id": "thumb-c",
            "label": "Variant C - Raw Insight Close-up",
            "timestamp": 542.0,
            "image": "/api/static/thumbnails/variant_c.jpg",
            "heatmap": "/api/static/thumbnails/heatmap_c.jpg",
            "saliency": 78.4,
            "gemini": 81.0,
            "composite": 79.7,
            "face": 1,
            "hook": "AI AUTOPILOT",
            "color": "cinema_contrast",
            "why": "Clean minimal aesthetic with cinematic vignette. Good for podcast listeners, lower raw scroll-stopping punch.",
            "votes": 145,
            "impressions": 2190,
            "ctr": 6.62
        }
    ]

    for t in demo_thumbs:
        cursor.execute("""
        INSERT INTO thumbnail_variants (
            id, project_id, label, frame_timestamp, image_url, heatmap_url, saliency_score,
            gemini_vision_score, composite_score, face_detected, text_hook, color_grade,
            why_this_wins, ab_votes, ab_impressions, simulated_ctr
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"], project_id, t["label"], t["timestamp"], t["image"], t["heatmap"],
            t["saliency"], t["gemini"], t["composite"], t["face"], t["hook"],
            t["color"], t["why"], t["votes"], t["impressions"], t["ctr"]
        ))

    # Seed Creator Persona
    persona_id = "persona-alex-tech"
    cursor.execute("""
    INSERT INTO persona_profile (
        id, name, creator_handle, niche, tone_humor, tone_enthusiasm, tone_technicality,
        tone_empathy, banned_words, signature_phrases, system_prompt, sample_comments, autopilot_enabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        persona_id,
        "Alex Rivera",
        "@alexrivera_ai",
        "AI Automation & Creator Strategy",
        75.0,
        82.0,
        88.0,
        70.0,
        json.dumps(["cheap", "guaranteed", "easy money", "crypto", "dm me"]),
        json.dumps(["Let's break down the mechanics.", "Ship early, iterate ruthlessly.", "Zero fluff."]),
        "You are Alex Rivera, an elite developer-creator who speaks with crisp technical clarity, dry wit, and high encouragement. Answer questions directly, offer tactical code or workflow snippets, and keep responses under 3 sentences.",
        json.dumps([
            {"user": "Does this work without a paid GPU?", "reply": "100%! All tension beat math and saliency heatmaps run locally on standard CPU via OpenCV and faster-whisper."},
            {"user": "How do you avoid sounding like a generic bot?", "reply": "Few-shot persona injection plus human approval gates. I approve every high-stakes response in 1 click."}
        ]),
        0
    ))

    # Seed Community Comments
    demo_comments = [
        {
            "id": "comm-1",
            "video_id": project_id,
            "video_title": "The $10M Solopreneur Formula",
            "author": "dev_marcus",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
            "content": "Can I run the tension beat detector on a standard laptop with no NVIDIA GPU?",
            "published": "12m ago",
            "sentiment": "question",
            "reply": "Yes! Built on CPU-friendly Spectral Residual saliency and faster-whisper quantised models. Zero GPU required to hit 60fps analysis.",
            "reasoning": "High technical question; validated local CPU capability and addressed hardware barrier directly.",
            "status": "pending",
            "confidence": 98.4
        },
        {
            "id": "comm-2",
            "video_id": project_id,
            "video_title": "The $10M Solopreneur Formula",
            "author": "sarah_content",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            "content": "The visual heatmap comparison at 05:10 blew my mind. Where does the attention score come from?",
            "published": "34m ago",
            "sentiment": "positive",
            "reply": "Thank you Sarah! It combines OpenCV's fine-grained saliency with a contrast-prominence formula to spot what human foveal vision locks onto first.",
            "reasoning": "Positive reaction to Thumbnail Lab; offered concise technical explanation matching creator persona.",
            "status": "pending",
            "confidence": 95.0
        },
        {
            "id": "comm-3",
            "video_id": project_id,
            "video_title": "The $10M Solopreneur Formula",
            "author": "growth_hacker_99",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Growth",
            "content": "Most tools charge $49/mo for multi-aspect cuts. Is this really 100% free forever?",
            "published": "1h ago",
            "sentiment": "question",
            "reply": "Completely free and open-source (MIT). No credit card, no paid cloud lock-in - you own the Docker container and your data.",
            "reasoning": "Addressed pricing skepticism by emphasizing MIT license and self-hosted sovereignty.",
            "status": "approved",
            "confidence": 99.1
        },
        {
            "id": "comm-4",
            "video_id": project_id,
            "video_title": "The $10M Solopreneur Formula",
            "author": "troll_account_44",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Troll",
            "content": "Nobody cares about thumbnails anymore just post good videos lol",
            "published": "2h ago",
            "sentiment": "critique",
            "reply": "Data shows 82% of YouTube browse-feature clicks depend entirely on thumbnail contrast and first 3 seconds of retention. Why gamble when you can test?",
            "reasoning": "Respectfully refuted with empirical distribution metrics while avoiding defensive tone.",
            "status": "pending",
            "confidence": 88.2
        }
    ]

    for c in demo_comments:
        cursor.execute("""
        INSERT INTO community_comments (
            id, video_id, video_title, author_name, author_avatar, content, published_at,
            sentiment, suggested_reply, reply_reasoning, status, confidence_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["id"], c["video_id"], c["video_title"], c["author"], c["avatar"],
            c["content"], c["published"], c["sentiment"], c["reply"],
            c["reasoning"], c["status"], c["confidence"]
        ))

    # Seed Content Calendar
    demo_slots = [
        {"id": "slot-1", "day": "Tuesday", "time": "15:00 UTC", "platform": "reels", "topic": "Tension Peak Breakdown: The 60% Creative Tax", "eng": "Very High", "format": "9:16", "hook": "You are paying an invisible creative tax every day..."},
        {"id": "slot-2", "day": "Wednesday", "time": "18:30 UTC", "platform": "shorts", "topic": "Attention Heatmaps: Eye-Tracking Without Hardware", "eng": "Very High", "format": "9:16", "hook": "Here is what YouTube viewers actually stare at..."},
        {"id": "slot-3", "day": "Thursday", "time": "13:00 UTC", "platform": "linkedin", "topic": "Architecting Autonomous Creator Agents with Local Python", "eng": "High", "format": "1:1", "hook": "Why solo operators will replace 10-person production agencies in 2026."},
        {"id": "slot-4", "day": "Friday", "time": "20:00 UTC", "platform": "tiktok", "topic": "Thumbnail Lab Live A/B Showdown", "eng": "Very High", "format": "9:16", "hook": "I tested 3 thumbnails on 10,000 views. The winner shocked me."},
        {"id": "slot-5", "day": "Sunday", "time": "17:00 UTC", "platform": "x", "topic": "Open-Source AI Stack Breakdown (faster-whisper + OpenCV)", "eng": "High", "format": "16:9", "hook": "How to build a zero-cost video intelligence engine in 400 lines of Python."}
    ]

    for s in demo_slots:
        cursor.execute("""
        INSERT INTO calendar_slots (
            id, day_of_week, time_slot, platform, recommended_topic, projected_engagement, format, hook_idea
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["day"], s["time"], s["platform"], s["topic"], s["eng"], s["format"], s["hook"]
        ))

    # Seed Semantic Library Items
    demo_semantic = [
        {"id": "sem-1", "type": "clip", "title": "The 60% Creative Tax", "snippet": "Breakdown of lost hours in thumbnail iteration and comments.", "tags": ["burnout", "productivity", "time-management", "creative-tax"], "ts": 12.0, "tension": 89.2},
        {"id": "sem-2", "type": "clip", "title": "Real-Time Saliency Heatmap Reveal", "snippet": "Demonstrating how eye-tracking hotspots predict click-through rate.", "tags": ["thumbnails", "heatmaps", "saliency", "ctr", "opencv"], "ts": 310.0, "tension": 96.8},
        {"id": "sem-3", "type": "thumbnail", "title": "Variant A - Cyber Contrast", "snippet": "High focal concentration on face with cyber cyan overlay.", "tags": ["variant-a", "cyberpunk", "high-ctr", "face-zoom"], "ts": 314.5, "tension": 94.2},
        {"id": "sem-4", "type": "comment", "title": "dev_marcus Question", "snippet": "Can I run the tension beat detector on CPU with no NVIDIA GPU?", "tags": ["hardware", "cpu", "faster-whisper", "faq"], "ts": 0.0, "tension": 75.0}
    ]

    for sm in demo_semantic:
        cursor.execute("""
        INSERT INTO semantic_items (
            id, item_type, title, snippet, tags, timestamp, tension_score, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sm["id"], sm["type"], sm["title"], sm["snippet"], json.dumps(sm["tags"]),
            sm["ts"], sm["tension"], json.dumps({})
        ))

    conn.commit()
    conn.close()
