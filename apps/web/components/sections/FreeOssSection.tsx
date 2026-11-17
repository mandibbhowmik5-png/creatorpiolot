import React from "react";
import { ShieldCheck, Cpu, Code2, Server, CheckCircle2, ArrowRight } from "lucide-react";

export default function FreeOssSection() {
  const stackItems = [
    {
      category: "LLM & Vision Reasoning",
      tech: "Google Gemini Free Tier + Local Ollama",
      license: "Free Tier / Apache 2.0",
      description: "Uses Google Gemini 2.5 Flash free quota with exponential backoff and automatic failover to local Ollama (Llama 3 / LLaVA) when offline or rate-limited.",
      cost: "$0 / month"
    },
    {
      category: "Audio Transcription",
      tech: "faster-whisper (CPU Friendly)",
      license: "MIT License",
      description: "Generates high-accuracy word-level timestamps directly on your CPU using CTranslate2 quantization. Zero external API calls or audio leakage.",
      cost: "$0 / month"
    },
    {
      category: "Attention Heatmaps",
      tech: "OpenCV Spectral Residual Saliency",
      license: "Apache 2.0",
      description: "Local foveal visual attention analysis. Uses Fourier transform spectral residuals and JET colormapping to detect viewer eye convergence hotspots.",
      cost: "$0 / month"
    },
    {
      category: "Thumbnail Variant Generator",
      tech: "Pillow 12 + Contrast Enhancers",
      license: "HPND (OSI Approved)",
      description: "Extracts keyframes and applies split-tone color grading, dynamic face centering, and high-contrast typography. Completely replaces paid image gen.",
      cost: "$0 / month"
    },
    {
      category: "Community Response Agent",
      tech: "YouTube Data API v3 (Free 10k Quota) + Mock Mode",
      license: "Free Tier",
      description: "Triages and drafts in-persona replies within the daily free quota. Full mock mode included for zero-config demonstration without OAuth.",
      cost: "$0 / month"
    },
    {
      category: "Database & Semantic Index",
      tech: "SQLite + In-Memory Async Queue",
      license: "Public Domain",
      description: "Zero external database setup. Full persistence with instant JSON serialization and lightweight asyncio task workers.",
      cost: "$0 / month"
    }
  ];

  return (
    <section id="stack" className="py-20 md:py-28 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% FREE HARD RULE</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Built for Solo Creators. <br />
            <span className="text-gradient-cyan">Zero Subscriptions. Forever.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-300">
            Every library and service in CreatorPilot is verified free for commercial use under MIT, Apache 2.0, or free-tier quotas. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-panel border border-white/[0.08] hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-400">{item.category}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold">
                    {item.cost}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">
                  {item.tech}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>License: {item.license}</span>
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Commercial Safe
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
