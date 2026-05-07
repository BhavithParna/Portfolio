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
      <div className="wrap" style={{ paddingTop: "7rem" }}>
        <BackLink href="/" label="Home" />

        <div className="page-header">
          <p className="t-label" style={{ marginBottom: "0.75rem" }}>All Work</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <h1 className="t-headline">The Workshop</h1>
            <p className="t-label">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</p>
          </div>
        </div>

        <div className="filter-bar">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`filter-btn${active === cat ? " active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ paddingBottom: "7rem" }}>
          {filtered.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
