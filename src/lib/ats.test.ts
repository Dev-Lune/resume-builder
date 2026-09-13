import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreResume } from "./ats.ts";
import { SAMPLE_RESUME } from "./sample.ts";
import { emptyResume } from "./schema.ts";

test("sample resume scores as ready", () => {
  const fit = scoreResume(SAMPLE_RESUME);
  assert.ok(fit.score >= 90, `expected >= 90, got ${fit.score}: ${fit.checks.filter((c) => !c.ok).map((c) => c.id).join(",")}`);
});

test("empty resume scores near zero", () => {
  const fit = scoreResume(emptyResume());
  assert.ok(fit.score <= 10, `expected <= 10, got ${fit.score}`);
  assert.equal(fit.checks.reduce((n, c) => n + c.weight, 0), 100);
});

test("weak bullets fail the verb check and pronouns", () => {
  const r = structuredClone(SAMPLE_RESUME);
  r.experience[0].bullets = [
    "Responsible for the checkout page and its 12 payment methods",
    "I helped the team with 3 releases",
    "Worked on performance for 2 quarters",
  ];
  const fit = scoreResume(r);
  assert.equal(fit.checks.find((c) => c.id === "verbs")?.ok, false);
  assert.equal(fit.checks.find((c) => c.id === "pronouns")?.ok, false);
});
