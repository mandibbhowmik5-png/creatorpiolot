"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, Play, Flame, Eye, MessageSquare, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Hero({ onOpenWalkthrough }: { onOpenWalkthrough: () => void }) {
  // Live Demo Loop State Machine
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [heatmapActive, setHeatmapActive] = useState(false);

  const seedPrompts = [
    "> tension_detector.scan(audio_energy, speech_wpm, hook_stakes)",
    "> thumbnail_lab.saliency(spectral_residual, attention_score=94.2)",
    "> persona_agent.reply(viewer_comment, tone_humor=75, autopilot=gate)",
  ];

  // Auto-cycling animation loop
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Typing effect for the fake terminal
  useEffect(() => {
    const target = seedPrompts[activeStep];
    setTypedPrompt("");
    let charIndex = 0;
    const timer = setInterval(() => {
      if (charIndex <= target.length) {
        setTypedPrompt(target.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(timer);
      }
    }, 35);
    return () => clearInterval(timer);
  }, [activeStep]);

  // Toggle heatmap bloom in step 1
  useEffect(() => {
    if (activeStep === 1) {
      const t = setTimeout(() => setHeatmapActive(true), 1200);
      return () => clearTimeout(t);
    } else {
      setHeatmapActive(false);
    }
  }, [activeStep]);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-violet-500/10 to-pink-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-medium mb-6 shadow-cyan-glow">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Autonomous Creator Agents • 100% Free Stack</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-black tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.08] mb-6">
            Your content team of{" "}
            <span className="text-gradient-hero">one-click agents.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
            Solo creators lose <span className="text-pink-400 font-bold">60% of creative hours</span> wrestling with thumbnail variations, multi-platform cutdowns, semantic tagging, and comments. CreatorPilot automates it all with zero subscription fees.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
            <a
              href="#dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-black font-heading font-black text-sm uppercase tracking-wider shadow-cyan-glow hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              Launch Creator Studio
              <ArrowRight className="w-4 h-4 text-black" />
            </a>

            <button
              onClick={onOpenWalkthrough}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white font-heading font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2.5 backdrop-blur-md"
            >
              <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              Watch 30s Interactive Demo
            </button>
          </div>

          {/* Free Tech Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono text-slate-400 mb-16">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5 text-pink-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Free Gemini Tier + Ollama
            </span>
            <span className="flex items-center gap-1.5 text-violet-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Local CPU OpenCV & Whisper
            </span>
          </div>
        </div>

        {/* Animated Live Demo Loop Terminal & Preview Frame */}
        <div className="w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0B0E14]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="font-mono text-xs text-slate-400 ml-2">creatorpilot_orchestrator.py</span>
            </div>
            {/* Step selector tabs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveStep(0)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                  activeStep === 0 ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span className="hidden sm:inline">1. Tension</span>
              </button>
              <button
                onClick={() => setActiveStep(1)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                  activeStep === 1 ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">2. Heatmap</span>
              </button>
              <button
                onClick={() => setActiveStep(2)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                  activeStep === 2 ? "bg-violet-500/20 text-violet-300 border border-violet-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span className="hidden sm:inline">3. Persona</span>
              </button>
            </div>
          </div>

          {/* Fake Terminal Prompt Line */}
          <div className="font-mono text-xs sm:text-sm text-cyan-300 mb-6 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{typedPrompt}</span>
            <span className="w-1.5 h-4 bg-cyan-400 animate-pulse inline-block" />
          </div>

          {/* Dynamic Content Displayed by Active Step */}
          <div className="min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
            {/* Step 0: Tension Beat Timeline Preview */}
            {activeStep === 0 && (
              <div className="w-full space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">● RETENTION CURVE ANALYZER</span>
                  <span>PEAK HOOK AT 05:10 (96.8/100)</span>
                </div>
                {/* Visual Audio & Tension Peak Bars */}
                <div className="h-32 sm:h-40 w-full bg-black/50 rounded-xl p-3 flex items-end gap-1.5 sm:gap-2 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-2 left-3 text-[10px] font-mono text-pink-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                    VIRAL 9:16 REEL BOUNDARY DETECTED
                  </div>
                  {[45, 52, 60, 48, 72, 89, 96.8, 88, 62, 55, 78, 84, 91, 70, 65, 82].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      {val >= 88 && (
                        <span className="text-[9px] font-mono text-pink-400 font-bold opacity-90 animate-bounce">
                          PEAK
                        </span>
                      )}
                      <div
                        style={{ height: `${val}%` }}
                        className={`w-full rounded-t transition-all duration-500 ${
                          val >= 88
                            ? "bg-gradient-to-t from-pink-500 to-cyan-400 shadow-magenta-glow"
                            : "bg-cyan-500/30 group-hover:bg-cyan-400/50"
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-500/20 text-xs text-slate-300 flex items-center justify-between">
                  <span>Snippet: &quot;If you are spending 5 hours editing, you have an unpaid intern job...&quot;</span>
                  <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono font-bold text-[10px]">
                    1-CLICK REEL EXPORT
                  </span>
                </div>
              </div>
            )}

            {/* Step 1: Thumbnail Saliency & Heatmap Bloom */}
            {activeStep === 1 && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
                <div className="p-3 rounded-xl border border-cyan-500/40 bg-cyan-950/20 relative overflow-hidden shadow-cyan-glow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-cyan-300">VARIANT A (WINNER)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-black font-mono font-extrabold text-[10px]">
                      12.04% CTR
                    </span>
                  </div>
                  <div className="h-32 rounded-lg bg-slate-900 border border-white/10 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={heatmapActive ? "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                      alt="Thumbnail A"
                      className="w-full h-full object-cover transition-opacity duration-700"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300 font-bold">
                      THE 60% TAX
                    </div>
                    {heatmapActive && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-red-600/90 text-[9px] font-mono text-white animate-pulse">
                        ● SPECTRAL RESIDUAL HOTSPOT
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-300">
                    Saliency: <span className="text-cyan-400 font-mono font-bold">94.2/100</span> (Eye-Gaze Convergence)
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">VARIANT B</span>
                    <span className="text-[10px] font-mono text-slate-400">8.52% CTR</span>
                  </div>
                  <div className="h-32 rounded-lg bg-slate-900 border border-white/10 relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                      alt="Thumbnail B"
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-pink-300 font-bold">
                      STOP EDITING NOW
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400">
                    Saliency: <span className="text-slate-300 font-mono">86.8/100</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">VARIANT C</span>
                    <span className="text-[10px] font-mono text-slate-400">6.59% CTR</span>
                  </div>
                  <div className="h-32 rounded-lg bg-slate-900 border border-white/10 relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                      alt="Thumbnail C"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300 font-bold">
                      AI AUTOPILOT
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400">
                    Saliency: <span className="text-slate-300 font-mono">78.4/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Community Persona Chat Stream */}
            {activeStep === 2 && (
              <div className="w-full max-w-xl mx-auto space-y-3 animate-in fade-in duration-300">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 font-mono text-[11px]">
                    <span className="font-bold text-white">dev_marcus</span>
                    <span>12m ago</span>
                    <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 text-[10px]">Question</span>
                  </div>
                  <p className="text-slate-200">
                    &quot;Can I run the tension beat detector on a standard laptop with no NVIDIA GPU?&quot;
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-bold text-cyan-400">Alex Rivera (Creator Persona)</span>
                      <span className="text-slate-400 text-[10px] font-sans">Confidence: 98.4%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                      Human Gate: Approved
                    </span>
                  </div>
                  <p className="text-slate-100 font-medium">
                    &quot;100%! Built on CPU-friendly Spectral Residual saliency and faster-whisper quantised models. Zero GPU required to hit 60fps analysis.&quot;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
