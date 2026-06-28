"use client";

import { useEffect, useRef, useState } from "react";

/*
  VideoIntro — plays a fullscreen intro clip, then crossfades away to reveal
  the site.

  - Autoplays muted + inline. `muted` is also set imperatively because React
    doesn't always apply the attribute in time, which makes browsers block
    muted-autoplay (black screen). If autoplay is still blocked we show a
    "tap to enter" affordance so it can never get stuck.
  - When the clip ends it fades out and unmounts; the page is revealed.
  - "Skip" lets impatient visitors jump straight in.
  - If the video is missing/fails, we skip straight to the site.
*/

type Stage = "playing" | "leaving" | "done";

export default function VideoIntro() {
  const [stage, setStage] = useState<Stage>("playing");
  const [needsTap, setNeedsTap] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Lock scroll while the intro is up.
  useEffect(() => {
    if (stage === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [stage]);

  // Force muted + try to play (works around React's flaky `muted` attribute).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => {
      v.play()
        .then(() => setNeedsTap(false))
        .catch(() => setNeedsTap(true)); // autoplay blocked → offer a tap
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("canplay", tryPlay, { once: true });
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  const finish = () => setStage((s) => (s === "playing" ? "leaving" : s));

  const playFromTap = () => {
    const v = videoRef.current;
    if (!v) return finish();
    v.muted = true;
    v.play().then(() => setNeedsTap(false)).catch(() => finish());
  };

  useEffect(() => {
    if (stage !== "leaving") return;
    const t = setTimeout(() => setStage("done"), 1100); // matches CSS transition
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === "done") return null;

  return (
    <div className="vi-root" data-stage={stage}>
      <video
        ref={videoRef}
        className="vi-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {needsTap && (
        <button className="vi-tap" onClick={playFromTap} aria-label="Enter">
          Tap to enter
        </button>
      )}

      <button className="vi-skip" onClick={finish}>
        Skip
      </button>
    </div>
  );
}
