import BackLink from "@/components/BackLink";

export default function MusicPage() {
  return (
    <main>
      <div className="wrap" style={{ paddingTop: "7rem", paddingBottom: "7rem" }}>
        <BackLink href="/" label="Home" />

        <div className="page-header">
          <p className="t-label" style={{ marginBottom: "0.75rem" }}>What's Playing</p>
          <h1 className="t-headline">The Soundtrack</h1>
        </div>

        <div style={{ border: "1px solid var(--rule)", background: "var(--paper)", padding: "5rem 3rem", textAlign: "center" }}>
          <p className="t-label" style={{ marginBottom: "1rem", color: "var(--accent)" }}>● Spotify Link Pending</p>
          <h2 className="t-title" style={{ marginBottom: "1rem" }}>Coming Soon</h2>
          <p className="t-body" style={{ maxWidth: 380, margin: "0 auto" }}>
            Once the Spotify link arrives, this page will come alive with favourite artists,
            albums, genres, and a carefully curated listening shelf.
          </p>
        </div>
      </div>
    </main>
  );
}
