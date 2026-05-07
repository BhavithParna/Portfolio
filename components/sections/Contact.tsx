"use client";
import { useRef, useEffect } from "react";

const details = [
  { label: "Email",    value: "bhavithparna6@gmail.com",             href: "mailto:bhavithparna6@gmail.com" },
  { label: "Location", value: "Hyderabad, Telangana, India",          href: null },
  { label: "GitHub",   value: "github.com/BhavithParna",             href: "https://github.com/BhavithParna" },
  { label: "LinkedIn", value: "linkedin.com/in/bhavith-parna-2920b0178", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
];

export default function Contact() {
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
          }, i * 75);
        });
        obs.disconnect();
      }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="contact" className="section" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head">
          <p className="t-label">Contact</p>
          <h2 className="t-headline reveal">Let's Talk</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "5rem", alignItems: "start" }} className="contact-grid">
          <div className="reveal">
            <p className="t-body" style={{ marginBottom: "2rem" }}>
              Open to collaborations, research opportunities, and interesting problems. If it sits
              at the edge of engineering and human health, I want to hear about it.
            </p>
            <a href="mailto:bhavithparna6@gmail.com" className="btn btn-filled" style={{ display: "inline-block", marginBottom: "1rem" }}>
              Send an Email
            </a>
          </div>

          <div className="reveal">
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
