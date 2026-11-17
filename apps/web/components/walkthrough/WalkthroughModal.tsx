"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Eye, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

export default function WalkthroughModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play timer (0 to 30s)
  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      setIsPlaying(true);
      return;
    }

    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 30) {
            return 30;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  // Determine current active phase
  let phase = 1;
  if (seconds < 5) phase = 1; // 0-5s: Paste video URL
  else if (seconds < 13) phase = 2; // 5-13s: Tension beats found, reels appear
  else if (seconds < 21) phase = 3; // 13-21s: Thumbnail variants with heatmaps, winner picked
  else if (seconds < 27) phase = 4; // 21-27s: Comment agent replies in creator voice
  else phase = 5; // 27-30s: Logo + tagline

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in">
      <div className="w-full max-w-4xl rounded-3xl bg-[#0B0E14] border border-cyan-500/30 p-4 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between max-h-[95vh]">
        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-heading font-black text-lg sm:text-xl text-white">
              30-Second Autonomous Walkthrough
            </h3>
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              {seconds}s / 30s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
              aria-label="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            style={{ width: `${(seconds / 30) * 100}%` }}
            className="h-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 rounded-full transition-all duration-100"
          />
        </div>

        {/* 5-Phase Narrative Stepper Navigation */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-6 text-[10px] sm:text-xs font-mono text-center">
          {[
            { p: 1, title: "0-5s Paste URL", active: phase === 1 },
            { p: 2, title: "5-13s Tension", active: phase === 2 },
            { p: 3, title: "13-21s Thumbnails", active: phase === 3 },
            { p: 4, title: "21-27s Persona", active: phase === 4 },
            { p: 5, title: "27-30s Launch", active: phase === 5 },
          ].map((item) => (
            <button
              key={item.p}
              onClick={() => {
                if (item.p === 1) setSeconds(0);
                if (item.p === 2) setSeconds(5.5);
                if (item.p === 3) setSeconds(13.5);
                if (item.p === 4) setSeconds(21.5);
                if (item.p === 5) setSeconds(27.5);
              }}
              className={`py-1.5 px-1 rounded-lg border transition-all ${
                item.active
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                  : "bg-black/30 border-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Main Stage Display */}
        <div className="min-h-[280px] sm:min-h-[340px] flex items-center justify-center p-4 rounded-2xl bg-black/60 border border-white/5 relative overflow-hidden">
          {/* Phase 1 (0-5s): Paste URL */}
          {phase === 1 && (
            <div className="w-full max-w-lg space-y-4 text-center animate-in fade-in">
              <span className="font-mono text-xs text-pink-400 font-bold uppercase tracking-wider block">
                [STAGE 1] INGEST LONGFORM VIDEO
              </span>
              <h4 className="font-heading font-black text-xl sm:text-2xl text-white">
                Drop your raw video link.
              </h4>
              <div className="p-3.5 rounded-2xl bg-[#0D0F14] border border-cyan-500/40 font-mono text-xs text-cyan-300 flex items-center gap-2 shadow-cyan-glow text-left">
                <span className="text-pink-400">&gt;</span>
                <span className="truncate">https://youtube.com/watch?v=solopreneur-ai-masterclass</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                faster-whisper prepares local word-level timestamps on standard CPU. Zero cloud upload.
              </p>
            </div>
          )}

          {/* Phase 2 (5-13s): Tension Beats Found */}
          {phase === 2 && (
            <div className="w-full space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-pink-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-pink-500" />
                  [STAGE 2] TENSION CURVE IDENTIFIED
                </span>
                <span className="text-cyan-300">VIRAL HOOK PEAK: 96.8/100</span>
              </div>
              <div className="h-28 sm:h-36 bg-[#07080A] rounded-xl p-3 flex items-end gap-2 border border-white/5">
                {[42, 50, 68, 75, 88, 96.8, 85, 60, 58, 80, 89, 74].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      style={{ height: `${v}%` }}
                      className={`w-full rounded-t ${
                        v >= 88 ? "bg-gradient-to-t from-pink-500 to-cyan-400" : "bg-cyan-500/30"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs text-slate-200">
                <span className="font-bold text-white block">Auto-Extracted 9:16 Reel:</span>
                &quot;If you spend five hours editing thumbnails, you don&apos;t have a media business - you have an unpaid intern job.&quot;
              </div>
            </div>
          )}

          {/* Phase 3 (13-21s): Thumbnail Variants & Heatmaps */}
          {phase === 3 && (
            <div className="w-full space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  [STAGE 3] OPENCV SPECTRAL RESIDUAL SALIENCY
                </span>
                <span className="text-emerald-400 font-bold">WINNER: VARIANT A (12.04% CTR)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#0D0F14] border border-cyan-400/50 shadow-cyan-glow">
                  <span className="font-mono text-[10px] text-cyan-300 font-bold block mb-1">
                    HEATMAP EYE-GAZE BLOOM
                  </span>
                  <div className="h-28 rounded-lg overflow-hidden bg-slate-900 relative">
                    <img
                      src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80"
                      alt="Heatmap"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-red-600/90 text-white font-mono text-[9px] font-bold">
                      HOTSPOT CONVERGENCE
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0F14] border border-white/10">
                  <span className="font-mono text-[10px] text-slate-400 font-bold block mb-1">
                    CYBER CYAN VARIANT
                  </span>
                  <div className="h-28 rounded-lg overflow-hidden bg-slate-900 relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Variant"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-cyan-300 font-bold">
                      THE 60% TAX
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 4 (21-27s): Persona Replies */}
          {phase === 4 && (
            <div className="w-full space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-violet-400 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  [STAGE 4] IN-VOICE COMMUNITY AGENT
                </span>
                <span className="text-cyan-300">CONFIDENCE: 98.4%</span>
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs">
                <span className="font-mono text-[10px] text-slate-400 block mb-1">dev_marcus asks:</span>
                <p className="text-slate-200">&quot;Can I run this without an expensive GPU?&quot;</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                <span className="font-mono text-[10px] text-cyan-400 block mb-1">Creator Persona replies (Approved):</span>
                <p className="text-slate-100 font-medium">
                  &quot;100%! Built on CPU-friendly Spectral Residual saliency and faster-whisper. Zero cloud GPU required.&quot;
                </p>
              </div>
            </div>
          )}

          {/* Phase 5 (27-30s): Ready to Launch */}
          {phase === 5 && (
            <div className="w-full text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-pink-500 mx-auto flex items-center justify-center p-[2px] shadow-cyan-glow">
                <div className="w-full h-full bg-[#07080A] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h4 className="font-heading font-black text-2xl text-white">
                CreatorPilot
              </h4>
              <p className="font-sans text-sm text-slate-300 max-w-md mx-auto">
                Your content team of one-click agents. 100% Free & Open Source forever.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-heading font-black text-xs uppercase tracking-wider shadow-cyan-glow hover:opacity-90 transition-all hover:scale-105"
                >
                  Enter Studio Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Scripted Auto-Demo Walkthrough</span>
          <button
            onClick={onClose}
            className="hover:text-white transition-colors underline"
          >
            Skip & Close
          </button>
        </div>
      </div>
    </div>
  );
}
