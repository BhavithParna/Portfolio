import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import DoodleIntro from "@/components/DoodleIntro";
import DockNav from "@/components/DockNav";

export const metadata: Metadata = {
  title: "Bhavith Parna — Biomedical Engineer",
  description: "Portfolio of Bhavith Parna — Biomedical Engineer, neurotech researcher, and hardware builder from Hyderabad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ position: "relative" }}>
        <DoodleIntro />
        <AnimatedBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <DockNav />
      </body>
    </html>
  );
}
