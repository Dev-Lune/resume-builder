import type { Resume } from "./schema";

/** A finished resume, used on the landing page and as the "see a sample" seed. */
export const SAMPLE_RESUME: Resume = {
  id: "sample",
  title: "Devika Nair, Senior Frontend Engineer",
  template: "classic",
  paper: "letter",
  updatedAt: 0,
  targetRole: "Senior Frontend Engineer",
  jobDescription: "",
  sectionOrder: ["summary", "experience", "projects", "skills", "education", "certifications"],
  pageBreaks: [],
  basics: {
    name: "Devika Nair",
    headline: "Senior Frontend Engineer",
    email: "devika.nair@example.com",
    phone: "+91 98211 40673",
    location: "Bengaluru, India",
    website: "devikanair.dev",
    linkedin: "linkedin.com/in/devikanair",
    github: "github.com/dnair",
  },
  summary:
    "Frontend engineer with 7 years shipping consumer web products at payments and healthcare companies. Led the checkout rebuild at Kestrel Pay that lifted conversion 11.4% across 3.2M monthly sessions. Comfortable owning a surface end to end: design review, TypeScript and React, performance budgets, accessibility audits, and the on-call rota that comes with it.",
  experience: [
    {
      id: "e1",
      company: "Kestrel Pay",
      role: "Senior Frontend Engineer",
      location: "Bengaluru",
      start: "Mar 2022",
      end: "Present",
      current: true,
      bullets: [
        "Led a 4-engineer rebuild of the hosted checkout in React and TypeScript, raising conversion from 61.2% to 72.6% on 3.2M monthly sessions.",
        "Cut Largest Contentful Paint from 3.8s to 1.4s on mid-range Android by splitting the bundle per payment method and deferring the fraud SDK.",
        "Introduced a shared design-token package used by 6 product teams, removing 41 one-off color values and 3 competing button components.",
        "Ran the accessibility audit that took the checkout from 14 WCAG AA failures to 0 ahead of the RBI accessibility guidance deadline.",
      ],
    },
    {
      id: "e2",
      company: "Orrin Health",
      role: "Frontend Engineer",
      location: "Pune",
      start: "Jul 2019",
      end: "Feb 2022",
      current: false,
      bullets: [
        "Built the patient scheduling flow used by 240 clinics, replacing a phone-based process and reducing no-shows 18% in the first quarter.",
        "Moved the web app from a CRA build to Next.js with incremental static regeneration, cutting p95 time to interactive from 6.1s to 2.3s.",
        "Wrote the Playwright suite (312 scenarios) that gated releases and caught 9 regressions before they reached clinics.",
      ],
    },
    {
      id: "e3",
      company: "Lumen Studio",
      role: "Web Developer",
      location: "Kochi",
      start: "Jun 2017",
      end: "Jun 2019",
      current: false,
      bullets: [
        "Delivered 22 marketing and e-commerce sites for retail clients, each scoring 90+ on Lighthouse performance at launch.",
        "Set up the studio's first component library in Vue, halving the average build time for new client sites from 6 weeks to 3.",
      ],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Ledgerline",
      link: "github.com/dnair/ledgerline",
      description: "Open-source double-entry bookkeeping UI for small Indian businesses, 1.9k GitHub stars.",
      bullets: [
        "Designed the offline-first sync layer on IndexedDB and a Cloudflare Worker, handling 30-day offline gaps without conflicts.",
      ],
    },
  ],
  skills: [
    { id: "s1", name: "Languages", items: ["TypeScript", "JavaScript", "HTML", "CSS", "SQL"] },
    {
      id: "s2",
      name: "Frameworks",
      items: ["React", "Next.js", "Vue", "Node.js", "Tailwind CSS"],
    },
    {
      id: "s3",
      name: "Practices",
      items: ["Web performance", "Accessibility (WCAG 2.2)", "Design systems", "Playwright", "CI/CD"],
    },
  ],
  education: [
    {
      id: "ed1",
      school: "National Institute of Technology, Calicut",
      degree: "B.Tech",
      field: "Computer Science and Engineering",
      location: "Kozhikode",
      start: "2013",
      end: "2017",
      notes: "",
    },
  ],
  certifications: [
    { id: "c1", name: "Google Mobile Web Specialist", issuer: "Google", date: "2021" },
  ],
};
