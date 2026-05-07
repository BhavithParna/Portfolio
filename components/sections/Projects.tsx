import Link from "next/link";
import { featuredProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="wrap">
        <div className="section-head">
          <p className="t-label">Selected Work</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2rem", flexWrap: "wrap" }}>
            <h2 className="t-headline">The Workshop</h2>
            <Link href="/projects" className="link-text">View all →</Link>
          </div>
        </div>

        <div>
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
