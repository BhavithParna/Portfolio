import BackLink from "@/components/BackLink";

const hobbies = [
  {
    title: "Basketball",
    sub: "On the court",
    desc: "Nothing clears the head like a good run. Basketball has been a constant — the game is fast, demanding, and honest about where you stand.",
    shelf: null as string[] | null,
    stats: null as { label: string; value: string }[] | null,
  },
  {
    title: "Reading",
    sub: "Lost in pages",
    desc: "A mix of science, fiction, and philosophy. There's a kind of thinking that only happens when you're deep in a good book.",
    shelf: [
      "Thinking, Fast and Slow — Daniel Kahneman",
      "The Gene: An Intimate History — Siddhartha Mukherjee",
      "Surely You're Joking, Mr. Feynman — Richard Feynman",
    ],
    stats: null,
  },
  {
    title: "Making Playlists",
    sub: "Curator mode",
    desc: "Playlists are personal architecture. The right sequence of songs can hold a mood, a memory, or an entire season of life.",
    shelf: null,
    stats: null,
  },
  {
    title: "Coffee",
    sub: "Non-negotiable",
    desc: "Not a habit. A lifestyle. Black, strong, and as often as possible. The lab runs on ideas; the ideas run on coffee.",
    shelf: null,
    stats: [
      { label: "Daily cups", value: "3+" },
      { label: "Preference", value: "Black" },
      { label: "Negotiable?", value: "Absolutely not" },
    ],
  },
];

export default function HobbiesPage() {
  return (
    <main>
      <div className="wrap" style={{ paddingTop: "7rem", paddingBottom: "7rem" }}>
        <BackLink href="/" label="Home" />

        <div className="page-header">
          <p className="t-label" style={{ marginBottom: "0.75rem" }}>Beyond the Lab</p>
          <h1 className="t-headline">Off the Clock</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="hobbies-grid">
          {hobbies.map(h => (
            <div key={h.title} style={{ border: "1px solid var(--rule)", background: "var(--paper)", padding: "2.25rem" }}>
              <p className="t-label" style={{ marginBottom: "0.75rem" }}>{h.sub}</p>
              <h2 className="t-title" style={{ marginBottom: "1rem" }}>{h.title}</h2>
              <div style={{ height: "1px", background: "var(--rule)", marginBottom: "1.25rem" }} />
              <p className="t-small" style={{ marginBottom: h.shelf || h.stats ? "1.75rem" : 0, lineHeight: 1.8 }}>{h.desc}</p>

              {h.shelf && (
                <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1.25rem" }}>
                  <p className="t-label" style={{ marginBottom: "0.85rem" }}>On the Shelf</p>
                  <div className="info-table">
                    {h.shelf.map((book, i) => (
                      <div key={book} className="info-row">
                        <div className="info-label">{String(i + 1).padStart(2, "0")}</div>
                        <div className="info-value" style={{ fontStyle: "italic" }}>{book}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {h.stats && (
                <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1.25rem" }}>
                  <div className="info-table">
                    {h.stats.map(s => (
                      <div key={s.label} className="info-row">
                        <div className="info-label">{s.label}</div>
                        <div className="info-value" style={{ fontWeight: 400, color: "var(--accent)" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.hobbies-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
