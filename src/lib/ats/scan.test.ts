import { test } from "node:test";
import assert from "node:assert/strict";
import { scan } from "./scan.ts";
import { extractJdKeywords, extractTitle } from "./keywords.ts";

const JD = `Senior Frontend Engineer, Payments

We are looking for a Senior Frontend Engineer to own our checkout. You will work
in React and TypeScript, care about Core Web Vitals and accessibility (WCAG), and
help evolve our design system. Experience with Next.js and GraphQL required.
Familiarity with payments and PCI DSS is a plus. You will write tests with
Playwright and ship through CI/CD.`;

const STRONG = `Devika Nair
devika@example.com | +91 98211 40673 | linkedin.com/in/devika

Summary
Senior Frontend Engineer with 7 years in React and TypeScript.

Experience
Senior Frontend Engineer, Kestrel Pay (Mar 2022 - Present)
- Rebuilt the checkout in React and TypeScript, improving Core Web Vitals.
- Ran the accessibility audit to WCAG AA and built the design system.
- Shipped through CI/CD with a Playwright suite.

Skills
React, TypeScript, Next.js, GraphQL, accessibility, design systems, Playwright

Education
B.Tech, Computer Science`;

const WEAK = `John Smith
Cook at a restaurant. Made food. Cleaned the kitchen. Served customers.`;

test("extracts the job title from the posting", () => {
  assert.match(extractTitle(JD), /Senior Frontend Engineer/i);
});

test("extracts the posting's hard skills", () => {
  const kw = extractJdKeywords(JD).map((k) => k.canonical);
  for (const want of ["react", "typescript", "next.js", "graphql", "ci/cd", "playwright"]) {
    assert.ok(kw.includes(want), `expected keyword ${want} in ${kw.join(",")}`);
  }
});

test("a matching resume scores high with a high match rate", () => {
  const r = scan({ resumeText: STRONG, jobDescription: JD, fileKind: "internal" });
  assert.ok(r.matchRate >= 70, `match rate ${r.matchRate}`);
  assert.ok(r.score >= 70, `score ${r.score}`);
  assert.equal(r.title.found, true);
  assert.ok(r.matched.some((m) => m.label === "React"));
});

test("an unrelated resume scores low and flags missing keywords", () => {
  const r = scan({ resumeText: WEAK, jobDescription: JD, fileKind: "pdf" });
  assert.ok(r.matchRate <= 20, `match rate ${r.matchRate}`);
  assert.ok(r.missing.some((m) => m.label === "React"));
  assert.ok(r.recommendations.length > 0);
});

test("a scanned (empty) file fails the extractable check", () => {
  const r = scan({ resumeText: "", jobDescription: JD, fileKind: "pdf", extractedChars: 0 });
  assert.equal(r.checks.find((c) => c.id === "extractable")?.severity, "fail");
});

test("placement tells an evidenced skill from a listed-only one", () => {
  const r = scan({ resumeText: STRONG, jobDescription: JD, fileKind: "internal", now: 2024 });
  const react = r.matched.find((m) => m.label === "React");
  const graphql = r.matched.find((m) => m.label === "GraphQL");
  assert.equal(react?.placement, "evidenced"); // React is used in a bullet
  assert.equal(graphql?.placement, "listed"); // GraphQL only sits in the Skills line
  assert.ok(r.recommendations.some((x) => /GraphQL/.test(x) && /bullet/.test(x)));
});

test("years-of-experience requirement is matched against the resume", () => {
  const jd = JD + "\nRequires 5+ years of frontend experience.";
  const strong = scan({ resumeText: STRONG, jobDescription: jd, fileKind: "internal", now: 2024 });
  assert.equal(strong.experience.required, 5);
  assert.ok(strong.experience.evidenced >= 5, `evidenced ${strong.experience.evidenced}`);
  assert.equal(strong.checks.find((c) => c.id === "experience")?.severity, "pass");

  const junior = scan({ resumeText: "Frontend dev. Jan 2023 - Present. React, TypeScript.", jobDescription: jd, fileKind: "txt", now: 2024 });
  assert.equal(junior.checks.find((c) => c.id === "experience")?.severity, "fail");
});
