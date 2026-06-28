"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Work",    href: "/#library" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  // The landing page is a fly-between "stage" with its own character nav —
  // no top bar there.
  if (pathname === "/") return null;

  return (
    <>
      <header
        className="nav"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-100%)", pointerEvents: visible ? "auto" : "none" }}
      >
        <div className="nav-inner">
          <Link href="/" className="nav-brand">Bhavith Parna</Link>
          <nav>
            <ul className="nav-links">
              {links.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="nav-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <button className="nav-menu-btn" onClick={() => setOpen(true)}>Menu</button>
        </div>
      </header>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg)", display: "flex", flexDirection: "column", padding: "1.5rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--rule)", marginBottom: "1.5rem" }}>
            <span className="nav-brand">Bhavith Parna</span>
            <button className="nav-menu-btn" onClick={() => setOpen(false)}>Close</button>
          </div>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily: "'EB Garamond', serif", fontSize: "2.5rem", fontWeight: 400, color: "var(--ink)", textDecoration: "none", padding: "0.7rem 0", borderBottom: "1px solid var(--rule)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
