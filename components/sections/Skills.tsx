"use client";
import { useRef, useEffect } from "react";

const clusters = [
  { label: "Programming",        tags: ["Python", "AIML"] },
  { label: "Embedded & IoT",     tags: ["Arduino", "Raspberry Pi", "ESP32"] },
  { label: "Neurotech & BCI",    tags: ["OpenBCI", "OpenViBE", "PsychoPy", "EEG", "SSVEP", "mVEP", "LSL"] },
  { label: "Simulation",         tags: ["MATLAB", "Multisim", "LTspice"] },
  { label: "Web & Deployment",   tags: ["HTML", "Ubuntu Server"] },
  { label: "Design",             tags: ["Photoshop", "Illustrator"] },
  { label: "Analogue Skills",    tags: ["Rapid Prototyping", "3D Modelling", "Cross-Functional Leadership", "Clinical Collaboration", "Project Management"] },
];

export default function Skills() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        ref.current?.querySelectorAll<HTMLElement>(".row-reveal").forEach((el, i) => {
          setTimeout(() => { el.style.opacity = "1"; }, i * 55);
        });
      }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`.row-reveal{opacity:0;transition:opacity 0.5s ease}`}</style>
      <section id="skills" className="section section-alt" ref={ref}>
        <div className="wrap">
          <div className="section-head">
            <p className="t-label">Skills</p>
            <h2 className="t-headline">The Craft</h2>
          </div>

          <div>
            {clusters.map(c => (
              <div key={c.label} className="skill-row row-reveal">
                <p className="t-label" style={{ paddingTop: "0.2rem", color: "var(--ink-mid)" }}>{c.label}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {c.tags.map(tag => (
                    <span key={tag} className="skill-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
