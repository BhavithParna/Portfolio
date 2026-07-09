import Link from "next/link";
import { projects, shelveProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }));
}

const excuses = [
  "Looks like I got lazy again — come back after a while.",
  "The write-up is still in the darkroom. Come back once it develops.",
  "I was going to document this. Then I made coffee instead. Check back soon.",
  "Under construction — the intern (me) is on an indefinite break.",
  "The ink hasn't dried on this one yet. Swing by later.",
];

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shelved = shelveProjects();
  const index = shelved.findIndex(s => s.project.slug === slug);
  if (index === -1) notFound();
  const { project, number, volume, companion } = shelved[index];

  return (
    <main>
      <section className="sb-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "6rem 0" }}>
        <span className="sb-deckle sb-deckle-bottom" />
        <div className="sb-wrap" style={{ width: "100%", textAlign: "center" }}>
          <div style={{ marginBottom: "2rem" }}>
            <BackLink href="/projects" label="All Projects" />
          </div>

          <p className="sb-eyebrow">
            No. {number}{volume && ` · Vol. ${volume}`} — {project.context} · {project.dates}
          </p>
          <h1 className="sb-name" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", marginBottom: "2.5rem" }}>
            {project.title}
          </h1>

          {project.classified ? (
            <>
              <span
                className="sb-stamp"
                style={{ display: "inline-block", fontSize: "1.4rem", padding: "0.6rem 1.6rem", transform: "rotate(-4deg)", marginBottom: "2rem" }}
              >
                CLASSIFIED
              </span>
              <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: "1.4rem", color: "var(--sb-ink-soft)", maxWidth: 520, margin: "0 auto" }}>
                This one stays in the sealed envelope for now. If I told you, I&apos;d have to redact you.
              </p>
            </>
          ) : (
            <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: "1.5rem", color: "var(--sb-ink-soft)", maxWidth: 520, margin: "0 auto" }}>
              {excuses[index % excuses.length]}
            </p>
          )}

          {companion && (
            <p style={{ marginTop: "3rem", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sb-ink-soft)" }}>
              Bound with{" "}
              <Link href={`/projects/${companion.slug}`} style={{ color: "var(--sb-terra)", textDecoration: "none", borderBottom: "1px solid currentColor" }}>
                {companion.title}
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
