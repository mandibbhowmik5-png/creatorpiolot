"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Terminal, Play, Menu, X, Cpu, Github } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07080A]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#07080A] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black tracking-tight text-lg text-white group-hover:text-cyan-400 transition-colors">
              Creator<span className="text-cyan-400">Pilot</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-pink-400 font-semibold -mt-1">
              Autonomous Agents
            </span>
          </div>
        </Link>

        {/* Live Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Local Stack: 100% Free CPU Mode</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#agents" className="hover:text-cyan-400 transition-colors">The 3 Agents</a>
          <a href="#tension" className="hover:text-cyan-400 transition-colors">Tension Beats</a>
          <a href="#thumbnails" className="hover:text-cyan-400 transition-colors">Thumbnail Lab</a>
          <a href="#persona" className="hover:text-cyan-400 transition-colors">Persona Studio</a>
          <a href="#dashboard" className="hover:text-pink-400 transition-colors">Live Studio</a>
          <a href="#stack" className="hover:text-cyan-400 transition-colors">Free Stack</a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <a
            href="#demo-walkthrough"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 text-xs font-semibold transition-all hover:scale-105"
          >
            <Play className="w-3 h-3 fill-pink-300" />
            <span className="hidden sm:inline">Watch</span> 30s Demo
          </a>

          <a
            href="#dashboard"
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-black font-heading font-bold text-xs uppercase tracking-wider shadow-cyan-glow hover:opacity-95 transition-all hover:scale-105"
          >
            <Cpu className="w-3.5 h-3.5" />
            Launch Studio
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 border-b border-white/10 bg-[#07080A]/95 backdrop-blur-2xl space-y-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Zero-Cost Engine (OpenCV + Whisper)</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm font-medium text-slate-300 pt-2">
            <a onClick={() => setMobileMenuOpen(false)} href="#agents" className="px-3 py-2 rounded-lg hover:bg-white/5">The 3 Agents</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#tension" className="px-3 py-2 rounded-lg hover:bg-white/5">Tension Beat Detector</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#thumbnails" className="px-3 py-2 rounded-lg hover:bg-white/5">Thumbnail Saliency Lab</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#persona" className="px-3 py-2 rounded-lg hover:bg-white/5">Community Persona Studio</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#dashboard" className="px-3 py-2 rounded-lg text-pink-400 hover:bg-white/5 font-semibold">Live Creator Studio</a>
            <a onClick={() => setMobileMenuOpen(false)} href="#stack" className="px-3 py-2 rounded-lg hover:bg-white/5">Free Open-Source Stack</a>
          </div>
          <div className="pt-2">
            <a
              onClick={() => setMobileMenuOpen(false)}
              href="#dashboard"
              className="w-full py-2.5 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-heading font-bold text-xs uppercase tracking-wider"
            >
              Launch Creator Studio
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
