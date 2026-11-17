"use client";

import React, { useState } from "react";
import { AGENT_CARDS } from "../../lib/mockData";
import { AgentCardDetail } from "../../../../packages/shared/types";
import { Flame, Eye, MessageSquare, ArrowRight, X, Sparkles, Terminal, CheckCircle2, Cpu } from "lucide-react";

export default function AgentCardsSection({ onSelectAgent }: { onSelectAgent?: (id: string) => void }) {
  const [selectedAgent, setSelectedAgent] = useState<AgentCardDetail | null>(null);

  const getAgentIcon = (id: string) => {
    switch (id) {
      case "tension":
        return <Flame className="w-6 h-6 text-cyan-400" />;
      case "thumbnail":
        return <Eye className="w-6 h-6 text-pink-400" />;
      case "persona":
        return <MessageSquare className="w-6 h-6 text-violet-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getBorderAccent = (id: string) => {
    switch (id) {
      case "tension":
        return "hover:border-cyan-500/50 hover:shadow-cyan-glow";
      case "thumbnail":
        return "hover:border-pink-500/50 hover:shadow-magenta-glow";
      case "persona":
        return "hover:border-violet-500/50 hover:shadow-violet-glow";
      default:
        return "hover:border-cyan-500/50";
    }
  };

  return (
    <section id="agents" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>AUTONOMOUS AGENT TRIO</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Three Specialized Agents. <br />
            <span className="text-gradient-hero">Zero Human Grunt Work.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-300">
            Click any agent card to inspect its detailed problem statement, seed prompts, and free open-source architecture.
          </p>
        </div>

        {/* 3 Interactive Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AGENT_CARDS.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-6 sm:p-7 rounded-2xl glass-panel glass-panel-hover border border-white/10 cursor-pointer flex flex-col justify-between transition-all duration-300 relative group ${getBorderAccent(
                agent.id
              )}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getAgentIcon(agent.id)}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-black/40 border border-white/5">
                    Click to Inspect
                  </span>
                </div>

                <h3 className="font-heading font-black text-xl text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {agent.title}
                </h3>
                <p className="text-xs text-pink-400 font-mono font-semibold mb-4">
                  {agent.tagline}
                </p>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-6 font-sans">
                  {agent.problemStatementDetail}
                </p>
              </div>

              <div>
                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {agent.techStackChips.slice(0, 3).map((chip, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-slate-300"
                    >
                      {chip}
                    </span>
                  ))}
                  {agent.techStackChips.length > 3 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
                      +{agent.techStackChips.length - 3}
                    </span>
                  )}
                </div>

                {/* Bottom inspect button */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-heading font-bold text-white group-hover:text-cyan-400">
                  <span>View Architecture Sheet</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Detail Sheet (matching screenshot spec: rounded cards, mono prompt lines with '>', tech chips) */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0B0E14] border border-white/15 p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Top close */}
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
              aria-label="Close Agent Details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                {getAgentIcon(selectedAgent.id)}
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl text-white">
                  {selectedAgent.title}
                </h3>
                <p className="font-mono text-xs text-pink-400">
                  {selectedAgent.tagline}
                </p>
              </div>
            </div>

            {/* Metric Banner */}
            <div className="mb-6 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">BENCHMARK PERFORMANCE:</span>
              <span className="text-cyan-400 font-bold">{selectedAgent.metricHeadline}</span>
            </div>

            {/* Problem Statement in Detail */}
            <div className="space-y-2 mb-6">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
                Problem Statement in Detail
              </h4>
              <div className="p-4 rounded-xl bg-[#07080A] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {selectedAgent.problemStatementDetail}
              </div>
            </div>

            {/* Seed Prompting Inspiration */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-pink-400" />
                <h4 className="font-mono text-xs uppercase tracking-wider text-pink-400 font-bold">
                  Seed Prompting Inspiration
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-[#07080A] border border-pink-500/20 font-mono text-xs text-pink-200 space-y-2.5">
                {selectedAgent.seedPromptLines.map((line, idx) => (
                  <p key={idx} className="leading-relaxed">
                    <span className="text-pink-500 font-bold mr-1">&gt;</span>
                    {line.replace(/^>\s*/, "")}
                  </p>
                ))}
              </div>
            </div>

            {/* Recommended Tech Stack Chips */}
            <div className="space-y-2 mb-8">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
                Recommended 100% Free Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.techStackChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
              <a
                href="#dashboard"
                onClick={() => {
                  setSelectedAgent(null);
                  if (onSelectAgent) onSelectAgent(selectedAgent.id);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-heading font-black text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-2"
              >
                Launch in Studio Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
