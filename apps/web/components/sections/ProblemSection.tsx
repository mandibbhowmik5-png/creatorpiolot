"use client";

import React, { useState, useEffect } from "react";
import { Clock, Scissors, Image as ImageIcon, MessageSquareText, TrendingDown, CheckCircle, ArrowRight } from "lucide-react";

export default function ProblemSection() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < 60) {
        current += 2;
        setCounter(current);
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const timeDrains = [
    {
      icon: Scissors,
      title: "Manual 9:16 Video Repurposing",
      hours: "5.5 hrs/wk",
      desc: "Re-framing active speakers, burning captions, exporting 4 aspect ratios."
    },
    {
      icon: ImageIcon,
      title: "Thumbnail Guesswork & Iterations",
      hours: "4.2 hrs/wk",
      desc: "Guessing contrast, testing crops without eye-gaze attention data."
    },
    {
      icon: MessageSquareText,
      title: "Community Comment Triage",
      hours: "3.8 hrs/wk",
      desc: "Replying to hundreds of questions while fighting burnout and maintaining voice."
    },
    {
      icon: TrendingDown,
      title: "Scattered Analytics & Semantic Tagging",
      hours: "2.5 hrs/wk",
      desc: "Synthesizing cross-platform retention drops and manual hashtag packs."
    }
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Animated 60% Counter & Problem Statement */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/40 border border-pink-500/30 text-pink-400 text-xs font-mono font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>THE SOLO CREATOR TAX</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-6xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400">
                {counter}%
              </span>
              <span className="font-heading font-bold text-2xl sm:text-3xl text-white">
                Hours Lost
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Solo creators spend more time wrestling with video timelines, thumbnail variants, and comment backlogs than actually creating. What feels like &quot;content production&quot; is mostly repetitive distribution grunt work.
            </p>

            <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Average Wasted Weekly Time</span>
                <span className="text-pink-400 font-bold">16.0 Hours / Week</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-cyan-400 h-full rounded-full w-[60%]" />
              </div>
              <p className="text-[11px] text-slate-400">
                CreatorPilot eliminates this by orchestrating autonomous agents behind a unified REST & WebSocket control plane.
              </p>
            </div>
          </div>

          {/* Time Drain Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timeDrains.map((drain, idx) => {
              const Icon = drain.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/[0.08] relative group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs text-pink-400 font-bold px-2 py-0.5 rounded bg-pink-950/40 border border-pink-500/20">
                      {drain.hours}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-white text-base mb-1">
                    {drain.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {drain.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
