"use client";
import Link from "next/link";
import { type Project } from "@/lib/projects";

/* Vintage book-cloth cover colours (match the Library spines) */
const covers = [
  { bg: "#8A2420", foil: "#F2E4C0" }, // terracotta
  { bg: "#2F6E66", foil: "#EAD9A8" }, // teal
  { bg: "#B0801F", foil: "#3A2C12" }, // mustard
  { bg: "#6A6A2E", foil: "#F0E6C2" }, // olive
  { bg: "#466A82", foil: "#F0E6C2" }, // dusty blue
  { bg: "#6A375C", foil: "#EBD6C0" }, // plum
  { bg: "#B85E2A", foil: "#F2E4C0" }, // burnt orange
];

const tapeClass = ["sb-tape-teal", "sb-tape-terra"];

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const cover = covers[index % covers.length];

  return (
    <Link href={`/projects/${project.slug}`} className="sb-proj-card">
      <span
        className={`sb-tape ${tapeClass[index % 2]}`}
        style={{ top: -13, left: 26, transform: "rotate(-5deg)" }}
      />

      {/* Cover plate */}
      <div className="sb-proj-cover" style={{ background: cover.bg }}>
        <span className="sb-proj-num" style={{ color: cover.foil }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Info */}
      <div className="sb-proj-info">
        <p className="sb-meta">{project.context}&nbsp;·&nbsp;{project.dates}</p>
        <h3 className="sb-proj-title">{project.title}</h3>
        {project.award && <span className="sb-award">★ {project.award}</span>}
        <p className="sb-proj-summary">{project.summary}</p>
        <div className="sb-proj-tags">
          {project.tags.slice(0, 5).map(tag => (
            <span key={tag} className="sb-proj-tag">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
