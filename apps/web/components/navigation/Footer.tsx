import React from "react";
import { Sparkles, Heart, ShieldCheck, Terminal, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050608] pt-12 pb-16 text-slate-400 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-pink-500 p-[1px]">
                <div className="w-full h-full bg-[#07080A] rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
              <span className="font-heading font-black text-white text-base">CreatorPilot</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Autonomous Creator Agents for Content Strategy & Multi-Platform Distribution. 100% Free & Open Source forever.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MIT License • Commercial Safe</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">The 3 Agents</h4>
            <ul className="space-y-2">
              <li><a href="#tension" className="hover:text-cyan-400 transition-colors">Tension Beat Detector (9:16)</a></li>
              <li><a href="#thumbnails" className="hover:text-cyan-400 transition-colors">Thumbnail Lab Saliency Heatmaps</a></li>
              <li><a href="#persona" className="hover:text-cyan-400 transition-colors">Autonomous Community Persona</a></li>
              <li><a href="#cutdown" className="hover:text-cyan-400 transition-colors">Multi-Platform Cutdowns (1:1, 4:5, 16:9)</a></li>
            </ul>
          </div>

          {/* Free Tech Stack */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">100% Free Stack</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300">faster-whisper</span> (CPU Friendly)</li>
              <li><span className="text-slate-300">OpenCV Saliency</span> (Spectral Residual)</li>
              <li><span className="text-slate-300">Google Gemini Flash</span> + Ollama Local</li>
              <li><span className="text-slate-300">Pillow 12</span> (No Paid Image Gen)</li>
              <li><span className="text-slate-300">YouTube Data API</span> (10k units Free)</li>
            </ul>
          </div>

          {/* Quick Start & Setup */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">One-Command Setup</h4>
            <div className="p-3 rounded-lg bg-[#0D0F14] border border-white/10 font-mono text-[11px] text-cyan-300 space-y-1">
              <p className="text-slate-400"># Run full stack locally</p>
              <p className="text-pink-400">$ git clone & docker compose up</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Zero paid services. No credit card required. Works 100% offline via mock mode.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 CreatorPilot. Forked & evolved from openshorts (MIT). Free for commercial use.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> for solo creators
            </span>
            <span>•</span>
            <span className="font-mono text-cyan-400">60 FPS Responsive UI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
