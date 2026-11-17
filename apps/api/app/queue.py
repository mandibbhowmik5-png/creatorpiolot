import asyncio
import uuid
from typing import Dict, Any, Callable, List, Optional
from datetime import datetime, timezone

class JobStatus:
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class JobQueue:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.listeners: List[asyncio.Queue] = []
        self._lock = asyncio.Lock()

    async def create_job(self, job_type: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        job_id = f"job-{uuid.uuid4().hex[:8]}"
        job = {
            "id": job_id,
            "type": job_type,
            "status": JobStatus.QUEUED,
            "progress": 0,
            "stage": "Initialized",
            "message": "Job queued for processing",
            "result": None,
            "error": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }
        async with self._lock:
            self.jobs[job_id] = job
        await self.broadcast(job)
        return job_id

    async def update_job(
        self,
        job_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        stage: Optional[str] = None,
        message: Optional[str] = None,
        result: Optional[Any] = None,
        error: Optional[str] = None
    ):
        async with self._lock:
            if job_id not in self.jobs:
                return
            job = self.jobs[job_id]
            if status is not None:
                job["status"] = status
            if progress is not None:
                job["progress"] = min(100, max(0, progress))
            if stage is not None:
                job["stage"] = stage
            if message is not None:
                job["message"] = message
            if result is not None:
                job["result"] = result
            if error is not None:
                job["error"] = error
            job["updated_at"] = datetime.now(timezone.utc).isoformat()

        await self.broadcast(job)

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.jobs.get(job_id)

    def list_jobs(self) -> List[Dict[str, Any]]:
        return list(self.jobs.values())

    async def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self.listeners.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self.listeners:
            self.listeners.remove(q)

    async def broadcast(self, payload: Dict[str, Any]):
        for q in list(self.listeners):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                pass
            except Exception:
                pass

# Global Singleton Queue
job_queue = JobQueue()
