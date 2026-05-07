"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";

const cards = [
  {
    href: "/music",
    label: "Music",
    eyebrow: "The Soundtrack",
    desc: "Playlists, artists, and the songs that fuel late-night builds and slow weekend mornings.",
  },
  {
    href: "/luca",
    label: "Luca",
    eyebrow: "The Good Boy",
    desc: "Meet Luca — cheese connoisseur, coconut water critic, and the greatest dog to ever exist.",
  },
  {
    href: "/hobbies",
    label: "Off the Clock",
    eyebrow: "Hobbies & Life",
    desc: "Basketball, books, obsessively curated playlists, and a dangerous amount of coffee.",
  },
];

export default function Life() {
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
          }, i * 70);
        });
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="life" className="section section-alt" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head">
          <p className="t-label">Beyond the Lab</p>
          <h2 className="t-headline reveal">Off the Clock</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }} className="life-grid">
          {cards.map(card => (
            <Link key={card.href} href={card.href} className="life-card reveal">
              <div>
                <p className="t-label" style={{ marginBottom: "1rem" }}>{card.eyebrow}</p>
                <h3 className="t-title" style={{ marginBottom: "0.85rem" }}>{card.label}</h3>
                <p className="t-small">{card.desc}</p>
              </div>
              <p className="life-card-arrow">Explore →</p>
            </Link>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.life-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
