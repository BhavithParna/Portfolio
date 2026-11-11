import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import DuskIntro from "@/components/DuskIntro";
import DockNav from "@/components/DockNav";

export const metadata: Metadata = {
  title: "Bhavith Parna — Biomedical Engineer",
  description: "Portfolio of Bhavith Parna — Biomedical Engineer, neurotech researcher, and hardware builder from Hyderabad.",
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600;700;800;900&family=Reenie+Beanie&family=JetBrains+Mono:wght@400;500;700&family=Pacifico&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,500;1,600;1,700&family=Special+Elite&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ position: "relative" }}>
        <DuskIntro />
        <AnimatedBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <DockNav />
      </body>
    </html>
  );
}
