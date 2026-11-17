# CreatorPilot - Open Source Dependency License Audit

**Hard Rule Compliance:** 100% Free. No paid APIs, no paid hosting, no credit card, no trials. Every library listed below is officially free and verified safe for commercial use.

---

## 1. Backend Core Dependencies (Python)

| Library / Tool | Version | License | Commercial Use | Purpose | Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FastAPI** | `>=0.110.0` | MIT | Permitted | REST API & WebSocket endpoints | $0 |
| **Uvicorn** | `>=0.28.0` | BSD-3-Clause | Permitted | Lightning ASGI server | $0 |
| **OpenCV (contrib)**| `>=4.8.0` | Apache 2.0 | Permitted | Spectral Residual visual saliency heatmaps | $0 |
| **Pillow (PIL)** | `>=10.0.0` | HPND (MIT-like)| Permitted | Thumbnail contrast grading & text overlays | $0 |
| **NumPy** | `>=1.24.0` | BSD-3-Clause | Permitted | Vector math & tensor array operations | $0 |
| **Pydantic** | `>=2.6.0` | MIT | Permitted | Request validation and schema contracts | $0 |
| **SQLite3** | Built-in | Public Domain | Permitted | Relational persistence & indexing | $0 |
| **faster-whisper** | Optional | MIT | Permitted | Local CPU-quantized transcription | $0 |
| **MediaPipe** | Optional | Apache 2.0 | Permitted | Face mesh & active speaker tracking | $0 |

---

## 2. Frontend Core Dependencies (Next.js / TypeScript)

| Package | Version | License | Commercial Use | Purpose | Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Next.js** | `^14.2.5` | MIT | Permitted | App Router React Framework | $0 |
| **React & React-DOM**| `^18.3.1` | MIT | Permitted | Declarative UI rendering | $0 |
| **Tailwind CSS** | `^3.4.7` | MIT | Permitted | Utility styling & design system | $0 |
| **Lucide React** | `^0.417.0` | ISC / MIT | Permitted | Consistent iconography | $0 |
| **Framer Motion** | `^11.3.19` | MIT | Permitted | Fluid animations & layout transitions | $0 |
| **Recharts** | `^2.12.7` | MIT | Permitted | Visual charts and graph rendering | $0 |
| **Playwright** | `^1.45.3` | Apache 2.0 | Permitted | Automated 30s demo recording | $0 |

---

## 3. External Free Quotas & Local Fallbacks

| Service | Tier / Provider | Terms | Failover Strategy | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** | Free Tier | Free (15 RPM, 1M TPM, 1,500 RPD) | Falls back to local Ollama on 429 rate limit | $0 |
| **Ollama (Llama 3)** | Local Binary | Open Source (Apache / Llama 3 Community) | Runs 100% offline on local CPU/RAM | $0 |
| **YouTube Data API v3**| Free Tier | Free (10,000 units/day) | Falls back to rich offline mock mode | $0 |

---

## 4. Verification Checklist

- [x] Zero credit card required
- [x] Zero proprietary or paid cloud hosting required
- [x] No paid generative image APIs (Midjourney, fal.ai, DALL-E) — replaced with Pillow + OpenCV
- [x] No paid voice dubbing APIs (ElevenLabs) — stripped from openshorts base
- [x] All licenses are permissive (MIT, Apache 2.0, BSD, HPND, Public Domain)
