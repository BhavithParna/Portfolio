"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { setScene, useScene, type Scene } from "@/lib/sceneStore";

/*
  DockNav — macOS-style dock, scrapbook edition. Mounted once in the root
  layout, so it's available on every page.

  A cream paper tray of perforated "postage stamp" buttons with
  cursor-proximity magnification and handwritten hover labels. Scene stamps
  swap the home stage (navigating home first if needed); the workshop stamp
  is a page link.

  On immersive views (HIDDEN_ROUTES, and the Hero landing scene) the dock
  stays tucked away — a small paper tab peeks at the bottom edge; bringing
  the cursor near it makes the dock glide in from a random direction. It
  tucks back away when the mouse wanders off. The Workshop is in there
  because its posters fly through the full viewport and would otherwise
  scroll straight under the tray.
*/

const HIDDEN_ROUTES = new Set(["/stare", "/projects"]);
/* …of those, the ones on cream paper need a dark tab instead of a pale one */
const LIGHT_ROUTES = new Set(["/projects"]);

type Item = {
  id: string;
  label: string;
  glyph: React.ReactNode;
  tint: string;                 // stamp paper tint
  scene?: Scene;                // swaps the stage…
  href?: string;                // …or navigates
};

const INK = "#33271C";

const ITEMS: Item[] = [
  { id: "home", scene: "home", label: "home sweet home", tint: "#F6EFDD", glyph: <HouseGlyph /> },
  { id: "about", scene: "about", label: "about me", tint: "#EFDCC8", glyph: <QuillGlyph /> },
  { id: "library", scene: "library", label: "the library", tint: "#EAD9B8", glyph: <BooksGlyph /> },
  { id: "workshop", href: "/projects", label: "the workshop", tint: "#E8D5C4", glyph: <WrenchGlyph /> },
  { id: "contact", scene: "contact", label: "send me a letter", tint: "#DCE4DC", glyph: <EnvelopeGlyph /> },
];

/* glide-in start points for hidden mode (picked at random per reveal) */
const ENTRIES = [
  { x: -420, y: 60, rotate: -10 },
  { x: 420, y: 60, rotate: 10 },
  { x: 0, y: 180, rotate: 0 },
  { x: -240, y: 200, rotate: -14 },
  { x: 240, y: 200, rotate: 14 },
];

export default function DockNav() {
  const pathname = usePathname();
  const router = useRouter();
  const scene = useScene();

  // The Hero landing is a full-bleed photo — keep it clean too.
  const tucked = HIDDEN_ROUTES.has(pathname) || (pathname === "/" && scene === "home");
  const [revealed, setRevealed] = useState(false);
  const [entry, setEntry] = useState(ENTRIES[2]);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cursor x in viewport coords; Infinity = cursor away, everything at rest.
  const mouseX = useMotionValue(Infinity);

  // Route changes: visible docks reset, tucked docks start hidden.
  useEffect(() => {
    setRevealed(false);
    mouseX.set(Infinity);
  }, [pathname, mouseX]);

  const visible = !tucked || revealed;

  const reveal = () => {
    if (revealed) return;
    setEntry(ENTRIES[Math.floor(Math.random() * ENTRIES.length)]);
    setRevealed(true);
  };
  const scheduleTuck = () => {
    if (!tucked) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(false), 1100);
  };
  const cancelTuck = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  /*
    The dock's own mouseleave can't be trusted to put it away: the hot zone
    unmounts the instant it reveals, right under the cursor, so the dock may
    never receive a mouseenter — and without one, no mouseleave ever follows.
    Watch the cursor against the bottom band instead; leave the band, tuck.
  */
  useEffect(() => {
    if (!tucked || !revealed) return;
    const BAND = 130;
    const onMove = (e: MouseEvent) => {
      if (e.clientY > window.innerHeight - BAND) cancelTuck();
      else scheduleTuck();
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tucked, revealed]);

  const onScene = (s: Scene) => {
    setScene(s);
    if (pathname !== "/") router.push("/");
    // Jumping to the (tucked) Hero scene from the dock: the cursor is on the
    // dock right now, so keep it up — it tucks itself once the mouse leaves.
    if (s === "home") setRevealed(true);
  };

  return (
    <>
      {/* hot zone + peeking paper tab, only while tucked away */}
      {tucked && !revealed && (
        <div
          className="dock-hotzone"
          onMouseEnter={reveal}
          onTouchStart={reveal}
          aria-hidden="true"
        >
          <span className={LIGHT_ROUTES.has(pathname) ? "dock-peek dock-peek-ink" : "dock-peek"} />
        </div>
      )}

      <div className="dock-wrap" style={{ pointerEvents: visible ? "auto" : "none" }}>
        <motion.nav
          className="dock"
          aria-label="Site navigation"
          onMouseMove={(e) => { mouseX.set(e.clientX); cancelTuck(); }}
          onMouseLeave={() => { mouseX.set(Infinity); scheduleTuck(); }}
          initial={false}
          animate={visible
            ? { x: 0, y: 0, rotate: 0, opacity: 1 }
            : { x: entry.x, y: entry.y, rotate: entry.rotate, opacity: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 17 }}
        >
          {ITEMS.map((item, i) => (
            <span key={item.id} style={{ display: "flex", alignItems: "flex-end" }}>
              {/* perforation divider sets the letter stamp apart at the end */}
              {i === 4 && <span className="dock-divider" aria-hidden="true" />}
              <DockStamp
                item={item}
                mouseX={mouseX}
                active={item.scene ? pathname === "/" && scene === item.scene : pathname === item.href}
                onSelect={() => item.scene && onScene(item.scene)}
              />
            </span>
          ))}
        </motion.nav>
      </div>
    </>
  );
}

function DockStamp({
  item,
  mouseX,
  active,
  onSelect,
}: {
  item: Item;
  mouseX: MotionValue<number>;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  // Distance from cursor to this stamp's center → magnification.
  const distance = useTransform(mouseX, (v) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? v - (b.left + b.width / 2) : Infinity;
  });
  const scale = useSpring(useTransform(distance, [-110, 0, 110], [1, 1.55, 1]), {
    mass: 0.15, stiffness: 220, damping: 16,
  });

  const inner = (
    <motion.span
      ref={ref}
      className="dock-stamp"
      style={{ scale, backgroundColor: item.tint }}
      whileTap={{ scale: 0.92 }}
    >
      {item.glyph}
    </motion.span>
  );

  return (
    <span className="dock-item">
      <span className="dock-label">{item.label}</span>
      {item.href ? (
        <Link href={item.href} aria-label={item.label} className="dock-btn">
          {inner}
        </Link>
      ) : (
        <button type="button" aria-label={item.label} className="dock-btn" onClick={onSelect}>
          {inner}
        </button>
      )}
      <span className="dock-ink-dot" data-active={active} aria-hidden="true" />
    </span>
  );
}

/* ─── stamp glyphs — 2px ink line doodles ─── */

const G = { fill: "none", stroke: INK, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function HouseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="dock-glyph" aria-hidden="true">
      <path {...G} d="M4 12 L12 4.5 L20 12" />
      <path {...G} d="M6.5 10.5 V19.5 H17.5 V10.5" />
      <path {...G} d="M10.5 19.5 V14.5 H13.5 V19.5" />
    </svg>
  );
}

function BooksGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="dock-glyph" aria-hidden="true">
      <path {...G} d="M5 20 V6.5 H9 V20" />
      <path {...G} d="M9 20 V4 H13.5 V20" />
      <path {...G} d="M13.8 19.8 L17 5.2 L20.5 6 L18 20" />
      <path {...G} d="M3.5 20 H21" />
    </svg>
  );
}

function EnvelopeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="dock-glyph" aria-hidden="true">
      <rect {...G} x="4" y="6.5" width="16" height="11.5" rx="1" />
      <path {...G} d="M4.5 7.5 L12 13.5 L19.5 7.5" />
    </svg>
  );
}

function QuillGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="dock-glyph" aria-hidden="true">
      <path {...G} d="M19.5 4.5 C14 5 8 10 5.5 17.5" />
      <path {...G} d="M19.5 4.5 C15.5 4.7 12.7 7 11 10.5 C13 10.2 15.8 9 17.8 6.2 C18.4 5.35 19 4.85 19.5 4.5 Z" />
      <path {...G} d="M4.5 19.5 L6.3 16.7" />
    </svg>
  );
}

function WrenchGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="dock-glyph" aria-hidden="true">
      <path {...G} d="M13.5 8.5 a4 4 0 1 1 2 5.4 L8 21 a1.9 1.9 0 0 1 -2.7 -2.7 L12.8 11 a4 4 0 0 1 0.7 -2.5 Z" />
      <path {...G} d="M17 4.5 L14.5 7 L17 9.5 L19.5 7" />
    </svg>
  );
}
