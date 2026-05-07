import BackLink from "@/components/BackLink";

const stats = [
  { label: "Greatest obsession",  value: "Cheese" },
  { label: "Close second",        value: "Coconut Water" },
  { label: "Favourite toy",       value: "Any ball, ever" },
  { label: "Favourite humans",    value: "Everyone (no exceptions)" },
  { label: "Threat level",        value: "Maximum Chaos" },
  { label: "Official rating",     value: "15 / 10" },
];

export default function LucaPage() {
  return (
    <main>
      <div className="wrap" style={{ paddingTop: "7rem", paddingBottom: "7rem" }}>
        <BackLink href="/" label="Home" />

        <div className="page-header" style={{ textAlign: "center" }}>
          <p className="t-label" style={{ marginBottom: "1.25rem" }}>The greatest dog to ever exist</p>
          <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(4rem, 12vw, 8rem)" }}>Luca</h1>
        </div>

        <p className="t-italic" style={{ textAlign: "center", maxWidth: 540, margin: "0 auto 4rem", color: "var(--ink-mid)" }}>
          "Hella smart, suspiciously obsessed with cheese and coconut water, and an absolute menace with a ball.
          Loves people, loves chaos, loves life."
        </p>

        {/* Hero placeholder */}
        <div style={{ border: "1px solid var(--rule)", background: "var(--paper)", height: 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "3.5rem" }}>
          <p className="t-label" style={{ marginBottom: "0.5rem" }}>Hero Photo</p>
          <p className="t-small">Add Luca's best photo here</p>
        </div>

        {/* Dossier */}
        <p className="t-label" style={{ marginBottom: "1.25rem" }}>Official Dossier</p>
        <div className="info-table" style={{ marginBottom: "3.5rem" }}>
          {stats.map(s => (
            <div key={s.label} className="info-row">
              <div className="info-label">{s.label}</div>
              <div className="info-value" style={{ fontWeight: 400, color: s.label === "Official rating" ? "var(--accent)" : "var(--ink)" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Gallery */}
        <p className="t-label" style={{ marginBottom: "1.25rem" }}>Gallery</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1px", background: "var(--rule)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "var(--paper)", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              <p className="t-label">Photo {String(i + 1).padStart(2, "0")}</p>
              <p className="t-small" style={{ fontSize: "0.72rem" }}>Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
