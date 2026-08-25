import { sha256Hex } from "./sha256.js";

/**
 * A metric lock is the commitment Precedent makes on behalf of a department:
 * these criteria, these thresholds, fixed at this timestamp, BEFORE the pilot
 * opened for applications. The hash is what makes the commitment checkable —
 * a verifier who later moves a threshold produces a different digest.
 *
 * The serialised form below is the canonical pre-image. It is stored alongside
 * the hash on every pilot so that anyone — a judge, an auditor, CAG — can run
 *
 *   printf '%s' "<serialised>" | shasum -a 256
 *
 * and get the same 64 hex characters the certificate prints.
 */
export const METRIC_LOCK_SPEC = "PRECEDENT/METRIC-LOCK/v1";

/** Canonical pre-image. Criteria are sorted by id so key order can never change the digest. */
export function serialiseMetricLock({ pilotId, sector, department, lockedAt, criteria }) {
  const lines = [
    METRIC_LOCK_SPEC,
    `pilot:${pilotId}`,
    `sector:${sector}`,
    `department:${department}`,
    `lockedAt:${lockedAt}`,
    "criteria:"
  ];
  [...criteria]
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((c) => lines.push(`${c.id}|${c.metric}|${c.operator}|${c.threshold}|${c.unit}`));
  return lines.join("\n");
}

/** Build a complete, self-verifying metric lock. */
export function buildMetricLock(input) {
  const serialised = serialiseMetricLock(input);
  return {
    ...input,
    algorithm: "SHA-256",
    spec: METRIC_LOCK_SPEC,
    serialised,
    hash: sha256Hex(serialised)
  };
}

/** True when a lock's stored hash still matches its stored criteria. */
export function verifyMetricLock(lock) {
  return !!lock && lock.hash === sha256Hex(serialiseMetricLock(lock));
}

const COMPARATORS = {
  ">=": (a, b) => a >= b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  "<": (a, b) => a < b,
  "==": (a, b) => a === b
};

/** Score an achieved value against a locked criterion. */
export function evaluateCriterion(criterion, achieved) {
  const compare = COMPARATORS[criterion.operator];
  return {
    criterionId: criterion.id,
    label: criterion.label,
    metric: criterion.metric,
    operator: criterion.operator,
    threshold: criterion.threshold,
    unit: criterion.unit,
    achieved,
    passed: compare ? compare(achieved, criterion.threshold) : false
  };
}

/** Human-readable requirement, e.g. "≥ 15 %". */
export function formatRequirement(criterion) {
  const symbol = { ">=": "≥", "<=": "≤", ">": ">", "<": "<", "==": "=" }[criterion.operator] || criterion.operator;
  return `${symbol} ${criterion.threshold}${criterion.unit ? ` ${criterion.unit}` : ""}`;
}
