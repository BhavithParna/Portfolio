"use client";

import { useEffect, useRef, useState } from "react";

/*
  VideoIntro — plays a fullscreen intro clip (you writing "BHAVITH" on
  frosted glass), then crossfades away to reveal the site.

  Drop your recording in /public as intro.mp4 (and optionally intro.webm).
  - Autoplays muted (browsers block autoplay with sound), inline on mobile.
  - When the clip ends it fades out and unmounts; the page is revealed.
  - "Skip" lets impatient visitors jump straight in.
  - If the video is missing or fails to load, we skip straight to the site
    so the page is never stuck behind a black screen.
*/

type Stage = "playing" | "leaving" | "done";

export default function VideoIntro() {
  const [stage, setStage] = useState<Stage>("playing");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Lock scroll while the intro is up.
  useEffect(() => {
    if (stage === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [stage]);

  // Begin the fade, then unmount after it finishes.
  const finish = () => {
    setStage((s) => (s === "playing" ? "leaving" : s));
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
        <source src="/intro.webm" type="video/webm" />
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      <button className="vi-skip" onClick={finish}>
        Skip
      </button>
    </div>
  );
}
