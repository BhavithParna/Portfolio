"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import About from "@/components/sections/About";
import Library from "@/components/sections/Library";
import Contact from "@/components/sections/Contact";
import { PaperPlane, Mailman, MailTruck } from "@/components/StageNav";

type Scene = "home" | "library" | "contact";

const sceneFade = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.015 },
  transition: { duration: 0.45, ease: "easeInOut" as const },
};

export default function Home() {
  const [scene, setScene] = useState<Scene>("home");
  const go = (s: Scene) => setScene(s);

  return (
    <div className="stage">
      {/* Scene content */}
      <AnimatePresence mode="wait">
        <motion.div key={scene} className="scene" {...sceneFade}>
          {scene === "home" && <About />}
          {scene === "library" && <Library />}
          {scene === "contact" && <Contact />}
        </motion.div>
      </AnimatePresence>

      {/* Travelling characters (switch per scene) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`chars-${scene}`}
          className="stage-chars"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {scene === "home" && (
            <>
              <PaperPlane className="nav-plane-home" label="Check out the Library" onClick={() => go("library")} />
              <Mailman className="nav-mailman" label="Send me a letter" onClick={() => go("contact")} />
            </>
          )}
          {scene === "library" && (
            <>
              <PaperPlane className="nav-plane-back" label="Fly back home" onClick={() => go("home")} back />
              <MailTruck className="nav-truck" label="Off to Contact" onClick={() => go("contact")} />
            </>
          )}
          {scene === "contact" && (
            <PaperPlane className="nav-plane-back" label="Fly back home" onClick={() => go("home")} back />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
