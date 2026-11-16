"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { setScene, useScene, type Scene } from "@/lib/sceneStore";

/*
  DockNav — the site navigation: a ruled bar across the top of every page.
  Wordmark on the left, five mono links in the middle, one call cell on the
  right, all sitting on a hairline with a registration cross at each gutter.
  An ember marker rides the rule under the current page and slides between
  links.

  The bar adapts: it reads what's underneath (a `data-dock-tone` attribute
  if a section sets one, otherwise the first solid background it finds) and
  switches between cream-on-night and ink-on-paper.

  Scene links swap the home stage (navigating home first if needed); the
  workshop link is a page link.
*/

type Item = { id: string; label: string; scene?: Scene; href?: string };

const ITEMS: Item[] = [
  { id: "home", scene: "home", label: "Home" },
  { id: "about", scene: "about", label: "About" },
  { id: "library", scene: "library", label: "Library" },
  { id: "workshop", href: "/projects", label: "Workshop" },
  { id: "contact", scene: "contact", label: "Contact" },
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
  const wrapRef = useRef<HTMLElement>(null);
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
    <motion.header
      className="nav-wrap"
      ref={wrapRef}
      data-tone={tone}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.25, 1], delay: 0.25 }}
    >
      <button type="button" className="nav-brand" onClick={() => onScene("home")} aria-label="Bhavith Parna, home">
        Bhavith <em>Parna</em>
      </button>

      <nav className="nav-links" aria-label="Site navigation">
        {ITEMS.map((item) => {
          const active = item.scene ? pathname === "/" && scene === item.scene : pathname.startsWith(item.href ?? "~");
          const inner = (
            <>
              {item.label}
              {active && (
                <motion.span
                  layoutId="nav-mark"
                  className="nav-mark"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  aria-hidden="true"
                />
              )}
            </>
          );
          return item.href ? (
            <Link key={item.id} href={item.href} className="nav-link" data-active={active} aria-current={active ? "page" : undefined}>
              {inner}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              className="nav-link"
              data-active={active}
              aria-current={active ? "page" : undefined}
              onClick={() => item.scene && onScene(item.scene)}
            >
              {inner}
            </button>
          );
        })}
      </nav>

      <button type="button" className="nav-cta" onClick={() => onScene("contact")}>
        Get in touch <span aria-hidden="true">→</span>
      </button>

      <i className="nav-cross" data-side="l" aria-hidden="true" />
      <i className="nav-cross" data-side="r" aria-hidden="true" />
    </motion.header>
  );
}
