"use client";
import { useState } from "react";
import { projects, allCategories } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import BackLink from "@/components/BackLink";

export default function ProjectsPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter(p => p.category.includes(active));

  return (
    <main>
      <section className="sb-page" style={{ paddingTop: "7rem", paddingBottom: "5rem", minHeight: "100vh" }}>
        <span className="sb-deckle sb-deckle-bottom" />
        <div className="sb-wrap">
          <BackLink href="/" label="Home" />

          <p className="sb-eyebrow">All work</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <h1 className="sb-name" style={{ fontSize: "clamp(2.4rem,6vw,4.5rem)", marginBottom: 0 }}>The Workshop</h1>
            <p className="sb-meta">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</p>
          </div>

          <div className="sb-filter">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`sb-filter-btn${active === cat ? " active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sb-proj-list">
            {filtered.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
