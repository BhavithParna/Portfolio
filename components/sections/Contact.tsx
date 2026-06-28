"use client";
import { useRef, useEffect } from "react";

const details = [
  { label: "Email",    value: "bhavithparna6@gmail.com",                 href: "mailto:bhavithparna6@gmail.com" },
  { label: "Location", value: "Hyderabad, Telangana, India",             href: null },
  { label: "GitHub",   value: "github.com/BhavithParna",                 href: "https://github.com/BhavithParna" },
  { label: "LinkedIn", value: "linkedin.com/in/bhavith-parna-2920b0178", href: "https://www.linkedin.com/in/bhavith-parna-2920b0178/" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reveals = Array.from(el.querySelectorAll<HTMLElement>(".fade"));
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        reveals.forEach((child, i) => {
          setTimeout(() => { child.style.opacity = "1"; child.style.transform = "none"; }, i * 90);
        });
        obs.disconnect();
      }
    }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`#contact .fade{opacity:0;transform:translateY(16px);transition:opacity 0.7s ease,transform 0.7s ease}`}</style>
      <section id="contact" className="sb-page" ref={sectionRef}>
        <span className="sb-deckle sb-deckle-top" />
        <div className="sb-wrap">
          <p className="sb-eyebrow fade">Drop me a line</p>
          <h2 className="sb-name fade" style={{ fontSize: "clamp(2.5rem,6vw,4.25rem)" }}>Let&apos;s talk.</h2>

          <div className="sb-postcard fade">
            <div className="sb-postcard-left">
              <p className="sb-postcard-msg">
                Open to collaborations, research, and interesting problems. If it sits at the edge
                of engineering and human health, I want to hear about it.
              </p>
              <a href="mailto:bhavithparna6@gmail.com" className="sb-btn sb-btn-primary">Send an email ✉</a>
              <div style={{ marginTop: "2.25rem" }}>
                <span className="sb-sign">Bhavith</span>
              </div>
            </div>

            <div className="sb-postcard-right">
              <span className="sb-tape sb-tape-tl sb-tape-terra" style={{ left: "auto", right: "18px" }} />
              <div className="sb-postage">
                <div className="sb-postage-inner">
                  <b>HYD</b>
                  <span>India · 2026</span>
                </div>
              </div>
              <dl style={{ marginTop: "6.5rem" }}>
                {details.map(d => (
                  <div className="sb-row" key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>
                      {d.href
                        ? <a href={d.href} target={d.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">{d.value}</a>
                        : d.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <a href="/bhavith-parna-cv.pdf" download className="sb-btn" style={{ marginTop: "1.4rem" }}>Download CV ↓</a>
            </div>
          </div>

          <div className="sb-foot fade">
            <span>Bhavith Parna</span>
            <span>© 2026 · Hyderabad, India</span>
          </div>
        </div>
      </section>
    </>
  );
}
