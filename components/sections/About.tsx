"use client";
import { useRef, useEffect } from "react";

const card = [
  { label: "Status",      value: "Undergraduate · Year 4 of 4" },
  { label: "Institution", value: "B. V. Raju Institute of Technology" },
  { label: "Programme",   value: "B.Tech, Biomedical Engineering" },
  { label: "Location",    value: "Hyderabad, Telangana" },
  { label: "Focus",       value: "Neurotech · BCI · Embedded" },
  { label: "Graduating",  value: "2027" },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        ref.current?.querySelectorAll<HTMLElement>(".fade").forEach((el, i) => {
          setTimeout(() => { el.style.opacity = "1"; el.style.transform = "none"; }, i * 90);
        });
      }
    }, { threshold: 0.04 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`#about .fade{opacity:0;transform:translateY(16px);transition:opacity 0.7s ease,transform 0.7s ease}`}</style>
      <section id="about" className="sb-page" ref={ref} style={{ paddingTop: "8rem", paddingBottom: "7rem" }}>
        <span className="sb-deckle sb-deckle-bottom" />

        <div className="sb-wrap">

          {/* Masthead */}
          <h1 className="sb-name fade">Bhavith <em>Parna</em></h1>
          <p className="sb-tagline fade">
            Biomedical engineer building at the edge of the human body.
          </p>

          <div className="sb-actions fade">
            <a href="/bhavith-parna-cv.pdf" download className="sb-btn sb-btn-primary">
              Download CV ↓
            </a>
            <a href="https://github.com/BhavithParna" target="_blank" rel="noopener noreferrer" className="sb-btn">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/bhavith-parna-2920b0178/" target="_blank" rel="noopener noreferrer" className="sb-btn">LinkedIn ↗</a>
          </div>

          {/* Body: handwritten letter + taped index card */}
          <div className="sb-grid">

            <div className="sb-letter">
              <span className="sb-coffee" style={{ top: "-18px", right: "8%" }} />
              <p className="sb-quote fade">
                I&apos;m a 4th-year Biomedical Engineering student. I build things — anywhere from
                Lego sets to BCI drone controllers, and everything chaotic in between.
              </p>
              <p className="fade">
                Lately that&apos;s meant architecting a real-time EEG-to-drone control pipeline
                during my internship, and designing a gamified rehab device for kids with Cerebral
                Palsy — working hand-in-hand with a doctor so the engineering actually serves the
                kid, not just my ego.
              </p>
              <p className="fade">
                I&apos;m drawn to problems where the hardware has to actually work — where &ldquo;it
                ran once in the demo&rdquo; isn&apos;t good enough. Real stakes, real constraints, no
                smoke and mirrors.
              </p>
              <p className="fade">
                When I&apos;m not elbow-deep in signal processing, I&apos;m probably on the basketball
                court, halfway through a book, curating a playlist nobody asked for, or on my third
                coffee — fourth if the EEG cap decided to fight me that day.
              </p>

              <span className="sb-note fade" style={{ marginTop: "1.5rem", position: "relative", display: "inline-block" }}>
                ↳ usually mid&#8209;build, on coffee #3 ☕
              </span>
            </div>

            <aside className="sb-card fade">
              <span className="sb-clip" />
              <span className="sb-tape sb-tape-tl sb-tape-teal" />
              <span className="sb-tape sb-tape-br sb-tape-terra" />
              <span className="sb-corner sb-corner-tl" />
              <span className="sb-corner sb-corner-br" />
              <p className="sb-card-title">Field notes</p>
              <dl>
                {card.map(r => (
                  <div className="sb-row" key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
                <div className="sb-row">
                  <dt>Contact</dt>
                  <dd><a href="mailto:bhavithparna6@gmail.com">bhavithparna6@gmail.com</a></dd>
                </div>
              </dl>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className="sb-stamp">Open to opportunities</span>
                <svg className="sb-doodle" width="56" height="34" viewBox="0 0 56 34" fill="none" aria-hidden="true" style={{ position: "static" }}>
                  <path d="M52 4C40 2 8 2 4 18c-2 8 6 12 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 30l-7-3M16 30l-2-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </>
  );
}
