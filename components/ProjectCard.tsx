"use client";
import Link from "next/link";
import { type Project } from "@/lib/projects";

const covers = [
  { bg: "#1A2B3D", strip: "#5B8FB9" },
  { bg: "#2E1C14", strip: "#C86D53" },
  { bg: "#162A18", strip: "#6BA86B" },
  { bg: "#261A30", strip: "#9B6BAB" },
  { bg: "#102828", strip: "#5AAAB4" },
  { bg: "#2C2010", strip: "#C4A855" },
  { bg: "#2A1A20", strip: "#B47A8A" },
];

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const cover = covers[index % covers.length];

  return (
    <Link href={`/projects/${project.slug}`} className="spine-card">
      {/* Cover panel */}
      <div className="spine-cover" style={{ background: cover.bg }}>
        <span className="spine-cover-num" style={{ color: cover.strip }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Info panel */}
      <div className="spine-info">
        <p className="t-label" style={{ marginBottom: "0.85rem" }}>
          {project.context}&nbsp;·&nbsp;{project.dates}
        </p>
        <h3 style={{
          fontFamily: "'EB Garamond', serif",
          fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)",
          fontWeight: 400,
          lineHeight: 1.15,
          color: "var(--ink)",
          marginBottom: project.award ? "0.65rem" : "0.85rem",
          letterSpacing: "-0.01em",
        }}>
          {project.title}
        </h3>
        {project.award && (
          <span className="award-badge" style={{ marginBottom: "0.85rem" }}>
            ★ {project.award}
          </span>
        )}
        <p className="t-small" style={{ marginBottom: "1.25rem", maxWidth: 540 }}>
          {project.summary}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {project.tags.slice(0, 5).map(tag => (
            <span key={tag} className="skill-tag" style={{ fontSize: "0.62rem", padding: "0.15rem 0.6rem" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
