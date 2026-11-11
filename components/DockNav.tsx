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
import { House, UserRound, LibraryBig, Wrench, Mail, type LucideIcon } from "lucide-react";
import { setScene, useScene, type Scene } from "@/lib/sceneStore";

/*
  DockNav — a floating glass bar, pinned to the bottom of every page. It
  never hides.

  - The glass adapts: it reads what's underneath it (a `data-dock-tone`
    attribute if a section sets one, otherwise the first solid background
    colour it finds) and switches between a light pane with ink icons and
    a dark pane with white icons.
  - The current page gets a pill that slides between icons (shared layout).
  - Icons lift and magnify with cursor proximity; a label chip rises on hover.

  Scene buttons swap the home stage (navigating home first if needed); the
  workshop button is a page link.
*/

type Item = { id: string; label: string; Icon: LucideIcon; scene?: Scene; href?: string };

const ITEMS: Item[] = [
  { id: "home", scene: "home", label: "Home", Icon: House },
  { id: "about", scene: "about", label: "About", Icon: UserRound },
  { id: "library", scene: "library", label: "Library", Icon: LibraryBig },
  { id: "workshop", href: "/projects", label: "Workshop", Icon: Wrench },
  { id: "contact", scene: "contact", label: "Contact", Icon: Mail },
];

type Tone = "light" | "dark";

/* What is the dock sitting on? */
function toneUnder(wrap: HTMLElement): Tone {
  const r = wrap.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  for (const el of document.elementsFromPoint(x, y)) {
    if (wrap.contains(el)) continue;
    const tagged = (el as HTMLElement).closest<HTMLElement>("[data-dock-tone]");
    if (tagged) return tagged.dataset.dockTone === "light" ? "light" : "dark";
    if (el instanceof HTMLImageElement || el instanceof HTMLCanvasElement || el instanceof HTMLVideoElement) return "dark";
    const cs = getComputedStyle(el);
    if (cs.backgroundImage !== "none") return "dark";
    const m = cs.backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [cr, cg, cb, ca = "1"] = m;
    if (+ca < 0.6) continue;
    return (0.2126 * +cr + 0.7152 * +cg + 0.0722 * +cb) / 255 > 0.62 ? "light" : "dark";
  }
  return "dark";
}

export default function DockNav() {
  const pathname = usePathname();
  const router = useRouter();
  const scene = useScene();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<Tone>("dark");

  // Cursor x in viewport coords; Infinity = cursor away, everything at rest.
  const mouseX = useMotionValue(Infinity);

  // Re-read the backdrop on scroll (any scroller), resize, and page changes.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const t = toneUnder(wrap);
      setTone((prev) => (prev === t ? prev : t));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(check); };
    queue();
    // scenes cross-fade for ~0.5s; look again once they've settled
    const timers = [250, 700, 1400].map((ms) => setTimeout(queue, ms));
    document.addEventListener("scroll", queue, { capture: true, passive: true });
    window.addEventListener("resize", queue);
    return () => {
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("scroll", queue, { capture: true });
      window.removeEventListener("resize", queue);
    };
  }, [pathname, scene]);

  const onScene = (s: Scene) => {
    setScene(s);
    if (pathname !== "/") router.push("/");
  };

  return (
    <div className="dock-wrap" ref={wrapRef} data-tone={tone}>
      <motion.nav
        className="dock"
        aria-label="Site navigation"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 170, damping: 20, delay: 0.25 }}
      >
        {ITEMS.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            mouseX={mouseX}
            active={item.scene ? pathname === "/" && scene === item.scene : pathname.startsWith(item.href ?? "~")}
            onSelect={() => item.scene && onScene(item.scene)}
          />
        ))}
      </motion.nav>
    </div>
  );
}

function DockItem({
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

  // Distance from cursor to this icon's centre → lift + magnify.
  const distance = useTransform(mouseX, (v) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? v - (b.left + b.width / 2) : Infinity;
  });
  const spring = { mass: 0.12, stiffness: 240, damping: 17 };
  const scale = useSpring(useTransform(distance, [-90, 0, 90], [1, 1.24, 1]), spring);
  const y = useSpring(useTransform(distance, [-90, 0, 90], [0, -5, 0]), spring);

  const inner = (
    <span className="dock-cell" ref={ref}>
      {active && (
        <motion.span
          layoutId="dock-active"
          className="dock-active"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <motion.span className="dock-icon" style={{ scale, y }} whileTap={{ scale: 0.86 }}>
        <item.Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </motion.span>
    </span>
  );

  return (
    <span className="dock-item" data-active={active}>
      <span className="dock-label">{item.label}</span>
      {item.href ? (
        <Link href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined} className="dock-btn">
          {inner}
        </Link>
      ) : (
        <button type="button" aria-label={item.label} aria-current={active ? "page" : undefined} className="dock-btn" onClick={onSelect}>
          {inner}
        </button>
      )}
    </span>
  );
}
