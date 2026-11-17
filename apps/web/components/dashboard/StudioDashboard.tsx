"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "../../lib/api";
import { VideoAnalysisResult, ThumbnailVariant, CommunityComment } from "../../../../packages/shared/types";
import { MOCK_PROJECT, MOCK_THUMBNAILS, MOCK_COMMENTS } from "../../lib/mockData";
import {
  Flame, Eye, MessageSquare, Layers, Search, TrendingUp, Calendar, Download,
  Play, CheckCircle, XCircle, Edit3, Send, Copy, RefreshCw, Sliders, Sparkles, Check,
  Link2, Loader2, Zap, AlertCircle,
} from "lucide-react";
import { MOCK_REPORT, MOCK_CALENDAR, MOCK_CUTS } from "../../lib/mockData";

type TabId = "analyze" | "tension" | "thumbnails" | "persona" | "cutdowns" | "insights" | "export";

export default function StudioDashboard({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || "tension");

  // ── Live Data State ─────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(false);
  const [project, setProject] = useState<VideoAnalysisResult>(MOCK_PROJECT);
  const [thumbnails, setThumbnails] = useState<ThumbnailVariant[]>(MOCK_THUMBNAILS);
  const [comments, setComments] = useState<CommunityComment[]>(MOCK_COMMENTS);
  const [loading, setLoading] = useState(true);

  // ── Video Analyze Form State ────────────────────────────────────────────
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState("");
  const [jobDone, setJobDone] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ── Thumbnail Lab State ─────────────────────────────────────────────────
  const [heatmapOn, setHeatmapOn] = useState<Record<string, boolean>>({});
  const [abSimulating, setAbSimulating] = useState(false);

  // ── Persona Chat State ──────────────────────────────────────────────────
  const [persona, setPersona] = useState(await_persona());
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "user" as const, text: "Does this run without a GPU?" },
    { sender: "creator" as const, text: "100%! All saliency math and transcription run on standard CPU. Zero cloud GPU costs." },
  ]);

  // ── Cutdown & Export ────────────────────────────────────────────────────
  const [selectedBeat, setSelectedBeat] = useState(MOCK_PROJECT.beats[2]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reelLoading, setReelLoading] = useState(false);

  // ── Semantic Search ─────────────────────────────────────────────────────
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [semanticLoading, setSemanticLoading] = useState(false);

  function await_persona() { return require("../../lib/mockData").MOCK_PERSONA; }

  // ── Bootstrap: load live data once on mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const online = await api.isOnline();
      setIsOnline(online);

      const [proj, thumbs, comms] = await Promise.all([
        api.getProject("proj-pilot-01"),
        api.getThumbnails("proj-pilot-01"),
        api.getComments(),
      ]);
      setProject(proj);
      if (proj.beats.length) setSelectedBeat(proj.beats[2] ?? proj.beats[0]);
      setThumbnails(thumbs);
      setComments(comms);
      setLoading(false);
    })();
  }, []);

  // ── WebSocket: attach once and handle all job_update events ────────────
  useEffect(() => {
    const ws = api.openProgressSocket((msg: any) => {
      if (msg.type === "job_update" && msg.data) {
        const d = msg.data;
        if (d.id === jobId || jobId === null) {
          setJobProgress(d.progress ?? 0);
          setJobStage(d.stage ?? "");
          if (d.status === "completed") {
            setJobDone(true);
            setAnalyzing(false);
            showToast("Analysis complete! Beats detected.");
            api.getProject(d.id).then((p) => {
              setProject(p);
              if (p.beats.length) setSelectedBeat(p.beats[2] ?? p.beats[0]);
              setActiveTab("tension");
            });
          }
          if (d.status === "failed") {
            setAnalyzing(false);
            showToast("Analysis failed — using demo data.");
          }
        }
      }
    });
    wsRef.current = ws;
    return () => ws?.close();
  }, [jobId]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) { showToast("Paste a video URL first."); return; }
    setAnalyzing(true);
    setJobProgress(5);
    setJobStage("Queued");
    setJobDone(false);
    const r = await api.analyzeVideo(videoUrl, videoTitle || undefined);
    setJobId(r.jobId);
    setActiveTab("tension");
    // poll fallback if WS unavailable
    let polls = 0;
    const poll = setInterval(async () => {
      polls++;
      const job = await api.getJob(r.jobId) as any;
      if (!job) { clearInterval(poll); return; }
      setJobProgress(job.progress ?? polls * 10);
      setJobStage(job.stage ?? "Processing");
      if (job.status === "completed" || job.status === "failed" || polls > 20) {
        clearInterval(poll);
        setAnalyzing(false);
        if (job.status === "completed") {
          setJobDone(true);
          showToast("Analysis complete!");
          const p = await api.getProject(r.jobId);
          setProject(p);
          if (p.beats.length) setSelectedBeat(p.beats[2] ?? p.beats[0]);
        }
      }
    }, 1500);
  };

  const handleSimulateAb = async () => {
    setAbSimulating(true);
    const r = await api.simulateAbTick();
    setThumbnails(r.variants);
    setTimeout(() => setAbSimulating(false), 700);
  };

  const handleCommentAction = async (id: string, action: "approve" | "reject") => {
    await api.commentAction(id, action);
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: action === "approve" ? "approved" : "rejected" } : c));
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text }]);
    const r = await api.testPersonaChat(text);
    setChatMessages(prev => [...prev, { sender: "creator", text: r.suggestedReply }]);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportReel = async (beat: typeof selectedBeat) => {
    setReelLoading(true);
    await api.generateCutdowns(`reel-${beat.id}`, beat.hookSummary, beat.transcriptSnippet, beat.timestampStart, beat.timestampEnd);
    setReelLoading(false);
    showToast(`Reel exported: "${beat.hookSummary}"`);
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    setSemanticLoading(true);
    const r = await api.searchSemantic(semanticQuery);
    setSemanticResults(r?.results ?? []);
    setSemanticLoading(false);
  };

  const resolveImg = (url: string) => api.resolveImageUrl(url);

  // ── Tabs config ──────────────────────────────────────────────────────────
  const tabs = [
    { id: "analyze", label: "Analyze Video", icon: Zap, color: "text-amber-400" },
    { id: "tension", label: "Tension Beats", icon: Flame, color: "text-cyan-400" },
    { id: "thumbnails", label: "Thumbnail Lab", icon: Eye, color: "text-pink-400" },
    { id: "persona", label: "Persona Studio", icon: MessageSquare, color: "text-violet-400" },
    { id: "cutdowns", label: "Multi-Platform", icon: Layers, color: "text-cyan-400" },
    { id: "insights", label: "Insights", icon: TrendingUp, color: "text-pink-400" },
    { id: "export", label: "Export", icon: Download, color: "text-white" },
  ] as const;

  return (
    <section id="dashboard" className="py-16 md:py-20 border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              LIVE AI CONTROL ROOM
              {isOnline ? (
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="ml-1 text-amber-400">· Demo Mode</span>
              )}
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              CreatorPilot <span className="text-gradient-cyan">Studio Dashboard</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1">
              {loading ? "Loading live data…" : (
                <>Active: <span className="text-white font-medium">{project.title}</span></>
              )}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#0D0F14] border border-white/10 flex items-center gap-2">
              <span className="text-slate-400">Avg Tension:</span>
              <span className="text-pink-400 font-bold">{project.averageTension}/100</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0D0F14] border border-white/10 flex items-center gap-2">
              <span className="text-slate-400">Top CTR:</span>
              <span className="text-cyan-400 font-bold">{thumbnails[0]?.simulatedCtr ?? "—"}%</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0D0F14] border border-white/10 flex items-center gap-2">
              <span className="text-slate-400">Queue:</span>
              <span className="text-amber-400 font-bold">{comments.filter(c => c.status === "pending").length} Pending</span>
            </div>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className="mb-5 p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-xs sm:text-sm font-mono flex items-center gap-2 shadow-cyan-glow animate-in fade-in">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            {toast}
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-white/[0.08]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider shrink-0 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-400/50 text-white shadow-cyan-glow"
                    : "bg-[#0B0E14] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB: ANALYZE VIDEO (new integrated form)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "analyze" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-6">
              <div>
                <h3 className="font-heading font-black text-xl text-white flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-amber-400" /> Analyze a New Video
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Paste any YouTube URL. CreatorPilot runs faster-whisper locally, maps the tension curve, and queues thumbnail generation — all 100% free on CPU.
                </p>
              </div>

              {/* URL Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Video title (optional)"
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-black font-heading font-black text-sm uppercase tracking-wider shadow-cyan-glow hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {analyzing ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Sparkles className="w-5 h-5 text-black" />}
                {analyzing ? `Processing… ${jobProgress}%` : "Run All 3 Agents Now"}
              </button>

              {/* Live Progress Bar */}
              {analyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>{jobStage || "Starting…"}</span>
                    <span className="text-cyan-400">{jobProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${jobProgress}%` }}
                      className="h-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 transition-all duration-500 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    WebSocket live progress stream active. Tabs will update automatically when complete.
                  </p>
                </div>
              )}

              {jobDone && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Analysis complete — switch to Tension Beats tab to explore results.
                </div>
              )}

              {/* What happens info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                {[
                  { step: "1", label: "Whisper Transcription", detail: "Local CPU · Word-level timestamps" },
                  { step: "2", label: "Tension Beat Detection", detail: "Energy · WPM · Hook Rating" },
                  { step: "3", label: "Thumbnail & Persona", detail: "OpenCV Saliency · Draft Replies" },
                ].map(s => (
                  <div key={s.step} className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                    <span className="font-mono text-cyan-400 font-bold block mb-1">Phase {s.step}</span>
                    <span className="font-heading font-bold text-white block">{s.label}</span>
                    <span className="text-slate-400">{s.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: TENSION BEATS
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "tension" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-cyan-400" /> Tension & Retention Timeline
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Live data from API — {project.beats.length} beats detected · Avg tension: {project.averageTension}/100
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1 text-pink-400"><span className="w-2 h-2 rounded-full bg-pink-500" /> Peak (&gt;80)</span>
                  <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Standard</span>
                </div>
              </div>

              {/* Timeline bars */}
              <div className="w-full h-52 sm:h-64 bg-black/60 rounded-2xl p-4 border border-white/5 flex items-end gap-2 overflow-x-auto">
                {project.beats.map((beat) => {
                  const isSelected = selectedBeat.id === beat.id;
                  return (
                    <div
                      key={beat.id}
                      onClick={() => setSelectedBeat(beat)}
                      className="flex-1 min-w-[44px] h-full flex flex-col justify-end items-center cursor-pointer group"
                    >
                      {beat.isPeak && (
                        <span className="text-[9px] font-mono font-bold text-pink-400 mb-1">★ {beat.tensionScore}</span>
                      )}
                      <div
                        style={{ height: `${beat.tensionScore}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 relative ${
                          isSelected
                            ? "bg-gradient-to-t from-pink-500 to-cyan-400 ring-2 ring-cyan-300"
                            : beat.isPeak
                            ? "bg-gradient-to-t from-pink-600/60 to-cyan-400/80"
                            : "bg-cyan-500/25 group-hover:bg-cyan-400/40"
                        }`}
                      >
                        {isSelected && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white animate-ping" />}
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1.5">
                        {Math.floor(beat.timestampStart / 60)}m{Math.floor(beat.timestampStart % 60)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Beat Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-pink-400 uppercase">
                    {selectedBeat.isPeak ? "★ Viral Retention Peak" : "Standard Beat"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                    {selectedBeat.tensionScore}/100
                  </span>
                </div>
                <h4 className="font-heading font-black text-xl text-white">{selectedBeat.hookSummary}</h4>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-sans text-sm text-slate-200 italic leading-relaxed">
                  &quot;{selectedBeat.transcriptSnippet}&quot;
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Audio Energy", value: selectedBeat.audioEnergyScore, color: "text-cyan-400" },
                    { label: "Speech Pace", value: `${selectedBeat.speechPaceWpm} WPM`, color: "text-white" },
                    { label: "Sentiment", value: selectedBeat.sentimentShiftScore, color: "text-pink-400" },
                    { label: "LLM Hook", value: selectedBeat.hookRating, color: "text-amber-400" },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded-xl bg-[#07080A] border border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 block">{m.label}</span>
                      <p className={`font-mono font-bold text-sm ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Reel */}
              <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-cyan-500/30 bg-[#0B0E14] flex flex-col justify-between shadow-cyan-glow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                    <Play className="w-5 h-5 fill-cyan-400" />
                  </div>
                  <h4 className="font-heading font-black text-lg text-white mb-2">Export 9:16 Reel</h4>
                  <div className="text-[11px] font-mono text-cyan-300 space-y-1 mb-4">
                    <p>· Duration: {Math.round(selectedBeat.timestampEnd - selectedBeat.timestampStart)}s</p>
                    <p>· Face-tracked 1080×1920</p>
                    <p>· Captions at y=68% safe zone</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExportReel(selectedBeat)}
                  disabled={reelLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-heading font-black text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {reelLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
                  {reelLoading ? "Generating…" : "Export Reel Cut"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: THUMBNAIL LAB (live images from API)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "thumbnails" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14]">
              <div>
                <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-pink-400" /> Thumbnail Lab
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  OpenCV Spectral Residual saliency · Pillow color grades · Bayesian A/B CTR simulation
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const r = await api.generateThumbnails("proj-pilot-01");
                    setThumbnails(r.variants);
                    showToast("New thumbnail batch generated!");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
                <button
                  onClick={handleSimulateAb}
                  disabled={abSimulating}
                  className="px-4 py-2.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-xs font-bold hover:bg-pink-500/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${abSimulating ? "animate-spin" : ""}`} />
                  {abSimulating ? "Streaming…" : "Simulate Traffic"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {thumbnails.map((thumb, idx) => {
                const isWinner = idx === 0;
                const toggled = heatmapOn[thumb.id] ?? false;
                const imgSrc = resolveImg(toggled ? thumb.heatmapUrl : thumb.imageUrl);
                return (
                  <div
                    key={thumb.id}
                    className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between ${
                      isWinner ? "border-cyan-500/50 bg-[#0B0E14] shadow-cyan-glow" : "border-white/10 bg-[#0B0E14]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-slate-200">{thumb.label}</span>
                        {isWinner && <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black font-mono font-extrabold text-[10px]">WINNER</span>}
                      </div>

                      {/* Live image from API */}
                      <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 border border-white/10 bg-slate-900">
                        {imgSrc ? (
                          <img src={imgSrc} alt={thumb.label} className="w-full h-full object-cover transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">Loading…</div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 text-xs font-heading font-black text-cyan-300 border border-cyan-400/40">
                          {thumb.textHook}
                        </div>
                        {toggled && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-red-600/90 text-white font-mono text-[9px] font-bold animate-pulse">
                            ● EYE-GAZE HOTSPOT
                          </div>
                        )}
                      </div>

                      {/* Heatmap toggle */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 mb-4">
                        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" /> Saliency Heatmap
                        </span>
                        <button
                          onClick={() => setHeatmapOn(prev => ({ ...prev, [thumb.id]: !prev[thumb.id] }))}
                          className={`w-11 h-6 rounded-full transition-colors p-0.5 ${toggled ? "bg-cyan-500" : "bg-slate-700"}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${toggled ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs mb-4">
                        <div className="p-2 rounded-lg bg-[#07080A] border border-white/5">
                          <span className="text-[9px] text-slate-400 block">Saliency</span>
                          <span className="font-bold text-cyan-400">{thumb.saliencyScore}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#07080A] border border-white/5">
                          <span className="text-[9px] text-slate-400 block">Vision</span>
                          <span className="font-bold text-pink-400">{thumb.geminiVisionScore}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#07080A] border border-white/5">
                          <span className="text-[9px] text-slate-400 block">CTR</span>
                          <span className="font-bold text-emerald-400">{thumb.simulatedCtr}%</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 font-sans leading-relaxed">
                        <span className="font-bold text-white block mb-1">Why this wins:</span>
                        {thumb.whyThisWins}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{thumb.abImpressions.toLocaleString()} views</span>
                      <span className="text-white font-bold">{thumb.abVotes} clicks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: PERSONA STUDIO (live chat + live comments)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "persona" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tone Sliders + Preview Chat */}
              <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-5">
                <div>
                  <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-violet-400" /> Persona Studio
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Tone sliders & live preview — changes POST to the API</p>
                </div>

                {/* Tone sliders */}
                {(["toneHumor", "toneTechnicality", "toneEnthusiasm", "toneEmpathy"] as const).map((key) => {
                  const labels: Record<string, string> = { toneHumor: "Humor & Wit", toneTechnicality: "Technicality", toneEnthusiasm: "Enthusiasm", toneEmpathy: "Empathy" };
                  const colors: Record<string, string> = { toneHumor: "text-cyan-400 accent-cyan-400", toneTechnicality: "text-pink-400 accent-pink-400", toneEnthusiasm: "text-violet-400 accent-violet-400", toneEmpathy: "text-amber-400 accent-amber-400" };
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                        <span>{labels[key]}</span>
                        <span className={colors[key].split(" ")[0] + " font-bold"}>{(persona as any)[key]}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={(persona as any)[key]}
                        onChange={e => setPersona((prev: any) => ({ ...prev, [key]: +e.target.value }))}
                        onMouseUp={() => api.updatePersona(persona)}
                        className={`w-full ${colors[key].split(" ")[1]}`}
                      />
                    </div>
                  );
                })}

                {/* Banned words */}
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-2">Banned Words:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.bannedWords.map((w: string, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] font-mono">✕ {w}</span>
                    ))}
                  </div>
                </div>

                {/* Live Preview Chat */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs font-mono font-bold text-white block">Live Persona Preview (calls API):</span>
                  <div className="h-44 overflow-y-auto space-y-2 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`p-2.5 rounded-xl ${msg.sender === "user" ? "bg-slate-800/70 text-slate-200 ml-6" : "bg-cyan-950/50 border border-cyan-500/30 text-cyan-100 mr-6"}`}>
                        <span className="font-mono text-[10px] text-slate-400 block mb-0.5">{msg.sender === "user" ? "Viewer" : persona.name}</span>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a viewer question…"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendChat()}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button onClick={handleSendChat} className="p-2 rounded-xl bg-cyan-400 text-black hover:opacity-90">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Comment Queue */}
              <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" /> Community Queue
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">Live from API — {comments.filter(c => c.status === "pending").length} pending approval</p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-pink-950/40 border border-pink-500/30 text-pink-400">
                    {persona.autopilotEnabled ? "🤖 Autopilot ON" : "👁️ Human Gate"}
                  </span>
                </div>

                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {comments.map(comm => (
                    <div key={comm.id} className={`p-4 rounded-2xl border transition-all ${
                      comm.status === "approved" ? "bg-emerald-950/20 border-emerald-500/30"
                      : comm.status === "rejected" ? "bg-red-950/20 border-red-500/20 opacity-50"
                      : "bg-black/40 border-white/10"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src={comm.authorAvatar} alt={comm.authorName} className="w-6 h-6 rounded-full border border-white/10" />
                          <span className="font-mono text-xs font-bold text-white">{comm.authorName}</span>
                          <span className="text-[10px] text-slate-400">{comm.publishedAt}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-white/5 border border-white/10 text-slate-300">{comm.sentiment}</span>
                      </div>
                      <p className="text-xs text-slate-200 mb-3 font-sans">&quot;{comm.content}&quot;</p>
                      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 mb-3">
                        <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-cyan-400">
                          <span>AI Draft (Confidence: {comm.confidenceScore}%)</span>
                        </div>
                        <p className="text-xs text-slate-100 font-medium font-sans">&quot;{comm.suggestedReply}&quot;</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">↳ {comm.replyReasoning}</p>
                      </div>
                      {comm.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleCommentAction(comm.id, "reject")} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 text-xs font-mono hover:bg-red-500/20 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button onClick={() => handleCommentAction(comm.id, "approve")} className="px-4 py-1.5 rounded-lg bg-cyan-400 text-black text-xs font-heading font-bold uppercase flex items-center gap-1 hover:opacity-90">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      )}
                      {comm.status === "approved" && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle className="w-4 h-4" /> Approved · Ready to Post</span>
                      )}
                      {comm.status === "rejected" && (
                        <span className="text-xs font-mono text-red-400">Archived</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: MULTI-PLATFORM CUTS (live generate)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "cutdowns" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" /> Multi-Platform Cutdown Engine
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Auto-generates 9:16, 1:1, 4:5, 16:9 with platform-specific captions from selected beat.</p>
                </div>
                <button
                  onClick={() => handleExportReel(selectedBeat)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate from Beat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {MOCK_CUTS.map(cut => (
                  <div key={cut.id} className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">{cut.aspectRatio}</span>
                        <span className="text-[11px] font-mono text-slate-400 capitalize">{cut.platform}</span>
                      </div>
                      <div className="w-full flex items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-white/5 mb-4">
                        <div className={`border-2 border-dashed border-cyan-400/40 rounded-lg bg-cyan-950/20 flex items-center justify-center ${
                          cut.aspectRatio === "9:16" ? "w-20 h-36" : cut.aspectRatio === "1:1" ? "w-28 h-28" : cut.aspectRatio === "4:5" ? "w-24 h-32" : "w-36 h-24"
                        }`}>
                          <span className="font-mono text-[10px] text-cyan-300 font-bold">{cut.aspectRatio}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 font-sans line-clamp-3 mb-4 leading-relaxed">{cut.captionText}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(cut.captionText, cut.id)}
                      className="w-full py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      {copiedKey === cut.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Caption
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: INSIGHTS (live from API)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "insights" && (
          <InsightsTab showToast={showToast} />
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: EXPORT
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "export" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-6">
              <div>
                <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-400" /> Export & Distribution Center
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Download cutdowns, thumbnails, SRT files, and copy-ready caption + hashtag packs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Winning Thumbnail Pack", desc: "1280×720 JPEG + Saliency Heatmap overlay (Variant A Winner)", color: "from-cyan-400 to-pink-500", label: "Download Thumbnail" },
                  { title: "Vertical Reel Export", desc: "1080×1920 MP4 · Face-tracked 9:16 · Burned captions · SRT included", color: "from-pink-500 to-violet-500", label: "Download 9:16 Reel" },
                  { title: "Copy Caption Pack", desc: "Platform-optimized hooks for TikTok, Reels, LinkedIn, YouTube Shorts, X", color: "from-violet-500 to-cyan-400", label: "Copy All Captions" },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <h4 className="font-heading font-bold text-white text-base">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    <button
                      onClick={() => { handleCopy(MOCK_CUTS[0]?.captionText ?? "", `export-${i}`); showToast(`${item.title} ready!`); }}
                      className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${item.color} text-black font-heading font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-2`}
                    >
                      {copiedKey === `export-${i}` ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Lazy Insights sub-component (loads live data itself) ──────────────────────
function InsightsTab({ showToast }: { showToast: (m: string) => void }) {
  const [report, setReport] = React.useState(MOCK_REPORT);
  const [calendar, setCalendar] = React.useState(MOCK_CALENDAR);

  React.useEffect(() => {
    api.getWeeklyReport().then(setReport);
    api.getCalendar().then(setCalendar);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-xl text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-400" /> Weekly Strategy Report
          </h3>
          <span className="font-mono text-xs text-slate-400">{report.generatedAt}</span>
        </div>
        <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/20 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
          {report.overview}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Retention Wins", items: report.retentionWins, color: "text-cyan-400" },
            { title: "Top Hooks", items: report.topPerformingHooks, color: "text-pink-400" },
            { title: "Thumbnail Rules", items: report.thumbnailTakeaways, color: "text-amber-400" },
          ].map(section => (
            <div key={section.title} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className={`font-mono text-xs font-bold uppercase ${section.color}`}>{section.title}</h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {section.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Content Calendar */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] space-y-4">
        <h4 className="font-heading font-black text-lg text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" /> Recommended Posting Calendar
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {calendar.map(slot => (
            <div key={slot.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-white">{slot.dayOfWeek}</span>
                <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60">{slot.timeSlot}</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-pink-400 block font-bold">{slot.platform} ({slot.format})</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{slot.recommendedTopic}</p>
              <div className="text-[10px] font-mono text-emerald-400">★ {slot.projectedEngagement}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
