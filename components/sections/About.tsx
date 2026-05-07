"use client";
import { useRef, useEffect } from "react";

export default function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        ref.current?.querySelectorAll<HTMLElement>(".fade").forEach((el, i) => {
          setTimeout(() => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; }, i * 90);
        });
      }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`.fade{opacity:0;transform:translateY(16px);transition:opacity 0.7s ease,transform 0.7s ease}`}</style>
      <section id="about" className="section" ref={ref}>
        <div className="wrap">

          <div className="section-head">
            <p className="t-label">About</p>
            <h2 className="t-headline fade">A brief introduction.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "5rem", alignItems: "start" }} className="about-grid">

            {/* Personal statement */}
            <div>
              <p className="t-italic fade" style={{ marginBottom: "1.75rem" }}>
                "I'm a third-year Biomedical Engineering student, building things at the intersection
                of neurotechnology and clinical medicine."
              </p>
              <p className="t-body fade" style={{ marginBottom: "1.25rem" }}>
                My work lately has meant architecting a real-time EEG-to-drone control pipeline
                during an internship, and designing a gamified rehabilitation device for children
                with Cerebral Palsy — working directly with a doctor to make sure the engineering
                served the actual clinical need, not just the technical problem.
              </p>
              <p className="t-body fade" style={{ marginBottom: "1.25rem" }}>
                I gravitate toward problems where the hardware has to function and the stakes are
                real. I'm less interested in demos and more interested in things that work.
              </p>
              <p className="t-body fade" style={{ marginBottom: "2.25rem" }}>
                Outside the lab you'll find me on the basketball court, deep in a book, building
                a playlist, or — most likely — on my third coffee of the day.
              </p>
              <div className="fade" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a href="https://github.com/BhavithParna" target="_blank" rel="noopener noreferrer" className="btn btn-outlined" style={{ padding: "0.5rem 1.3rem", fontSize: "0.72rem" }}>GitHub ↗</a>
                <a href="https://www.linkedin.com/in/bhavith-parna-2920b0178/" target="_blank" rel="noopener noreferrer" className="btn btn-outlined" style={{ padding: "0.5rem 1.3rem", fontSize: "0.72rem" }}>LinkedIn ↗</a>
              </div>
            </div>

            {/* Info table */}
            <div className="fade">
              <div className="info-table">
                {[
                  { label: "Status",       value: "Undergraduate, Year 3 of 4" },
                  { label: "Institution",  value: "B. V. Raju Institute of Technology" },
                  { label: "Programme",    value: "B.Tech, Biomedical Engineering" },
                  { label: "Location",     value: "Hyderabad, Telangana" },
                  { label: "Focus",        value: "Neurotech · BCI · Embedded Systems" },
                  { label: "Graduating",   value: "2027" },
                  { label: "Contact",      value: "bhavithparna6@gmail.com" },
                ].map(r => (
                  <div className="info-row" key={r.label}>
                    <div className="info-label">{r.label}</div>
                    <div className="info-value">{r.value}</div>
                  </div>
                ))}
                <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--rule)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                  <span className="t-label" style={{ color: "var(--accent)" }}>Open to opportunities</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.about-grid{grid-template-columns:1fr!important;gap:3rem!important}}`}</style>
    </>
  );
}
