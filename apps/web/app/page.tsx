"use client";

import React, { useState } from "react";
import Hero from "../components/hero/Hero";
import ProblemSection from "../components/sections/ProblemSection";
import AgentCardsSection from "../components/agents/AgentCardsSection";
import HowItWorks from "../components/sections/HowItWorks";
import StudioDashboard from "../components/dashboard/StudioDashboard";
import FreeOssSection from "../components/sections/FreeOssSection";
import FAQSection from "../components/sections/FAQSection";
import WalkthroughModal from "../components/walkthrough/WalkthroughModal";

export default function HomePage() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [selectedDashboardTab, setSelectedDashboardTab] = useState<string>("tension");

  const handleSelectAgent = (agentId: string) => {
    if (agentId === "tension") setSelectedDashboardTab("tension");
    else if (agentId === "thumbnail") setSelectedDashboardTab("thumbnails");
    else if (agentId === "persona") setSelectedDashboardTab("persona");
  };

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <Hero onOpenWalkthrough={() => setWalkthroughOpen(true)} />

      {/* 2. Problem Section (Animated 60% Counter) */}
      <ProblemSection />

      {/* 3. The 3 Agents Interactive Detail Cards */}
      <AgentCardsSection onSelectAgent={handleSelectAgent} />

      {/* 4. How It Works (Scroll-pinned 4-step pipeline) */}
      <HowItWorks />

      {/* 5. Live Product Studio Dashboard */}
      <StudioDashboard initialTab={selectedDashboardTab} />

      {/* 6. Free & Open Source Stack Section */}
      <FreeOssSection />

      {/* 7. FAQ Section */}
      <FAQSection />

      {/* 8. 30-Second Scripted Interactive Walkthrough Modal */}
      <WalkthroughModal
        isOpen={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
      />
    </div>
  );
}
