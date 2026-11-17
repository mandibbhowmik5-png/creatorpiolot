import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

export const metadata: Metadata = {
  title: "CreatorPilot | Autonomous Creator Agents for Content Strategy & Distribution",
  description: "100% Free & Open-Source AI Agents: Tension Beat Reel Detection, Real-Time Thumbnail Saliency Heatmaps, and In-Persona Community Autopilot.",
  keywords: ["AI Creator", "Autonomous Agents", "OpenShorts", "Tension Beats", "Thumbnail Heatmaps", "Whisper", "OpenCV", "100% Free"],
  authors: [{ name: "CreatorPilot Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07080A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07080A] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <div className="fixed inset-0 grid-background pointer-events-none z-0 opacity-80" />
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed -top-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
