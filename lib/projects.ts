export type Project = {
  slug: string;
  title: string;
  context: string;
  dates: string;
  summary: string;
  bullets: string[];
  tags: string[];
  category: string[];
  featured: boolean;
  award?: string;
  classified?: boolean;
  /** Slug of the project this one is a companion volume to. Companions share
   *  their parent's number and binding, and sit beside it on the shelf. */
  companionOf?: string;
};

export const projects: Project[] = [
  {
    slug: "bci-drone-controller",
    title: "Non-Invasive BCI Drone Controller",
    context: "Internship",
    dates: "Feb 2026 – Present",
    summary: "An advanced Brain-Computer Interface project bridging neurological signals and physical hardware control — building a real-time system to pilot a drone using EEG data.",
    bullets: [
      "Real-time BCI drone control via EEG using OpenBCI Cyton board and Lab Streaming Layer (LSL)",
      "Architected a scalable Python-based ML pipeline to process mVEP stimuli evoked by PsychoPy, classifying high-fidelity brainwaves",
    ],
    tags: ["Python", "OpenBCI", "LSL", "PsychoPy", "EEG", "Machine Learning"],
    category: ["Neurotech / BCI", "Internship"],
    featured: true,
  },
  {
    slug: "gamified-rehab-cerebral-palsy",
    title: "Gamified Rehab Device for Cerebral Palsy",
    context: "Anveshana Competition",
    dates: "Jan 2026",
    summary: "A wearable rehabilitation tool that gamifies physical therapy for individuals with Cerebral Palsy. Built with direct clinical input from a practising doctor.",
    bullets: [
      "Led a team of four through design and development",
      "Custom-engineered to meet specific clinical needs of the doctor's patients",
      "Successfully gamified physical therapy — making it highly engaging for CP patients",
      "Received an Appreciation Award for the project's impact",
    ],
    tags: ["Wearables", "Biomedical", "Hardware", "Gamification", "Rehabilitation"],
    category: ["Biomedical", "Competition"],
    featured: true,
    award: "Appreciation Award — Anveshana Competition",
  },
  {
    slug: "iith-teer-device",
    title: "TEER Measurement Device",
    context: "IITH Internship",
    dates: "2025",
    summary: "A benchtop instrument built during a research internship at IIT Hyderabad to measure Trans-Epithelial Electrical Resistance (TEER) — quantifying the barrier integrity of cell-culture monolayers for in-vitro tissue models.",
    bullets: [
      "Research internship at the Indian Institute of Technology, Hyderabad (IITH)",
      "Measures Trans-Epithelial Electrical Resistance to assess cell-monolayer barrier integrity",
      "Custom low-noise analog front-end and electrode interface for impedance measurement",
    ],
    tags: ["Biomedical", "Instrumentation", "Impedance", "Electronics", "Cell Culture"],
    category: ["Biomedical", "Internship"],
    featured: true,
  },
  {
    slug: "teerbench",
    title: "TeerBench",
    context: "Companion Software",
    dates: "2026 – Present",
    summary: "The software half of the TEER instrument — a desktop GUI that turns the benchtop device into something you can actually drive, with live impedance readout and session logging.",
    bullets: [
      "Desktop GUI for the TEER measurement device — no more driving the instrument from a terminal",
      "Live impedance readout with real-time plotting across a measurement session",
      "Session logging and export for downstream analysis of barrier-integrity data",
    ],
    tags: ["GUI", "Desktop App", "Instrumentation", "Data Logging", "TEER"],
    category: ["Biomedical", "Software"],
    featured: false,
    companionOf: "iith-teer-device",
  },
  {
    slug: "smart-helmet",
    title: "Smart Helmet System",
    context: "Minor Project",
    dates: "2025",
    summary: "A smart helmet equipped with a comprehensive sensor network for real-time safety monitoring and automated crash detection.",
    bullets: [
      "Hardware integration: GPS, accelerometers, alcohol detection sensors",
      "Automated crash detection protocol with API-driven emergency alerts",
      "Custom web dashboard for live sensor data visualization",
    ],
    tags: ["IoT", "Arduino", "GPS", "API", "Web Dashboard", "Embedded Systems"],
    category: ["IoT & Embedded"],
    featured: true,
  },
  {
    slug: "visual-reaction-timer",
    title: "Visual Reaction Timer",
    context: "Third Year Project",
    dates: "Jan – Mar 2026",
    summary: "A portable IoT device engineered to test, track, and analyze visual reaction times with high precision. Includes a real-time web dashboard for cognitive performance tracking.",
    bullets: [
      "Led a team of two through the full build",
      "Engineered complete system architecture: custom hardware triggers + web-based frontend dashboard",
      "Real-time cognitive performance tracking and data visualization",
    ],
    tags: ["IoT", "Hardware", "Python", "Web Dashboard", "Embedded Systems"],
    category: ["IoT & Embedded", "Academic"],
    featured: false,
  },
  {
    slug: "applied-signal-processing-bci",
    title: "Applied Signal Processing for Visual BCI",
    context: "Research",
    dates: "Feb 2026 – Present",
    summary: "Deep-dive research into neurological signal processing — capturing and interpreting brain responses to visual stimuli using custom PsychoPy pipelines.",
    bullets: [
      "Advanced Visual Neuroinformatics research",
      "Eliciting, capturing, and processing SSVEP and mVEP visual evoked potentials",
      "Custom PsychoPy experimental pipelines",
    ],
    tags: ["Python", "PsychoPy", "SSVEP", "mVEP", "Signal Processing", "EEG"],
    category: ["Neurotech / BCI", "Research"],
    featured: false,
  },
  {
    slug: "hydro-plantation-geotagging",
    title: "Geotagging of Plantation in Hydro Project Catchment",
    context: "Smart India Hackathon (SIH) 2023",
    dates: "Dec 2023",
    summary: "A suspended mobile IoT unit for geotagging and monitoring plantations within hydro project catchment areas. SIH 2023 Finalist.",
    bullets: [
      "SIH 2023 Finalist — engineered a suspended mobile IoT unit",
      "Raspberry Pi + camera systems with image recognition algorithms",
      "Colour variation analysis for tracking plant growth rates",
      "Automated surveillance with anomaly detection and real-time alerts",
    ],
    tags: ["Raspberry Pi", "Computer Vision", "IoT", "Image Recognition", "Python"],
    category: ["IoT & Embedded", "Hackathon"],
    featured: false,
    award: "SIH 2023 Finalist",
  },
  {
    slug: "brainengine",
    title: "BrainEngine",
    context: "Classified",
    dates: "Pending",
    summary: "Redacted until further notice.",
    bullets: [],
    tags: [],
    category: ["Neurotech / BCI"],
    featured: false,
    classified: true,
  },
];

export const featuredProjects = projects.filter(p => p.featured);
export const allCategories = ["All", "Neurotech / BCI", "IoT & Embedded", "Biomedical", "Hackathon", "Research"];

export type Shelved = {
  project: Project;
  /** Catalogue number. A companion shares its parent's number. */
  number: string;
  /** "I" / "II" — only set on the two halves of a companion pair. */
  volume?: string;
  /** Which binding (spine colour / poster ink) to use. Companions share their parent's. */
  binding: number;
  /** The project this one is bound with, if any. */
  companion?: Project;
};

/**
 * Assigns catalogue numbers and bindings. Companion volumes don't take a
 * number of their own — they share their parent's and are marked Vol. II,
 * so the pair reads as two volumes of one work.
 */
export function shelveProjects(list: Project[] = projects): Shelved[] {
  const bySlug = new Map(list.map(p => [p.slug, p]));
  const primary = new Map<string, { number: string; binding: number }>();

  let n = 0;
  for (const p of list) {
    if (p.companionOf && bySlug.has(p.companionOf)) continue;
    primary.set(p.slug, { number: String(++n).padStart(2, "0"), binding: n - 1 });
  }

  const hasCompanion = new Set(
    list.filter(p => p.companionOf && bySlug.has(p.companionOf)).map(p => p.companionOf!),
  );

  return list.map(p => {
    const parentSlug = p.companionOf && bySlug.has(p.companionOf) ? p.companionOf : null;
    const base = primary.get(parentSlug ?? p.slug)!;
    return {
      project: p,
      number: base.number,
      binding: base.binding,
      volume: parentSlug ? "II" : hasCompanion.has(p.slug) ? "I" : undefined,
      companion: parentSlug
        ? bySlug.get(parentSlug)
        : list.find(c => c.companionOf === p.slug),
    };
  });
}

export const primaryCount = shelveProjects().filter(s => !s.project.companionOf).length;
