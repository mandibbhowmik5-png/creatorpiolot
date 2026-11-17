import asyncio
import json
import os
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import DATA_DIR, MEDIA_DIR, EXPORTS_DIR, THUMBNAILS_DIR, DEMO_MODE
from .database import init_db, get_connection
from .queue import job_queue, JobStatus
from .services.gemini_llm import llm_service
from .services.tension_detector import tension_detector
from .services.thumbnail_lab import thumbnail_lab
from .services.persona_studio import persona_studio
from .services.cutdown_engine import cutdown_engine
from .services.semantic_library import semantic_library
from .services.insights_agent import insights_agent

# Initialize DB and schema
init_db()

# Generate initial physical thumbnail images if missing
try:
    thumbnail_lab.generate_variants_for_project("proj-pilot-01")
except Exception as e:
    print(f"[Main] Initial thumbnail generation notice: {e}")

app = FastAPI(
    title="CreatorPilot API",
    description="Autonomous Creator Agents for Content Strategy & Distribution - 100% Free & Open Source",
    version="1.0.0"
)

# Enable CORS for Next.js frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static File Handlers
app.mount("/api/static/thumbnails", StaticFiles(directory=str(THUMBNAILS_DIR)), name="thumbnails")
app.mount("/api/static/exports", StaticFiles(directory=str(EXPORTS_DIR)), name="exports")

# ----------------- PYDANTIC REQUEST SCHEMAS -----------------

class AnalyzeVideoRequest(BaseModel):
    videoUrl: str = Field(..., example="https://youtube.com/watch?v=solopreneur-ai-masterclass")
    title: Optional[str] = "The $10M Solopreneur Formula"
    durationSeconds: Optional[float] = 1840.0

class ExportReelRequest(BaseModel):
    beatId: str
    projectId: str
    aspectRatio: Optional[str] = "9:16"

class PersonaUpdateRequest(BaseModel):
    toneHumor: float = 75.0
    toneEnthusiasm: float = 80.0
    toneTechnicality: float = 85.0
    toneEmpathy: float = 70.0
    bannedWords: List[str] = []
    signaturePhrases: List[str] = []
    systemPrompt: str = ""
    autopilotEnabled: bool = False

class PreviewChatRequest(BaseModel):
    comment: str
    author: Optional[str] = "CuriousViewer"

class CommentActionRequest(BaseModel):
    action: str = Field(..., example="approve") # approve, edit, reject, post
    editedReply: Optional[str] = None

class CutdownRequest(BaseModel):
    clipId: str
    title: str
    transcriptSnippet: str
    startTime: float
    endTime: float

# ----------------- WEBSOCKET REALTIME STREAM -----------------

@app.websocket("/ws/progress")
async def websocket_progress_endpoint(websocket: WebSocket):
    await websocket.accept()
    sub_queue = await job_queue.subscribe()
    try:
        # Welcome event
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to CreatorPilot live agent event stream",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        while True:
            # Check for job events
            try:
                event = await asyncio.wait_for(sub_queue.get(), timeout=1.0)
                await websocket.send_json({"type": "job_update", "data": event})
            except asyncio.TimeoutError:
                # Keep alive ping
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    finally:
        job_queue.unsubscribe(sub_queue)

# ----------------- SYSTEM & HEALTH -----------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CreatorPilot Autonomous Agent Engine",
        "version": "1.0.0",
        "license": "MIT (100% Free & Open Source)",
        "demoMode": DEMO_MODE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/seed")
async def reset_seed_data():
    from .database import seed_demo_data_if_empty
    seed_demo_data_if_empty()
    return {"message": "Demo data refreshed successfully"}

# ----------------- AGENT 1: TENSION BEAT DETECTOR -----------------

@app.post("/api/tension/analyze")
async def analyze_video(req: AnalyzeVideoRequest, background_tasks: BackgroundTasks):
    job_id = await job_queue.create_job("tension_analysis", {"url": req.videoUrl, "title": req.title})

    async def _run_analysis():
        try:
            await job_queue.update_job(job_id, status=JobStatus.PROCESSING, progress=15, stage="Transcribing", message="Transcribing speech with faster-whisper CPU model...")
            await asyncio.sleep(0.5)

            await job_queue.update_job(job_id, progress=45, stage="Audio Energy & Speech Pace", message="Computing RMS amplitude and syllabic tempo...")
            await asyncio.sleep(0.5)

            analysis = tension_detector.analyze_segments(
                video_duration=req.durationSeconds or 1200.0,
                video_title=req.title or "Video"
            )

            await job_queue.update_job(job_id, progress=80, stage="Hook Scoring", message="Scoring retention peaks via LLM hook judgment...")
            await asyncio.sleep(0.4)

            # Persist project and beats
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("""
            INSERT OR REPLACE INTO projects (id, title, source_url, duration, status, created_at, average_tension, speech_summary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                job_id,
                req.title or "Analyzed Video",
                req.videoUrl,
                req.durationSeconds or 1200.0,
                "completed",
                datetime.now(timezone.utc).isoformat(),
                analysis["averageTension"],
                analysis["summary"]
            ))

            for b in analysis["beats"]:
                cur.execute("""
                INSERT OR REPLACE INTO tension_beats (
                    id, project_id, timestamp_start, timestamp_end, tension_score, audio_energy_score,
                    speech_pace_wpm, sentiment_shift_score, laughter_or_pause_score, hook_rating,
                    hook_summary, transcript_snippet, is_peak, reel_export_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"{job_id}-{b['id']}", job_id, b["timestampStart"], b["timestampEnd"],
                    b["tensionScore"], b["audioEnergyScore"], b["speechPaceWpm"],
                    b["sentimentShiftScore"], b["laughterOrPauseScore"], b["hookRating"],
                    b["hookSummary"], b["transcriptSnippet"], 1 if b["isPeak"] else 0,
                    b["reelExportUrl"]
                ))
            conn.commit()
            conn.close()

            await job_queue.update_job(
                job_id,
                status=JobStatus.COMPLETED,
                progress=100,
                stage="Completed",
                message=f"Detected {len([b for b in analysis['beats'] if b['isPeak']])} peak retention reels!",
                result=analysis
            )
        except Exception as e:
            await job_queue.update_job(job_id, status=JobStatus.FAILED, error=str(e), message="Tension analysis failed")

    background_tasks.add_task(_run_analysis)
    return {"jobId": job_id, "status": "queued"}

@app.get("/api/tension/projects")
async def list_projects():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/tension/projects/{project_id}")
async def get_project(project_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cur.fetchone()
    if not proj:
        # Fallback to demo project
        cur.execute("SELECT * FROM projects LIMIT 1")
        proj = cur.fetchone()

    cur.execute("SELECT * FROM tension_beats WHERE project_id = ? ORDER BY timestamp_start ASC", (proj["id"],))
    beats_rows = cur.fetchall()
    conn.close()

    beats = [
        {
            "id": r["id"],
            "timestampStart": r["timestamp_start"],
            "timestampEnd": r["timestamp_end"],
            "tensionScore": r["tension_score"],
            "audioEnergyScore": r["audio_energy_score"],
            "speechPaceWpm": r["speech_pace_wpm"],
            "sentimentShiftScore": r["sentiment_shift_score"],
            "laughterOrPauseScore": r["laughter_or_pause_score"],
            "hookRating": r["hook_rating"],
            "hookSummary": r["hook_summary"],
            "transcriptSnippet": r["transcript_snippet"],
            "isPeak": bool(r["is_peak"]),
            "reelExportUrl": r["reel_export_url"]
        }
        for r in beats_rows
    ]

    top_beats = sorted(beats, key=lambda b: b["tensionScore"], reverse=True)[:5]

    return {
        "jobId": proj["id"],
        "title": proj["title"],
        "duration": proj["duration"],
        "sourceUrl": proj["source_url"],
        "createdAt": proj["created_at"],
        "averageTension": proj["average_tension"],
        "speechSummary": proj["speech_summary"],
        "beats": beats,
        "topBeats": top_beats
    }

# ----------------- AGENT 2: THUMBNAIL LAB -----------------

@app.get("/api/thumbnails/{project_id}")
async def get_thumbnails(project_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM thumbnail_variants ORDER BY composite_score DESC")
    rows = cur.fetchall()
    conn.close()

    if not rows:
        variants = thumbnail_lab.generate_variants_for_project(project_id)
        return variants

    return [
        {
            "id": r["id"],
            "projectId": r["project_id"],
            "label": r["label"],
            "frameTimestamp": r["frame_timestamp"],
            "imageUrl": r["image_url"],
            "heatmapUrl": r["heatmap_url"],
            "saliencyScore": r["saliency_score"],
            "geminiVisionScore": r["gemini_vision_score"],
            "compositeScore": r["composite_score"],
            "faceDetected": bool(r["face_detected"]),
            "textHook": r["text_hook"],
            "colorGrade": r["color_grade"],
            "whyThisWins": r["why_this_wins"],
            "abVotes": r["ab_votes"],
            "abImpressions": r["ab_impressions"],
            "simulatedCtr": r["simulated_ctr"]
        }
        for r in rows
    ]

@app.post("/api/thumbnails/generate")
async def generate_thumbnail_variants(req: Dict[str, Any]):
    project_id = req.get("projectId", "proj-pilot-01")
    hooks = req.get("hooks")
    variants = thumbnail_lab.generate_variants_for_project(project_id, hooks=hooks)

    conn = get_connection()
    cur = conn.cursor()
    for v in variants:
        cur.execute("""
        INSERT OR REPLACE INTO thumbnail_variants (
            id, project_id, label, frame_timestamp, image_url, heatmap_url, saliency_score,
            gemini_vision_score, composite_score, face_detected, text_hook, color_grade,
            why_this_wins, ab_votes, ab_impressions, simulated_ctr
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            v["id"], v["projectId"], v["label"], v["frameTimestamp"], v["imageUrl"],
            v["heatmapUrl"], v["saliencyScore"], v["geminiVisionScore"], v["compositeScore"],
            1 if v["faceDetected"] else 0, v["textHook"], v["colorGrade"], v["whyThisWins"],
            v["abVotes"], v["abImpressions"], v["simulatedCtr"]
        ))
    conn.commit()
    conn.close()

    return {"variants": variants, "winner": variants[0]}

@app.post("/api/thumbnails/ab-simulate")
async def simulate_ab_tick_endpoint():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM thumbnail_variants")
    rows = [dict(r) for r in cur.fetchall()]
    
    # Map column names
    mapped = []
    for r in rows:
        mapped.append({
            "id": r["id"],
            "projectId": r["project_id"],
            "label": r["label"],
            "frameTimestamp": r["frame_timestamp"],
            "imageUrl": r["image_url"],
            "heatmapUrl": r["heatmap_url"],
            "saliencyScore": r["saliency_score"],
            "geminiVisionScore": r["gemini_vision_score"],
            "compositeScore": r["composite_score"],
            "faceDetected": bool(r["face_detected"]),
            "textHook": r["text_hook"],
            "colorGrade": r["color_grade"],
            "whyThisWins": r["why_this_wins"],
            "abVotes": r["ab_votes"],
            "abImpressions": r["ab_impressions"],
            "simulatedCtr": r["simulated_ctr"]
        })
    
    updated = thumbnail_lab.simulate_ab_tick(mapped)
    for u in updated:
        cur.execute("""
        UPDATE thumbnail_variants
        SET ab_votes = ?, ab_impressions = ?, simulated_ctr = ?
        WHERE id = ?
        """, (u["abVotes"], u["abImpressions"], u["simulatedCtr"], u["id"]))
    conn.commit()
    conn.close()

    return {"variants": updated, "leader": updated[0]}

# ----------------- AGENT 3: PERSONA STUDIO -----------------

@app.get("/api/persona")
async def get_persona():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM persona_profile LIMIT 1")
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Persona not found")

    return {
        "id": row["id"],
        "name": row["name"],
        "creatorHandle": row["creator_handle"],
        "niche": row["niche"],
        "toneHumor": row["tone_humor"],
        "toneEnthusiasm": row["tone_enthusiasm"],
        "toneTechnicality": row["tone_technicality"],
        "toneEmpathy": row["tone_empathy"],
        "bannedWords": json.loads(row["banned_words"]),
        "signaturePhrases": json.loads(row["signature_phrases"]),
        "systemPrompt": row["system_prompt"],
        "sampleComments": json.loads(row["sample_comments"]),
        "autopilotEnabled": bool(row["autopilot_enabled"])
    }

@app.put("/api/persona")
async def update_persona(req: PersonaUpdateRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    UPDATE persona_profile
    SET tone_humor = ?, tone_enthusiasm = ?, tone_technicality = ?, tone_empathy = ?,
        banned_words = ?, signature_phrases = ?, system_prompt = ?, autopilot_enabled = ?
    """, (
        req.toneHumor, req.toneEnthusiasm, req.toneTechnicality, req.toneEmpathy,
        json.dumps(req.bannedWords), json.dumps(req.signaturePhrases), req.systemPrompt,
        1 if req.autopilotEnabled else 0
    ))
    conn.commit()
    conn.close()
    return {"message": "Persona updated successfully"}

@app.post("/api/persona/test-chat")
async def preview_persona_chat(req: PreviewChatRequest):
    persona_data = await get_persona()
    reply = persona_studio.generate_reply(req.comment, req.author or "Viewer", persona_data)
    return reply

@app.get("/api/comments")
async def get_comments():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM community_comments ORDER BY rowid DESC")
    rows = cur.fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "videoId": r["video_id"],
            "videoTitle": r["video_title"],
            "authorName": r["author_name"],
            "authorAvatar": r["author_avatar"],
            "content": r["content"],
            "publishedAt": r["published_at"],
            "sentiment": r["sentiment"],
            "suggestedReply": r["suggested_reply"],
            "replyReasoning": r["reply_reasoning"],
            "status": r["status"],
            "editedReply": r["edited_reply"],
            "confidenceScore": r["confidence_score"]
        }
        for r in rows
    ]

@app.post("/api/comments/{comment_id}/action")
async def comment_action(comment_id: str, req: CommentActionRequest):
    conn = get_connection()
    cur = conn.cursor()
    if req.action == "approve":
        cur.execute("UPDATE community_comments SET status = 'approved' WHERE id = ?", (comment_id,))
    elif req.action == "reject":
        cur.execute("UPDATE community_comments SET status = 'rejected' WHERE id = ?", (comment_id,))
    elif req.action == "edit":
        cur.execute("UPDATE community_comments SET status = 'approved', edited_reply = ? WHERE id = ?", (req.editedReply, comment_id))
    elif req.action == "post":
        cur.execute("UPDATE community_comments SET status = 'posted' WHERE id = ?", (comment_id,))
    conn.commit()
    conn.close()
    return {"id": comment_id, "action": req.action, "status": "updated"}

# ----------------- MULTI-PLATFORM CUTDOWN ENGINE -----------------

@app.post("/api/cutdown/generate")
async def generate_cutdowns(req: CutdownRequest):
    cuts_package = cutdown_engine.generate_all_cuts(
        clip_id=req.clipId,
        title=req.title,
        transcript_snippet=req.transcriptSnippet,
        start_time=req.startTime,
        end_time=req.endTime
    )
    return cuts_package

# ----------------- SEMANTIC LIBRARY -----------------

@app.get("/api/semantic/search")
async def search_semantic(query: str = "", filter_type: str = "all"):
    results = semantic_library.search(query, filter_type=filter_type)
    return {"query": query, "results": results, "count": len(results)}

# ----------------- STRATEGY INSIGHTS & CALENDAR -----------------

@app.get("/api/insights/weekly-report")
async def get_weekly_insights():
    report = insights_agent.generate_weekly_report()
    return report

@app.get("/api/insights/calendar")
async def get_content_calendar():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM calendar_slots")
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "dayOfWeek": r["day_of_week"],
            "timeSlot": r["time_slot"],
            "platform": r["platform"],
            "recommendedTopic": r["recommended_topic"],
            "projectedEngagement": r["projected_engagement"],
            "format": r["format"],
            "hookIdea": r["hook_idea"]
        }
        for r in rows
    ]

# ----------------- JOB PROGRESS -----------------

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    job = job_queue.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
