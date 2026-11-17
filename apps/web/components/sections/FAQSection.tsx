"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CreatorPilot remain 100% free with no hidden bills?",
      a: "CreatorPilot avoids paid cloud APIs by running all heavy media math locally. Whisper transcription uses faster-whisper CPU quantization, visual heatmaps use OpenCV's built-in Spectral Residual saliency, and thumbnail variants are generated via Pillow. The LLM reasoning utilizes Google Gemini's free tier with automatic fallback to local Ollama (Llama 3)."
    },
    {
      q: "What was reused from openshorts and what was removed?",
      a: "We forked and reused openshorts's MIT clip boundary calculation, face-tracking reframer, and SRT subtitles engine. We completely stripped all paid fal.ai UGC actors, ElevenLabs dubbing, and cloud auth/billing. We added the Tension Beat Detector, OpenCV Saliency Heatmaps, Pillow Variant Studio, In-Persona Community Agent, and Multi-Aspect Cutdowns."
    },
    {
      q: "Can I run this on a standard laptop with no NVIDIA GPU?",
      a: "Yes! The entire pipeline is explicitly optimized for CPU execution. OpenCV Spectral Residual saliency takes under 15ms per frame, and faster-whisper INT8 quantization runs smoothly on modern dual-core and quad-core CPUs."
    },
    {
      q: "Does the Community Agent post replies automatically or can I review them?",
      a: "By default, human-approval gating is strictly enforced. Suggested replies sit in an approval queue where you can approve in 1 click, edit, or reject. An optional 'Autopilot' toggle is available for creators who want immediate responses to routine technical questions."
    },
    {
      q: "How does the simulated live A/B testing work in the Thumbnail Lab?",
      a: "It combines OpenCV's fine-grained saliency score (gaze convergence) with vision legibility metrics. The live simulation runs Bayesian CTR sampling over realistic impressions, proving how high-contrast split-tone treatments outperform low-contrast variants."
    }
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/[0.06] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>COMMONLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-panel border border-white/[0.08] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-heading font-bold text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
