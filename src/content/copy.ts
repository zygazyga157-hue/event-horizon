/**
 * Global copy and metadata
 * Source: project-zyga-about-contact.md
 */

export const siteMeta = {
  title: "PROJECT ZYGA — Event Horizon Gallery",
  description: "I build systems at the intersection of computer science and physics — tools that turn uncertainty into measurable decisions.",
  author: "Mthabisi W. Mkwananzi",
  alias: "Zyga Zyga",
  url: "https://zyga.dev",
  keynote: "Do(C)",
  esoteric157: "157: Begin. Adapt. Understand.",
  humanColorPreference: "red",
};

export const heroCopy = {
  title: "Event Horizon Gallery",
  subtitle: "A museum of systems",
  thesis: "Where algorithms meet architecture, and experiments become artifacts.",
  identityLine: "I build systems at the intersection of computer science and physics — tools that turn uncertainty into measurable decisions.",
};

export const aboutCopy = {
  pageTitle: "THE CURATOR",
  metaLine: "ABOUT / v1.0 / Updated 2026-01-24",
  subheading: "Mthabisi W. Mkwananzi (Zyga Zyga) — Self-taught systems builder, 5+ years shipping real software.",
  heroText: `I'm Mthabisi W. Mkwananzi, also known as Zyga Zyga — a self-taught developer with 5+ years of experience building and deploying software.

I think in systems: I design pipelines, interfaces, and feedback loops that survive in the real world (latency, failure modes, cost, risk).

My long arc is exploration — transcending space & time through computation, modeling, and automation.`,
  placard: {
    what: "I build full-stack and backend systems: data platforms, realtime services, simulations, automations, and production deployments.",
    why: "Because the world is noisy. Good engineering reduces noise into signal — measurable, repeatable, and inspectable.",
    approach: [
      "Measure first, then optimize.",
      "Reproducible experiments beat opinions.",
      "Monitoring is part of correctness.",
      "Documentation is part of the build.",
      "Ship in small, verifiable increments.",
    ],
  },
  coreSpecialties: [
    "Data analysis & science tooling",
    "GIS tools and geospatial workflows",
    "Web hosting & web development",
    "Cloud engineering & VPS operations",
    "App development",
    "Systems engineering",
    "Web3 development",
    "Cybersecurity & ethical hacking",
    "Project management & governance",
    "IoT & embedded systems",
    "ML & AI systems",
    "Algorithmic trading (Python + Assisted C)",
  ],
  languages: [
    { name: "Python", frameworks: ["FastAPI", "Flask", "Django"] },
    { name: "JavaScript / TypeScript", frameworks: ["Next.js", "React", "Node.js"] },
    { name: "HTML / CSS", frameworks: ["Tailwind CSS", "Jinja2", "Bootstrap"] },
  ],
  compatibility: ["Linux", "Windows", "macOS", "Server environments (VPS, containers)", "Multi-platform clients (web-first)"],
  tools: [
    "VS Code",
    "Cursor",
    "Git / GitHub",
    "PostgreSQL",
    "Docker",
    "Nginx",
    "Certbot",
    "Heroku",
    "VPS infrastructure",
    "MetaTrader",
  ],
  timeline: [
    { year: "2020", event: "Discovers terminals and Git cloning" },
    { year: "2022", event: "Masters Python and JavaScript" },
    { year: "2024", event: "Expands portfolio through building and shipping" },
    { year: "2026", event: "Focused: Web3 development + first deployment" },
  ],
};

export const contactCopy = {
  pageTitle: "THE LEDGER",
  metaLine: "CONTACT / v1.0 / Updated 2026-01-24",
  subheading: "Send a message, request collaboration, or place an offer directly on an artifact.",
  intro: `If you want to work together, send a message with:
• the problem you want solved
• constraints (timeline, budget, risk tolerance)
• links/context (docs, repos, mockups)

For direct project offers, use the Acquirement Bid panel on artifacts.
For sponsorship, use the Funding Bid panel.`,
  opportunities: {
    types: [
      { label: "Freelance", description: "Flexible project-based work with clear scope" },
      { label: "Contract-based", description: "Short to medium-term engagements with defined deliverables" },
      { label: "Consulting", description: "Architecture reviews, technical advisory, strategy sessions" },
      { label: "Research", description: "Collaborative R&D on interesting problems" },
    ],
    industries: [
      "Mining (IoT)",
      "Fintech (Algo trading)",
      "Developer Tools (Python & JS)",
      "Software development",
      "Data platforms",
      "Cybersecurity",
      "Robotics",
      "Web3 community",
    ],
    deliverables: [
      "Full-stack web applications",
      "Real-time systems & WebSocket infrastructure",
      "Data pipelines & ETL",
      "IoT sensing pipelines",
      "Backtesting engines & trading systems",
      "CI/CD & deployment automation",
      "Technical documentation & architecture diagrams",
    ],
  },
  availability: {
    status: "selective" as const,
    timezone: "Africa/Harare",
    responseTime: "24–72 hours",
  },
  contact: {
    email: "zygazyga157@gmail.com",
    whatsapp: "https://wa.me/+14386001307",
  },
  formFields: {
    interestTypes: ["Hiring", "Collaboration", "Funding", "Consulting", "Research", "Other"],
  },
  footerLine: "157: Begin. Adapt. Understand.",
  cta: "Send a Message",
};
