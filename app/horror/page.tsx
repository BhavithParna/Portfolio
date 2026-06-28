import BackLink from "@/components/BackLink";

const films = [
  {
    title: "Hereditary",
    sub: "Ari Aster · 2018",
    desc: "Grief as a slow-tightening noose. The kind of dread that builds from the inside out — no jump scares needed.",
  },
  {
    title: "The Thing",
    sub: "John Carpenter · 1982",
    desc: "Paranoia, practical effects, and a creature that could be anyone. Still the gold standard for body horror done right.",
  },
  {
    title: "Sinister",
    sub: "Scott Derrickson · 2012",
    desc: "Those home-movie reels are seared into my brain. Genuinely uncomfortable in the best way.",
  },
  {
    title: "The Conjuring",
    sub: "James Wan · 2013",
    desc: "Old-school haunted-house craft. Tension over gore, atmosphere over shock.",
  },
];

export default function HorrorPage() {
  return (
    <main>
      <div className="wrap" style={{ paddingTop: "7rem", paddingBottom: "7rem" }}>
        <BackLink href="/" label="Home" />

        <div className="page-header">
          <p className="t-label" style={{ marginBottom: "0.75rem" }}>Beyond the Lab</p>
          <h1 className="t-headline">After Dark</h1>
          <p className="t-italic" style={{ marginTop: "1rem", maxWidth: 520 }}>
            A standing weakness for horror — the slower and more dread-soaked, the better.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="horror-grid">
          {films.map(f => (
            <div key={f.title} style={{ border: "1px solid var(--rule)", background: "var(--paper)", padding: "2.25rem" }}>
              <p className="t-label" style={{ marginBottom: "0.75rem" }}>{f.sub}</p>
              <h2 className="t-title" style={{ marginBottom: "1rem" }}>{f.title}</h2>
              <div style={{ height: "1px", background: "var(--rule)", marginBottom: "1.25rem" }} />
              <p className="t-small" style={{ lineHeight: 1.8 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.horror-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
