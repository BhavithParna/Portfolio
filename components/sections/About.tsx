"use client";

import CoffeeCounter from "@/components/CoffeeCounter";

/*
  About — "about ²⁰²⁶" editorial layout (imported from Claude Design,
  About Section.dc.html) re-set on the site's scrapbook paper: left column
  is a pile of artifacts (torn photo, sticky note, rubber stamp, spinning
  coffee-ring counter), right column is the bio + profile/contact index.
*/

const PROFILE: { label: string; value: React.ReactNode }[] = [
  { label: "status", value: "Undergraduate · Year 4 of 4" },
  { label: "institution", value: "B. V. Raju Institute of Technology" },
  { label: "programme", value: "B.Tech, Biomedical Engineering" },
  { label: "graduating", value: "2027" },
];

const CONTACT: { label: string; value: React.ReactNode }[] = [
  { label: "location", value: "Hyderabad, Telangana" },
  { label: "focus", value: "Neurotech · BCI · Embedded" },
  { label: "email", value: <a href="mailto:bhavithparna6@gmail.com">bhavithparna6@gmail.com</a> },
];

export default function About() {
  // Simple top-to-bottom stagger; the section remounts on every scene switch.
  let step = 0;
  const d = () => ({ animationDelay: `${(0.08 + step++ * 0.08).toFixed(2)}s` });

  return (
    <section id="about" className="sb-page ab-page">
      <span className="sb-deckle sb-deckle-bottom" />

      <div className="sb-wrap">
        <header className="ab-fade" style={d()}>
          <h1 className="ab-title">about <sup>2026</sup></h1>
          <p className="ab-mono ab-byline">[ bhavith parna ]</p>
        </header>

        <div className="ab-grid">

          {/* ── artifact pile ── */}
          <div className="ab-artifacts">
            <figure className="ab-photo ab-fade-o" style={d()}>
              <img
                src="/images/about-photo.jpg"
                alt="Grainy night photo of a Darth Vader figure"
              />
              <figcaption className="ab-photo-cap">exhibit A — after dark</figcaption>
            </figure>
            <span className="ab-tape ab-fade-o" style={d()} aria-hidden="true" />

            <span className="sb-note ab-note ab-fade-o" style={d()}>
              ↳ usually mid&#8209;build,<br />on coffee #3 ☕
            </span>

            <span className="sb-stamp ab-stamp ab-fade-o" style={d()}>
              Open to opportunities
            </span>

            <div className="ab-cuppos ab-fade" style={d()}>
              <CoffeeCounter />
            </div>
          </div>

          {/* ── bio + index ── */}
          <div>
            <h2 className="ab-h ab-fade" style={d()}>about me</h2>
            <p className="ab-mono ab-sub ab-fade" style={d()}>hey, I&apos;m Bhavith :)</p>

            <p className="ab-lead ab-fade" style={d()}>
              I&apos;m a 4th-year Biomedical Engineering student. I build things — anywhere
              from Lego sets to BCI drone controllers, and everything chaotic in between.
            </p>
            <p className="ab-p ab-fade" style={d()}>
              Lately that&apos;s meant architecting a real-time EEG-to-drone control pipeline
              during my internship, and designing a gamified rehab device for kids with Cerebral
              Palsy — working hand-in-hand with a doctor so the engineering actually serves the
              kid, not just my ego.
            </p>
            <p className="ab-p ab-fade" style={d()}>
              I&apos;m drawn to problems where the hardware has to actually work — where &ldquo;it
              ran once in the demo&rdquo; isn&apos;t good enough. Real stakes, real constraints, no
              smoke and mirrors.
            </p>
            <p className="ab-p ab-fade" style={d()}>
              When I&apos;m not elbow-deep in signal processing, I&apos;m probably on the basketball
              court, halfway through a book, curating a playlist nobody asked for, or on my third
              coffee — fourth if the EEG cap decided to fight me that day.
            </p>

            <div className="ab-facts ab-fade" style={d()}>
              <div>
                <h3 className="ab-facts-h">profile</h3>
                {PROFILE.map((f) => (
                  <div className="ab-fact" key={f.label}>
                    <span className="ab-fact-label">[ {f.label} ]</span>
                    <span className="ab-fact-value">{f.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="ab-facts-h">contact</h3>
                {CONTACT.map((f) => (
                  <div className="ab-fact" key={f.label}>
                    <span className="ab-fact-label">[ {f.label} ]</span>
                    <span className="ab-fact-value">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-actions ab-actions ab-fade" style={d()}>
              <a href="/bhavith-parna-cv.pdf" download className="sb-btn sb-btn-primary">
                Download CV ↓
              </a>
              <a href="https://github.com/BhavithParna" target="_blank" rel="noopener noreferrer" className="sb-btn">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/bhavith-parna-2920b0178/" target="_blank" rel="noopener noreferrer" className="sb-btn">LinkedIn ↗</a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
