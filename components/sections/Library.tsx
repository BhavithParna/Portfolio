"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { shelveProjects } from "@/lib/projects";

/* ─── Texture: SVG noise as data URI for bookcloth grain ─────── */
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

/* ─── Per-book visual props ──────────────────────────────────── */
const bookMeta = [
  {
    // Terracotta
    w: 128, h: 306,
    gradient: "linear-gradient(to right, #5E2113 0%, #5E2113 6%, #8E3A22 16%, #B05030 30%, #C0613F 50%, #B05030 70%, #8E3A22 84%, #5E2113 94%, #5E2113 100%)",
    foil: "#F2E4C0",
    mb: 0,
  },
  {
    // Vintage Teal
    w: 110, h: 288,
    gradient: "linear-gradient(to right, #123A36 0%, #123A36 6%, #1C4A44 16%, #276059 30%, #2F6E66 50%, #276059 70%, #1C4A44 84%, #123A36 94%, #123A36 100%)",
    foil: "#EAD9A8",
    mb: 4,
  },
  {
    // Mustard
    w: 120, h: 316,
    gradient: "linear-gradient(to right, #6E4A12 0%, #6E4A12 6%, #946616 16%, #B0801F 30%, #C99A3B 50%, #B0801F 70%, #946616 84%, #6E4A12 94%, #6E4A12 100%)",
    foil: "#4A3618",
    mb: 2,
  },
  {
    // Olive
    w: 104, h: 294,
    gradient: "linear-gradient(to right, #3A3A16 0%, #3A3A16 6%, #51511F 16%, #6A6A2E 30%, #7E7E3A 50%, #6A6A2E 70%, #51511F 84%, #3A3A16 94%, #3A3A16 100%)",
    foil: "#F0E6C2",
    mb: 6,
  },
  {
    // Bone / cream cloth
    w: 96, h: 280,
    gradient: "linear-gradient(to right, #B3A078 0%, #B3A078 6%, #CDBB90 16%, #DFD0A6 30%, #ECDFBC 50%, #DFD0A6 70%, #CDBB90 84%, #B3A078 94%, #B3A078 100%)",
    foil: "#5A4632",
    mb: 0,
  },
  {
    // Dusty Blue
    w: 114, h: 300,
    gradient: "linear-gradient(to right, #233A4A 0%, #233A4A 6%, #324E62 16%, #466A82 30%, #5A7E96 50%, #466A82 70%, #324E62 84%, #233A4A 94%, #233A4A 100%)",
    foil: "#F0E6C2",
    mb: 3,
  },
  {
    // Plum
    w: 108, h: 290,
    gradient: "linear-gradient(to right, #3A1A32 0%, #3A1A32 6%, #512846 16%, #6A375C 30%, #7E3E6E 50%, #6A375C 70%, #512846 84%, #3A1A32 94%, #3A1A32 100%)",
    foil: "#EBD6C0",
    mb: 5,
  },
  {
    // Charcoal — the classified one
    w: 122, h: 310,
    gradient: "linear-gradient(to right, #14100C 0%, #14100C 6%, #241C14 16%, #362A1E 30%, #423424 50%, #362A1E 70%, #241C14 84%, #14100C 94%, #14100C 100%)",
    foil: "#C86D53",
    mb: 1,
  },
];

/* Life books use the same rich approach */
const lifeMeta = [
  {
    href: "/hobbies",
    title: "Off the Clock",
    sub: "Hobbies",
    w: 118, h: 296, mb: 3,
    gradient: "linear-gradient(to right, #6E3414 0%, #6E3414 6%, #94481E 16%, #B85E2A 30%, #D07038 50%, #B85E2A 70%, #94481E 84%, #6E3414 94%, #6E3414 100%)",
    foil: "#F2E4C0",
    italic: false,
  },
  {
    href: "/music",
    title: "The Soundtrack",
    sub: "Music",
    w: 128, h: 312, mb: 0,
    gradient: "linear-gradient(to right, #1A3A48 0%, #1A3A48 6%, #274E5E 16%, #386A7E 30%, #4A8296 50%, #386A7E 70%, #274E5E 84%, #1A3A48 94%, #1A3A48 100%)",
    foil: "#EAD9A8",
    italic: false,
  },
  {
    href: "/luca",
    title: "Luca",
    sub: "The Good Boy",
    w: 108, h: 304, mb: 5,
    gradient: "linear-gradient(to right, #6E5212 0%, #6E5212 6%, #927018 16%, #B58E22 30%, #D0A634 50%, #B58E22 70%, #927018 84%, #6E5212 94%, #6E5212 100%)",
    foil: "#3A2C12",
    italic: true,
  },
  {
    href: "/horror",
    title: "Horror",
    sub: "After Dark",
    w: 116, h: 298, mb: 2,
    gradient: "linear-gradient(to right, #2A0808 0%, #2A0808 6%, #460E0C 16%, #661614 30%, #8A2420 50%, #661614 70%, #460E0C 84%, #2A0808 94%, #2A0808 100%)",
    foil: "#E0C29A",
    italic: false,
  },
  {
    href: "/stare",
    title: "Something to Stare At",
    sub: "A Cool Animation",
    w: 112, h: 292, mb: 4,
    gradient: "linear-gradient(to right, #0E2A2E 0%, #0E2A2E 6%, #1C4A48 16%, #2F6E66 30%, #8A4630 50%, #2F6E66 70%, #1C4A48 84%, #0E2A2E 94%, #0E2A2E 100%)",
    foil: "#E8C87A",
    italic: true,
  },
];

/* ─── Reusable: spine decorative rule ────────────────────────── */
function FoilRule({ color, opacity = 0.55 }: { color: string; opacity?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "70%", alignSelf: "center" }}>
      <div style={{ height: 1, background: color, opacity }} />
      <div style={{ height: 1, background: color, opacity: opacity * 0.4 }} />
    </div>
  );
}

/* ─── Spine Book (project books — narrow vertical spine) ─────── */
function SpineBook({
  href, title, context, award, w, h, gradient, foil, mb, volume, lean = 0,
}: {
  href: string; title: string; context: string;
  award: boolean; w: number; h: number;
  gradient: string; foil: string; mb: number;
  volume?: string; lean?: number;
}) {
  const rest = `rotate(${lean}deg)`;
  return (
    <Link
      href={href}
      title={volume ? `${title} (Vol. ${volume})` : title}
      style={{
        flexShrink: 0,
        width: w,
        height: h,
        marginBottom: mb,
        // A leaning companion tips into the volume beside it and rests its
        // bottom corner on the plank.
        marginLeft: lean ? -8 : 0,
        transform: rest,
        transformOrigin: "bottom left",
        background: gradient,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        textDecoration: "none",
        transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
        boxShadow: "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3), 0 2px 0 rgba(255,255,255,0.03)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = `translateY(-20px) ${rest}`;
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.6)";
        el.style.zIndex = "30";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = rest;
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3), 0 2px 0 rgba(255,255,255,0.03)";
        el.style.zIndex = "1";
      }}
    >
      {/* Bookcloth grain texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `
          ${NOISE},
          repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 4px)
        `,
      }} />

      {/* Left hinge shadow */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 12,
        background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Right hinge shadow */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 10,
        background: "linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Top edge highlight */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(to right, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", width: "100%", padding: "12px 0" }}>

        {/* Top ornament */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 8, width: "100%" }}>
          {award && <div style={{ width: "80%", height: 2, background: "var(--accent)", opacity: 0.9, alignSelf: "center" }} />}
          <FoilRule color={foil} />
        </div>

        {/* Spine text — rotated bottom to top */}
        <div style={{
          flex: 1,
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.7rem",
          overflow: "hidden",
          padding: "4px 0",
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.48rem",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: foil,
            opacity: 0.5,
            flexShrink: 0,
          }}>
            {context}
          </span>
          <span style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "0.92rem",
            fontWeight: 400,
            color: foil,
            lineHeight: 1.25,
            textAlign: "center",
            letterSpacing: "0.03em",
            textShadow: `0 1px 3px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.08)`,
            wordBreak: "break-word",
            overflow: "hidden",
          }}>
            {title}
          </span>
        </div>

        {/* Bottom ornament — volume mark for books that come as a pair */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, marginTop: 8, width: "100%" }}>
          {volume && (
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.42rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: foil,
              opacity: 0.72,
            }}>
              {volume}
            </span>
          )}
          <FoilRule color={foil} opacity={0.4} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Cover Book (life books — wide face-up cover) ───────────── */
function CoverBook({
  href, title, sub, h, gradient, foil, italic,
}: {
  href: string; title: string; sub: string;
  h: number; gradient: string; foil: string; italic: boolean;
}) {
  return (
    <Link
      href={href}
      title={title}
      style={{
        flex: "1 1 0",
        minWidth: 160,
        height: h,
        background: gradient,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 1.75rem 1.5rem",
        cursor: "pointer",
        textDecoration: "none",
        overflow: "hidden",
        transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
        boxShadow: "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-20px)";
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.3), 0 28px 52px rgba(0,0,0,0.85)";
        el.style.zIndex = "30";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "3px 0 8px rgba(0,0,0,0.5), -1px 0 4px rgba(0,0,0,0.3)";
        el.style.zIndex = "1";
      }}
    >
      {/* Bookcloth grain */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `
          ${NOISE},
          repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 4px)
        `,
      }} />

      {/* Left hinge */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 14, background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)", pointerEvents: "none", zIndex: 2 }} />
      {/* Right hinge */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 12, background: "linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)", pointerEvents: "none", zIndex: 2 }} />
      {/* Top edge */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)", pointerEvents: "none", zIndex: 3 }} />

      {/* Top foil rule */}
      <div style={{ position: "absolute", top: 16, left: "1.75rem", right: "1.75rem", zIndex: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ height: 1, background: foil, opacity: 0.5 }} />
        <div style={{ height: 1, background: foil, opacity: 0.22 }} />
      </div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 4 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.52rem",
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: foil,
          opacity: 0.5,
          marginBottom: "0.6rem",
        }}>
          {sub}
        </p>
        <h3 style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: "clamp(1.35rem, 2.2vw, 1.85rem)",
          fontStyle: italic ? "italic" : "normal",
          fontWeight: 400,
          color: foil,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          textShadow: `0 1px 4px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.06)`,
        }}>
          {title}
        </h3>
        {/* Bottom foil rule */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "0.9rem" }}>
          <div style={{ height: 1, background: foil, opacity: 0.5 }} />
          <div style={{ height: 1, background: foil, opacity: 0.22 }} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Shelf plank ────────────────────────────────────────────── */
function ShelfPlank() {
  return (
    <div style={{
      height: 26,
      background: "linear-gradient(to bottom, #8A6238 0%, #74502C 30%, #5E3F20 65%, #4A3016 100%)",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
      borderRight: "1px solid rgba(0,0,0,0.25)",
      borderBottom: "1px solid rgba(0,0,0,0.45)",
      borderTop: "2px solid #A07A4A",
      boxShadow: "0 6px 18px rgba(60,40,20,0.4), 0 12px 34px rgba(60,40,20,0.25)",
    }} />
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export default function Library() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reveals = Array.from(el.querySelectorAll<HTMLElement>(".reveal"));
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        reveals.forEach((child, i) => {
          setTimeout(() => {
            child.style.opacity = "1";
            child.style.transform = "translateY(0)";
          }, i * 75);
        });
        obs.disconnect();
      }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="library" ref={sectionRef} className="sb-page" style={{ padding: "6.5rem 0 7rem" }}>
      <span className="sb-deckle sb-deckle-top" />
      <span className="sb-deckle sb-deckle-bottom" />
      <div className="sb-wrap">

        <div className="reveal" style={{ marginBottom: "3.5rem" }}>
          <p className="sb-eyebrow">The Library</p>
          <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: "1.4rem", color: "var(--sb-ink-soft)", maxWidth: 480 }}>
            Browse the shelves — every book opens a chapter.
          </p>
        </div>

        {/* ── Projects shelf header ── */}
        <div className="reveal sb-shelf-head">
          <p className="sb-shelf-label">Selected Work</p>
          <Link href="/projects" className="sb-shelf-link">Full catalogue →</Link>
        </div>

        {/* ── Projects shelf ── */}
        <div className="reveal sb-shelf" style={{ overflowX: "auto" }}>
          {shelveProjects().map(({ project: p, volume, binding }) => {
            const m = bookMeta[binding % bookMeta.length];
            // A companion volume is bound to match its parent — same cloth and
            // foil, a slimmer, shorter book leaning against it.
            const companion = !!p.companionOf;
            return (
              <SpineBook
                key={p.slug}
                href={`/projects/${p.slug}`}
                title={p.title}
                context={p.context}
                volume={volume && `VOL. ${volume}`}
                award={!!p.award}
                w={companion ? Math.round(m.w * 0.7) : m.w}
                h={companion ? Math.round(m.h * 0.84) : m.h}
                gradient={m.gradient}
                foil={m.foil}
                mb={companion ? 0 : m.mb}
                lean={companion ? -5 : 0}
              />
            );
          })}
        </div>
        <ShelfPlank />

        <div style={{ height: "4.5rem" }} />

        {/* ── Life shelf header ── */}
        <div className="reveal sb-shelf-head">
          <p className="sb-shelf-label">Beyond the Lab</p>
        </div>

        {/* ── Life shelf ── */}
        <div className="reveal sb-shelf">
          {lifeMeta.map(b => (
            <SpineBook
              key={b.href}
              href={b.href}
              title={b.title}
              context={b.sub}
              award={false}
              w={b.w}
              h={b.h}
              gradient={b.gradient}
              foil={b.foil}
              mb={b.mb}
            />
          ))}
        </div>
        <ShelfPlank />

      </div>
    </section>
  );
}
