"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { shelveProjects, primaryCount, type Shelved } from "@/lib/projects";
import BackLink from "@/components/BackLink";
import Ferrofluid from "@/components/Ferrofluid";
import ProjectPosters from "@/components/ProjectPosters";

/*
  Opening a project stows its slug; coming back to the Workshop spends it, so
  you land on the poster you left rather than being thrown back to 01. It's
  spent on read, so arriving here any other way (the dock, a fresh visit)
  still opens on 01.
*/
const RESUME_KEY = "workshop:resume";

function stowResume(slug: string) {
  try { sessionStorage.setItem(RESUME_KEY, slug); } catch {}
}

function spendResume(entries: Shelved[]) {
  if (typeof window === "undefined") return 0;
  try {
    const slug = sessionStorage.getItem(RESUME_KEY);
    sessionStorage.removeItem(RESUME_KEY);
    const i = entries.findIndex(e => e.project.slug === slug);
    return i >= 0 ? i : 0;
  } catch {
    return 0;
  }
}

export default function ProjectsPage() {
  const [active, setActive] = useState(0);
  // Set the moment a poster is clicked: the chrome fades and a cream veil
  // washes in behind the diving poster, so the hand-off to the (also cream)
  // project page has nothing to cut against.
  const [opening, setOpening] = useState(false);
  const router = useRouter();
  // Stable identity — ProjectPosters rebuilds its whole scene when this changes.
  const entries = useMemo(() => shelveProjects(), []);
  // Read once per mount. Safe to differ from the server (0): it only seeds the
  // WebGL scroll, and the caption follows whatever poster ends up centred.
  const startIndex = useMemo(() => spendResume(entries), [entries]);
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
        <div className={opening ? "wk-chrome wk-chrome-out" : "wk-chrome"} style={{ position: "absolute", top: "clamp(1.5rem, 4vh, 3.5rem)", left: "clamp(1.5rem, 5vw, 5.5rem)", zIndex: 5, pointerEvents: "none" }}>
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
            initialIndex={startIndex}
            onActiveChange={setActive}
            onOpenStart={() => setOpening(true)}
            onSelect={i => {
              const { slug } = entries[i].project;
              stowResume(slug);
              router.push(`/projects/${slug}`);
            }}
          />
        </div>

        {/* Cream wash that swallows the diving poster */}
        <div className={opening ? "wk-veil wk-veil-in" : "wk-veil"} aria-hidden="true" />

        {/* Caption for the poster at center stage */}
        <div
          key={current?.project.slug}
          className={opening ? "wk-caption wk-chrome-out" : "wk-caption"}
          style={{
            position: "absolute",
            right: "clamp(1.5rem, 5vw, 5.5rem)",
            bottom: "clamp(5.5rem, 12vh, 7.5rem)",
            zIndex: 5,
            maxWidth: 300,
            textAlign: "right",
            pointerEvents: "none",
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
          .wk-caption { animation: sbCaptionIn 0.45s ease both; }

          /* opening a poster: masthead + caption step back, cream washes in */
          @keyframes wkChromeOut {
            to { opacity: 0; transform: translateY(6px); }
          }
          .wk-chrome-out { animation: wkChromeOut 0.3s ease forwards; }

          .wk-veil {
            position: absolute;
            inset: 0;
            z-index: 8;
            background: var(--paper);
            opacity: 0;
            pointer-events: none;
          }
          .wk-veil-in {
            animation: wkVeilIn 0.42s ease-in 0.33s forwards;
          }
          @keyframes wkVeilIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .wk-caption, .wk-chrome-out { animation: none; }
            .wk-veil-in { animation: wkVeilIn 0.2s linear 0.4s forwards; }
          }
        `}</style>
      </section>
    </main>
  );
}
