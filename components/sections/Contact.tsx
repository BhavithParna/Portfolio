"use client";

const details = [
  { label: "Email",    value: "bhavithparna6@gmail.com",             href: "mailto:bhavithparna6@gmail.com" },
  { label: "Location", value: "Hyderabad, Telangana, India",          href: null },
  { label: "GitHub",   value: "github.com/BhavithParna",             href: "https://github.com/BhavithParna" },
  { label: "LinkedIn", value: "linkedin.com/in/bhavith-parna-2920b0178", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
];

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="wrap">
        <div className="section-head">
          <p className="t-label">Contact</p>
          <h2 className="t-headline">Let's Talk</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "5rem", alignItems: "start" }} className="contact-grid">
          <div>
            <p className="t-body" style={{ marginBottom: "2rem" }}>
              Open to collaborations, research opportunities, and interesting problems. If it sits
              at the edge of engineering and human health, I want to hear about it.
            </p>
            <a href="mailto:bhavithparna6@gmail.com" className="btn btn-filled" style={{ display: "inline-block", marginBottom: "1rem" }}>
              Send an Email
            </a>
          </div>

          <div>
            <div className="info-table">
              {details.map(d => (
                <div key={d.label} className="info-row">
                  <div className="info-label">{d.label}</div>
                  <div className="info-value">
                    {d.href
                      ? <a href={d.href} target={d.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">{d.value}</a>
                      : d.value
                    }
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <a href="/bhavith-parna-cv.pdf" download className="btn btn-outlined" style={{ display: "block", textAlign: "center" }}>
                Download CV
              </a>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "5.5rem", paddingTop: "2rem", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: "1.05rem", color: "var(--ink-light)" }}>Bhavith Parna</p>
          <p className="t-label">© 2026 · Hyderabad, India</p>
        </div>
      </div>
      <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;gap:2.5rem!important}}`}</style>
    </section>
  );
}
