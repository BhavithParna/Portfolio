import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Bhavith Parna — Biomedical Engineer",
  description: "Portfolio of Bhavith Parna — Biomedical Engineer, neurotech researcher, and hardware builder from Hyderabad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ position: "relative" }}>
        <AnimatedBackground />
        <Nav />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
