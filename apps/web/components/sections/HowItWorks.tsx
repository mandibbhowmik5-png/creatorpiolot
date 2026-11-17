"use client";

import React, { useState } from "react";
import { Upload, Activity, Layers, Share2, CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Ingest Longform Video & Whisper Sync",
      tagline: "Local CPU Transcription with Word Timestamps",
      desc: "Paste any YouTube link or upload raw MP4. faster-whisper transcribes dialogue locally on standard CPU without uploading your audio to third-party cloud servers.",
      metric: "0.2x Realtime Processing on CPU",
      details: ["faster-whisper CPU quantised model", "Punctuation & sentence boundary recovery", "Zero API costs or subscription gates"]
    },
    {
      step: "02",
      icon: Activity,
      title: "Tension Curve & Beat Extraction",
      tagline: "Multimodal Retention Peak Mapping",
      desc: "CreatorPilot maps acoustic energy, syllabic velocity (WPM), dramatic narrative pauses, and LLM hook strength into a unified tension timeline to locate viral short-form moments.",
      metric: "96.8 Peak Tension Score",
      details: ["Acoustic RMS variance tracking", "Speech cadence acceleration detection", "Safe-zone active speaker centering"]
    },
    {
      step: "03",
      icon: Layers,
      title: "Thumbnail Lab & Saliency Heatmaps",
      tagline: "OpenCV Spectral Residual Eye-Tracking",
      desc: "Extracts keyframes at emotional climax timestamps, creates 3 high-contrast Pillow variants, and generates eye-gaze heatmaps to simulate viewer click-through conversion.",
      metric: "12.04% Winning Predicted CTR",
      details: ["Spectral residual visual saliency", "JET colormap attention bloom", "Simulated Bayesian live A/B testing"]
    },
    {
      step: "04",
      icon: Share2,
      title: "Persona Calibration & Multi-Cut Export",
      tagline: "Human-in-the-Loop Community Autopilot",
      desc: "Trains creator voice from past comments, provides a 1-click human approval queue, and generates 9:16, 1:1, 4:5, and 16:9 cutdown packs with platform-specific captions.",
      metric: "100% Autonomous Coverage",
      details: ["Tone sliders: Humor, Tech, Empathy", "Banned-word filtering & catchphrases", "Export packs for TikTok, Reels, LinkedIn, X"]
    }
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-400 text-xs font-mono font-medium mb-4">
            <span>THE 4-STEP PIPELINE</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
            How It Works: <span className="text-gradient-cyan">From Longform to Domination.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-300">
            A battle-tested autonomous pipeline running locally on your hardware with zero paid third-party dependencies.
          </p>
        </div>

        {/* Step Cards with Interactive Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step Selector List */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? "bg-white/[0.08] border-cyan-400/50 shadow-cyan-glow"
                      : "bg-[#0B0E14]/70 border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      PHASE {s.step}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {s.metric}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Preview Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 bg-[#0B0E14] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  {React.createElement(steps[activeStep].icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <span className="font-mono text-xs text-pink-400 font-bold">
                    STEP {steps[activeStep].step} SPECIFICATION
                  </span>
                  <h3 className="font-heading font-black text-xl text-white">
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                {steps[activeStep].metric}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-6">
              {steps[activeStep].desc}
            </p>

            <div className="space-y-3 mb-8">
              <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider font-bold">
                Operational Architecture
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {steps[activeStep].details.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">
                Next: Step {activeStep < 3 ? activeStep + 2 : 1}
              </span>
              <button
                onClick={() => setActiveStep((activeStep + 1) % 4)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Continue Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
