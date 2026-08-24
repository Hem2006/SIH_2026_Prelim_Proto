import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Database,
  Users,
  Settings,
  LogOut,
  MapPin,
  IndianRupee,
  Briefcase,
  Calendar,
  ArrowUpRight,
  Lock,
  Building2,
  UserCheck,
  Download,
  AlertTriangle,
  RefreshCw,
  Star,
  Check,
  ChevronRight,
  Send,
  Building,
  User,
  ExternalLink
} from "lucide-react";
import {
  initialUsers,
  initialPilots,
  initialProcurements,
  initialVerifiers,
  initialOnboardingRequests,
  initialSectorRules
} from "./data/seedData";

export default function App() {
  // App state
  const [users, setUsers] = useState(initialUsers);
  const [pilots, setPilots] = useState(initialPilots);
  const [procurements, setProcurements] = useState(initialProcurements);
  const [verifiers, setVerifiers] = useState(initialVerifiers);
  const [onboardingRequests, setOnboardingRequests] = useState(initialOnboardingRequests);
  const [sectorRules, setSectorRules] = useState(initialSectorRules);

  // Active session
  const [currentUser, setCurrentUser] = useState(null); // starts at login screen
  const [activeRole, setActiveRole] = useState(null); // 'Startup', 'Government Official', 'Verifier', 'Admin'
  const [currentTab, setCurrentTab] = useState("dashboard"); // dashboard, opportunities, passport, etc.

  // UI state
  const [registrationMode, setRegistrationMode] = useState(null); // 'startup' or 'official'
  const [selectedPilot, setSelectedPilot] = useState(null); // for detail modals
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(null); // pilot id to upload evidence
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(null); // pilot id to adopt
  const [toast, setToast] = useState(null);


  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Reset to seed data
  const handleResetData = () => {
    setUsers(JSON.parse(JSON.stringify(initialUsers)));
    setPilots(JSON.parse(JSON.stringify(initialPilots)));
    setProcurements(JSON.parse(JSON.stringify(initialProcurements)));
    setVerifiers(JSON.parse(JSON.stringify(initialVerifiers)));
    setOnboardingRequests(JSON.parse(JSON.stringify(initialOnboardingRequests)));
    setSectorRules(JSON.parse(JSON.stringify(initialSectorRules)));
    setCurrentUser(null);
    setActiveRole(null);
    setRegistrationMode(null);
    setSelectedPilot(null);
    showToast("Application state reset to original seed data", "info");
  };

  // Switch Active User / Role
  const handleLogin = (userKey) => {
    const user = users[userKey];
    setCurrentUser(user);
    setActiveRole(user.role);
    setRegistrationMode(null);
    // Set default tab based on role
    if (user.role === "Startup") setCurrentTab("dashboard");
    else if (user.role === "Government Official") setCurrentTab("dashboard");
    else if (user.role === "Verifier") setCurrentTab("pending");
    else if (user.role === "Admin") setCurrentTab("analytics");
    showToast(`Logged in as ${user.name} (${user.role})`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    showToast("Logged out successfully", "info");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner & Alert for Sandbox */}
      <div className="bg-amber-500 text-white text-xs py-1 px-4 text-center font-medium flex justify-between items-center shadow-inner">
        <span className="mx-auto flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <strong>Precedent Sandbox Environment:</strong> In-memory storage. Browser reloads reset the database state.
        </span>
        <button 
          onClick={handleResetData}
          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] uppercase font-bold py-0.5 px-2 rounded flex items-center gap-1 transition"
        >
          <RefreshCw className="w-2.5 h-2.5" /> Reset Demo State
        </button>
      </div>

      {/* Persistent Navigation Header */}
      {currentUser && (
        <header className="bg-govteal-900 text-white shadow-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Brand */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
                <div className="bg-white text-govteal-900 p-1.5 rounded-lg font-bold flex items-center justify-center shadow">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight">PRECEDENT</span>
                  <span className="text-[10px] block text-govteal-200 tracking-widest uppercase font-bold">SIH Public Procurement Hub</span>
                </div>
              </div>

              {/* Navigation Links based on role */}
              <nav className="hidden md:flex space-x-1">
                {activeRole === "Startup" && (
                  <>
                    <HeaderNavLink label="Dashboard" active={currentTab === "dashboard"} onClick={() => setCurrentTab("dashboard")} />
                    <HeaderNavLink label="Discover Pilots" active={currentTab === "opportunities"} onClick={() => setCurrentTab("opportunities")} />
                    <HeaderNavLink label="My Pilot Passport" active={currentTab === "passport"} onClick={() => setCurrentTab("passport")} />
                  </>
                )}
                {activeRole === "Government Official" && (
                  <>
                    <HeaderNavLink label="Sponsor Hub" active={currentTab === "dashboard"} onClick={() => setCurrentTab("dashboard")} />
                    <HeaderNavLink label="Post a Pilot" active={currentTab === "post-pilot"} onClick={() => setCurrentTab("post-pilot")} />
                    <HeaderNavLink label="Browse Certified Pilots" active={currentTab === "browse-certified"} onClick={() => setCurrentTab("browse-certified")} />
                    <HeaderNavLink label="Audit Defense Record" active={currentTab === "procurement-history"} onClick={() => setCurrentTab("procurement-history")} />
                  </>
                )}
                {activeRole === "Verifier" && (
                  <>
                    <HeaderNavLink label="Pending Verifications" active={currentTab === "pending"} onClick={() => setCurrentTab("pending")} />
                    <HeaderNavLink label="Verification History" active={currentTab === "history"} onClick={() => setCurrentTab("history")} />
                  </>
                )}
                {activeRole === "Admin" && (
                  <>
                    <HeaderNavLink label="System Analytics" active={currentTab === "analytics"} onClick={() => setCurrentTab("analytics")} />
                    <HeaderNavLink label="Verifier Management" active={currentTab === "verifiers"} onClick={() => setCurrentTab("verifiers")} />
                    <HeaderNavLink label="Department Onboarding" active={currentTab === "onboarding"} onClick={() => setCurrentTab("onboarding")} />
                    <HeaderNavLink label="Sector success criteria" active={currentTab === "rules"} onClick={() => setCurrentTab("rules")} />
                    <HeaderNavLink label="Registry Oversight" active={currentTab === "oversight"} onClick={() => setCurrentTab("oversight")} />
                  </>
                )}
              </nav>

              {/* User Switcher / Profile Dropdown */}
              <div className="flex items-center gap-3">
                <div className="bg-govteal-800 border border-govteal-700 rounded-lg px-3 py-1 text-right hidden sm:block">
                  <p className="text-xs text-govteal-200 font-bold uppercase">{currentUser.role}</p>
                  <p className="text-sm font-semibold truncate max-w-[150px]">{currentUser.name} {currentUser.startupName ? `(${currentUser.startupName})` : ""}</p>
                </div>
                <div className="relative group">
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleLogin(e.target.value)}
                    className="bg-govteal-950 text-white text-xs border border-govteal-700 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
                  >
                    <option disabled>Switch Role/User...</option>
                    <option value="ram">Ram (Startup - AquaSense)</option>
                    <option value="arjun">Arjun (Official - Pune)</option>
                    <option value="meera">Meera (Official - Nagpur)</option>
                    <option value="kavita">Dr. Kavita Rao (Verifier)</option>
                    <option value="admin">MSInS Admin (Nodal)</option>
                  </select>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-govteal-950 hover:bg-rose-950 text-govteal-300 hover:text-rose-400 p-2 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center gap-3 max-w-md border animate-bounce ${
            toast.type === "success" ? "bg-emerald-600 border-emerald-500" :
            toast.type === "info" ? "bg-govteal-800 border-govteal-700" : "bg-rose-600 border-rose-500"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
            <div>
              <p className="font-bold">Notification</p>
              <p className="text-sm">{toast.message}</p>
            </div>
          </div>
        )}

        {!currentUser ? (
          /* LOGIN & ONBOARDING PORTAL */
          registrationMode ? (
            <RegistrationView 
              mode={registrationMode}
              setMode={setRegistrationMode}
              users={users}
              setUsers={setUsers}
              onboardingRequests={onboardingRequests}
              setOnboardingRequests={setOnboardingRequests}
              showToast={showToast}
              handleLogin={handleLogin}
            />
          ) : (
            <LoginPortal 
              handleLogin={handleLogin} 
              setRegistrationMode={setRegistrationMode} 
            />
          )
        ) : (
          /* LOGGED IN VIEW */
          <div>
            {activeRole === "Startup" && (
              <StartupDashboard
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                currentUser={currentUser}
                pilots={pilots}
                setPilots={setPilots}
                procurements={procurements}
                showToast={showToast}
                selectedPilot={selectedPilot}
                setSelectedPilot={setSelectedPilot}
                evidenceModalOpen={evidenceModalOpen}
                setEvidenceModalOpen={setEvidenceModalOpen}
              />
            )}
            {activeRole === "Government Official" && (
              <OfficialDashboard
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                currentUser={currentUser}
                pilots={pilots}
                setPilots={setPilots}
                procurements={procurements}
                setProcurements={setProcurements}
                showToast={showToast}
                selectedPilot={selectedPilot}
                setSelectedPilot={setSelectedPilot}
                adoptionModalOpen={adoptionModalOpen}
                setAdoptionModalOpen={setAdoptionModalOpen}
                sectorRules={sectorRules}
              />
            )}
            {activeRole === "Verifier" && (
              <VerifierDashboard
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                currentUser={currentUser}
                pilots={pilots}
                setPilots={setPilots}
                showToast={showToast}
                selectedPilot={selectedPilot}
                setSelectedPilot={setSelectedPilot}
              />
            )}
            {activeRole === "Admin" && (
              <AdminDashboard
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                currentUser={currentUser}
                pilots={pilots}
                setPilots={setPilots}
                procurements={procurements}
                verifiers={verifiers}
                setVerifiers={setVerifiers}
                onboardingRequests={onboardingRequests}
                setOnboardingRequests={setOnboardingRequests}
                users={users}
                setUsers={setUsers}
                sectorRules={sectorRules}
                setSectorRules={setSectorRules}
                showToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center">
          <p className="text-sm">
            © 2026 Precedent Hub. Powered by the Maharashtra State Innovation Society (MSInS) & DPIIT Startup Support Hub.
          </p>
          <div className="mt-4 sm:mt-0 flex justify-center gap-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <span>GFR 2017 compliant portal</span>
            <span>•</span>
            <span>Secured Audit Trail</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Nav Links Helper
function HeaderNavLink({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
        active 
          ? "bg-govteal-950 text-white shadow-sm border-b-2 border-teal-400" 
          : "text-govteal-100 hover:bg-govteal-800 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

/* ==========================================================
   LOGIN PORTAL & REGISTER
   ========================================================== */
function LoginPortal({ handleLogin, setRegistrationMode }) {
  return (
    <div className="max-w-4xl mx-auto my-12">
      <div className="text-center mb-10">
        <div className="inline-block bg-govteal-900 text-white p-3 rounded-2xl mb-4 shadow">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">PRECEDENT</h1>
        <p className="mt-2 text-lg text-slate-600 max-w-xl mx-auto">
          Maharashtra Public Procurement Sandbox for Startups. Fast-tracking innovative solutions from Pilot to Scaled Department Procurement.
        </p>
        <div className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-bold">
          Under GFR Rule 170 (EMD Exemption) & Rule 173 (Turnover/Experience Exemption)
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
          Select a Role to Access the Sandbox (Preseeded Personas)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Startup Demo */}
          <div className="border border-slate-200 hover:border-govteal-500 hover:shadow-md rounded-xl p-5 transition flex flex-col justify-between bg-slate-50">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Startup
                </span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  DPIIT Verified
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ram</h3>
              <p className="text-xs text-slate-500 font-semibold">AquaSense Technologies</p>
              <p className="text-sm text-slate-600 mt-2">
                Water-leak detection telemetry. Wants to apply to pilots, log metrics, and view their credible Pilot Passport.
              </p>
            </div>
            <button
              onClick={() => handleLogin("ram")}
              className="mt-6 w-full bg-govteal-900 hover:bg-govteal-950 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              Sign In as Ram <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Government Officials */}
          <div className="border border-slate-200 hover:border-govteal-500 hover:shadow-md rounded-xl p-5 transition flex flex-col justify-between bg-slate-50">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Government Official
                </span>
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  2 Accounts Available
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Arjun / Meera</h3>
              <p className="text-xs text-slate-500 font-semibold">Pune Municipal Corp / Nagpur Municipal Corp</p>
              <p className="text-sm text-slate-600 mt-2">
                <strong>Arjun:</strong> Post & sponsor pilots.<br />
                <strong>Meera:</strong> Browse certified pilots & Adopt (Fast-Track Procurement).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={() => handleLogin("arjun")}
                className="bg-govteal-900 hover:bg-govteal-950 text-white py-2 px-1 rounded-lg text-xs font-bold transition text-center"
              >
                Log In: Arjun (Pune)
              </button>
              <button
                onClick={() => handleLogin("meera")}
                className="bg-govteal-800 hover:bg-govteal-950 text-white py-2 px-1 rounded-lg text-xs font-bold transition text-center"
              >
                Log In: Meera (Nagpur)
              </button>
            </div>
          </div>

          {/* Independent Verifier */}
          <div className="border border-slate-200 hover:border-govteal-500 hover:shadow-md rounded-xl p-5 transition flex flex-col justify-between bg-slate-50">
            <div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mb-2">
                Independent Verifier
              </span>
              <h3 className="text-lg font-bold text-slate-900">Dr. Kavita Rao</h3>
              <p className="text-xs text-slate-500 font-semibold">Technical Evaluator (Water Sector)</p>
              <p className="text-sm text-slate-600 mt-2">
                Audits completed pilots by analyzing startup metrics and department logs, issuing official credibility certifications.
              </p>
            </div>
            <button
              onClick={() => handleLogin("kavita")}
              className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              Sign In as Dr. Kavita <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Nodal Body */}
          <div className="border border-slate-200 hover:border-govteal-500 hover:shadow-md rounded-xl p-5 transition flex flex-col justify-between bg-slate-50">
            <div>
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mb-2">
                Admin / Nodal Body
              </span>
              <h3 className="text-lg font-bold text-slate-900">MSInS Admin</h3>
              <p className="text-xs text-slate-500 font-semibold">Maharashtra State Innovation Society</p>
              <p className="text-sm text-slate-600 mt-2">
                Manages verifier registry, onboard departments, edits success-criteria rules, and monitors system-wide analytics.
              </p>
            </div>
            <button
              onClick={() => handleLogin("admin")}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              Sign In as MSInS Admin <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Self Registration Section */}
        <div className="mt-10 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-sm mb-4 font-semibold">Need to register a new account to test onboarding?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setRegistrationMode("startup")}
              className="border border-govteal-900 text-govteal-900 hover:bg-govteal-50 py-2 px-4 rounded-lg font-bold text-sm transition"
            >
              Register Startup
            </button>
            <button
              onClick={() => setRegistrationMode("official")}
              className="border border-govteal-900 text-govteal-900 hover:bg-govteal-50 py-2 px-4 rounded-lg font-bold text-sm transition"
            >
              Register Government Official
            </button>
          </div>
          <p className="text-slate-400 text-xs mt-3 italic">
            * Verifiers are invite-only and must be added directly by the MSInS Admin.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   REGISTRATION VIEW (STARTUP / OFFICIAL)
   ========================================================== */
function RegistrationView({ 
  mode, 
  setMode, 
  users, 
  setUsers, 
  onboardingRequests, 
  setOnboardingRequests, 
  showToast,
  handleLogin
}) {
  // Common states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Startup specific states
  const [founder, setFounder] = useState("");
  const [mobile, setMobile] = useState("");
  const [dpiitNo, setDpiitNo] = useState("");
  const [dpiitStatus, setDpiitStatus] = useState("unverified"); // unverified, verifying, verified
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // Official specific states
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [emailError, setEmailError] = useState("");

  // DPIIT Mock Lookup simulation
  const handleVerifyDPIIT = () => {
    if (!dpiitNo.trim()) {
      showToast("Please enter a DPIIT recognition number", "error");
      return;
    }
    setDpiitStatus("verifying");
    setTimeout(() => {
      setDpiitStatus("verified");
      setName("SmartInfra Systems"); // Auto-fill company details
      showToast("DPIIT Recognition Number Verified!", "success");
    }, 1500);
  };

  const handleSendOTP = () => {
    if (!mobile || mobile.length < 10) {
      showToast("Please enter a valid 10-digit mobile number", "error");
      return;
    }
    setOtpSent(true);
    showToast("Fake OTP sent: Enter any 6 digits to verify", "info");
  };

  // Official Email domain check
  const handleOfficialEmailChange = (val) => {
    setEmail(val);
    const domain = val.toLowerCase().split("@")[1] || "";
    if (val && !domain.endsWith("gov.in") && !domain.endsWith("nic.in")) {
      setEmailError("Official email must end in .gov.in, .nic.in, or a state gov domain");
    } else {
      setEmailError("");
    }
  };

  const handleRegisterStartup = (e) => {
    e.preventDefault();
    if (dpiitStatus !== "verified") {
      showToast("Please verify your DPIIT recognition number first", "error");
      return;
    }
    if (!otpSent || otpInput.length < 6) {
      showToast("Please complete the mobile OTP step (any 6 digits)", "error");
      return;
    }

    const newKey = `startup_${Date.now()}`;
    const newStartup = {
      id: newKey,
      name: founder || "Startup Founder",
      email,
      role: "Startup",
      startupName: name,
      dpiitNo,
      sector: "Water & Sanitation",
      status: "Verified",
      passportScore: 70,
      details: "Self-registered startup in Sandbox."
    };

    setUsers(prev => ({ ...prev, [newKey]: newStartup }));
    showToast("Startup registration complete! Logged in automatically.", "success");
    // Auto login
    handleLogin(newKey);
  };

  const handleRegisterOfficial = (e) => {
    e.preventDefault();
    if (emailError || !email) {
      showToast("Please fix the validation errors", "error");
      return;
    }
    if (!department || !designation || !employeeId) {
      showToast("All fields are required", "error");
      return;
    }

    const newRequest = {
      id: `req_${Date.now()}`,
      name,
      email,
      department,
      designation,
      employeeId
    };

    setOnboardingRequests(prev => [...prev, newRequest]);
    showToast("Registration submitted! Pending MSInS Admin approval.", "info");
    setMode(null); // return to logins
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      <button 
        onClick={() => setMode(null)}
        className="text-sm font-semibold text-govteal-600 hover:text-govteal-900 mb-6 inline-flex items-center gap-1"
      >
        ← Back to Login Screen
      </button>

      {mode === "startup" ? (
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
            <Building className="text-govteal-900" /> Startup Registration
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Register your DPIIT-recognized innovative enterprise to participate in government pilots.
          </p>

          <form onSubmit={handleRegisterStartup} className="space-y-5">
            {/* DPIIT Field */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                DPIIT Recognition Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DPIIT98372"
                  value={dpiitNo}
                  onChange={(e) => setDpiitNo(e.target.value)}
                  disabled={dpiitStatus === "verifying" || dpiitStatus === "verified"}
                  className="flex-grow border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100"
                />
                {dpiitStatus !== "verified" ? (
                  <button
                    type="button"
                    onClick={handleVerifyDPIIT}
                    disabled={dpiitStatus === "verifying"}
                    className="bg-govteal-900 hover:bg-govteal-950 text-white font-semibold text-sm px-4 py-2 rounded transition flex items-center gap-1"
                  >
                    {dpiitStatus === "verifying" ? (
                      <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : "Verify DPIIT"}
                  </button>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded border border-emerald-200 flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-1 italic">
                * Simulated check: verifying connects with the DPIIT national lookup service.
              </p>
            </div>

            {/* General Form Fields */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Startup / Entity Name (Auto-filled on Verification)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter startup name"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Founder/Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Founder name"
                  value={founder}
                  onChange={(e) => setFounder(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* OTP Stub */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Mobile Number (Aadhaar Linked)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Enter 10 digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="flex-grow border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="border border-govteal-900 text-govteal-900 hover:bg-govteal-50 font-semibold text-xs px-4 rounded transition"
                  >
                    {otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter any 6 digits"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="border border-slate-300 rounded px-3 py-2 text-sm tracking-widest w-40 text-center"
                  />
                  <span className="text-slate-500 text-xs ml-3">Any 6 digits is accepted in sandbox mode.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2.5 rounded-lg shadow transition mt-4"
            >
              Complete Registration & Access App
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
            <User className="text-govteal-900" /> Government Official Registration
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Access credentials for Municipal Corporation, Smart City bodies, and State Procurement officials.
          </p>

          <form onSubmit={handleRegisterOfficial} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Government Email ID
              </label>
              <input
                type="email"
                required
                placeholder="officer@pune.gov.in"
                value={email}
                onChange={(e) => handleOfficialEmailChange(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${
                  emailError ? "border-rose-400 focus:ring-rose-500" : "border-slate-300 focus:ring-teal-500"
                }`}
              />
              {emailError ? (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{emailError}</p>
              ) : (
                <p className="text-slate-500 text-xs mt-1">Must be an @gov.in, @nic.in, or state government email.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Department / Municipal Body
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Municipal Corporation"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Official Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Superintending Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Employee ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PMC-38291"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 mt-4">
              <strong>Onboarding Policy Note:</strong> Official accounts require nodal verification. Upon submission, the MSInS Admin must manually approve this account before access is granted.
            </div>

            <button
              type="submit"
              className="w-full bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2.5 rounded-lg shadow transition"
            >
              Submit Registration for Approval
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   1. STARTUP DASHBOARD & VIEWS (RAM)
   ========================================================== */
function StartupDashboard({
  currentTab,
  setCurrentTab,
  currentUser,
  pilots,
  setPilots,
  procurements,
  showToast,
  selectedPilot,
  setSelectedPilot,
  evidenceModalOpen,
  setEvidenceModalOpen
}) {
  // Discover-screen filter state lives here (only this screen uses it)
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");

  const [applyModalOpen, setApplyModalOpen] = useState(null); // pilot object
  const [proposedCost, setProposedCost] = useState("");
  const [proposedScope, setProposedScope] = useState("");
  const [timeline, setTimeline] = useState("");

  // Evidence forms
  const [waterLossVal, setWaterLossVal] = useState("22% reduction");
  const [durVal, setDurVal] = useState("100 days");
  const [sensorsVal, setSensorsVal] = useState("25 sensors");
  const [notesVal, setNotesVal] = useState("");

  const ramPilots = pilots.filter(p => p.application?.startupId === currentUser.id);

  // Stats
  const appliedCount = ramPilots.filter(p => p.status === "Applied").length;
  const runningCount = ramPilots.filter(p => p.status === "Running").length;
  const completedCount = ramPilots.filter(p => p.status === "Completed").length;
  const certifiedCount = ramPilots.filter(p => p.status === "Certified").length;

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!proposedCost || !proposedScope) {
      showToast("Please fill in the application details", "error");
      return;
    }
    const updatedPilots = pilots.map(p => {
      if (p.id === applyModalOpen.id) {
        return {
          ...p,
          status: "Applied",
          application: {
            startupId: currentUser.id,
            startupName: currentUser.startupName,
            proposedCost: parseFloat(proposedCost),
            proposedScope,
            dpiitNo: currentUser.dpiitNo,
            appliedAt: new Date().toISOString().split("T")[0]
          }
        };
      }
      return p;
    });
    setPilots(updatedPilots);
    setApplyModalOpen(null);
    setProposedCost("");
    setProposedScope("");
    showToast(`Successfully applied for "${applyModalOpen.title}"!`, "success");
  };

  const handleEvidenceSubmit = (e) => {
    e.preventDefault();
    const updatedPilots = pilots.map(p => {
      if (p.id === evidenceModalOpen) {
        return {
          ...p,
          status: "Completed", // awaiting verifier
          evidence: {
            waterLossReduction: waterLossVal,
            duration: durVal,
            sensorsDeployed: sensorsVal,
            summary: notesVal || "Pilot executed successfully matching initial scope specifications.",
            docs: "Evidence_Report_Telemetry_Log.pdf",
            submittedAt: new Date().toISOString().split("T")[0]
          }
        };
      }
      return p;
    });
    setPilots(updatedPilots);
    setEvidenceModalOpen(null);
    setNotesVal("");
    showToast("Outcome evidence submitted successfully! Pilot status updated to 'Completed (Pending Verification)'.", "success");
  };

  return (
    <div>
      {/* 1. DASHBOARD VIEW */}
      {currentTab === "dashboard" && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:flex md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Startup Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor your pilot proposals, submit evidence telemetry, and view your procurement credentials.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button 
                onClick={() => setCurrentTab("opportunities")}
                className="bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center gap-1.5 transition"
              >
                <Search className="w-4 h-4" /> Discover Pilot Opportunities
              </button>
            </div>
          </div>

          {/* Top stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={<Clock className="text-slate-500 w-5 h-5" />} label="Applied" value={appliedCount} bg="bg-slate-100" />
            <StatCard icon={<TrendingUp className="text-blue-500 w-5 h-5" />} label="Running Pilots" value={runningCount} bg="bg-blue-50" />
            <StatCard icon={<AlertTriangle className="text-amber-500 w-5 h-5" />} label="Completed" value={completedCount} bg="bg-amber-50" />
            <StatCard icon={<Award className="text-emerald-500 w-5 h-5" />} label="Certified precedents" value={certifiedCount} bg="bg-emerald-50" />

            {/* Passport Score Banner */}
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-govteal-900 to-govteal-950 text-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-govteal-200">Passport Score</span>
                <Award className="w-5 h-5 text-teal-400" />
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-extrabold">{currentUser.passportScore}</span>
                <span className="text-sm font-semibold text-govteal-300 ml-1">/100</span>
              </div>
              <div className="w-full bg-govteal-800 rounded-full h-1.5 mt-2">
                <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${currentUser.passportScore}%` }} />
              </div>
              <span className="text-[10px] text-teal-300 font-semibold mt-2 block">✓ Top-Tier Supplier Standing</span>
            </div>
          </div>

          {/* Current Actions & List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Pilot Applications & Running Projects</h2>
            {ramPilots.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Building className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold">No applications found.</p>
                <p className="text-xs text-slate-400">Head over to "Discover Pilots" to submit your first proposal!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-left font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-3">Pilot Details</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Proposed Cost</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {ramPilots.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-bold block text-slate-900">{p.title}</span>
                          <span className="text-xs text-slate-400">Sector: {p.sector}</span>
                        </td>
                        <td className="px-6 py-4">{p.department}</td>
                        <td className="px-6 py-4 font-semibold">₹{p.application?.proposedCost?.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {p.status === "Running" && (
                              <button
                                onClick={() => setEvidenceModalOpen(p.id)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded text-xs transition"
                              >
                                Upload Evidence
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPilot(p)}
                              className="text-govteal-900 hover:underline text-xs font-bold"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DISCOVER OPPORTUNITIES */}
      {currentTab === "opportunities" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discover Open Pilots</h1>
            <p className="text-sm text-slate-500 mt-1">
              Apply to short-term, low-budget pilots posted by various government officials to test your innovation.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pilots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <select 
              value={sectorFilter} 
              onChange={(e) => setSectorFilter(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="All">All Sectors</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Energy & Cleantech">Energy & Cleantech</option>
            </select>
            <select 
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="All">All Budgets</option>
              <option value="low">Under ₹10,00,000</option>
              <option value="high">₹10,00,000 & above</option>
            </select>
            <div className="flex justify-end items-center">
              <span className="text-xs text-slate-500 font-bold">
                {pilots.filter(p => p.status === "Open").length} open listings found
              </span>
            </div>
          </div>

          {/* Pilots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pilots
              .filter(p => p.status === "Open")
              .filter(p => searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
              .filter(p => sectorFilter !== "All" ? p.sector === sectorFilter : true)
              .filter(p => {
                if (budgetFilter === "low") return p.budgetCap < 1000000;
                if (budgetFilter === "high") return p.budgetCap >= 1000000;
                return true;
              })
              .map(p => (
                <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-govteal-50 text-govteal-900 text-xs font-bold px-2 py-0.5 rounded border border-govteal-200">
                        {p.sector}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5" /> {p.durationDays} Days
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-govteal-600 font-semibold mt-1">{p.department}</p>
                    <p className="text-xs text-slate-600 mt-3 line-clamp-3">{p.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget Cap</span>
                      <span className="font-extrabold text-slate-900 text-sm">₹{p.budgetCap.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPilot(p)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2.5 py-1.5"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => setApplyModalOpen(p)}
                        className="bg-govteal-900 hover:bg-govteal-950 text-white font-bold text-xs py-1.5 px-3 rounded transition"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. PILOT PASSPORT */}
      {currentTab === "passport" && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Pilot Passport</h1>
            <p className="text-sm text-slate-500 mt-1">
              This passport operates as a portable credibility badge summarizing certified pilots. Other government departments reference this to bypass experience/EMD hurdles.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
            {/* Certificate Header */}
            <div className="bg-govteal-900 text-white px-8 py-10 text-center relative border-b-8 border-teal-400">
              <div className="absolute top-4 right-4 bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider py-1 px-3 rounded shadow">
                ✓ Active Supplier Passport
              </div>
              <Award className="w-16 h-16 mx-auto text-teal-300 mb-2" />
              <h2 className="text-2xl font-bold tracking-wide">PRECEDENT COMPLIANCE PASSPORT</h2>
              <p className="text-xs text-govteal-200 tracking-widest uppercase mt-1">
                State Innovation Procurement Framework Certificate
              </p>
              <div className="mt-2 text-xs text-govteal-300 font-mono">
                Passport ID: PP-{currentUser.dpiitNo}-2026
              </div>
            </div>

            {/* Entity details */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border-b border-slate-200 text-sm">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Startup Name</span>
                <span className="font-bold text-slate-800 text-base">{currentUser.startupName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">DPIIT Recognition Number</span>
                <span className="font-mono font-bold text-slate-800">{currentUser.dpiitNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Innovation Sector</span>
                <span className="font-bold text-slate-800">{currentUser.sector}</span>
              </div>
            </div>

            {/* Certified Precedents section */}
            <div className="p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                <CheckCircle className="text-emerald-500 w-5 h-5" /> Certified Pilots Registry Records
              </h3>

              {pilots.filter(p => p.status === "Certified" && p.application?.startupId === currentUser.id).length === 0 ? (
                <div className="text-center py-6 text-slate-500 italic text-sm">
                  No certified pilots currently linked to this passport. Complete a sponsored pilot and achieve verifier validation to receive your first certified record.
                </div>
              ) : (
                pilots.filter(p => p.status === "Certified" && p.application?.startupId === currentUser.id).map(p => (
                  <div key={p.id} className="border border-emerald-200 bg-emerald-50/30 p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 py-0.5 px-2 rounded">
                          Certified Outcome Precedent
                        </span>
                        <h4 className="font-extrabold text-slate-950 text-base mt-2">{p.title}</h4>
                        <p className="text-xs text-slate-600">Sponsoring Agency: {p.department} ({p.sponsoringOfficialName})</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-mono">Certified Date</span>
                        <span className="font-bold text-slate-700 text-xs">{p.verification?.certifiedAt}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-emerald-100 py-3 text-sm">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Key Success Metric</span>
                        <span className="font-bold text-slate-800">{p.evidence?.waterLossReduction}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Audited Duration</span>
                        <span className="font-semibold text-slate-800">{p.evidence?.duration}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Technical Audit Score</span>
                        <span className="font-extrabold text-emerald-700">{p.verification?.score}/100</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Verifier Official Endorsement</span>
                      <p className="text-xs text-slate-600 italic mt-0.5">
                        "{p.verification?.notes}"
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2">
                        Signed: {p.verification?.verifierName} (Technical Auditor, {p.sector} Board)
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-500">Hash: SHA256- {p.id}-CERT-X992</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-4 h-4" /> GFR EXEMPTION COMPLIANT
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Legal / Policy Exemption Reference */}
            <div className="bg-slate-100 p-6 border-t border-slate-200 text-xs text-slate-600 space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wide">
                General Financial Rules (GFR) 2017 - Procurement Exemptions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-slate-800 block mb-0.5">Rule 170: EMD Exemption</strong>
                  Startups having valid DPIIT recognition and verified pilot outcomes are exempted from depositing Earnest Money Deposit (EMD) or Bid Security in subsequent public procurements of similar technologies.
                </div>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Rule 173: Relaxation of Prior Criteria</strong>
                  Nodal agencies relax criteria relating to prior turnover and prior experience in all public procurement bids, provided the bidder startup meets quality/technical parameters certified in this passport.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DETAILS MODAL */}
      {selectedPilot && (
        <PilotDetailModal 
          pilot={selectedPilot} 
          onClose={() => setSelectedPilot(null)} 
          currentUser={currentUser}
        />
      )}

      {/* 5. APPLY MODAL FORM */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Pilot Listing</h3>
                <p className="text-xs text-slate-500">{applyModalOpen.title}</p>
              </div>
              <button onClick={() => setApplyModalOpen(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded border text-xs space-y-1">
                <div><strong>Startup:</strong> {currentUser.startupName}</div>
                <div><strong>DPIIT Number:</strong> {currentUser.dpiitNo}</div>
                <div><strong>Budget Cap:</strong> ₹{applyModalOpen.budgetCap.toLocaleString('en-IN')}</div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Proposed Pilot Cost (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    required
                    max={applyModalOpen.budgetCap}
                    placeholder="Enter cost (must be within budget cap)"
                    value={proposedCost}
                    onChange={(e) => setProposedCost(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Proposed Pilot Scope & Implementation Method</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline your deployment scope, target locations, frequency of data feedback, and how you will meet the success criteria..."
                  value={proposedScope}
                  onChange={(e) => setProposedScope(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Execution Timeline (Days)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 90"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-govteal-900 hover:bg-govteal-950 text-white rounded text-sm font-semibold transition"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. UPLOAD EVIDENCE MODAL */}
      {evidenceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Outcome Evidence</h3>
                <p className="text-xs text-slate-500">Provide verified telemetry data & outcome metrics to submit for verification.</p>
              </div>
              <button onClick={() => setEvidenceModalOpen(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded border border-amber-200">
                <strong>Attention:</strong> Uploading outcome evidence marks the pilot as Completed. Sponsoring officials and technical verifiers will evaluate these metrics against success criteria.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Key Performance Outcome Metric</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22% reduction in water loss"
                  value={waterLossVal}
                  onChange={(e) => setWaterLossVal(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pilot Executed Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 90 Days"
                    value={durVal}
                    onChange={(e) => setDurVal(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Assets Deployed / Output</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25 sensors"
                    value={sensorsVal}
                    onChange={(e) => setSensorsVal(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Outcome Narrative / Technical Summary</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the pilot outcomes, lessons learned, and proof of technical stability..."
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Evidence Documentation File</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50">
                  <FileText className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-govteal-900 block">Water_Audit_Telemetry_Report.pdf</span>
                  <span className="text-[10px] text-slate-400">Mocked file uploaded successfully</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvidenceModalOpen(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-govteal-900 hover:bg-govteal-950 text-white rounded text-sm font-semibold transition"
                >
                  Submit Outcome Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   2. GOVERNMENT OFFICIAL DASHBOARD & VIEWS (ARJUN / MEERA)
   ========================================================== */
function OfficialDashboard({
  currentTab,
  setCurrentTab,
  currentUser,
  pilots,
  setPilots,
  procurements,
  setProcurements,
  showToast,
  selectedPilot,
  setSelectedPilot,
  adoptionModalOpen,
  setAdoptionModalOpen,
  sectorRules
}) {
  // Post Pilot Form States
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newSector, setNewSector] = useState("Water & Sanitation");
  const [newDesc, setNewDesc] = useState("");

  // Sponsor outcome states
  const [feedbackPilotId, setFeedbackPilotId] = useState(null);
  const [sponsorNotes, setSponsorNotes] = useState("");

  // Search & Registry Browse States
  const [browseQuery, setBrowseQuery] = useState("");
  const [browseSector, setBrowseSector] = useState("All");

  // Procurement Adopt states
  const [procureDept, setProcureDept] = useState(currentUser.department);
  const [procureBudget, setProcureBudget] = useState("");

  // Sponsoring filter
  const myPilots = pilots.filter(p => p.sponsoringOfficialId === currentUser.id);
  const myProcurements = procurements.filter(pr => pr.adoptingOfficialId === currentUser.id);

  const handlePostPilot = (e) => {
    e.preventDefault();
    if (!newTitle || !newBudget || !newDuration) {
      showToast("Please fill in all fields", "error");
      return;
    }
    const newPilot = {
      id: `p_${Date.now()}`,
      title: newTitle,
      department: currentUser.department,
      sponsoringOfficialId: currentUser.id,
      sponsoringOfficialName: currentUser.name,
      budgetCap: parseFloat(newBudget),
      durationDays: parseInt(newDuration),
      sector: newSector,
      description: newDesc,
      status: "Open",
      application: null,
      evidence: null,
      verification: null
    };

    setPilots(prev => [newPilot, ...prev]);
    setNewTitle("");
    setNewBudget("");
    setNewDuration("");
    setNewDesc("");
    setCurrentTab("dashboard");
    showToast(`New pilot opportunity "${newTitle}" posted!`, "success");
  };

  const handleSelectStartup = (pilotId, startupId) => {
    const updated = pilots.map(p => {
      if (p.id === pilotId) {
        return {
          ...p,
          status: "Running"
        };
      }
      return p;
    });
    setPilots(updated);
    showToast("Startup selected! Pilot is now in 'Running' status.", "success");
  };

  // Sponsoring official logs feedback
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const updated = pilots.map(p => {
      if (p.id === feedbackPilotId) {
        return {
          ...p,
          evidence: {
            ...p.evidence,
            sponsorFeedback: sponsorNotes
          }
        };
      }
      return p;
    });
    setPilots(updated);
    setFeedbackPilotId(null);
    setSponsorNotes("");
    showToast("Sponsor outcome feedback logged successfully. Verifier can now review.", "success");
  };

  // Scale Adoption Confirmation
  const handleConfirmAdoption = (e) => {
    e.preventDefault();
    if (!procureBudget) {
      showToast("Please enter the scaled procurement budget", "error");
      return;
    }
    const targetPilot = pilots.find(p => p.id === adoptionModalOpen);
    const newProc = {
      id: `pr_${Date.now()}`,
      pilotId: targetPilot.id,
      pilotTitle: targetPilot.title,
      sponsoringDepartment: targetPilot.department,
      adoptingOfficialId: currentUser.id,
      adoptingOfficialName: currentUser.name,
      adoptingDepartment: procureDept,
      scaledBudget: parseFloat(procureBudget),
      justification: `Fast-track scaled adoption approved for startup "${targetPilot.application.startupName}" based on certified pilot precedent PP-${targetPilot.application.dpiitNo}-2026. This procurement is executed with regulatory exemptions under General Financial Rules (GFR) 2017 Rule 170 (EMD exemption) and Rule 173 (relaxation of turnover & experience parameters for verified precedents).`,
      date: new Date().toISOString().split("T")[0]
    };

    setProcurements(prev => [newProc, ...prev]);
    setAdoptionModalOpen(null);
    setProcureBudget("");
    setCurrentTab("procurement-history");
    showToast("Scaled Procurement completed! Fast-track audit trail successfully compiled.", "success");
  };

  return (
    <div>
      {/* 1. DASHBOARD VIEW (SPONSOR MODE) */}
      {currentTab === "dashboard" && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:flex md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Official Sponsor Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Post new pilots, manage applications, and review running projects for <strong>{currentUser.department}</strong>.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button 
                onClick={() => setCurrentTab("post-pilot")}
                className="bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Post a Pilot
              </button>
            </div>
          </div>

          {/* Sponsoring List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Pilots Sponsored by My Department</h2>
            {myPilots.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold">No sponsored pilots.</p>
                <p className="text-xs text-slate-400">Click "Post a Pilot" to list your first technology opportunity.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-left font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-3">Pilot Opportunity</th>
                      <th className="px-6 py-3">Budget Cap</th>
                      <th className="px-6 py-3">Applicants / Proposal</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myPilots.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-bold block text-slate-900">{p.title}</span>
                          <span className="text-xs text-slate-400">Duration: {p.durationDays} Days</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">₹{p.budgetCap.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          {p.application ? (
                            <div>
                              <span className="font-bold text-govteal-900 block">{p.application.startupName}</span>
                              <span className="text-xs text-slate-500">Proposed: ₹{p.application.proposedCost.toLocaleString('en-IN')}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">No applicants yet</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {p.status === "Applied" && (
                              <button
                                onClick={() => handleSelectStartup(p.id, p.application.startupId)}
                                className="bg-govteal-950 hover:bg-govteal-900 text-white font-bold text-xs py-1.5 px-3 rounded transition"
                              >
                                Select Startup
                              </button>
                            )}
                            {p.status === "Completed" && !p.evidence?.sponsorFeedback && (
                              <button
                                onClick={() => {
                                  setFeedbackPilotId(p.id);
                                  setSponsorNotes("");
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 px-3 rounded"
                              >
                                Log Feedback
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPilot(p)}
                              className="text-govteal-900 hover:underline text-xs font-bold"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. POST A PILOT FORM */}
      {currentTab === "post-pilot" && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Post a Pilot Opportunity</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a low-budget, short-term pilot requirement to attract innovative startups.
            </p>
          </div>

          <form onSubmit={handlePostPilot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pilot Opportunity Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Acoustic Leak Telemetry Deployment in Pune Ward 12"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Budget Cap (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 800000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 90"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Innovation Sector</label>
              <select
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500"
              >
                {Object.keys(sectorRules).map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Problem Description & Scope</label>
              <textarea
                required
                rows={4}
                placeholder="Detail the technical challenge, target goals, deployment criteria, and telemetry expectations..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded text-[11px] text-slate-500">
              * Posted opportunities comply with the State procurement sandbox guidelines. Budgets must remain within departmental pilot authority limits.
            </div>

            <button
              type="submit"
              className="w-full bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2.5 rounded shadow transition"
            >
              Post Opportunity
            </button>
          </form>
        </div>
      )}

      {/* 3. BROWSE CERTIFIED PILOTS (ADOPT MODE) */}
      {currentTab === "browse-certified" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Certified Pilots Registry</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse pre-certified solutions deployed in other departments. Fast-track scale adoptions using built-in GFR 170/173 exemptions.
            </p>
          </div>

          {/* Filter row */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search technologies or startups..."
                value={browseQuery}
                onChange={(e) => setBrowseQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <select
              value={browseSector}
              onChange={(e) => setBrowseSector(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="All">All Sectors</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Energy & Cleantech">Energy & Cleantech</option>
            </select>
            <div className="flex justify-end items-center">
              <span className="text-xs text-slate-500 font-bold">
                {pilots.filter(p => p.status === "Certified").length} Certified Precedents Active
              </span>
            </div>
          </div>

          {/* Certified pilots list */}
          <div className="space-y-4">
            {pilots
              .filter(p => p.status === "Certified")
              .filter(p => browseQuery ? (p.title.toLowerCase().includes(browseQuery.toLowerCase()) || p.application.startupName.toLowerCase().includes(browseQuery.toLowerCase())) : true)
              .filter(p => browseSector !== "All" ? p.sector === browseSector : true)
              .map(p => (
                <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                  <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                        <Award className="w-3 h-3" /> Certified Precedent
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{p.sector}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                    <p className="text-xs text-slate-500">Rigorous pilot completed by <strong className="text-govteal-900">{p.application.startupName}</strong> at {p.department}.</p>
                    <p className="text-xs text-slate-600 line-clamp-2 italic">"{p.verification.notes}"</p>
                  </div>

                  {/* Audit Metrics */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Audited Outcome</p>
                    <p className="text-sm font-extrabold text-emerald-800">{p.evidence.waterLossReduction}</p>
                    <p className="text-xs text-slate-500">Duration: {p.evidence.duration} | Evaluator Score: {p.verification.score}/100</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex lg:flex-col gap-2 justify-end">
                    <button
                      onClick={() => setSelectedPilot(p)}
                      className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 px-3 rounded w-full text-center transition"
                    >
                      View Evidence Log
                    </button>
                    <button
                      onClick={() => setAdoptionModalOpen(p.id)}
                      className="bg-govteal-900 hover:bg-govteal-950 text-white font-bold text-xs py-2 px-3 rounded w-full text-center flex items-center justify-center gap-1 transition"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Adopt & Procure
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. PROCUREMENT HISTORY & AUDIT DEFENSE RECORD */}
      {currentTab === "procurement-history" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border-b-8 border-teal-500">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-teal-400 w-8 h-8" /> Audit Defense Procurement Record
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Official ledger of sponsored pilots and fast-track adoptions. This serves as your compliance shield, referencing legally established GFR 2017 exemptions to satisfy department auditors.
            </p>
          </div>

          {/* Section: Sponsored pilots list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">Sponsored Pilots Ledger</h2>
            {myPilots.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No pilots sponsored yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-2">Pilot Reference</th>
                      <th className="px-4 py-2">Sponsor cost</th>
                      <th className="px-4 py-2">Partner Startup</th>
                      <th className="px-4 py-2">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myPilots.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-950 block">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Ref ID: {p.id}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{p.application?.proposedCost?.toLocaleString('en-IN') || p.budgetCap.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-medium text-govteal-900">{p.application?.startupName || "Unassigned"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded ${
                            p.status === "Certified" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}>
                            {p.status === "Certified" ? "Verified Precedent" : p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Scale adoptions list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">Fast-Track Scaled Adoptions Ledger (Exemptions Utilized)</h2>
            {myProcurements.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No scaled adoptions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-2">Procurement Details</th>
                      <th className="px-4 py-2">Adoption Budget</th>
                      <th className="px-4 py-2">Original Department</th>
                      <th className="px-4 py-2">GFR Justification Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myProcurements.map(pr => (
                      <tr key={pr.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-extrabold text-slate-950 block">{pr.pilotTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Date: {pr.date} | Proc ID: {pr.id}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-teal-800">₹{pr.scaledBudget.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-xs">{pr.sponsoringDepartment}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-50 text-blue-800 text-[10px] font-mono font-bold px-2 py-1 rounded border border-blue-200 block w-max">
                            Rule 170 (EMD) / 173 (Exp)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. FEEDBACK LOG FORM MODAL */}
      {feedbackPilotId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900">Sponsor Feedback Form</h3>
              <button onClick={() => setFeedbackPilotId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">×</button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded text-xs space-y-1">
                <p><strong>Pilot:</strong> {pilots.find(p => p.id === feedbackPilotId)?.title}</p>
                <p><strong>Startup Outcome Claimed:</strong> {pilots.find(p => p.id === feedbackPilotId)?.evidence?.waterLossReduction}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department Feedback / Sponsor Verification Notes</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide feedback on startup compliance, delivery timeliness, resource responsiveness, and verify if the telemetry metrics align with internal telemetry data..."
                  value={sponsorNotes}
                  onChange={(e) => setSponsorNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackPilotId(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-govteal-900 hover:bg-govteal-950 text-white rounded text-sm font-semibold transition"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADOPT & PROCURE CONFIRMATION MODAL */}
      {adoptionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Fast-Track Scaled Procurement Adoption</h3>
                <p className="text-xs text-slate-500">Adopt and procure a certified pilot precedent directly.</p>
              </div>
              <button onClick={() => setAdoptionModalOpen(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">×</button>
            </div>

            <form onSubmit={handleConfirmAdoption} className="space-y-4">
              {/* Precedent Summary */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs space-y-1.5">
                <span className="font-bold text-emerald-800 uppercase tracking-wide block">✓ Certified Precedent Reference</span>
                <p><strong>Pilot Precedent:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.title}</p>
                <p><strong>Partner Startup:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.application.startupName}</p>
                <p><strong>Certified Metrics:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.evidence.waterLossReduction}</p>
                <p><strong>Verifier:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.verification.verifierName}</p>
              </div>

              {/* Auto Justification Display */}
              <div className="bg-slate-50 p-4 rounded border text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wide block">Auto-Generated Auditor Justification</span>
                <p className="text-slate-600 italic">
                  "This procurement of scaled solutions is fast-tracked under the State procurement sandbox policies. Based on verified outcomes (telemetry score: {pilots.find(p => p.id === adoptionModalOpen)?.verification.score}/100) executed for {pilots.find(p => p.id === adoptionModalOpen)?.department}, the vendor startup is exempted from EMD (General Financial Rules 2017 Rule 170) and prior experience/turnover relaxations are invoked (Rule 173)."
                </p>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Adopting Department</label>
                  <input
                    type="text"
                    required
                    value={procureDept}
                    onChange={(e) => setProcureDept(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Scaled Procurement Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2400000"
                    value={procureBudget}
                    onChange={(e) => setProcureBudget(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setAdoptionModalOpen(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold shadow transition flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Confirm & Execute Procurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPilot && (
        <PilotDetailModal 
          pilot={selectedPilot} 
          onClose={() => setSelectedPilot(null)} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

/* ==========================================================
   3. VERIFIER DASHBOARD & VIEWS (DR. KAVITA RAO)
   ========================================================== */
function VerifierDashboard({
  currentTab,
  setCurrentTab,
  currentUser,
  pilots,
  setPilots,
  showToast,
  selectedPilot,
  setSelectedPilot
}) {
  const [activePilotId, setActivePilotId] = useState(null); // pilot ID being evaluated
  const [score, setScore] = useState(90);
  const [notes, setNotes] = useState("");
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(true);
  const [c3, setC3] = useState(true);

  const pendingList = pilots.filter(p => p.status === "Completed");
  const verifiedHistory = pilots.filter(p => p.status === "Certified" || p.status === "Rejected");

  const handleVerifyAction = (statusOption) => {
    if (!notes.trim()) {
      showToast("Please provide evaluator notes before deciding", "error");
      return;
    }
    const updated = pilots.map(p => {
      if (p.id === activePilotId) {
        return {
          ...p,
          status: statusOption, // Certified or Rejected
          verification: {
            verifierId: currentUser.id,
            verifierName: currentUser.name,
            score: parseInt(score),
            scorecard: [
              { criterion: "≥15% measurable improvement", passed: c1 },
              { criterion: "pilot ran ≥60 days", passed: c2 },
              { criterion: "no safety incidents", passed: c3 }
            ],
            notes,
            certifiedAt: new Date().toISOString().split("T")[0]
          }
        };
      }
      return p;
    });
    setPilots(updated);
    setActivePilotId(null);
    setNotes("");
    showToast(`Pilot verification process complete: marked as ${statusOption}!`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Tab Nav */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setCurrentTab("pending")}
          className={`pb-2 text-sm font-bold transition ${
            currentTab === "pending" ? "border-b-2 border-govteal-900 text-govteal-900" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Pending Verifications ({pendingList.length})
        </button>
        <button
          onClick={() => setCurrentTab("history")}
          className={`pb-2 text-sm font-bold transition ${
            currentTab === "history" ? "border-b-2 border-govteal-900 text-govteal-900" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Verification History ({verifiedHistory.length})
        </button>
      </div>

      {/* 1. PENDING QUEUE */}
      {currentTab === "pending" && (
        <div className="space-y-6 animate-fade-in">
          {pendingList.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-lg">Verification Queue Cleared</p>
              <p className="text-sm mt-1 text-slate-400">All submitted pilots have been successfully audited.</p>
            </div>
          ) : (
            pendingList.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                      Awaiting Technical Audit
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-2">{p.title}</h3>
                    <p className="text-xs text-slate-500">Partner Startup: <strong className="text-govteal-900">{p.application.startupName}</strong> | Sector: {p.sector}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPilot(p)}
                    className="text-xs text-govteal-900 font-bold hover:underline"
                  >
                    View Full Evidence Details
                  </button>
                </div>

                {/* Compare outcomes side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded border">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Startup Outcome Submission</h4>
                    <ul className="text-xs space-y-1 text-slate-700">
                      <li><strong>Outcome claimed:</strong> {p.evidence.waterLossReduction}</li>
                      <li><strong>Duration:</strong> {p.evidence.duration}</li>
                      <li><strong>Assets:</strong> {p.evidence.sensorsDeployed}</li>
                      <li className="mt-2 text-slate-500">"{p.evidence.summary}"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sponsor Officer Feedback</h4>
                    {p.evidence.sponsorFeedback ? (
                      <p className="text-xs text-slate-700 italic">
                        "{p.evidence.sponsorFeedback}"
                      </p>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold bg-amber-50 p-1.5 rounded block">
                        ⏳ Sponsoring official has not logged feedback comments yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Open scorecard action */}
                {activePilotId !== p.id ? (
                  <button
                    onClick={() => {
                      setActivePilotId(p.id);
                      setNotes("");
                      setScore(90);
                    }}
                    className="bg-govteal-900 hover:bg-govteal-950 text-white font-bold text-xs py-2 px-4 rounded transition"
                  >
                    Evaluate & Complete Audit
                  </button>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-lg border-2 border-govteal-900 space-y-5 animate-slide-up">
                    <h4 className="font-extrabold text-sm text-slate-900 border-b pb-1">TECHNICAL EVALUATOR SCORECARD</h4>
                    
                    {/* Scorecard checklist */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500">Verify Sector Criteria templates:</p>
                      
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={c1} onChange={(e) => setC1(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
                        <span>Metric Exceeded (≥15% measurable improvement logged)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={c2} onChange={(e) => setC2(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
                        <span>Execution period compliant (pilot ran ≥60 days)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={c3} onChange={(e) => setC3(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
                        <span>Security & stability compliance (zero safety incidents reported)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Evaluator Score (0-100)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="flex-grow accent-govteal-900"
                          />
                          <span className="font-bold text-sm text-slate-900 w-10 text-right">{score}/100</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1 font-semibold">Technical Auditor Endorsement Notes</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write detailed assessment. Detail outcome precision, stability and replicability for scaling..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setActivePilotId(null)}
                        className="border border-slate-300 text-slate-600 py-1.5 px-3 rounded text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleVerifyAction("Rejected")}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded text-xs"
                      >
                        Reject Pilot
                      </button>
                      <button
                        onClick={() => handleVerifyAction("Certified")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-xs"
                      >
                        Certify Precedent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. VERIFIED HISTORY */}
      {currentTab === "history" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Past Audit Ledger Decisions</h2>
          {verifiedHistory.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-6">No audits processed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Pilot Details</th>
                    <th className="px-6 py-3">Partner Startup</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Decision</th>
                    <th className="px-6 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {verifiedHistory.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-950 block">{p.title}</span>
                        <span className="text-xs text-slate-400">Sector: {p.sector}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-govteal-900">{p.application.startupName}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{p.verification?.score}/100</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          p.status === "Certified" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPilot(p)}
                          className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedPilot && (
        <PilotDetailModal 
          pilot={selectedPilot} 
          onClose={() => setSelectedPilot(null)} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

/* ==========================================================
   4. ADMIN / NODAL BODY DASHBOARD & VIEWS (MSINS ADMIN)
   ========================================================== */
function AdminDashboard({
  currentTab,
  setCurrentTab,
  currentUser,
  pilots,
  setPilots,
  procurements,
  verifiers,
  setVerifiers,
  onboardingRequests,
  setOnboardingRequests,
  users,
  setUsers,
  sectorRules,
  setSectorRules,
  showToast
}) {
  // Verifier creation states
  const [vName, setVName] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vSector, setVSector] = useState("Water & Sanitation");
  const [vState, setVState] = useState("Maharashtra");

  // Rule creation states
  const [activeRuleSector, setActiveRuleSector] = useState("Water & Sanitation");
  const [newRuleCriterion, setNewRuleCriterion] = useState("");

  // Search states for registry oversight
  const [oversightQuery, setOversightQuery] = useState("");

  // Analytics Headline Numbers
  const totalPilotsCount = pilots.length;
  const certifiedCount = pilots.filter(p => p.status === "Certified").length;
  const scaleAdoptionsCount = procurements.length;
  
  // Total Contract value calculations
  const totalPilotValue = pilots.reduce((acc, curr) => acc + (curr.application?.proposedCost || curr.budgetCap), 0);
  const totalProcurementValue = procurements.reduce((acc, curr) => acc + curr.scaledBudget, 0);
  const totalValueUnlocked = totalPilotValue + totalProcurementValue;

  const handleAddVerifier = (e) => {
    e.preventDefault();
    if (!vName || !vEmail) {
      showToast("Verifier name and email are required", "error");
      return;
    }
    const newV = {
      id: `v_${Date.now()}`,
      name: vName,
      sector: vSector,
      state: vState
    };

    // Add to verifiers list
    setVerifiers(prev => [...prev, newV]);
    
    // Add to login users list as a valid credentials object
    const userKey = `verifier_${Date.now()}`;
    setUsers(prev => ({
      ...prev,
      [userKey]: {
        id: userKey,
        name: vName,
        email: vEmail,
        role: "Verifier",
        organization: `${vState} Technical Evaluation Agency`,
        sector: vSector
      }
    }));

    setVName("");
    setVEmail("");
    showToast(`Verifier "${vName}" onboarded and credential registered!`, "success");
  };

  const handleApproveOfficial = (reqId) => {
    const targetReq = onboardingRequests.find(r => r.id === reqId);
    const userKey = `official_${Date.now()}`;
    const newOfficer = {
      id: userKey,
      name: targetReq.name,
      email: targetReq.email,
      role: "Government Official",
      department: targetReq.department,
      designation: targetReq.designation,
      employeeId: targetReq.employeeId,
      status: "Approved"
    };

    setUsers(prev => ({ ...prev, [userKey]: newOfficer }));
    setOnboardingRequests(prev => prev.filter(r => r.id !== reqId));
    showToast(`Account approved for ${targetReq.name} (${targetReq.department})`, "success");
  };

  const handleRejectOfficial = (reqId) => {
    setOnboardingRequests(prev => prev.filter(r => r.id !== reqId));
    showToast("Official registration request rejected.", "info");
  };

  const handleAddCriterion = (e) => {
    e.preventDefault();
    if (!newRuleCriterion.trim()) return;

    setSectorRules(prev => ({
      ...prev,
      [activeRuleSector]: [...prev[activeRuleSector], newRuleCriterion]
    }));
    setNewRuleCriterion("");
    showToast("Success criteria checklist item added", "success");
  };

  const handleRemoveCriterion = (sector, index) => {
    const list = [...sectorRules[sector]];
    list.splice(index, 1);
    setSectorRules(prev => ({
      ...prev,
      [sector]: list
    }));
    showToast("Checklist item removed", "info");
  };

  return (
    <div className="space-y-6">
      {/* Internal Navigation Tabs */}
      <div className="flex gap-3 overflow-x-auto border-b pb-2 scrollbar-hide text-sm">
        <TabButton active={currentTab === "analytics"} label="System Analytics" onClick={() => setCurrentTab("analytics")} icon={<BarChart3 className="w-4 h-4" />} />
        <TabButton active={currentTab === "verifiers"} label="Verifier Management" onClick={() => setCurrentTab("verifiers")} icon={<Users className="w-4 h-4" />} />
        <TabButton active={currentTab === "onboarding"} label={`Official Approvals (${onboardingRequests.length})`} onClick={() => setCurrentTab("onboarding")} icon={<UserCheck className="w-4 h-4" />} />
        <TabButton active={currentTab === "rules"} label="Success Criteria Rules" onClick={() => setCurrentTab("rules")} icon={<Settings className="w-4 h-4" />} />
        <TabButton active={currentTab === "oversight"} label="Registry Oversight" onClick={() => setCurrentTab("oversight")} icon={<Database className="w-4 h-4" />} />
      </div>

      {/* 1. SYSTEM ANALYTICS */}
      {currentTab === "analytics" && (
        <div className="space-y-8 animate-fade-in">
          {/* Headlines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Building className="text-slate-500 w-5 h-5" />} label="Total Pilots Initiated" value={totalPilotsCount} bg="bg-white border" />
            <StatCard icon={<Award className="text-emerald-600 w-5 h-5" />} label="Certified Precedents" value={certifiedCount} bg="bg-white border" />
            <StatCard icon={<CheckCircle className="text-blue-600 w-5 h-5" />} label="Procurement Adoptions" value={scaleAdoptionsCount} bg="bg-white border" />
            <div className="bg-gradient-to-br from-govteal-900 to-govteal-950 text-white rounded-xl p-5 shadow-md flex flex-col justify-between">
              <span className="text-xs uppercase font-bold text-govteal-200 tracking-wider">Procurement Value Unlocked</span>
              <span className="text-2xl font-black mt-2">₹{totalValueUnlocked.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-teal-300 font-bold mt-1">✓ Local Economy Scaling Booster</span>
            </div>
          </div>

          {/* SVG Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Pilots by status */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide mb-6">Pilots Breakdown by Audit Status</h3>
              
              {/* Vertical SVG Bar Chart */}
              <div className="flex flex-col space-y-4">
                <BarItem label="Certified" value={pilots.filter(p => p.status === "Certified").length} max={totalPilotsCount} color="bg-emerald-500" />
                <BarItem label="Running" value={pilots.filter(p => p.status === "Running").length} max={totalPilotsCount} color="bg-blue-500" />
                <BarItem label="Completed" value={pilots.filter(p => p.status === "Completed").length} max={totalPilotsCount} color="bg-amber-500" />
                <BarItem label="Applied" value={pilots.filter(p => p.status === "Applied").length} max={totalPilotsCount} color="bg-slate-400" />
                <BarItem label="Open opportunities" value={pilots.filter(p => p.status === "Open").length} max={totalPilotsCount} color="bg-teal-700" />
              </div>
            </div>

            {/* Chart 2: Scaled Procurements Over Time */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide mb-4">Scaled Procurements & Justifications</h3>
                <p className="text-xs text-slate-500">Track GFR 170/173 exemptions implemented for procurement.</p>
              </div>

              {/* Cumulative adoptions-over-time line chart (pure SVG, no chart lib) */}
              <AdoptionsLineChart procurements={procurements} />

              <div className="bg-slate-50 p-4 rounded border text-xs space-y-2 mt-4">
                <div className="flex justify-between font-bold border-b pb-1">
                  <span>Adoption Department</span>
                  <span>Scaled Amount</span>
                </div>
                {procurements.map(pr => (
                  <div key={pr.id} className="flex justify-between">
                    <span>{pr.adoptingDepartment}</span>
                    <span className="font-semibold text-teal-800">₹{pr.scaledBudget.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFIER MANAGEMENT */}
      {currentTab === "verifiers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* List of current verifiers */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b pb-2">Active Technical Verifiers</h3>
            <div className="divide-y divide-slate-100">
              {verifiers.map(v => (
                <div key={v.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{v.name}</h4>
                    <p className="text-xs text-slate-500">Domain: {v.sector} | Region: {v.state}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    Technical Auditor
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form to add a verifier */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-max">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Technical Verifier</h3>
            <form onSubmit={handleAddVerifier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Verifier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavita Rao"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Official Email ID</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kavita.rao@twiab.org"
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Evaluator Sector</label>
                <select
                  value={vSector}
                  onChange={(e) => setVSector(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Energy & Cleantech">Energy & Cleantech</option>
                  <option value="Healthcare & Medtech">Healthcare & Medtech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">State Nodal Authority</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={vState}
                  onChange={(e) => setVState(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2 rounded text-sm transition"
              >
                Add Verifier Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. DEPARTMENT ONBOARDING APPROVALS */}
      {currentTab === "onboarding" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h3 className="font-bold text-slate-900 text-lg border-b pb-2 mb-4">Official Department Registration Requests</h3>
          
          {onboardingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic">
              No pending registration approvals.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {onboardingRequests.map(r => (
                <div key={r.id} className="py-4 sm:flex sm:justify-between sm:items-center">
                  <div className="space-y-1">
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                      Pending Approvals
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">{r.name}</h4>
                    <p className="text-xs text-slate-600">
                      Designation: <strong>{r.designation}</strong> at <strong>{r.department}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">Email: {r.email} | Emp ID: {r.employeeId}</p>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleRejectOfficial(r.id)}
                      className="border border-slate-300 text-slate-600 font-semibold px-4 py-1.5 rounded text-xs hover:bg-slate-50 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveOfficial(r.id)}
                      className="bg-govteal-900 hover:bg-govteal-950 text-white font-bold px-4 py-1.5 rounded text-xs transition"
                    >
                      Approve Official
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SECTOR CRITERIA RULES */}
      {currentTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Rules List */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-lg border-b pb-2">Technical Success Criteria Templates</h3>
            
            {Object.keys(sectorRules).map(sector => (
              <div key={sector} className="space-y-2">
                <h4 className="font-extrabold text-sm text-govteal-900 border-l-4 border-govteal-900 pl-2 uppercase tracking-wide">
                  {sector}
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded border">
                  {sectorRules[sector].map((criterion, idx) => (
                    <li key={idx} className="flex justify-between items-center py-1">
                      <span>• {criterion}</span>
                      <button
                        onClick={() => handleRemoveCriterion(sector, idx)}
                        className="text-rose-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Add rules form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-max">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Sector Criterion</h3>
            <form onSubmit={handleAddCriterion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Sector</label>
                <select
                  value={activeRuleSector}
                  onChange={(e) => setActiveRuleSector(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Energy & Cleantech">Energy & Cleantech</option>
                  <option value="Healthcare & Medtech">Healthcare & Medtech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Criterion Text</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pilot ran ≥90 days"
                  value={newRuleCriterion}
                  onChange={(e) => setNewRuleCriterion(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-govteal-900 hover:bg-govteal-950 text-white font-bold py-2 rounded text-sm transition"
              >
                Add Criterion Template
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. REGISTRY OVERSIGHT */}
      {currentTab === "oversight" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-900 text-lg">Registry Master Oversight Table</h3>
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search registry..."
                value={oversightQuery}
                onChange={(e) => setOversightQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3">ID / Reference</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Associated Entities</th>
                  <th className="px-4 py-3">Financial Value</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Render Pilots */}
                {pilots
                  .filter(p => oversightQuery ? (p.title.toLowerCase().includes(oversightQuery.toLowerCase()) || p.department.toLowerCase().includes(oversightQuery.toLowerCase())) : true)
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{p.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ref ID: {p.id}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold uppercase text-slate-400">PILOT ({p.sector})</td>
                      <td className="px-4 py-3">
                        <p><strong>Department:</strong> {p.department}</p>
                        <p><strong>Startup:</strong> {p.application?.startupName || "None Selected"}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{p.application?.proposedCost?.toLocaleString('en-IN') || p.budgetCap.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}

                {/* Render Procurements */}
                {procurements
                  .filter(pr => oversightQuery ? (pr.pilotTitle.toLowerCase().includes(oversightQuery.toLowerCase()) || pr.adoptingDepartment.toLowerCase().includes(oversightQuery.toLowerCase())) : true)
                  .map(pr => (
                    <tr key={pr.id} className="bg-emerald-50/20 hover:bg-emerald-50/40">
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-950 block">{pr.pilotTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Adoption ID: {pr.id}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-800 uppercase">SCALED PROCUREMENT</td>
                      <td className="px-4 py-3">
                        <p><strong>Adopter:</strong> {pr.adoptingDepartment}</p>
                        <p><strong>Original Agency:</strong> {pr.sponsoringDepartment}</p>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-teal-800">₹{pr.scaledBudget.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          Adopted Exemption
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub components for Admin
function TabButton({ active, label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
        active 
          ? "bg-govteal-900 text-white shadow-sm" 
          : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AdoptionsLineChart({ procurements }) {
  // Cumulative count of scaled adoptions plotted against their recorded dates.
  const points = [...procurements]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((pr, i) => ({ date: pr.date, cumulative: i + 1 }));

  if (points.length === 0) {
    return (
      <div className="mt-4 h-40 flex items-center justify-center bg-slate-50 rounded border text-xs text-slate-400">
        No scaled adoptions recorded yet.
      </div>
    );
  }

  const W = 380, H = 150, PAD = 28;
  const maxY = Math.max(2, points[points.length - 1].cumulative);
  const x = (i) => PAD + (points.length === 1 ? (W - 2 * PAD) / 2 : (i * (W - 2 * PAD)) / (points.length - 1));
  const y = (v) => H - PAD - (v / maxY) * (H - 2 * PAD);
  const path = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(pt.cumulative)}`).join(" ");
  const area = `${path} L ${x(points.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;

  return (
    <div className="mt-4 bg-slate-50 rounded border p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        Cumulative Scaled Adoptions Over Time
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" role="img" aria-label="Cumulative scaled adoptions over time">
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={y(maxY * f)} y2={y(maxY * f)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        <text x={4} y={y(maxY) + 4} fontSize="9" fill="#94a3b8">{maxY}</text>
        <text x={4} y={y(0) + 4} fontSize="9" fill="#94a3b8">0</text>
        <path d={area} fill="#1F4E5C" opacity="0.10" />
        <path d={path} fill="none" stroke="#1F4E5C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((pt, i) => (
          <g key={pt.date + i}>
            <circle cx={x(i)} cy={y(pt.cumulative)} r="3.5" fill="#1F4E5C" />
            <text x={x(i)} y={H - PAD + 14} fontSize="8" fill="#64748b" textAnchor="middle">{pt.date}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarItem({ label, value, max, color }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900 font-bold">{value}</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/* ==========================================================
   GENERAL COMPONENT STUBS & DETAILS MODAL
   ========================================================== */

function StatCard({ icon, label, value, bg = "bg-white" }) {
  return (
    <div className={`${bg} rounded-xl p-5 shadow-sm border border-slate-150 flex items-center justify-between`}>
      <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
        <span className="text-2xl font-extrabold text-slate-900 block mt-1">{value}</span>
      </div>
      <div className="p-2.5 bg-white shadow-sm rounded-lg border border-slate-100">
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Open: "bg-slate-100 text-slate-600 border-slate-200",
    Applied: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Running: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-amber-50 text-amber-700 border-amber-200",
    Certified: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200"
  };
  const colorClass = colors[status] || "bg-slate-100 text-slate-600";

  return (
    <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${colorClass}`}>
      {status === "Completed" ? "Completed (Pending Audit)" : status}
    </span>
  );
}

function PilotDetailModal({ pilot, onClose, currentUser }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={pilot.status} />
              <span className="text-xs text-slate-500 font-semibold">{pilot.sector}</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-950 mt-1">{pilot.title}</h3>
            <p className="text-xs text-slate-400 font-medium">Ref ID: {pilot.id} | Budget Cap: ₹{pilot.budgetCap.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-sm text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Problem Description</h4>
            <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded">{pilot.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sponsoring Body</h4>
              <p className="text-xs font-bold text-slate-800">{pilot.department}</p>
              <p className="text-[11px] text-slate-500">Officer: {pilot.sponsoringOfficialName}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Execution Period</h4>
              <p className="text-xs font-bold text-slate-800">{pilot.durationDays} Days</p>
            </div>
          </div>

          {/* Proposal/Application block */}
          {pilot.application && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Startup Application Details</h4>
                <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">DPIIT Verified</span>
              </div>
              <p className="text-xs"><strong>Startup Entity:</strong> {pilot.application.startupName} (DPIIT ID: {pilot.application.dpiitNo})</p>
              <p className="text-xs"><strong>Proposed Pilot Cost:</strong> ₹{pilot.application.proposedCost.toLocaleString('en-IN')}</p>
              <p className="text-xs bg-white p-2.5 rounded border leading-relaxed text-slate-600"><strong>Scope of Work:</strong> {pilot.application.proposedScope}</p>
            </div>
          )}

          {/* Outcome Evidence block */}
          {pilot.evidence && (
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 border-b pb-1">Outcome Evidence Log</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>Outcome Metric:</strong> <span className="font-bold text-teal-800">{pilot.evidence.waterLossReduction}</span>
                </div>
                <div>
                  <strong>Assets Deployed:</strong> {pilot.evidence.sensorsDeployed}
                </div>
              </div>
              <p className="text-xs bg-white p-2.5 rounded border text-slate-600"><strong>Telemetry Narrative:</strong> {pilot.evidence.summary}</p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-mono text-slate-400">File: {pilot.evidence.docs}</span>
                <span className="text-[10px] text-slate-400">Submitted: {pilot.evidence.submittedAt}</span>
              </div>
              {pilot.evidence.sponsorFeedback && (
                <div className="bg-slate-100 p-2.5 rounded border mt-2 text-xs">
                  <strong>Sponsor Official Feedback:</strong>
                  <p className="italic text-slate-600 mt-1">"{pilot.evidence.sponsorFeedback}"</p>
                </div>
              )}
            </div>
          )}

          {/* Verification block */}
          {pilot.verification && (
            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b pb-1">Technical Audit & Certification Details</h4>
              <p className="text-xs"><strong>Technical Score:</strong> <span className="font-bold text-emerald-700 text-sm">{pilot.verification.score}/100</span></p>
              
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Verification criteria checklist</p>
                <div className="space-y-1 text-xs font-semibold">
                  {pilot.verification.scorecard.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      {c.passed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      <span className={c.passed ? "text-emerald-800" : "text-rose-800"}>{c.criterion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs bg-white p-2.5 rounded border italic text-slate-600">"{pilot.verification.notes}"</p>
              <p className="text-[10px] font-bold text-slate-500">Certified by: {pilot.verification.verifierName} on {pilot.verification.certifiedAt}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-4 rounded text-xs transition"
          >
            Close Detail Panel
          </button>
        </div>
      </div>
    </div>
  );
}
