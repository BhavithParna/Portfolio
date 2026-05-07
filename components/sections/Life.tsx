"use client";
import Link from "next/link";

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
  return (
    <section id="life" className="section section-alt">
      <div className="wrap">
        <div className="section-head">
          <p className="t-label">Beyond the Lab</p>
          <h2 className="t-headline">Off the Clock</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }} className="life-grid">
          {cards.map(card => (
            <Link key={card.href} href={card.href} className="life-card">
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
