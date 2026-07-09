"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { shelveProjects, primaryCount } from "@/lib/projects";
import BackLink from "@/components/BackLink";
import Ferrofluid from "@/components/Ferrofluid";
import ProjectPosters from "@/components/ProjectPosters";

export default function ProjectsPage() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  // Stable identity — ProjectPosters rebuilds its whole scene when this changes.
  const entries = useMemo(() => shelveProjects(), []);
  const current = entries[active];

  return (
    <main>
      <section className="sb-page" style={{ padding: 0, height: "100vh", minHeight: 640, overflow: "hidden" }}>
        <span className="sb-deckle sb-deckle-bottom" />

        {/* Ferrofluid ink churning under the paper */}
        <Ferrofluid
          colors={["#BC5A3C", "#2F6E66", "#C28A33"]}
          speed={0.3}
          scale={1.1}
          rimWidth={0.16}
          sharpness={3}
          glow={2.2}
          opacity={0.85}
          mixBlendMode="multiply"
        />

        {/* Masthead */}
        <div style={{ position: "absolute", top: "clamp(1.5rem, 4vh, 3.5rem)", left: "clamp(1.5rem, 5vw, 5.5rem)", zIndex: 5, pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto" }}>
            <BackLink href="/" label="Home" />
          </div>
          <p className="sb-eyebrow">All work</p>
          <h1 className="sb-name" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", marginBottom: "0.35rem" }}>The Workshop</h1>
          <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: "1.05rem", color: "var(--sb-ink-soft)" }}>
            scroll to rifle through · click one to open it
          </p>
        </div>

        {/* Flying posters */}
        <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          <ProjectPosters
            entries={entries}
            onActiveChange={setActive}
            onSelect={i => router.push(`/projects/${entries[i].project.slug}`)}
          />
        </div>

        {/* Caption for the poster at center stage */}
        <div
          key={current?.project.slug}
          style={{
            position: "absolute",
            right: "clamp(1.5rem, 5vw, 5.5rem)",
            bottom: "clamp(5.5rem, 12vh, 7.5rem)",
            zIndex: 5,
            maxWidth: 300,
            textAlign: "right",
            pointerEvents: "none",
            animation: "sbCaptionIn 0.45s ease both",
          }}
        >
          <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: "2rem", color: "var(--sb-terra)", lineHeight: 1 }}>
            {current?.number}
            <span style={{ fontSize: "1rem", color: "var(--sb-ink-soft)" }}> / {String(primaryCount).padStart(2, "0")}</span>
          </p>
          {current?.volume && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sb-teal)", marginTop: "0.3rem" }}>
              Vol. {current.volume}
            </p>
          )}
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "1.35rem", color: "var(--sb-ink)", lineHeight: 1.2, margin: "0.4rem 0 0.3rem" }}>
            {current?.project.title}
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sb-ink-soft)" }}>
            {current?.project.context} · {current?.project.dates}
          </p>
        </div>

        <style>{`
          @keyframes sbCaptionIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    </main>
  );
}
