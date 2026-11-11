"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { House, UserRound, LibraryBig, Wrench, Mail, type LucideIcon } from "lucide-react";
import { setScene, useScene, type Scene } from "@/lib/sceneStore";

/*
  DockNav — a glass tab bar, pinned to the bottom of every page. It never
  hides.

  One capsule of clear glass holding five tabs (icon over a small label).
  A brighter lens of glass sits behind the current tab and slides to the
  next one with a spring when you navigate. Icons swell slightly on hover
  and squish on press.

  The glass adapts: it reads what's underneath (a `data-dock-tone` attribute
  if a section sets one, otherwise the first solid background it finds) and
  switches between a light and a dark pane.

  Scene tabs swap the home stage (navigating home first if needed); the
  workshop tab is a page link.
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
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 170, damping: 20, delay: 0.25 }}
      >
        {ITEMS.map((item) => {
          const active = item.scene ? pathname === "/" && scene === item.scene : pathname.startsWith(item.href ?? "~");
          const inner = (
            <>
              {active && (
                <motion.span
                  layoutId="dock-lens"
                  className="dock-lens"
                  transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.9 }}
                  aria-hidden="true"
                />
              )}
              <motion.span
                className="dock-icon"
                whileHover={{ scale: 1.14, y: -1 }}
                whileTap={{ scale: 0.86 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                <item.Icon size={21} strokeWidth={active ? 2.1 : 1.7} aria-hidden="true" />
              </motion.span>
              <span className="dock-word">{item.label}</span>
            </>
          );
          return item.href ? (
            <Link key={item.id} href={item.href} className="dock-btn" data-active={active} aria-current={active ? "page" : undefined}>
              {inner}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              className="dock-btn"
              data-active={active}
              aria-current={active ? "page" : undefined}
              onClick={() => item.scene && onScene(item.scene)}
            >
              {inner}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
