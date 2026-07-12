"use client";

import { AnimatePresence, motion } from "framer-motion";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Library from "@/components/sections/Library";
import Contact from "@/components/sections/Contact";
import { useScene } from "@/lib/sceneStore";

const sceneFade = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.015 },
  transition: { duration: 0.45, ease: "easeInOut" as const },
};

export default function Home() {
  // Scene lives in a global store — the dock (root layout) drives it.
  const scene = useScene();

  return (
    <div className="stage">
      <AnimatePresence mode="wait">
        <motion.div key={scene} className="scene" {...sceneFade}>
          {scene === "home" && <Hero />}
          {scene === "about" && <About />}
          {scene === "library" && <Library />}
          {scene === "contact" && <Contact />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
