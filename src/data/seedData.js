import { buildMetricLock, evaluateCriterion } from "../lib/metricLock.js";

/* ============================================================================
   PRECEDENT — SEED REGISTRY
   ----------------------------------------------------------------------------
   Every metric-lock hash in this file is a real SHA-256 digest, computed at
   module load from the serialised criteria (see src/lib/metricLock.js). Nothing
   here is a hand-typed placeholder. Run `npm run verify:seed` to re-check every
   digest against Node's crypto and to assert the registry's invariants.

   Pass/fail on every certificate is COMPUTED from the locked threshold against
   the achieved value — it is never asserted by hand, so a certificate cannot
   contradict its own metric lock.
   ========================================================================== */

/* ---------------------------------------------------------------- reference */

export const SECTORS = [
  "Water & Sanitation",
  "Energy & Cleantech",
  "Urban Mobility",
  "Agriculture & Rural",
  "Healthcare & Medtech",
  "Education & Skilling"
];

export const TIERS = [
  { level: 0, name: "Registered", blurb: "DPIIT-recognised, on the registry, no pilot yet." },
  { level: 1, name: "Piloted", blurb: "A department has run a pilot. Outcome not yet certified." },
  { level: 2, name: "Certified", blurb: "An independent verifier certified the outcome against pre-locked thresholds." },
  { level: 3, name: "Precedent", blurb: "Two or more departments have procured by citing the certificate." },
  { level: 4, name: "Standard", blurb: "5+ departments across 2+ states. Eligible for a GeM rate contract." }
];

export const DEPARTMENTS = {
  PMC:   { name: "Pune Municipal Corporation", state: "Maharashtra" },
  NMC:   { name: "Nagpur Municipal Corporation", state: "Maharashtra" },
  PCMC:  { name: "Pimpri-Chinchwad Municipal Corporation", state: "Maharashtra" },
  MWSSD: { name: "Maharashtra Water Supply & Sanitation Dept", state: "Maharashtra" },
  MSEDCL:{ name: "MSEDCL", state: "Maharashtra" },
  ZPS:   { name: "Zilla Parishad Solapur", state: "Maharashtra" },
  ZPA:   { name: "Zilla Parishad Ahmednagar", state: "Maharashtra" },
  TMC:   { name: "Thane Municipal Corporation", state: "Maharashtra" },
  MCGM:  { name: "Municipal Corporation of Greater Mumbai", state: "Maharashtra" },
  SMC:   { name: "Surat Municipal Corporation", state: "Gujarat" },
  IMC:   { name: "Indore Municipal Corporation", state: "Madhya Pradesh" }
};

/* The metric vocabulary a threshold can be locked against. Kept small on purpose:
   an officer comparing two certificates must be comparing the same quantity.   */
export const METRICS = {
  nrw_reduction_pct:            { label: "Non-revenue water reduced", unit: "%" },
  leak_detection_latency_hrs:   { label: "Leak detection latency", unit: "hrs" },
  cost_per_mld_saved_inr:       { label: "Cost per MLD saved", unit: "₹" },
  distribution_loss_pct:        { label: "Distribution loss reduced", unit: "%" },
  grievance_resolution_days:    { label: "Grievance resolution time", unit: "days" },
  energy_savings_pct:           { label: "Energy consumption reduced", unit: "%" },
  pilot_duration_days:          { label: "Pilot execution period", unit: "days" },
  safety_incidents:             { label: "Reportable safety incidents", unit: "incidents" },
  grid_disturbances:            { label: "Grid disturbance events", unit: "events" },
  night_safety_complaints:      { label: "Night-safety complaints", unit: "complaints" },
  uptime_pct:                   { label: "Device uptime", unit: "%" },
  advisory_uptake_pct:          { label: "Farmer advisory uptake", unit: "%" },
  cold_chain_excursion_pct:     { label: "Cold-chain temperature excursions", unit: "%" },
  screening_sensitivity_pct:    { label: "Screening sensitivity", unit: "%" },
  eta_accuracy_pct:             { label: "Live ETA accuracy", unit: "%" },
  numeracy_gain_pct:            { label: "Numeracy proficiency gain", unit: "%" },
  junction_delay_pct:           { label: "Average junction delay reduced", unit: "%" },
  solar_yield_variance_pct:     { label: "Yield variance against guarantee", unit: "%" }
};

/** Shorthand for a locked criterion. Label and unit come from the metric vocabulary. */
function c(id, metric, operator, threshold) {
  const m = METRICS[metric];
  if (!m) throw new Error(`Unknown metric: ${metric}`);
  return { id, metric, operator, threshold, unit: m.unit, label: m.label };
}

/* ------------------------------------------------------------------- people */

export const initialUsers = {
  ram: {
    id: "ram",
    name: "Ram",
    email: "ram@aquasense.io",
    role: "Startup",
    startupName: "AquaSense Technologies",
    dpiitNo: "DPIIT98372",
    sector: "Water & Sanitation",
    status: "Verified",
    passportScore: 88,
    details: "Specializes in acoustic and IoT-based water leak detection and pressure sensors."
  },
  arjun: {
    id: "arjun",
    name: "Arjun",
    email: "arjun@pune.gov.in",
    role: "Government Official",
    department: "Pune Municipal Corporation",
    designation: "Superintending Engineer",
    employeeId: "PMC-38291",
    status: "Approved"
  },
  meera: {
    id: "meera",
    name: "Meera",
    email: "meera@nagpur.gov.in",
    role: "Government Official",
    department: "Nagpur Municipal Corporation",
    designation: "Additional Commissioner",
    employeeId: "NMC-98721",
    status: "Approved"
  },
  kavita: {
    id: "kavita",
    name: "Dr. Kavita Rao",
    email: "kavita.rao@twiab.org",
    role: "Verifier",
    organization: "Technical Water Infrastructure Audit Board",
    empanelmentId: "EMP/MH/WTR/2024/0113",
    sector: "Water & Sanitation"
  },
  admin: {
    id: "admin",
    name: "MSInS Admin",
    email: "admin@msins.in",
    role: "Admin",
    department: "Maharashtra State Innovation Society",
    designation: "Nodal Director"
  },

  /* Officers who sponsor pilots and cite certificates elsewhere in the registry.
     They are addressable records (the audit-defence file names them) but are not
     added to the one-click role switcher, which stays at the five demo personas. */
  off_pcmc:   { id: "off_pcmc", name: "Sunil Deshmukh", email: "sunil.d@pcmc.gov.in", role: "Government Official", department: "Pimpri-Chinchwad Municipal Corporation", designation: "Executive Engineer (Water Supply)", employeeId: "PCMC-44120", status: "Approved" },
  off_mwssd:  { id: "off_mwssd", name: "Anjali Bhosale", email: "anjali.b@mwssd.gov.in", role: "Government Official", department: "Maharashtra Water Supply & Sanitation Dept", designation: "Deputy Secretary", employeeId: "MWSSD-20114", status: "Approved" },
  off_msedcl: { id: "off_msedcl", name: "Prakash Jadhav", email: "prakash.j@msedcl.in", role: "Government Official", department: "MSEDCL", designation: "Chief Engineer (Distribution)", employeeId: "MSEDCL-70233", status: "Approved" },
  off_zps:    { id: "off_zps", name: "Vaishali Kamble", email: "ceo@zpsolapur.gov.in", role: "Government Official", department: "Zilla Parishad Solapur", designation: "Chief Executive Officer", employeeId: "ZPS-11002", status: "Approved" },
  off_zpa:    { id: "off_zpa", name: "Ravi Kulkarni", email: "ceo@zpahmednagar.gov.in", role: "Government Official", department: "Zilla Parishad Ahmednagar", designation: "Chief Executive Officer", employeeId: "ZPA-30877", status: "Approved" },
  off_tmc:    { id: "off_tmc", name: "Sanjay Patil", email: "sanjay.patil@thane.gov.in", role: "Government Official", department: "Thane Municipal Corporation", designation: "Executive Engineer", employeeId: "TMC-77612", status: "Approved" },
  off_mcgm:   { id: "off_mcgm", name: "Rajesh Kumar", email: "rajesh.k@mcgm.gov.in", role: "Government Official", department: "Municipal Corporation of Greater Mumbai", designation: "General Manager (Projects)", employeeId: "MCGM-88711", status: "Approved" },
  off_smc:    { id: "off_smc", name: "Hetal Vyas", email: "hetal.vyas@suratmunicipal.gov.in", role: "Government Official", department: "Surat Municipal Corporation", designation: "Additional City Engineer", employeeId: "SMC-GJ-3391", status: "Approved" },
  off_imc:    { id: "off_imc", name: "Devendra Chouhan", email: "d.chouhan@imcindore.gov.in", role: "Government Official", department: "Indore Municipal Corporation", designation: "Superintending Engineer", employeeId: "IMC-MP-5520", status: "Approved" }
};

/* --------------------------------------------------------------- verifiers */
/* Empanelled independent evaluators. A pilot's verifier is drawn at random from
   the pool matching its sector; the draw is recorded on the certificate so the
   officer can show an auditor that they did not pick their own assessor.       */

export const initialVerifiers = [
  { id: "kavita", name: "Dr. Kavita Rao",       empanelmentId: "EMP/MH/WTR/2024/0113", sector: "Water & Sanitation",   state: "Maharashtra",    organization: "Technical Water Infrastructure Audit Board", empanelledOn: "2024-06-11", auditsCompleted: 4 },
  { id: "v_sen", name: "Prof. Amit Sen",        empanelmentId: "EMP/WB/ENR/2024/0207", sector: "Energy & Cleantech",   state: "West Bengal",    organization: "Jadavpur University — Power Systems Lab",     empanelledOn: "2024-08-02", auditsCompleted: 2 },
  { id: "v_neelam", name: "Dr. Neelam Kulkarni", empanelmentId: "EMP/MH/WTR/2023/0088", sector: "Water & Sanitation",  state: "Maharashtra",    organization: "VJTI — Centre for Urban Water Systems",       empanelledOn: "2023-11-19", auditsCompleted: 3 },
  { id: "v_raman", name: "Prof. S. Ramanathan", empanelmentId: "EMP/TN/ENR/2024/0341", sector: "Energy & Cleantech",   state: "Tamil Nadu",     organization: "Anna University — Energy Institute",          empanelledOn: "2024-09-27", auditsCompleted: 2 },
  { id: "v_farida", name: "Dr. Farida Sheikh",  empanelmentId: "EMP/MH/HLT/2025/0019", sector: "Healthcare & Medtech", state: "Maharashtra",    organization: "Maharashtra Medical Devices Audit Cell",      empanelledOn: "2025-01-30", auditsCompleted: 1 },
  { id: "v_ganesh", name: "Prof. Ganesh Iyer",  empanelmentId: "EMP/KA/MOB/2024/0455", sector: "Urban Mobility",       state: "Karnataka",      organization: "IISc — Transportation Systems Group",         empanelledOn: "2024-10-14", auditsCompleted: 1 },
  { id: "v_meena", name: "Dr. Meenakshi Nair",  empanelmentId: "EMP/KL/AGR/2023/0162", sector: "Agriculture & Rural",  state: "Kerala",         organization: "Kerala Agricultural University",              empanelledOn: "2023-07-22", auditsCompleted: 2 },
  { id: "v_rajeev", name: "Prof. Rajeev Bhatt", empanelmentId: "EMP/GJ/EDU/2025/0074", sector: "Education & Skilling", state: "Gujarat",        organization: "IIM Ahmedabad — Ed Systems Cell",             empanelledOn: "2025-02-17", auditsCompleted: 1 },
  { id: "v_anup", name: "Dr. Anup Chatterjee",  empanelmentId: "EMP/MP/WTR/2024/0290", sector: "Water & Sanitation",   state: "Madhya Pradesh", organization: "MANIT Bhopal — Water Resources Dept",         empanelledOn: "2024-05-08", auditsCompleted: 2 },
  { id: "v_leena", name: "Prof. Leena D'Souza", empanelmentId: "EMP/MH/MOB/2025/0136", sector: "Urban Mobility",       state: "Maharashtra",    organization: "COEP Technological University",               empanelledOn: "2025-03-25", auditsCompleted: 1 }
];

const verifierById = Object.fromEntries(initialVerifiers.map((v) => [v.id, v]));

/* --------------------------------------------------------------- solutions */
/* A solution is what actually climbs the tier ladder. Pilots attach to it,
   certificates attach to pilots, citations attach to certificates. `tier` is
   derived at the bottom of this file from that evidence — never hand-set.     */

export const initialSolutions = [
  {
    id: "sol-aquasense-leak",
    name: "Acoustic Leak Telemetry Grid",
    startupId: "ram",
    startupName: "AquaSense Technologies",
    dpiitNo: "DPIIT98372",
    sector: "Water & Sanitation",
    hqState: "Maharashtra",
    registeredOn: "2025-01-18",
    oneLiner: "Clamp-on acoustic sensors that locate trunk-main leaks within hours instead of billing cycles.",
    description: "Battery-powered acoustic correlators clamp onto existing trunk mains and stream to a district dashboard. Correlation across sensor pairs localises a leak to within eight metres without excavation or supply interruption."
  },
  {
    id: "sol-varunet-pressure",
    name: "District Metered Area Pressure Optimiser",
    startupId: "st_varunet",
    startupName: "VaruNet Hydro",
    dpiitNo: "DPIIT41207",
    sector: "Water & Sanitation",
    hqState: "Maharashtra",
    registeredOn: "2025-02-26",
    oneLiner: "Closed-loop pressure management that cuts background leakage without new pipe.",
    description: "Motorised pressure-reducing valves driven by demand forecasts, holding district pressure at the minimum that still meets the tail-end service standard."
  },
  {
    id: "sol-hydroloop-greywater",
    name: "Modular Greywater Recycling Units",
    startupId: "st_hydroloop",
    startupName: "HydroLoop Systems",
    dpiitNo: "DPIIT55831",
    sector: "Water & Sanitation",
    hqState: "Maharashtra",
    registeredOn: "2025-05-09",
    oneLiner: "Skid-mounted greywater treatment for gardens and commercial complexes, metered end to end.",
    description: "Containerised membrane bioreactor units with sensor-tracked inflow and reuse metering, sized for ward-level parks and municipal building clusters."
  },
  {
    id: "sol-nirmalflow-quality",
    name: "AI Water Quality Telemetry",
    startupId: "st_nirmalflow",
    startupName: "NirmalFlow Labs",
    dpiitNo: "DPIIT62194",
    sector: "Water & Sanitation",
    hqState: "Maharashtra",
    registeredOn: "2025-11-03",
    oneLiner: "Continuous pH, turbidity and residual-chlorine telemetry on school and public reservoirs.",
    description: "Multi-parameter probes with edge anomaly detection, escalating contamination events to the ward engineer before the next manual sampling round."
  },
  {
    id: "sol-clearwell-billing",
    name: "NRW Billing Reconciliation Engine",
    startupId: "st_clearwell",
    startupName: "ClearWell Analytics",
    dpiitNo: "DPIIT38470",
    sector: "Water & Sanitation",
    hqState: "Karnataka",
    registeredOn: "2025-03-14",
    oneLiner: "Meter-data reconciliation that separates commercial loss from physical loss on paper.",
    description: "Ingests consumer meter reads, bulk-flow meter reads and billing exports to attribute non-revenue water between under-billing, tampering and physical leakage."
  },
  {
    id: "sol-civicloop-grievance",
    name: "SwiftGrievance Routing",
    startupId: "st_civicloop",
    startupName: "CivicLoop Systems",
    dpiitNo: "DPIIT70933",
    sector: "Water & Sanitation",
    hqState: "Maharashtra",
    registeredOn: "2025-04-21",
    oneLiner: "Classifies and routes water-supply complaints to the crew that can actually close them.",
    description: "NLP triage over inbound complaint channels, auto-assigning to the correct ward crew with SLA timers and escalation to the section engineer."
  },
  {
    id: "sol-voltedge-dtloss",
    name: "GridSense DT Loss Analytics",
    startupId: "st_voltedge",
    startupName: "VoltEdge Analytics",
    dpiitNo: "DPIIT29118",
    sector: "Energy & Cleantech",
    hqState: "Maharashtra",
    registeredOn: "2025-02-05",
    oneLiner: "Transformer-level loss attribution that points a lineman at the exact feeder segment.",
    description: "Correlates distribution transformer meter data against downstream consumer reads to rank feeders by recoverable loss, with theft-signature detection."
  },
  {
    id: "sol-wattwise-dimming",
    name: "Adaptive Streetlight Dimming",
    startupId: "st_wattwise",
    startupName: "WattWise Municipal",
    dpiitNo: "DPIIT84025",
    sector: "Energy & Cleantech",
    hqState: "Telangana",
    registeredOn: "2025-06-30",
    oneLiner: "Occupancy-linked dimming of municipal street lighting on a central management system.",
    description: "Node-level dimming controllers on existing LED luminaires, stepping output down between low-occupancy hours on a schedule tuned per circuit."
  },
  {
    id: "sol-solarisgrid-yield",
    name: "Rooftop Solar Yield Assurance",
    startupId: "st_solarisgrid",
    startupName: "SolarisGrid",
    dpiitNo: "DPIIT47762",
    sector: "Energy & Cleantech",
    hqState: "Maharashtra",
    registeredOn: "2025-08-12",
    oneLiner: "Per-string monitoring that holds a rooftop EPC to its guaranteed generation curve.",
    description: "String-level generation telemetry benchmarked against irradiance, producing a monthly shortfall statement the department can invoke against the EPC contract."
  },
  {
    id: "sol-laneiq-signals",
    name: "LaneIQ Adaptive Signal Timing",
    startupId: "st_laneiq",
    startupName: "LaneIQ Mobility",
    dpiitNo: "DPIIT19604",
    sector: "Urban Mobility",
    hqState: "Maharashtra",
    registeredOn: "2025-07-07",
    oneLiner: "Camera-based adaptive signal control retrofitted to existing junction controllers.",
    description: "Vision-based queue estimation feeding a green-split optimiser, retrofitted onto installed controllers without replacing junction hardware."
  },
  {
    id: "sol-transitpulse-eta",
    name: "TransitPulse Fleet Telematics",
    startupId: "st_transitpulse",
    startupName: "TransitPulse",
    dpiitNo: "DPIIT52380",
    sector: "Urban Mobility",
    hqState: "Maharashtra",
    registeredOn: "2025-12-15",
    oneLiner: "Live bus ETAs at the stop, computed from on-board telematics rather than schedules.",
    description: "On-board GNSS telematics with dwell-time modelling, publishing arrival predictions to stop displays and a public feed."
  },
  {
    id: "sol-krishisense-soil",
    name: "KrishiSense Soil Moisture Network",
    startupId: "st_krishisense",
    startupName: "KrishiSense",
    dpiitNo: "DPIIT66512",
    sector: "Agriculture & Rural",
    hqState: "Maharashtra",
    registeredOn: "2025-04-02",
    oneLiner: "Block-level soil moisture sensing paired with a village extension officer's advisory round.",
    description: "Capacitive soil probes at block scale feeding irrigation advisories, delivered through the existing extension officer rather than direct-to-farmer messaging."
  },
  {
    id: "sol-agriyield-sms",
    name: "AgriYield SMS Crop Advisory",
    startupId: "st_agriyield",
    startupName: "AgriYield Analytics",
    dpiitNo: "DPIIT73845",
    sector: "Agriculture & Rural",
    hqState: "Madhya Pradesh",
    registeredOn: "2025-01-29",
    oneLiner: "Weather-linked crop advisory pushed to registered farmers by SMS.",
    description: "Rule-based advisory generation from block-level weather and crop-calendar data, delivered as one-way vernacular SMS to a registered farmer list."
  },
  {
    id: "sol-meditrack-coldchain",
    name: "MediTrack Cold Chain Monitoring",
    startupId: "st_meditrack",
    startupName: "MediTrack Rural",
    dpiitNo: "DPIIT31099",
    sector: "Healthcare & Medtech",
    hqState: "Maharashtra",
    registeredOn: "2025-03-31",
    oneLiner: "Continuous vaccine cold-chain telemetry across primary health centre networks.",
    description: "Battery-backed temperature loggers inside ILR units with GSM escalation, tracking excursion minutes per centre against national cold-chain norms."
  },
  {
    id: "sol-diagnoai-tb",
    name: "DiagnoAI TB Screening",
    startupId: "st_diagnoai",
    startupName: "DiagnoAI",
    dpiitNo: "DPIIT90761",
    sector: "Healthcare & Medtech",
    hqState: "Karnataka",
    registeredOn: "2026-05-27",
    oneLiner: "Chest X-ray triage for tuberculosis at dispensary level, CDSCO Class B registered.",
    description: "Screening model that flags presumptive TB from digital chest radiographs, ordering the radiologist queue by likelihood rather than arrival time."
  },
  {
    id: "sol-learnbridge-numeracy",
    name: "LearnBridge Numeracy Remediation",
    startupId: "st_learnbridge",
    startupName: "LearnBridge",
    dpiitNo: "DPIIT27430",
    sector: "Education & Skilling",
    hqState: "Maharashtra",
    registeredOn: "2025-06-16",
    oneLiner: "Adaptive numeracy practice for grades 3-5, run on the school's existing tablet pool.",
    description: "Offline-first adaptive practice sequenced against the state numeracy framework, with a teacher dashboard of class-level gap analysis."
  },
  {
    id: "sol-aquavend-atm",
    name: "AquaVend Community Water ATMs",
    startupId: "st_aquavend",
    startupName: "AquaVend",
    dpiitNo: "DPIIT58123",
    sector: "Water & Sanitation",
    hqState: "Rajasthan",
    registeredOn: "2026-06-08",
    oneLiner: "Card-operated potable water dispensers with per-litre consumption telemetry.",
    description: "Solar-assisted RO dispensing kiosks with prepaid card access and remote water-quality reporting, sized for peri-urban settlements."
  }
];

/* ------------------------------------------------------------------- pilots */

const solutionById = Object.fromEntries(initialSolutions.map((s) => [s.id, s]));

/** Render a measured value the way an officer would read it: 22%, ₹31,800, 3.4 hrs. */
export function formatValue(value, unit) {
  if (unit === "%") return `${value}%`;
  if (unit === "₹") return `₹${Number(value).toLocaleString("en-IN")}`;
  return `${value} ${unit}`;
}

const PILOT_STATUS = ["Open", "Applied", "Running", "Completed", "Certified", "Negative Precedent", "Rejected"];

/**
 * Assemble a pilot record.
 *
 * The important part is what this function refuses to let you hand-write:
 * the metric-lock hash is computed from the criteria, and every pass/fail is
 * computed by comparing the measured value to the locked threshold. A seeded
 * certificate therefore cannot claim a PASS the thresholds do not support.
 */
function makePilot(def) {
  const {
    id, solutionId, title, deptKey, officialId, budgetCap, durationDays,
    sector, description, status, openedAt, lockedAt, criteria,
    headlineCriterion, application, evidence, verification
  } = def;

  if (!PILOT_STATUS.includes(status)) throw new Error(`${id}: bad status ${status}`);
  const dept = DEPARTMENTS[deptKey];
  const officer = initialUsers[officialId];
  const solution = solutionId ? solutionById[solutionId] : null;
  if (!dept || !officer) throw new Error(`${id}: unknown department or officer`);

  const metricLock = buildMetricLock({
    pilotId: id,
    sector,
    department: dept.name,
    lockedAt,
    criteria
  });

  let fullApplication = null;
  if (application && solution) {
    fullApplication = {
      startupId: solution.startupId,
      startupName: solution.startupName,
      solutionId: solution.id,
      solutionName: solution.name,
      dpiitNo: solution.dpiitNo,
      ...application
    };
  }

  let fullEvidence = null;
  let fullVerification = null;

  if (evidence) {
    const measuredDays = evidence.measured?.duration ?? durationDays;
    const headline = criteria.find((k) => k.id === headlineCriterion) || criteria[0];
    const headlineValue = evidence.measured?.[headline.id];
    fullEvidence = {
      headlineMetric: `${formatValue(headlineValue, headline.unit)} — ${headline.label.toLowerCase()}`,
      duration: `${measuredDays} days`,
      assetsDeployed: evidence.assetsDeployed,
      summary: evidence.summary,
      docs: evidence.docs,
      submittedAt: evidence.submittedAt,
      sponsorFeedback: evidence.sponsorFeedback || null,
      measured: evidence.measured
    };
  }

  if (verification) {
    const v = verifierById[verification.verifierId];
    if (!v) throw new Error(`${id}: unknown verifier ${verification.verifierId}`);
    const results = criteria.map((k) => evaluateCriterion(k, evidence.measured[k.id]));
    const passed = results.every((r) => r.passed);
    const outcome = passed ? "PASS" : "FAIL";

    if (passed && status !== "Certified") throw new Error(`${id}: all criteria met but status is ${status}`);
    if (!passed && status !== "Negative Precedent") throw new Error(`${id}: criteria missed but status is ${status}`);

    fullVerification = {
      certificateId: verification.certificateId,
      certificateType: passed ? "positive" : "negative",
      outcome,
      verifierId: v.id,
      verifierName: v.name,
      verifierEmpanelmentId: v.empanelmentId,
      verifierOrganization: v.organization,
      verifierState: v.state,
      assignment: {
        method: "Random draw from the empanelled pool for this sector",
        drawnOn: verification.drawnOn,
        poolSize: verification.poolSize,
        note: "Sponsoring department had no role in selecting the verifier."
      },
      score: verification.score,
      results,
      // Legacy shape kept so existing checklist rendering keeps working.
      scorecard: results.map((r) => ({
        criterion: `${r.label} ${{ ">=": "≥", "<=": "≤", ">": ">", "<": "<", "==": "=" }[r.operator]} ${formatValue(r.threshold, r.unit)}`,
        passed: r.passed
      })),
      notes: verification.notes,
      lesson: verification.lesson || null,
      citesCertificates: verification.citesCertificates || [],
      certifiedAt: verification.certifiedAt,
      verificationUrl: `https://precedent-prototype.vercel.app/certificate/${verification.certificateId}`
    };
  }

  return {
    id,
    title,
    solutionId: solutionId || null,
    department: dept.name,
    departmentState: dept.state,
    sponsoringOfficialId: officer.id,
    sponsoringOfficialName: officer.name,
    sponsoringOfficialDesignation: officer.designation,
    sponsoringOfficialEmployeeId: officer.employeeId,
    budgetCap,
    durationDays,
    sector,
    description,
    status,
    openedAt,
    metricLock,
    application: fullApplication,
    evidence: fullEvidence,
    verification: fullVerification
  };
}

export const initialPilots = [
  /* ---- WATER & SANITATION ------------------------------------------------ */

  makePilot({
    id: "pl-pmc-w12-leak",
    solutionId: "sol-aquasense-leak",
    title: "Acoustic Leak Telemetry — Pune Ward 12",
    deptKey: "PMC",
    officialId: "arjun",
    budgetCap: 800000,
    durationDays: 90,
    sector: "Water & Sanitation",
    description: "Deploy acoustic and IoT flow sensors across Pune Ward 12 water main lines to detect and isolate micro-leakages causing non-revenue water loss.",
    status: "Certified",
    openedAt: "2025-03-10",
    lockedAt: "2025-03-10T11:05:00+05:30",
    criteria: [
      c("nrw_reduction", "nrw_reduction_pct", ">=", 15),
      c("leak_latency", "leak_detection_latency_hrs", "<=", 6),
      c("duration", "pilot_duration_days", ">=", 60),
      c("safety", "safety_incidents", "==", 0)
    ],
    headlineCriterion: "nrw_reduction",
    application: {
      proposedCost: 750000,
      proposedScope: "Deploy 25 clamp-on acoustic correlators along the Ward 12 trunk main, streaming continuous telemetry for 90 days with weekly leak-localisation reports to the section engineer.",
      appliedAt: "2025-03-24"
    },
    evidence: {
      assetsDeployed: "25 acoustic correlators, 4 bulk flow meters",
      summary: "Identified 14 micro-leaks and 3 major pipe fractures. Ward 12 non-revenue water fell from 35% to 13% over the audited period, cross-checked against SCADA bulk-flow records.",
      docs: "Water_Audit_Report_Pune_Ward12.pdf",
      submittedAt: "2025-07-05",
      sponsorFeedback: "Deployment caused no supply interruption. Crew response times to flagged leaks improved materially once localisation reports replaced complaint-driven digging.",
      measured: { nrw_reduction: 22, leak_latency: 3.4, duration: 90, safety: 0 }
    },
    verification: {
      certificateId: "PC-2025-WTR-0007",
      verifierId: "kavita",
      drawnOn: "2025-07-08",
      poolSize: 4,
      score: 95,
      notes: "Outcome evidence is thoroughly documented and cross-verified against SCADA bulk-flow telemetry. The 22% reduction is sustained across the final six weeks rather than a commissioning spike. Design is highly replicable on comparable trunk-main geometry.",
      certifiedAt: "2025-07-18"
    }
  }),

  makePilot({
    id: "pl-pcmc-dma-pressure",
    solutionId: "sol-varunet-pressure",
    title: "District Metered Area Pressure Optimisation — Pimpri-Chinchwad",
    deptKey: "PCMC",
    officialId: "off_pcmc",
    budgetCap: 1200000,
    durationDays: 120,
    sector: "Water & Sanitation",
    description: "Install motorised pressure-reducing valves across four district metered areas to cut background leakage without replacing distribution mains.",
    status: "Certified",
    openedAt: "2025-06-02",
    lockedAt: "2025-06-02T09:40:00+05:30",
    criteria: [
      c("nrw_reduction", "nrw_reduction_pct", ">=", 12),
      c("cost_per_mld", "cost_per_mld_saved_inr", "<=", 42000),
      c("duration", "pilot_duration_days", ">=", 90)
    ],
    headlineCriterion: "nrw_reduction",
    application: {
      proposedCost: 1150000,
      proposedScope: "Four DMAs, motorised PRVs with demand-forecast control, tail-end pressure loggers to prove the service standard is still met at minimum head.",
      appliedAt: "2025-06-19"
    },
    evidence: {
      assetsDeployed: "4 motorised PRVs, 22 pressure loggers",
      summary: "Average district pressure held 1.8 bar lower at night while tail-end service pressure stayed above the 7 m standard. Background leakage fell 17.5% against the pre-intervention baseline.",
      docs: "PCMC_DMA_Pressure_Report_2025.pdf",
      submittedAt: "2025-10-28",
      sponsorFeedback: "No increase in tail-end complaints during the pilot. Valve maintenance load is within the existing ward crew's capacity.",
      measured: { nrw_reduction: 17.5, cost_per_mld: 31800, duration: 120 }
    },
    verification: {
      certificateId: "PC-2025-WTR-0011",
      verifierId: "v_neelam",
      drawnOn: "2025-11-01",
      poolSize: 4,
      score: 89,
      notes: "Pressure management results are consistent with the AquaSense Ward 12 precedent on the physical-loss share of NRW. Cost per MLD saved is well inside the locked ceiling. Tail-end compliance was independently spot-checked at 9 locations.",
      citesCertificates: ["PC-2025-WTR-0007"],
      certifiedAt: "2025-11-14"
    }
  }),

  makePilot({
    id: "pl-mwssd-nrw-grid",
    solutionId: "sol-aquasense-leak",
    title: "Non-Revenue Water Audit Grid — Solapur Rural Feeder",
    deptKey: "MWSSD",
    officialId: "off_mwssd",
    budgetCap: 1800000,
    durationDays: 150,
    sector: "Water & Sanitation",
    description: "Extend acoustic leak telemetry to a rural bulk-transmission feeder serving 41 villages, where leak discovery currently depends on visible surface flow.",
    status: "Certified",
    openedAt: "2025-09-15",
    lockedAt: "2025-09-15T15:20:00+05:30",
    criteria: [
      c("nrw_reduction", "nrw_reduction_pct", ">=", 14),
      c("leak_latency", "leak_detection_latency_hrs", "<=", 8),
      c("duration", "pilot_duration_days", ">=", 120),
      c("safety", "safety_incidents", "==", 0)
    ],
    headlineCriterion: "nrw_reduction",
    application: {
      proposedCost: 1740000,
      proposedScope: "38 correlators across 64 km of rural transmission main, with a village-level leak escalation SMS loop to the local operator.",
      appliedAt: "2025-09-29"
    },
    evidence: {
      assetsDeployed: "38 acoustic correlators, 6 bulk flow meters",
      summary: "Located 27 leaks on a transmission main previously audited only by visual inspection. Feeder non-revenue water fell from 41% to 22.4% across 150 days.",
      docs: "MWSSD_Solapur_Feeder_NRW_Audit.pdf",
      submittedAt: "2026-02-05",
      sponsorFeedback: "Rural deployment held up through the monsoon. Two sensors were lost to cable theft and replaced under warranty within the pilot window.",
      measured: { nrw_reduction: 18.6, leak_latency: 5.1, duration: 150, safety: 0 }
    },
    verification: {
      certificateId: "PC-2026-WTR-0024",
      verifierId: "v_anup",
      drawnOn: "2026-02-09",
      poolSize: 4,
      score: 91,
      notes: "Replicates the Ward 12 result on rural transmission geometry, which was the open question left by that certificate. Detection latency is higher than the urban precedent but comfortably inside the locked ceiling for this pilot.",
      citesCertificates: ["PC-2025-WTR-0007"],
      certifiedAt: "2026-02-20"
    }
  }),

  makePilot({
    id: "pl-tmc-nrw-billing",
    solutionId: "sol-clearwell-billing",
    title: "NRW Billing Reconciliation — Thane Zone 3",
    deptKey: "TMC",
    officialId: "off_tmc",
    budgetCap: 950000,
    durationDays: 90,
    sector: "Water & Sanitation",
    description: "Attribute Zone 3 non-revenue water between commercial loss and physical loss using consumer meter, bulk meter and billing data, without field instrumentation.",
    status: "Negative Precedent",
    openedAt: "2025-05-19",
    lockedAt: "2025-05-19T10:15:00+05:30",
    criteria: [
      c("nrw_reduction", "nrw_reduction_pct", ">=", 10),
      c("duration", "pilot_duration_days", ">=", 60),
      c("safety", "safety_incidents", "==", 0)
    ],
    headlineCriterion: "nrw_reduction",
    application: {
      proposedCost: 910000,
      proposedScope: "Ingest 90 days of consumer meter reads, bulk-flow reads and billing exports for Zone 3; produce a monthly loss-attribution statement and a recovery worklist.",
      appliedAt: "2025-06-01"
    },
    evidence: {
      assetsDeployed: "No field hardware — data integration only",
      summary: "Reconciliation ran cleanly and produced a credible attribution: 63% of Zone 3 loss is physical, not commercial. Recovery actions available from billing data alone moved measured NRW by 3.2 points against a locked threshold of 10.",
      docs: "TMC_Zone3_NRW_Reconciliation.pdf",
      submittedAt: "2025-09-12",
      sponsorFeedback: "The analysis was competent and the vendor delivered on time. The approach simply cannot move a loss that is mostly underground.",
      measured: { nrw_reduction: 3.2, duration: 90, safety: 0 }
    },
    verification: {
      certificateId: "NP-2025-WTR-0003",
      verifierId: "kavita",
      drawnOn: "2025-09-16",
      poolSize: 4,
      score: 42,
      notes: "The vendor executed the scope as proposed and the analytical output is sound. The pilot nonetheless missed its locked NRW threshold by a wide margin because the underlying loss in Zone 3 is predominantly physical.",
      lesson: "Meter-data reconciliation alone does not reduce non-revenue water where the majority of loss is physical. Departments whose trunk mains are unmetered should pair this with field leak detection, or not procure it in isolation. Zone 3 spent ₹9.1 lakh to learn this; the next department does not have to.",
      certifiedAt: "2025-09-30"
    }
  }),

  makePilot({
    id: "pl-nmc-greywater",
    solutionId: "sol-hydroloop-greywater",
    title: "Modular Greywater Recycling — Nagpur Ward 5",
    deptKey: "NMC",
    officialId: "meera",
    budgetCap: 1000000,
    durationDays: 100,
    sector: "Water & Sanitation",
    description: "Install skid-mounted greywater treatment at three public gardens and one municipal building cluster, with metered reuse replacing tanker supply.",
    status: "Certified",
    openedAt: "2025-12-08",
    lockedAt: "2025-12-08T12:00:00+05:30",
    criteria: [
      c("nrw_reduction", "nrw_reduction_pct", ">=", 9),
      c("uptime", "uptime_pct", ">=", 92),
      c("duration", "pilot_duration_days", ">=", 90)
    ],
    headlineCriterion: "nrw_reduction",
    application: {
      proposedCost: 960000,
      proposedScope: "Four containerised MBR units with inflow and reuse metering, sized to displace garden tanker demand across Ward 5.",
      appliedAt: "2025-12-22"
    },
    evidence: {
      assetsDeployed: "4 containerised MBR units, 8 reuse meters",
      summary: "Displaced 11.3% of ward freshwater draw for non-potable use. Units ran at 94.6% availability with two membrane cleaning stops.",
      docs: "NMC_Ward5_Greywater_Outcome.pdf",
      submittedAt: "2026-03-28",
      sponsorFeedback: "Tanker trips to Ward 5 gardens dropped from 14 to 3 per week. Odour complaints during commissioning were resolved within a fortnight.",
      measured: { nrw_reduction: 11.3, uptime: 94.6, duration: 100 }
    },
    verification: {
      certificateId: "PC-2026-WTR-0031",
      verifierId: "v_neelam",
      drawnOn: "2026-03-31",
      poolSize: 4,
      score: 87,
      notes: "Reuse metering is end-to-end and auditable. Notably, the department scoped this pilot around physical reuse rather than paper reconciliation, explicitly citing the Thane negative precedent in its pilot note.",
      citesCertificates: ["PC-2025-WTR-0007", "NP-2025-WTR-0003"],
      certifiedAt: "2026-04-12"
    }
  }),

  makePilot({
    id: "pl-nmc-grievance",
    solutionId: "sol-civicloop-grievance",
    title: "Water Grievance Resolution Routing — Nagpur",
    deptKey: "NMC",
    officialId: "meera",
    budgetCap: 700000,
    durationDays: 75,
    sector: "Water & Sanitation",
    description: "Triage and auto-route inbound water-supply complaints to the ward crew that can close them, with SLA timers and escalation to the section engineer.",
    status: "Certified",
    openedAt: "2025-11-11",
    lockedAt: "2025-11-11T16:45:00+05:30",
    criteria: [
      c("resolution_time", "grievance_resolution_days", "<=", 4),
      c("duration", "pilot_duration_days", ">=", 60)
    ],
    headlineCriterion: "resolution_time",
    application: {
      proposedCost: 680000,
      proposedScope: "NLP triage across the helpline, WhatsApp and portal channels for all 10 Nagpur water zones, with crew-level SLA dashboards.",
      appliedAt: "2025-11-24"
    },
    evidence: {
      assetsDeployed: "10 zones onboarded, 3 complaint channels integrated",
      summary: "Median water-supply grievance closure fell from 7.9 days to 2.6 days. Misrouted complaints — previously 31% of volume — fell to 6%.",
      docs: "NMC_Grievance_Routing_Outcome.pdf",
      submittedAt: "2026-03-02",
      sponsorFeedback: "Section engineers now see an accurate queue. The escalation timer changed behaviour more than the routing itself did.",
      measured: { resolution_time: 2.6, duration: 75 }
    },
    verification: {
      certificateId: "PC-2026-WTR-0028",
      verifierId: "kavita",
      drawnOn: "2026-03-05",
      poolSize: 4,
      score: 88,
      notes: "Closure-time improvement is measured against the department's own pre-pilot ticket exports, not a vendor-supplied baseline. Sampled 200 closed tickets and confirmed genuine resolution rather than premature closure.",
      certifiedAt: "2026-03-18"
    }
  }),

  makePilot({
    id: "pl-mcgm-water-quality",
    solutionId: "sol-nirmalflow-quality",
    title: "AI Water Quality Telemetry — Mumbai School Reservoirs",
    deptKey: "MCGM",
    officialId: "off_mcgm",
    budgetCap: 1500000,
    durationDays: 120,
    sector: "Water & Sanitation",
    description: "Continuous real-time tracking of pH, turbidity and residual chlorine across public school drinking water reservoirs, escalating contamination events before the next manual sampling round.",
    status: "Running",
    openedAt: "2026-05-08",
    lockedAt: "2026-05-08T10:30:00+05:30",
    criteria: [
      c("uptime", "uptime_pct", ">=", 95),
      c("duration", "pilot_duration_days", ">=", 90),
      c("safety", "safety_incidents", "==", 0)
    ],
    headlineCriterion: "uptime",
    application: {
      proposedCost: 1460000,
      proposedScope: "60 multi-parameter probes across 60 school reservoirs in two wards, with edge anomaly detection and SMS escalation to the ward health officer.",
      appliedAt: "2026-05-21"
    }
  }),

  makePilot({
    id: "pl-zps-handpump",
    solutionId: "sol-aquasense-leak",
    title: "Rural Handpump Uptime Telemetry — Solapur Zilla Parishad",
    deptKey: "ZPS",
    officialId: "off_zps",
    budgetCap: 650000,
    durationDays: 90,
    sector: "Water & Sanitation",
    description: "Instrument 120 village handpumps with usage telemetry so that failures are detected from a drop in draw rather than from a village complaint.",
    status: "Completed",
    openedAt: "2026-04-14",
    lockedAt: "2026-04-14T09:15:00+05:30",
    criteria: [
      c("uptime", "uptime_pct", ">=", 90),
      c("leak_latency", "leak_detection_latency_hrs", "<=", 24),
      c("duration", "pilot_duration_days", ">=", 60)
    ],
    headlineCriterion: "uptime",
    application: {
      proposedCost: 615000,
      proposedScope: "120 handpump stroke-counters with weekly GSM upload and an automatic repair ticket when draw falls below threshold for 48 hours.",
      appliedAt: "2026-04-27"
    },
    evidence: {
      assetsDeployed: "120 stroke-counter telemetry units across 74 villages",
      summary: "Mean handpump downtime fell from 11 days to under 2. Fault-to-ticket latency averaged 19 hours against a manual baseline of 6 to 9 days.",
      docs: "ZPS_Handpump_Telemetry_Outcome.pdf",
      submittedAt: "2026-08-02",
      measured: { uptime: 93.8, leak_latency: 19, duration: 90 }
    }
  }),

  makePilot({
    id: "pl-pmc-greywater-gardens",
    solutionId: null,
    title: "Greywater Recycling for Public Gardens — Pune Ward 5",
    deptKey: "PMC",
    officialId: "arjun",
    budgetCap: 1000000,
    durationDays: 100,
    sector: "Water & Sanitation",
    description: "Implement localized smart filtration and sensor-tracked greywater recycling systems in Pune Ward 5 public gardens and commercial complexes.",
    status: "Open",
    openedAt: "2026-08-04",
    lockedAt: "2026-08-04T11:00:00+05:30",
    criteria: [
      c("nrw_reduction", "nrw_reduction_pct", ">=", 9),
      c("uptime", "uptime_pct", ">=", 92),
      c("duration", "pilot_duration_days", ">=", 90)
    ],
    headlineCriterion: "nrw_reduction"
  }),

  /* ---- ENERGY & CLEANTECH ------------------------------------------------ */

  makePilot({
    id: "pl-msedcl-dt-loss",
    solutionId: "sol-voltedge-dtloss",
    title: "Distribution Transformer Loss Analytics — MSEDCL Pune Circle",
    deptKey: "MSEDCL",
    officialId: "off_msedcl",
    budgetCap: 2000000,
    durationDays: 150,
    sector: "Energy & Cleantech",
    description: "Rank 400 distribution transformers by recoverable loss using DT meter and consumer read correlation, so that field crews are dispatched by evidence rather than by rotation.",
    status: "Certified",
    openedAt: "2025-04-28",
    lockedAt: "2025-04-28T14:10:00+05:30",
    criteria: [
      c("loss_reduction", "distribution_loss_pct", ">=", 8),
      c("duration", "pilot_duration_days", ">=", 90),
      c("grid_events", "grid_disturbances", "==", 0)
    ],
    headlineCriterion: "loss_reduction",
    application: {
      proposedCost: 1920000,
      proposedScope: "400 DTs in Pune Circle, monthly loss-attribution ranking, theft-signature flags routed to the vigilance cell.",
      appliedAt: "2025-05-12"
    },
    evidence: {
      assetsDeployed: "400 distribution transformers instrumented",
      summary: "Circle distribution loss fell 11.4 points over 150 days. 62 of 400 DTs accounted for 71% of recoverable loss; vigilance action on those alone delivered most of the gain.",
      docs: "MSEDCL_PuneCircle_DT_Loss_Audit.pdf",
      submittedAt: "2025-09-24",
      sponsorFeedback: "The ranking changed how the vigilance cell plans its week. No supply disturbance attributable to the pilot.",
      measured: { loss_reduction: 11.4, duration: 150, grid_events: 0 }
    },
    verification: {
      certificateId: "PC-2025-ENR-0009",
      verifierId: "v_sen",
      drawnOn: "2025-09-27",
      poolSize: 2,
      score: 92,
      notes: "Loss reduction is computed against audited energy input at the circle boundary, not against the vendor's own model. Sampled 40 DTs and reconciled against MSEDCL's billing system independently.",
      certifiedAt: "2025-10-08"
    }
  }),

  makePilot({
    id: "pl-pcmc-streetlight",
    solutionId: "sol-wattwise-dimming",
    title: "Adaptive Streetlight Dimming — PCMC Sector 12",
    deptKey: "PCMC",
    officialId: "off_pcmc",
    budgetCap: 1100000,
    durationDays: 120,
    sector: "Energy & Cleantech",
    description: "Occupancy-linked dimming of 1,800 municipal LED luminaires between low-traffic hours, on the existing central management system.",
    status: "Negative Precedent",
    openedAt: "2025-09-02",
    lockedAt: "2025-09-02T13:25:00+05:30",
    criteria: [
      c("energy_savings", "energy_savings_pct", ">=", 18),
      c("night_complaints", "night_safety_complaints", "<=", 5),
      c("duration", "pilot_duration_days", ">=", 90)
    ],
    headlineCriterion: "energy_savings",
    application: {
      proposedCost: 1060000,
      proposedScope: "1,800 node controllers across Sector 12, dimming to 50% between 23:00 and 05:00 with occupancy override.",
      appliedAt: "2025-09-16"
    },
    evidence: {
      assetsDeployed: "1,800 node dimming controllers",
      summary: "Measured energy saving of 9.1% against a locked threshold of 18%. Night-safety complaints from the sector rose from 5 to 31 over the pilot window, concentrated on the two arterial roads inside the dimming circuit.",
      docs: "PCMC_Sector12_Dimming_Outcome.pdf",
      submittedAt: "2026-01-09",
      sponsorFeedback: "Residential lanes were fine. The problem was that arterial and residential lighting share a circuit here, so the arterial stretch dimmed with everything else.",
      measured: { energy_savings: 9.1, night_complaints: 31, duration: 120 }
    },
    verification: {
      certificateId: "NP-2026-ENR-0005",
      verifierId: "v_raman",
      drawnOn: "2026-01-13",
      poolSize: 2,
      score: 38,
      notes: "Two locked criteria missed. The energy shortfall traces to luminaires already running at reduced driver output before the pilot, so the available headroom was roughly half what the proposal assumed.",
      lesson: "Adaptive dimming on circuits that mix arterial and residential lighting produced a six-fold rise in night-safety complaints, and delivered half the promised saving on luminaires already driver-dimmed. Departments should confirm circuit segregation and audit existing driver output BEFORE tendering. PCMC spent ₹10.6 lakh establishing this.",
      certifiedAt: "2026-01-28"
    }
  }),

  makePilot({
    id: "pl-mcgm-solar-yield",
    solutionId: "sol-solarisgrid-yield",
    title: "Rooftop Solar Yield Assurance — MCGM Municipal Schools",
    deptKey: "MCGM",
    officialId: "off_mcgm",
    budgetCap: 2200000,
    durationDays: 180,
    sector: "Energy & Cleantech",
    description: "String-level generation monitoring across 46 school rooftop plants, benchmarked against irradiance to hold the EPC contractor to its guaranteed yield.",
    status: "Certified",
    openedAt: "2025-11-20",
    lockedAt: "2025-11-20T10:50:00+05:30",
    criteria: [
      c("yield_variance", "solar_yield_variance_pct", "<=", 6),
      c("duration", "pilot_duration_days", ">=", 150),
      c("grid_events", "grid_disturbances", "==", 0)
    ],
    headlineCriterion: "yield_variance",
    application: {
      proposedCost: 2140000,
      proposedScope: "46 rooftop plants, string-level telemetry with pyranometer reference, monthly shortfall statements formatted for contractual invocation.",
      appliedAt: "2025-12-04"
    },
    evidence: {
      assetsDeployed: "46 rooftop plants, 312 strings monitored",
      summary: "Measured yield tracked the guarantee within 3.8% once soiling losses were separated. Recovered ₹41 lakh in contractual shortfall from the EPC across two quarters.",
      docs: "MCGM_School_Solar_Yield_Assurance.pdf",
      submittedAt: "2026-05-18",
      sponsorFeedback: "The monthly shortfall statement is the deliverable that mattered. It is the first time the department could argue yield with the EPC on evidence.",
      measured: { yield_variance: 3.8, duration: 180, grid_events: 0 }
    },
    verification: {
      certificateId: "PC-2026-ENR-0019",
      verifierId: "v_raman",
      drawnOn: "2026-05-21",
      poolSize: 2,
      score: 90,
      notes: "Irradiance reference instrumentation was independently calibrated. Shortfall computation method is documented well enough for a third party to reproduce it from raw telemetry, which is what makes it contractually usable.",
      citesCertificates: ["NP-2026-ENR-0005"],
      certifiedAt: "2026-05-30"
    }
  }),

  makePilot({
    id: "pl-nmc-feeder-audit",
    solutionId: "sol-voltedge-dtloss",
    title: "LT Feeder Energy Audit — Nagpur",
    deptKey: "NMC",
    officialId: "meera",
    budgetCap: 900000,
    durationDays: 90,
    sector: "Energy & Cleantech",
    description: "Extend transformer-level loss attribution to the low-tension feeder segments serving Nagpur's municipal pumping stations.",
    status: "Running",
    openedAt: "2026-06-15",
    lockedAt: "2026-06-15T11:35:00+05:30",
    criteria: [
      c("loss_reduction", "distribution_loss_pct", ">=", 7),
      c("duration", "pilot_duration_days", ">=", 60),
      c("grid_events", "grid_disturbances", "==", 0)
    ],
    headlineCriterion: "loss_reduction",
    application: {
      proposedCost: 870000,
      proposedScope: "72 LT feeder segments serving municipal pumping loads, with monthly recoverable-loss ranking.",
      appliedAt: "2026-06-29"
    }
  }),

  makePilot({
    id: "pl-msedcl-prepaid-meter",
    solutionId: null,
    title: "Prepaid Smart Meter Field Trial — MSEDCL Nagpur Urban",
    deptKey: "MSEDCL",
    officialId: "off_msedcl",
    budgetCap: 2400000,
    durationDays: 120,
    sector: "Energy & Cleantech",
    description: "Field trial of prepaid smart metering on 2,000 urban connections, measuring collection efficiency and disconnection-cycle cost against the postpaid baseline.",
    status: "Open",
    openedAt: "2026-08-14",
    lockedAt: "2026-08-14T09:00:00+05:30",
    criteria: [
      c("loss_reduction", "distribution_loss_pct", ">=", 6),
      c("duration", "pilot_duration_days", ">=", 90),
      c("grid_events", "grid_disturbances", "==", 0)
    ],
    headlineCriterion: "loss_reduction"
  }),

  /* ---- URBAN MOBILITY ---------------------------------------------------- */

  makePilot({
    id: "pl-pmc-signal-timing",
    solutionId: "sol-laneiq-signals",
    title: "Adaptive Signal Timing — Pune JM Road Corridor",
    deptKey: "PMC",
    officialId: "arjun",
    budgetCap: 1600000,
    durationDays: 120,
    sector: "Urban Mobility",
    description: "Retrofit vision-based adaptive green-split control onto nine existing junction controllers along the JM Road corridor.",
    status: "Certified",
    openedAt: "2025-08-25",
    lockedAt: "2025-08-25T15:00:00+05:30",
    criteria: [
      c("delay_reduction", "junction_delay_pct", ">=", 15),
      c("duration", "pilot_duration_days", ">=", 90),
      c("safety", "safety_incidents", "==", 0)
    ],
    headlineCriterion: "delay_reduction",
    application: {
      proposedCost: 1540000,
      proposedScope: "Nine junctions, camera-based queue estimation feeding the installed controllers, with before/after floating-car delay surveys.",
      appliedAt: "2025-09-08"
    },
    evidence: {
      assetsDeployed: "9 junctions retrofitted, 27 cameras",
      summary: "Average corridor junction delay fell 21.7% in the peak period, measured by floating-car survey across 40 runs before and after.",
      docs: "PMC_JMRoad_Adaptive_Signals_Outcome.pdf",
      submittedAt: "2026-01-22",
      sponsorFeedback: "Traffic police reported fewer manual overrides at the two worst junctions. Camera mounting on existing poles avoided any civil work.",
      measured: { delay_reduction: 21.7, duration: 120, safety: 0 }
    },
    verification: {
      certificateId: "PC-2026-MOB-0022",
      verifierId: "v_ganesh",
      drawnOn: "2026-01-26",
      poolSize: 2,
      score: 86,
      notes: "Delay measurement used an independent floating-car protocol rather than the vendor's own detector counts, which is the correct basis. Result holds in the evening peak as well as the morning.",
      certifiedAt: "2026-02-06"
    }
  }),

  makePilot({
    id: "pl-tmc-bus-eta",
    solutionId: "sol-transitpulse-eta",
    title: "Bus Fleet Telematics & Live ETA — Thane",
    deptKey: "TMC",
    officialId: "off_tmc",
    budgetCap: 1300000,
    durationDays: 100,
    sector: "Urban Mobility",
    description: "On-board telematics across 140 TMT buses publishing live arrival predictions to 60 stop displays and a public feed.",
    status: "Completed",
    openedAt: "2026-04-06",
    lockedAt: "2026-04-06T12:20:00+05:30",
    criteria: [
      c("eta_accuracy", "eta_accuracy_pct", ">=", 85),
      c("uptime", "uptime_pct", ">=", 93),
      c("duration", "pilot_duration_days", ">=", 90)
    ],
    headlineCriterion: "eta_accuracy",
    application: {
      proposedCost: 1265000,
      proposedScope: "140 buses fitted with GNSS telematics, dwell-time modelling, 60 stop displays and an open GTFS-realtime feed.",
      appliedAt: "2026-04-19"
    },
    evidence: {
      assetsDeployed: "140 buses fitted, 60 stop displays live",
      summary: "Predictions landed within a two-minute window on 88.4% of observed arrivals. Device availability held at 95.1% across the pilot.",
      docs: "TMC_Bus_ETA_Outcome_Report.pdf",
      submittedAt: "2026-08-11",
      measured: { eta_accuracy: 88.4, uptime: 95.1, duration: 100 }
    }
  }),

  /* ---- AGRICULTURE & RURAL ----------------------------------------------- */

  makePilot({
    id: "pl-zps-soil-moisture",
    solutionId: "sol-krishisense-soil",
    title: "Soil Moisture Advisory Network — Solapur Blocks",
    deptKey: "ZPS",
    officialId: "off_zps",
    budgetCap: 850000,
    durationDays: 150,
    sector: "Agriculture & Rural",
    description: "Block-level soil moisture sensing feeding irrigation advisories delivered through the existing village extension officer rather than direct-to-farmer messaging.",
    status: "Certified",
    openedAt: "2025-07-31",
    lockedAt: "2025-07-31T10:05:00+05:30",
    criteria: [
      c("uptake", "advisory_uptake_pct", ">=", 40),
      c("duration", "pilot_duration_days", ">=", 120),
      c("uptime", "uptime_pct", ">=", 90)
    ],
    headlineCriterion: "uptake",
    application: {
      proposedCost: 820000,
      proposedScope: "48 soil probes across 6 blocks, advisories routed weekly through 6 extension officers with an acknowledgement loop.",
      appliedAt: "2025-08-14"
    },
    evidence: {
      assetsDeployed: "48 soil moisture probes across 6 blocks",
      summary: "58.2% of surveyed farmers acted on at least one advisory in the season, verified by extension officer field register rather than SMS delivery receipts.",
      docs: "ZPS_Soil_Moisture_Advisory_Outcome.pdf",
      submittedAt: "2025-12-27",
      sponsorFeedback: "Routing advisories through the extension officer is what made the difference. The officers already had the farmers' trust.",
      measured: { uptake: 58.2, duration: 150, uptime: 96.1 }
    },
    verification: {
      certificateId: "PC-2026-AGR-0016",
      verifierId: "v_meena",
      drawnOn: "2025-12-30",
      poolSize: 2,
      score: 84,
      notes: "Uptake is evidenced from field registers and a 180-farmer sample survey, not from message delivery logs. This is the distinction the earlier Solapur SMS pilot failed on, and the department scoped around it deliberately.",
      citesCertificates: ["NP-2025-AGR-0002"],
      certifiedAt: "2026-01-09"
    }
  }),

  makePilot({
    id: "pl-zps-crop-advisory",
    solutionId: "sol-agriyield-sms",
    title: "SMS Crop Advisory Uptake — Solapur",
    deptKey: "ZPS",
    officialId: "off_zps",
    budgetCap: 450000,
    durationDays: 90,
    sector: "Agriculture & Rural",
    description: "Weather-linked crop advisories pushed as one-way vernacular SMS to a registered farmer list across four blocks.",
    status: "Negative Precedent",
    openedAt: "2025-02-14",
    lockedAt: "2025-02-14T09:30:00+05:30",
    criteria: [
      c("uptake", "advisory_uptake_pct", ">=", 35),
      c("duration", "pilot_duration_days", ">=", 60)
    ],
    headlineCriterion: "uptake",
    application: {
      proposedCost: 430000,
      proposedScope: "Weekly vernacular SMS advisories to 12,400 registered farmers across four blocks, with a season-end uptake survey.",
      appliedAt: "2025-03-09"
    },
    evidence: {
      assetsDeployed: "12,400 farmers on the SMS register, 4 blocks",
      summary: "Delivery was reliable at 96% of messages, but only 11% of surveyed farmers reported acting on any advisory, against a locked threshold of 35%.",
      docs: "ZPS_SMS_Advisory_Uptake_Survey.pdf",
      submittedAt: "2025-06-09",
      sponsorFeedback: "Farmers received the messages. They did not trust or act on a text with no local face behind it.",
      measured: { uptake: 11, duration: 90 }
    },
    verification: {
      certificateId: "NP-2025-AGR-0002",
      verifierId: "v_meena",
      drawnOn: "2025-06-12",
      poolSize: 2,
      score: 34,
      notes: "Delivery infrastructure performed as promised. The pilot failed on behaviour change, which was the locked criterion, and the survey methodology was sound enough to be confident in that result.",
      lesson: "One-way SMS advisory with no local extension-officer loop reached 11% uptake against a 35% threshold, despite 96% delivery. Delivery rate is not uptake. Departments should budget for field follow-up or expect this result. Solapur established this at a cost of ₹4.3 lakh.",
      certifiedAt: "2025-06-24"
    }
  }),

  /* ---- HEALTHCARE & MEDTECH ---------------------------------------------- */

  makePilot({
    id: "pl-zps-coldchain",
    solutionId: "sol-meditrack-coldchain",
    title: "Cold Chain Vaccine Monitoring — Solapur PHC Network",
    deptKey: "ZPS",
    officialId: "off_zps",
    budgetCap: 1400000,
    durationDays: 180,
    sector: "Healthcare & Medtech",
    description: "Continuous temperature telemetry inside ILR units across 88 primary health centres, with GSM escalation on excursion.",
    status: "Certified",
    openedAt: "2025-05-06",
    lockedAt: "2025-05-06T14:40:00+05:30",
    criteria: [
      c("excursions", "cold_chain_excursion_pct", "<=", 2),
      c("uptime", "uptime_pct", ">=", 95),
      c("duration", "pilot_duration_days", ">=", 150)
    ],
    headlineCriterion: "excursions",
    application: {
      proposedCost: 1350000,
      proposedScope: "88 ILR units instrumented with battery-backed loggers, escalation to the block medical officer within 20 minutes of an excursion.",
      appliedAt: "2025-05-20"
    },
    evidence: {
      assetsDeployed: "88 ILR units across 88 PHCs",
      summary: "Excursion minutes fell to 1.1% of monitored time from an audited baseline of 6.4%. Twelve failing ILR units were identified and replaced during the pilot.",
      docs: "ZPS_ColdChain_Monitoring_Outcome.pdf",
      submittedAt: "2025-11-18",
      sponsorFeedback: "Finding the twelve dead units was worth the pilot on its own. Escalation reaches the block medical officer, which is the level that can act.",
      measured: { excursions: 1.1, uptime: 97.3, duration: 180 }
    },
    verification: {
      certificateId: "PC-2025-HLT-0013",
      verifierId: "v_farida",
      drawnOn: "2025-11-21",
      poolSize: 1,
      score: 93,
      notes: "Logger calibration certificates were checked against NABL references for a 15-unit sample. Excursion baseline is drawn from the department's own prior manual register, which understated the problem.",
      certifiedAt: "2025-12-02"
    }
  }),

  makePilot({
    id: "pl-mcgm-tb-screening",
    solutionId: "sol-diagnoai-tb",
    title: "TB Screening X-ray AI — MCGM Dispensaries",
    deptKey: "MCGM",
    officialId: "off_mcgm",
    budgetCap: 1900000,
    durationDays: 150,
    sector: "Healthcare & Medtech",
    description: "Triage presumptive tuberculosis from digital chest radiographs at 22 dispensaries, ordering the radiologist queue by likelihood rather than arrival time.",
    status: "Applied",
    openedAt: "2026-07-20",
    lockedAt: "2026-07-20T11:15:00+05:30",
    criteria: [
      c("sensitivity", "screening_sensitivity_pct", ">=", 95),
      c("duration", "pilot_duration_days", ">=", 120),
      c("safety", "safety_incidents", "==", 0)
    ],
    headlineCriterion: "sensitivity",
    application: {
      proposedCost: 1840000,
      proposedScope: "22 dispensaries, retrospective validation on 4,000 prior radiographs followed by prospective triage with radiologist adjudication of every flagged case.",
      appliedAt: "2026-08-06"
    }
  }),

  /* ---- EDUCATION & SKILLING ---------------------------------------------- */

  makePilot({
    id: "pl-zps-numeracy",
    solutionId: "sol-learnbridge-numeracy",
    title: "Adaptive Numeracy Remediation — Solapur ZP Schools",
    deptKey: "ZPS",
    officialId: "off_zps",
    budgetCap: 750000,
    durationDays: 120,
    sector: "Education & Skilling",
    description: "Offline-first adaptive numeracy practice for grades 3 to 5 on the schools' existing tablet pool, with class-level gap analysis for the teacher.",
    status: "Certified",
    openedAt: "2025-10-13",
    lockedAt: "2025-10-13T10:25:00+05:30",
    criteria: [
      c("numeracy_gain", "numeracy_gain_pct", ">=", 12),
      c("duration", "pilot_duration_days", ">=", 90),
      c("uptime", "uptime_pct", ">=", 85)
    ],
    headlineCriterion: "numeracy_gain",
    application: {
      proposedCost: 720000,
      proposedScope: "34 ZP schools, grades 3 to 5, baseline and endline assessment administered by the block education officer rather than the vendor.",
      appliedAt: "2025-10-27"
    },
    evidence: {
      assetsDeployed: "34 schools, 2,760 students, existing tablet pool",
      summary: "Endline numeracy proficiency rose 16.4 points against baseline on the state assessment instrument, with the largest gains in the lowest-scoring quartile.",
      docs: "ZPS_Numeracy_Remediation_Endline.pdf",
      submittedAt: "2026-02-18",
      sponsorFeedback: "Running on the tablets the schools already owned is why this finished on budget. Teacher dashboard adoption was uneven across blocks.",
      measured: { numeracy_gain: 16.4, duration: 120, uptime: 91.2 }
    },
    verification: {
      certificateId: "PC-2026-EDU-0026",
      verifierId: "v_rajeev",
      drawnOn: "2026-02-21",
      poolSize: 1,
      score: 85,
      notes: "Baseline and endline were administered by the block education officer under the state instrument, so the gain is not vendor-measured. Control comparison across 8 non-pilot schools supports the attribution.",
      certifiedAt: "2026-03-02"
    }
  })
];

/* -------------------------------------------------------------- citations */
/* An adoption IS a citation. A department procures by pointing at somebody
   else's certificate under GFR 2017 Rule 173(i), and that act is what the
   audit-defence file is later reconstructed from.                            */

const pilotById = Object.fromEntries(initialPilots.map((p) => [p.id, p]));
const pilotByCertificate = Object.fromEntries(
  initialPilots.filter((p) => p.verification).map((p) => [p.verification.certificateId, p])
);

function daysBefore(isoDate, n) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().split("T")[0];
}

const GFR_RULE = "GFR 2017 Rule 173(i)";

/**
 * Record one department procuring by citing another department's certificate.
 *
 * The justification and the decision trail are GENERATED from the certificate
 * being cited, not written by hand — that is the product claim. An officer who
 * clicks Adopt does not draft an audit defence; the platform compiles it.
 */
function makeAdoption({ id, certificateId, adoptingDeptKey, adoptingOfficialId, scaledBudget, date, auditFileId, note }) {
  const pilot = pilotByCertificate[certificateId];
  if (!pilot) throw new Error(`${id}: no certificate ${certificateId}`);
  if (pilot.verification.certificateType !== "positive") {
    throw new Error(`${id}: cannot adopt against a negative precedent`);
  }

  const dept = DEPARTMENTS[adoptingDeptKey];
  const officer = initialUsers[adoptingOfficialId];
  const solution = solutionById[pilot.solutionId];
  const v = pilot.verification;
  const headline = pilot.evidence.headlineMetric;

  const justification =
    `${dept.name} procures ${solution.name} from ${solution.startupName} (DPIIT ${solution.dpiitNo}) ` +
    `by citing certificate ${certificateId}, issued ${v.certifiedAt} by ${v.verifierName} ` +
    `(empanelment ${v.verifierEmpanelmentId}) against success metrics locked on ` +
    `${pilot.metricLock.lockedAt.split("T")[0]} under SHA-256 ${pilot.metricLock.hash.slice(0, 16)}…. ` +
    `The cited pilot at ${pilot.department} recorded ${headline}. Prior turnover and prior experience ` +
    `criteria are relaxed under ${GFR_RULE}; Earnest Money Deposit is exempted under GFR 2017 Rule 170. ` +
    `The vendor's track record is established by an independent certificate rather than by this department's own assessment.`;

  const decisionTrail = [
    { at: v.certifiedAt, actor: v.verifierName, action: `Certificate ${certificateId} issued and published to the registry.` },
    { at: daysBefore(date, 21), actor: `${officer.name}, ${officer.designation}`, action: `Searched the certified registry for ${pilot.sector.toLowerCase()} precedents matching the department's requirement.` },
    { at: daysBefore(date, 18), actor: `${officer.name}, ${officer.designation}`, action: `Opened certificate ${certificateId}. Reviewed each locked threshold against the achieved value.` },
    { at: daysBefore(date, 18), actor: "Precedent platform", action: `Metric-lock hash re-computed from the stored criteria and matched: ${pilot.metricLock.hash.slice(0, 32)}…` },
    { at: daysBefore(date, 14), actor: `${officer.name}, ${officer.designation}`, action: `Reviewed published negative precedents in ${pilot.sector} before proceeding.` },
    { at: daysBefore(date, 7), actor: `${officer.name}, ${officer.designation}`, action: `Recorded intent to procure by citation under ${GFR_RULE} rather than by open tender.` },
    { at: date, actor: `${officer.name}, ${officer.designation}`, action: `Adoption executed at ₹${scaledBudget.toLocaleString("en-IN")}. Audit-defence file ${auditFileId} compiled automatically.` }
  ];

  return {
    id,
    citedCertificateId: certificateId,
    pilotId: pilot.id,
    pilotTitle: pilot.title,
    solutionId: solution.id,
    solutionName: solution.name,
    startupName: solution.startupName,
    dpiitNo: solution.dpiitNo,
    sector: pilot.sector,
    sponsoringDepartment: pilot.department,
    sponsoringState: pilot.departmentState,
    adoptingOfficialId: officer.id,
    adoptingOfficialName: officer.name,
    adoptingOfficialDesignation: officer.designation,
    adoptingOfficialEmployeeId: officer.employeeId,
    adoptingDepartment: dept.name,
    adoptingState: dept.state,
    scaledBudget,
    gfrRule: GFR_RULE,
    emdRule: "GFR 2017 Rule 170",
    verifierName: v.verifierName,
    verifierEmpanelmentId: v.verifierEmpanelmentId,
    metricLockHash: pilot.metricLock.hash,
    auditFileId,
    note: note || null,
    justification,
    decisionTrail,
    date
  };
}

export const initialProcurements = [
  /* Acoustic Leak Telemetry Grid — the chain that reaches Tier 4.
     Six departments, three states, all citing one certificate.               */
  makeAdoption({ id: "adp-001", certificateId: "PC-2025-WTR-0007", adoptingDeptKey: "NMC",   adoptingOfficialId: "meera",     scaledBudget: 2400000, date: "2025-09-05", auditFileId: "ADF-2025-0041", note: "First department to procure on this certificate without running its own pilot." }),
  makeAdoption({ id: "adp-002", certificateId: "PC-2025-WTR-0007", adoptingDeptKey: "PCMC",  adoptingOfficialId: "off_pcmc",  scaledBudget: 3100000, date: "2025-12-11", auditFileId: "ADF-2025-0088" }),
  makeAdoption({ id: "adp-003", certificateId: "PC-2025-WTR-0007", adoptingDeptKey: "TMC",   adoptingOfficialId: "off_tmc",   scaledBudget: 2850000, date: "2026-02-14", auditFileId: "ADF-2026-0013" }),
  makeAdoption({ id: "adp-004", certificateId: "PC-2025-WTR-0007", adoptingDeptKey: "MWSSD", adoptingOfficialId: "off_mwssd", scaledBudget: 9600000, date: "2026-04-09", auditFileId: "ADF-2026-0047", note: "State-level rollout across 11 rural water schemes." }),
  makeAdoption({ id: "adp-005", certificateId: "PC-2025-WTR-0007", adoptingDeptKey: "SMC",   adoptingOfficialId: "off_smc",   scaledBudget: 4200000, date: "2026-06-20", auditFileId: "ADF-2026-0092", note: "First out-of-state citation. Gujarat accepted the Maharashtra certificate without re-piloting." }),
  makeAdoption({ id: "adp-006", certificateId: "PC-2025-WTR-0007", adoptingDeptKey: "IMC",   adoptingOfficialId: "off_imc",   scaledBudget: 3600000, date: "2026-07-28", auditFileId: "ADF-2026-0121", note: "Sixth department, third state. Triggers Tier 4 review for a GeM rate contract." }),
  makeAdoption({ id: "adp-007", certificateId: "PC-2026-WTR-0024", adoptingDeptKey: "MCGM",  adoptingOfficialId: "off_mcgm",  scaledBudget: 6400000, date: "2026-07-30", auditFileId: "ADF-2026-0126", note: "Cites the rural-feeder certificate rather than the original urban one." }),

  /* DMA Pressure Optimiser */
  makeAdoption({ id: "adp-008", certificateId: "PC-2025-WTR-0011", adoptingDeptKey: "NMC",  adoptingOfficialId: "meera",    scaledBudget: 1900000, date: "2026-01-20", auditFileId: "ADF-2026-0004" }),
  makeAdoption({ id: "adp-009", certificateId: "PC-2025-WTR-0011", adoptingDeptKey: "MCGM", adoptingOfficialId: "off_mcgm", scaledBudget: 5800000, date: "2026-05-05", auditFileId: "ADF-2026-0063" }),

  /* GridSense DT Loss Analytics */
  makeAdoption({ id: "adp-010", certificateId: "PC-2025-ENR-0009", adoptingDeptKey: "MCGM", adoptingOfficialId: "off_mcgm", scaledBudget: 3400000, date: "2026-01-15", auditFileId: "ADF-2026-0002" }),
  makeAdoption({ id: "adp-011", certificateId: "PC-2025-ENR-0009", adoptingDeptKey: "IMC",  adoptingOfficialId: "off_imc",  scaledBudget: 2700000, date: "2026-06-02", auditFileId: "ADF-2026-0079" }),
  makeAdoption({ id: "adp-012", certificateId: "PC-2025-ENR-0009", adoptingDeptKey: "PCMC", adoptingOfficialId: "off_pcmc", scaledBudget: 2100000, date: "2026-07-14", auditFileId: "ADF-2026-0108" }),

  /* SwiftGrievance Routing */
  makeAdoption({ id: "adp-013", certificateId: "PC-2026-WTR-0028", adoptingDeptKey: "PMC", adoptingOfficialId: "arjun",    scaledBudget: 1100000, date: "2026-05-18", auditFileId: "ADF-2026-0071" }),
  makeAdoption({ id: "adp-014", certificateId: "PC-2026-WTR-0028", adoptingDeptKey: "TMC", adoptingOfficialId: "off_tmc",  scaledBudget: 980000,  date: "2026-07-02", auditFileId: "ADF-2026-0101" }),

  /* Single-adopter certificates — Tier 2 solutions with one citation each */
  makeAdoption({ id: "adp-015", certificateId: "PC-2026-WTR-0031", adoptingDeptKey: "PCMC", adoptingOfficialId: "off_pcmc", scaledBudget: 1700000, date: "2026-06-28", auditFileId: "ADF-2026-0095" }),
  makeAdoption({ id: "adp-016", certificateId: "PC-2026-ENR-0019", adoptingDeptKey: "PMC",  adoptingOfficialId: "arjun",    scaledBudget: 2900000, date: "2026-07-08", auditFileId: "ADF-2026-0104" }),
  makeAdoption({ id: "adp-017", certificateId: "PC-2026-MOB-0022", adoptingDeptKey: "PCMC", adoptingOfficialId: "off_pcmc", scaledBudget: 2300000, date: "2026-04-25", auditFileId: "ADF-2026-0056" }),
  makeAdoption({ id: "adp-018", certificateId: "PC-2026-AGR-0016", adoptingDeptKey: "ZPA",  adoptingOfficialId: "off_zpa",  scaledBudget: 1250000, date: "2026-04-02", auditFileId: "ADF-2026-0044" }),
  makeAdoption({ id: "adp-019", certificateId: "PC-2025-HLT-0013", adoptingDeptKey: "MCGM", adoptingOfficialId: "off_mcgm", scaledBudget: 3100000, date: "2026-03-11", auditFileId: "ADF-2026-0029" }),
  makeAdoption({ id: "adp-020", certificateId: "PC-2026-EDU-0026", adoptingDeptKey: "ZPA",  adoptingOfficialId: "off_zpa",  scaledBudget: 920000,  date: "2026-06-11", auditFileId: "ADF-2026-0083" })
];

/* ------------------------------------------------------- onboarding & rules */

export const initialOnboardingRequests = [
  { id: "req1", name: "Prashant Wagh", email: "prashant.wagh@nashikmc.gov.in", department: "Nashik Municipal Corporation", designation: "Executive Engineer (Water Supply)", employeeId: "NashikMC-4412" },
  { id: "req2", name: "Shalini Deshpande", email: "s.deshpande@csmc.gov.in", department: "Chhatrapati Sambhajinagar Municipal Corporation", designation: "Deputy Municipal Commissioner", employeeId: "CSMC-22981" },
  { id: "req3", name: "Imran Shaikh", email: "imran.shaikh@kolhapurcorporation.gov.in", department: "Kolhapur Municipal Corporation", designation: "City Engineer", employeeId: "KMC-66103" }
];

/* Default success-criteria templates a sponsoring department starts from when it
   locks metrics for a new pilot. Stored as readable lines because this is what
   the nodal admin edits; the machine-readable form is the pilot's metric lock. */
export const initialSectorRules = {
  "Water & Sanitation": [
    "Non-revenue water reduced ≥ 15%",
    "Leak detection latency ≤ 6 hrs",
    "Pilot execution period ≥ 60 days",
    "Reportable safety incidents = 0"
  ],
  "Energy & Cleantech": [
    "Distribution loss reduced ≥ 8%",
    "Grid disturbance events = 0",
    "Pilot execution period ≥ 90 days"
  ],
  "Urban Mobility": [
    "Average junction delay reduced ≥ 15%",
    "Pilot execution period ≥ 90 days",
    "Reportable safety incidents = 0"
  ],
  "Agriculture & Rural": [
    "Farmer advisory uptake ≥ 40% (field-verified, not delivery receipts)",
    "Device uptime ≥ 90%",
    "Pilot execution period ≥ 120 days"
  ],
  "Healthcare & Medtech": [
    "Screening sensitivity ≥ 95%",
    "Cold-chain temperature excursions ≤ 2%",
    "CDSCO standards alignment evidenced"
  ],
  "Education & Skilling": [
    "Numeracy proficiency gain ≥ 12 points on the state instrument",
    "Assessment administered by the block education officer, not the vendor",
    "Pilot execution period ≥ 90 days"
  ]
};

/* ----------------------------------------------------------- derived state */

/** A pilot only counts as "piloted" once it has actually run. */
const RAN_STATUSES = ["Running", "Completed", "Certified", "Negative Precedent"];

/**
 * The tier ladder, in one place. Tier is evidence, not a label somebody typed:
 * every level below is computed from pilots and citations that exist in this file.
 */
export function computeTier({ ranPilotCount, positiveCertificateCount, citingDepartmentCount, citingStateCount }) {
  if (citingDepartmentCount >= 5 && citingStateCount >= 2) return 4;
  if (citingDepartmentCount >= 2) return 3;
  if (positiveCertificateCount >= 1) return 2;
  if (ranPilotCount >= 1) return 1;
  return 0;
}

initialSolutions.forEach((sol) => {
  const pilots = initialPilots.filter((p) => p.solutionId === sol.id);
  const certified = pilots.filter((p) => p.verification);
  const positive = certified.filter((p) => p.verification.certificateType === "positive");
  const negative = certified.filter((p) => p.verification.certificateType === "negative");
  const citations = initialProcurements.filter((a) => a.solutionId === sol.id);
  const citingDepartments = [...new Set(citations.map((a) => a.adoptingDepartment))];
  const citingStates = [...new Set(citations.map((a) => a.adoptingState))];

  sol.pilotIds = pilots.map((p) => p.id);
  sol.ranPilotCount = pilots.filter((p) => RAN_STATUSES.includes(p.status)).length;
  sol.certificateIds = certified.map((p) => p.verification.certificateId);
  sol.positiveCertificateIds = positive.map((p) => p.verification.certificateId);
  sol.negativeCertificateIds = negative.map((p) => p.verification.certificateId);
  sol.citationCount = citations.length;
  sol.citingDepartments = citingDepartments;
  sol.citingStates = citingStates;
  sol.totalAdoptedValue = citations.reduce((sum, a) => sum + a.scaledBudget, 0);
  sol.tier = computeTier({
    ranPilotCount: sol.ranPilotCount,
    positiveCertificateCount: positive.length,
    citingDepartmentCount: citingDepartments.length,
    citingStateCount: citingStates.length
  });
  sol.tierName = TIERS[sol.tier].name;
  sol.gemRateContractEligible = sol.tier === 4;
});

/** Certificate-level index: what a certificate is, and who has leaned on it. */
export const initialCertificates = initialPilots
  .filter((p) => p.verification)
  .map((p) => {
    const citations = initialProcurements.filter((a) => a.citedCertificateId === p.verification.certificateId);
    return {
      id: p.verification.certificateId,
      type: p.verification.certificateType,
      pilotId: p.id,
      pilotTitle: p.title,
      solutionId: p.solutionId,
      solutionName: solutionById[p.solutionId]?.name || p.title,
      startupName: p.application?.startupName || null,
      sector: p.sector,
      issuingDepartment: p.department,
      issuingState: p.departmentState,
      issuedAt: p.verification.certifiedAt,
      verifierName: p.verification.verifierName,
      verifierEmpanelmentId: p.verification.verifierEmpanelmentId,
      metricLockHash: p.metricLock.hash,
      citesCertificates: p.verification.citesCertificates,
      citationCount: citations.length,
      citedByDepartments: citations.map((a) => a.adoptingDepartment),
      citedByStates: [...new Set(citations.map((a) => a.adoptingState))]
    };
  });

/** Edges for the precedent graph: who cited what, and why it counts as citation. */
export const initialCitationEdges = [
  ...initialProcurements.map((a) => ({
    id: `edge-${a.id}`,
    type: "adoption",
    fromId: `dept:${a.adoptingDepartment}`,
    fromLabel: a.adoptingDepartment,
    toCertificateId: a.citedCertificateId,
    date: a.date,
    weight: a.scaledBudget
  })),
  ...initialPilots
    .filter((p) => p.verification?.citesCertificates?.length)
    .flatMap((p) =>
      p.verification.citesCertificates.map((cited) => ({
        id: `edge-${p.verification.certificateId}-${cited}`,
        type: "prior-art",
        fromId: p.verification.certificateId,
        fromLabel: p.verification.certificateId,
        toCertificateId: cited,
        date: p.verification.certifiedAt,
        weight: 0
      }))
    )
];

/** The single chain a judge should be walked through, in order. */
export const FOLLOW_A_PRECEDENT = {
  pilotId: "pl-pmc-w12-leak",
  certificateId: "PC-2025-WTR-0007",
  adoptionId: "adp-001",
  auditFileId: "ADF-2025-0041",
  solutionId: "sol-aquasense-leak"
};
