import { projects } from "@/lib/projects";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();

  return (
    <main>
      <div className="wrap" style={{ paddingTop: "7rem", paddingBottom: "7rem", maxWidth: 860 }}>
        <BackLink href="/projects" label="All Projects" />

        <div className="page-header">
          <p className="t-label" style={{ marginBottom: "0.75rem" }}>{project.context}&nbsp;·&nbsp;{project.dates}</p>
          <h1 className="t-headline" style={{ marginBottom: "0.75rem" }}>{project.title}</h1>
          {project.award && (
            <span className="award-badge" style={{ marginTop: "0.5rem", display: "inline-block" }}>
              ★ {project.award}
            </span>
          )}
        </div>

        <p className="t-italic" style={{ marginBottom: "2.75rem" }}>{project.summary}</p>

        {/* Spec block */}
        <div style={{ marginBottom: "3rem" }}>
          <p className="t-label" style={{ marginBottom: "1.25rem" }}>Key Details</p>
          <div className="info-table">
            {project.bullets.map((b, i) => (
              <div key={i} className="info-row">
                <div className="info-label">{String(i + 1).padStart(2, "0")}</div>
                <div className="info-value">{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "3.5rem" }}>
          <p className="t-label" style={{ marginBottom: "1rem" }}>Tech Stack</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
            {project.tags.map(tag => (
              <span key={tag} className="skill-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: "2.5rem", borderTop: "1px solid var(--rule)" }}>
          <a href="https://github.com/BhavithParna" target="_blank" rel="noopener noreferrer" className="btn btn-outlined">
            View GitHub ↗
          </a>
        </div>
      </div>
    </main>
  );
}
