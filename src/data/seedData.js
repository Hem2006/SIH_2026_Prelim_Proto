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
    sector: "Water & Sanitation"
  },
  admin: {
    id: "admin",
    name: "MSInS Admin",
    email: "admin@msins.in",
    role: "Admin",
    department: "Maharashtra State Innovation Society",
    designation: "Nodal Director"
  }
};

export const initialPilots = [
  {
    id: "p1",
    title: "Leak Detection Pilot — Pune Ward 12",
    department: "Pune Municipal Corporation",
    sponsoringOfficialId: "arjun",
    sponsoringOfficialName: "Arjun",
    budgetCap: 800000,
    durationDays: 90,
    sector: "Water & Sanitation",
    description: "Deploy acoustic and IoT flow sensors across Pune Ward 12 water main lines to detect and isolate micro-leakages causing non-revenue water loss.",
    status: "Certified", // Open, Applied, Running, Completed, Certified, Rejected
    application: {
      id: "app_ram_p1",
      startupId: "ram",
      startupName: "AquaSense Technologies",
      proposedCost: 750000,
      proposedScope: "Deploy 25 smart acoustic sensors along the main trunk line of Ward 12, running continuous telemetry for 90 days.",
      dpiitNo: "DPIIT98372",
      appliedAt: "2026-04-10",
      status: "Selected"
    },
    applications: [
      {
        id: "app_ram_p1",
        startupId: "ram",
        startupName: "AquaSense Technologies",
        proposedCost: 750000,
        proposedScope: "Deploy 25 smart acoustic sensors along the main trunk line of Ward 12, running continuous telemetry for 90 days.",
        dpiitNo: "DPIIT98372",
        appliedAt: "2026-04-10",
        status: "Selected"
      }
    ],
    evidence: {
      waterLossReduction: "22% reduction in water loss",
      duration: "90 days",
      sensorsDeployed: "25 sensors",
      summary: "Successfully identified 14 micro-leaks and 3 major pipe fractures. Reduced daily water loss in Pune Ward 12 from 35% to 13%.",
      docs: "Water_Audit_Report_Pune_Ward12.pdf",
      submittedAt: "2026-07-15"
    },
    verification: {
      verifierId: "kavita",
      verifierName: "Dr. Kavita Rao",
      score: 95,
      scorecard: [
        { criterion: "≥15% measurable improvement", passed: true },
        { criterion: "pilot ran ≥60 days", passed: true },
        { criterion: "no safety incidents", passed: true }
      ],
      notes: "Outcome evidence is thoroughly documented and cross-verified via SCADA data. Flow telemetry confirms the 22% drop in water wastage. Very strong performance and highly replicable design.",
      certifiedAt: "2026-07-22"
    },
    escrow: {
      totalAmount: 750000,
      disbursedAmount: 750000,
      pfmsAccountRef: "PFMS-MAHA-PMC-2026-9921",
      milestones: [
        {
          id: "m1",
          title: "Milestone 1: Equipment Mobilization & Deployment",
          percentage: 30,
          amount: 225000,
          deliverable: "Deploy 25 acoustic sensors and link telemetry to PMC SCADA dashboard",
          status: "Disbursed",
          disbursedAt: "2026-04-25",
          txRef: "TXN-PFMS-98124"
        },
        {
          id: "m2",
          title: "Milestone 2: Mid-Term Telemetry & Operations",
          percentage: 40,
          amount: 300000,
          deliverable: "Continuous 45-day telemetry stream identifying initial 10 micro-leak hotspots",
          status: "Disbursed",
          disbursedAt: "2026-06-05",
          txRef: "TXN-PFMS-98440"
        },
        {
          id: "m3",
          title: "Milestone 3: Final Verification & Handover",
          percentage: 30,
          amount: 225000,
          deliverable: "Independent verification audit completion and 90-day municipal handover",
          status: "Disbursed",
          disbursedAt: "2026-07-24",
          txRef: "TXN-PFMS-98912"
        }
      ]
    }
  },
  {
    id: "p2",
    title: "IoT-Based Greywater Recycling - Pune Ward 5",
    department: "Pune Municipal Corporation",
    sponsoringOfficialId: "arjun",
    sponsoringOfficialName: "Arjun",
    budgetCap: 1000000,
    durationDays: 100,
    sector: "Water & Sanitation",
    description: "Implement localized smart filtration and sensor-tracked greywater recycling systems in Pune Ward 5 public gardens and commercial complexes.",
    status: "Applied",
    application: null,
    applications: [
      {
        id: "app_p2_1",
        startupId: "hydroflow",
        startupName: "HydroFlow Cleantech",
        proposedCost: 920000,
        proposedScope: "Install modular 5KLD decentralized greywater recycling units with real-time BOD/COD telemetry across 3 community gardens in Ward 5.",
        dpiitNo: "DPIIT77410",
        appliedAt: "2026-08-18",
        status: "Pending"
      },
      {
        id: "app_p2_2",
        startupId: "varun",
        startupName: "Varun Bio-Filters",
        proposedCost: 880000,
        proposedScope: "Deploy bio-engineered phytorid filtration beds connected to cloud-monitored water reuse manifolds for municipal landscaping.",
        dpiitNo: "DPIIT66329",
        appliedAt: "2026-08-20",
        status: "Pending"
      }
    ],
    evidence: null,
    verification: null
  },
  {
    id: "p3",
    title: "AI-Driven Water Quality Monitoring - Mumbai Ward 2",
    department: "Municipal Corporation of Greater Mumbai",
    sponsoringOfficialId: "mumbai_off",
    sponsoringOfficialName: "Rajesh Kumar (MGM)",
    budgetCap: 1500000,
    durationDays: 120,
    sector: "Water & Sanitation",
    description: "Continuous real-time tracking of pH, turbidity, and chemical contamination across public school drinking water reservoirs using AI telemetry.",
    status: "Open",
    application: null,
    applications: [],
    evidence: null,
    verification: null
  }
];

export const initialProcurements = [
  {
    id: "pr1",
    pilotId: "p1",
    pilotTitle: "Leak Detection Pilot — Pune Ward 12",
    startupId: "ram",
    startupName: "AquaSense Technologies",
    sponsoringDepartment: "Pune Municipal Corporation",
    adoptingOfficialId: "meera",
    adoptingOfficialName: "Meera",
    adoptingDepartment: "Nagpur Municipal Corporation",
    scaledBudget: 2400000,
    targetScope: "Deploy 80 acoustic sensors across Nagpur Central Zone to replicate Pune Ward 12 water savings.",
    status: "Accepted", // "Pending Startup Acceptance" | "Accepted" | "Declined"
    justification: "Nagpur Municipal Corporation adopts this certified solution based on Pune Ward 12 pilot results (22% water loss reduction). Procurement is fast-tracked under GFR 2017 Rule 170 (Earnest Money Deposit exemption for startups) and GFR 2017 Rule 173 (relaxation of prior turnover and prior experience criteria for certified startups).",
    date: "2026-08-10"
  }
];

export const initialVerifiers = [
  { id: "v1", name: "Dr. Kavita Rao", sector: "Water & Sanitation", state: "Maharashtra" },
  { id: "v2", name: "Prof. Amit Sen", sector: "Energy & Cleantech", state: "West Bengal" }
];

export const initialOnboardingRequests = [
  {
    id: "req1",
    name: "Rajesh Kumar",
    email: "rajesh.k@mumbai.gov.in",
    department: "Mumbai Smart City Ltd",
    designation: "GM Projects",
    employeeId: "MSCL-887"
  },
  {
    id: "req2",
    name: "Sanjay Patil",
    email: "sanjay.patil@thane.gov.in",
    department: "Thane Municipal Corporation",
    designation: "Executive Engineer",
    employeeId: "TMC-776"
  }
];

export const initialSectorRules = {
  "Water & Sanitation": [
    "≥15% measurable improvement",
    "pilot ran ≥60 days",
    "no safety incidents"
  ],
  "Energy & Cleantech": [
    "≥10% energy savings",
    "zero grid disturbances",
    "pilot ran ≥90 days"
  ],
  "Healthcare & Medtech": [
    "≥98% diagnostic accuracy",
    "zero patient complaints",
    "CDSCO standards alignment"
  ],
  "Roadworks": [
    "≥20% reduction in surface defects",
    "pilot ran ≥90 days",
    "no traffic safety incidents"
  ],
  "Food Technology": [
    "≥95% batch quality compliance",
    "zero contamination events",
    "FSSAI standards alignment"
  ]
};

/* Sentinel used by the "Civic Domain" pickers. Choosing it reveals a free-text
   field so a department can name a sector the registry doesn't carry yet. */
export const OTHER_SECTOR = "Others";

export const createPilotEscrow = (cost) => {
  const numCost = parseFloat(cost) || 750000;
  const m1 = Math.round(numCost * 0.30);
  const m2 = Math.round(numCost * 0.40);
  const m3 = numCost - m1 - m2;
  return {
    totalAmount: numCost,
    disbursedAmount: 0,
    pfmsAccountRef: `PFMS-MAHA-PMC-${Math.floor(1000 + Math.random() * 9000)}`,
    milestones: [
      {
        id: "m1",
        title: "Milestone 1: Equipment Mobilization & Deployment",
        percentage: 30,
        amount: m1,
        deliverable: "Hardware deployment, initial site telemetry calibration, and baseline connectivity",
        status: "Ready for Review",
        disbursedAt: null,
        txRef: null
      },
      {
        id: "m2",
        title: "Milestone 2: Mid-Term Telemetry & Operations",
        percentage: 40,
        amount: m2,
        deliverable: "Mid-way performance telemetry logs submitted and verified by municipal engineer",
        status: "Pending",
        disbursedAt: null,
        txRef: null
      },
      {
        id: "m3",
        title: "Milestone 3: Final Verification & Pilot Handover",
        percentage: 30,
        amount: m3,
        deliverable: "Final telemetry report audited and verified by independent board",
        status: "Pending",
        disbursedAt: null,
        txRef: null
      }
    ]
  };
};
