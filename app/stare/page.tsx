import Balatro from "@/components/Balatro";

/*
  /stare — "Something to Stare At": a full-screen swirl, hypnosis basically.
  Slow continuous rotation, no mouse interaction, fine grain (high pixelFilter
  + devicePixelRatio rendering). Navigation: the global dock glides in when
  the cursor nears the bottom of the screen.
*/

export const metadata = {
  title: "Something to Stare At — Bhavith Parna",
  description: "A cool animation to get lost in looking at.",
};

export default function StarePage() {
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Balatro isRotate mouseInteraction={false} pixelFilter={2600} />
      </div>

      <div
        style={{
          position: "absolute", bottom: "1.5rem", left: 0, right: 0, zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem",
          pointerEvents: "none", textAlign: "center",
        }}
      >
        <p className="t-label" style={{ color: "rgba(237,232,223,0.85)" }}>
          Beyond the Lab — Something to Stare At
        </p>
        <p
          style={{
            fontFamily: "'Caveat', cursive", fontSize: "1.35rem", lineHeight: 1,
            color: "rgba(237,232,223,0.75)",
          }}
        >
          no goal here. stare a while, breathe.
        </p>
      </div>
    </main>
  );
}
