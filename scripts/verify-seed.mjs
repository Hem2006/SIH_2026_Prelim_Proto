/**
 * Independent check on the seed registry.
 *
 * 1. Every metric-lock hash is recomputed with Node's crypto and compared to the
 *    digest the browser bundle would print. If these ever diverge, a certificate
 *    is showing a number nobody can reproduce — which is the exact failure this
 *    product exists to prevent.
 * 2. Registry invariants that the demo narrative depends on.
 */
import { createHash } from "node:crypto";
import {
  initialPilots, initialProcurements, initialSolutions, initialVerifiers,
  initialCertificates, initialCitationEdges, FOLLOW_A_PRECEDENT
} from "../src/data/seedData.js";
import { serialiseMetricLock } from "../src/lib/metricLock.js";

let failures = 0;
const fail = (msg) => { failures++; console.error(`  ✗ ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

console.log("\nMetric-lock hashes vs node:crypto");
let hashMismatch = 0;
for (const p of initialPilots) {
  const expected = createHash("sha256").update(serialiseMetricLock(p.metricLock), "utf8").digest("hex");
  if (p.metricLock.hash !== expected) { hashMismatch++; fail(`${p.id}: ${p.metricLock.hash} != ${expected}`); }
  if (!/^[0-9a-f]{64}$/.test(p.metricLock.hash)) fail(`${p.id}: hash is not 64 hex characters`);
}
if (!hashMismatch) ok(`${initialPilots.length} pilots — every digest reproducible with shasum -a 256`);

console.log("\nCertificates agree with their own metric locks");
let verdictMismatch = 0;
for (const p of initialPilots.filter((x) => x.verification)) {
  const allPassed = p.verification.results.every((r) => r.passed);
  const expectedType = allPassed ? "positive" : "negative";
  if (p.verification.certificateType !== expectedType) { verdictMismatch++; fail(`${p.id}: type ${p.verification.certificateType}, criteria say ${expectedType}`); }
  for (const r of p.verification.results) {
    if (r.achieved === undefined) { verdictMismatch++; fail(`${p.id}/${r.criterionId}: no measured value`); }
  }
}
if (!verdictMismatch) ok("no certificate contradicts its locked thresholds");

console.log("\nChronology");
let chrono = 0;
for (const p of initialPilots) {
  const locked = p.metricLock.lockedAt.split("T")[0];
  if (p.application && p.application.appliedAt < locked) { chrono++; fail(`${p.id}: application predates the metric lock`); }
  if (p.evidence && p.evidence.submittedAt < locked) { chrono++; fail(`${p.id}: evidence predates the metric lock`); }
  if (p.verification && p.verification.certifiedAt < p.evidence.submittedAt) { chrono++; fail(`${p.id}: certified before evidence was submitted`); }
}
for (const a of initialProcurements) {
  const cert = initialCertificates.find((c) => c.id === a.citedCertificateId);
  if (a.date < cert.issuedAt) { chrono++; fail(`${a.id}: cites ${cert.id} before it was issued`); }
}
if (!chrono) ok("metrics locked before applications; nothing cited before it existed");

console.log("\nRegistry shape");
const negatives = initialPilots.filter((p) => p.status === "Negative Precedent");
negatives.length >= 3 ? ok(`${negatives.length} negative precedents certified and published`) : fail(`only ${negatives.length} negative precedents (need 3)`);

const overBudget = initialPilots.filter((p) => p.budgetCap > 2500000);
overBudget.length === 0 ? ok("every pilot is within the ₹25 lakh pilot ceiling") : fail(`${overBudget.length} pilots exceed ₹25 lakh`);

const tiers = new Set(initialSolutions.map((s) => s.tier));
[0, 1, 2, 3, 4].every((t) => tiers.has(t)) ? ok(`${initialSolutions.length} solutions spanning all five tiers`) : fail(`tiers present: ${[...tiers].sort()}`);

const tier4 = initialSolutions.filter((s) => s.tier === 4);
if (tier4.length === 0) fail("no Tier 4 solution — GeM graduation is not demonstrable");
for (const s of tier4) {
  s.citingDepartments.length >= 5 && s.citingStates.length >= 2
    ? ok(`${s.name}: ${s.citingDepartments.length} departments across ${s.citingStates.length} states (${s.citingStates.join(", ")})`)
    : fail(`${s.name} is Tier 4 without the citations to justify it`);
}

const verifierIds = new Set(initialVerifiers.map((v) => v.id));
initialVerifiers.length >= 10 ? ok(`${initialVerifiers.length} empanelled verifiers`) : fail(`only ${initialVerifiers.length} verifiers`);
if (initialVerifiers.some((v) => !/^EMP\//.test(v.empanelmentId))) fail("a verifier is missing a well-formed empanelment ID");

console.log("\nReferential integrity");
let refs = 0;
const pilotIds = new Set(initialPilots.map((p) => p.id));
const certIds = new Set(initialCertificates.map((c) => c.id));
for (const p of initialPilots) {
  if (p.verification && !verifierIds.has(p.verification.verifierId)) { refs++; fail(`${p.id}: unknown verifier`); }
  for (const cited of p.verification?.citesCertificates || []) {
    if (!certIds.has(cited)) { refs++; fail(`${p.id}: cites missing certificate ${cited}`); }
  }
}
for (const a of initialProcurements) {
  if (!pilotIds.has(a.pilotId)) { refs++; fail(`${a.id}: unknown pilot`); }
  if (!certIds.has(a.citedCertificateId)) { refs++; fail(`${a.id}: unknown certificate`); }
}
for (const key of Object.values(FOLLOW_A_PRECEDENT)) {
  const found = pilotIds.has(key) || certIds.has(key) ||
    initialProcurements.some((a) => a.id === key || a.auditFileId === key) ||
    initialSolutions.some((s) => s.id === key);
  if (!found) { refs++; fail(`the demo path references a missing record: ${key}`); }
}
if (!refs) ok(`${initialCitationEdges.length} citation edges, all endpoints resolve`);

console.log("\nTime span");
const dates = [...initialPilots.map((p) => p.openedAt), ...initialProcurements.map((a) => a.date)].sort();
const months = (new Date(dates.at(-1)) - new Date(dates[0])) / (1000 * 60 * 60 * 24 * 30.44);
months >= 17 ? ok(`registry spans ${months.toFixed(1)} months (${dates[0]} → ${dates.at(-1)})`) : fail(`only ${months.toFixed(1)} months of history`);

console.log(failures === 0 ? "\nSeed registry verified.\n" : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
