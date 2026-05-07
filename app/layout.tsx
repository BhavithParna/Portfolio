import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Bhavith Parna — Biomedical Engineer",
  description: "Portfolio of Bhavith Parna — Biomedical Engineer, neurotech researcher, and hardware builder from Hyderabad.",
};

/* Page-wide fixed S-curve background — very faint, bleeds through every section */
function PageBackground() {
  const lines = [
    "M -120 140 H 800 A 140 140 0 0 1 800 420 H 200 A 140 140 0 0 0 200 700  H 1380",
    "M -120 124 H 800 A 156 156 0 0 1 800 436 H 200 A 156 156 0 0 0 200 748  H 1380",
    "M -120 108 H 800 A 172 172 0 0 1 800 452 H 200 A 172 172 0 0 0 200 796  H 1380",
    "M -120  92 H 800 A 188 188 0 0 1 800 468 H 200 A 188 188 0 0 0 200 844  H 1380",
    "M -120  76 H 800 A 204 204 0 0 1 800 484 H 200 A 204 204 0 0 0 200 892  H 1380",
    "M -120  60 H 800 A 220 220 0 0 1 800 500 H 200 A 220 220 0 0 0 200 940  H 1380",
  ];

  return (
    <svg
      viewBox="-120 20 1500 960"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.45,
      }}
    >
      {lines.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="rgba(237,232,223,0.07)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ position: "relative" }}>
        <PageBackground />
        <Nav />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
