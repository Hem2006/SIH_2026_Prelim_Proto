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
  ExternalLink,
  Menu,
  Bell,
  ChevronDown,
  Home,
  Compass,
  Eye,
  EyeOff,
  X,
  Activity,
  PieChart,
  Handshake,
  Printer,
  CreditCard,
  Receipt,
  ScrollText
} from "lucide-react";
import {
  initialUsers,
  initialPilots,
  initialProcurements,
  initialVerifiers,
  initialOnboardingRequests,
  initialSectorRules,
  OTHER_SECTOR,
  createPilotEscrow
} from "./data/seedData";

/* There is no backend — every tab starts from the same seed data in its own
   isolated React state. Mirroring the shared "registry" slices (not session
   state like currentUser) into localStorage, plus listening for the native
   `storage` event, lets multiple tabs of the same browser act like they're
   looking at the same live system: an official selecting a startup in one
   tab shows up in a verifier's queue in another, without a refresh. The
   `storage` event only ever fires in *other* tabs than the one that wrote
   the value, so this can't loop back on itself. */
const SANDBOX_STORAGE_KEY = "aarambh_sandbox_state_v1";

const loadStoredSandboxState = () => {
  try {
    const raw = window.localStorage.getItem(SANDBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getPilotApplications = (pilot) => {
  if (!pilot) return [];
  if (Array.isArray(pilot.applications) && pilot.applications.length > 0) {
    return pilot.applications;
  }
  if (pilot.application) {
    return [{
      ...pilot.application,
      status: pilot.application.status || (pilot.status === "Running" || pilot.status === "Completed" || pilot.status === "Certified" ? "Selected" : "Pending")
    }];
  }
  return [];
};

export default function App() {
  // App state — each seeded from localStorage if another tab already wrote a
  // sandbox session, so a freshly opened tab joins the same running demo
  // instead of resetting everyone back to the seed data.
  const [users, setUsers] = useState(() => loadStoredSandboxState()?.users || initialUsers);
  const [pilots, setPilots] = useState(() => loadStoredSandboxState()?.pilots || initialPilots);
  const [procurements, setProcurements] = useState(() => loadStoredSandboxState()?.procurements || initialProcurements);
  const [verifiers, setVerifiers] = useState(() => loadStoredSandboxState()?.verifiers || initialVerifiers);
  const [onboardingRequests, setOnboardingRequests] = useState(() => loadStoredSandboxState()?.onboardingRequests || initialOnboardingRequests);
  const [sectorRules, setSectorRules] = useState(() => loadStoredSandboxState()?.sectorRules || initialSectorRules);

  // Active session
  const [currentUser, setCurrentUser] = useState(null); // starts at login screen
  const [activeRole, setActiveRole] = useState(null); // 'Startup', 'Government Official', 'Verifier', 'Admin'
  const [currentTab, setCurrentTab] = useState("dashboard"); // dashboard, opportunities, passport, etc.

  // UI state
  const [registrationMode, setRegistrationMode] = useState(null); // 'startup' or 'official'
  const [selectedPilot, setSelectedPilot] = useState(null); // for detail modals
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(null); // pilot id to upload evidence
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(null); // pilot id to adopt
  const [docketModalData, setDocketModalData] = useState(null); // pilot or procurement data for CVC Audit Docket
  const [contractModalData, setContractModalData] = useState(null); // procurement or pilot data for Contract Agreement Viewer
  const [toast, setToast] = useState(null);

  // Sidebar state

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Mirror the shared registry into localStorage on every change, so other
  // tabs of this browser can pick it up. Session state (who's logged in,
  // which tab is open) deliberately stays out of this — each tab keeps its
  // own role so testing an official and a verifier side by side works.
  useEffect(() => {
    try {
      window.localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify({
        users, pilots, procurements, verifiers, onboardingRequests, sectorRules
      }));
    } catch {
      // Private browsing / storage disabled — the tab still works, it just
      // won't sync with others.
    }
  }, [users, pilots, procurements, verifiers, onboardingRequests, sectorRules]);

  // Pick up changes another tab just wrote. `storage` only fires in tabs
  // other than the one that made the change, so this can't echo back.
  useEffect(() => {
    const handleExternalUpdate = (e) => {
      if (e.key !== SANDBOX_STORAGE_KEY || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue);
        if (next.users) setUsers(next.users);
        if (next.pilots) setPilots(next.pilots);
        if (next.procurements) setProcurements(next.procurements);
        if (next.verifiers) setVerifiers(next.verifiers);
        if (next.onboardingRequests) setOnboardingRequests(next.onboardingRequests);
        if (next.sectorRules) setSectorRules(next.sectorRules);
        showToast("Synced an update from another open tab.", "info");
      } catch {
        // Malformed write from another tab — ignore rather than crash.
      }
    };
    window.addEventListener("storage", handleExternalUpdate);
    return () => window.removeEventListener("storage", handleExternalUpdate);
  }, []);

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
    setDocketModalData(null);
    setContractModalData(null);
    setSelectedPilot(null);
    showToast("Application state reset to original seed data", "info");
  };

  // Switch Active User / Role
  const handleLogin = (userKey) => {
    const user = users[userKey];
    setCurrentUser(user);
    setActiveRole(user.role);
    setRegistrationMode(null);
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

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
  };

  const getNavItems = () => {
    if (activeRole === "Startup") return [
      { label: "Dashboard", short: "Home", tab: "dashboard", icon: <Home className="w-4 h-4" /> },
      { label: "Discover Pilots", short: "Pilots", tab: "opportunities", icon: <Compass className="w-4 h-4" /> },
      { label: "PFMS Escrow Tracker", short: "Escrow", tab: "escrow", icon: <CreditCard className="w-4 h-4" /> },
      { label: "My Pilot Passport", short: "Passport", tab: "passport", icon: <Award className="w-4 h-4" /> },
    ];
    if (activeRole === "Government Official") return [
      { label: "Sponsor Hub", short: "Hub", tab: "dashboard", icon: <Home className="w-4 h-4" /> },
      { label: "Post a Pilot", short: "Post", tab: "post-pilot", icon: <Plus className="w-4 h-4" /> },
      { label: "Browse Certified", short: "Certified", tab: "browse-certified", icon: <Award className="w-4 h-4" /> },
      { label: "Audit Defense Record", short: "Audit", tab: "procurement-history", icon: <ShieldCheck className="w-4 h-4" /> },
    ];
    if (activeRole === "Verifier") return [
      { label: "Pending Verifications", short: "Pending", tab: "pending", icon: <Clock className="w-4 h-4" /> },
      { label: "Verification History", short: "History", tab: "history", icon: <CheckCircle className="w-4 h-4" /> },
    ];
    if (activeRole === "Admin") return [
      { label: "System Analytics", short: "Stats", tab: "analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "Verifier Management", short: "Verifiers", tab: "verifiers", icon: <Users className="w-4 h-4" /> },
      { label: "Official Approvals", short: "Approvals", tab: "onboarding", icon: <UserCheck className="w-4 h-4" /> },
      { label: "Success Criteria", short: "Criteria", tab: "rules", icon: <Settings className="w-4 h-4" /> },
      { label: "Registry Oversight", short: "Registry", tab: "oversight", icon: <Database className="w-4 h-4" /> },
    ];
    return [];
  };

  return (
    <div className="min-h-screen bg-sand font-sans">
      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="min-h-screen flex flex-col">
        {/* ===== TOP NAVIGATION (only when logged in) ===== */}
        {currentUser && (
          <header className="sticky top-0 z-40 shadow-sm">
            {/* 1 — state masthead */}
            <div className="bg-sidebar-darker text-blue-100/70 text-[10px] px-4 py-1 flex items-center justify-between">
              <span className="uppercase tracking-[0.14em] font-semibold flex items-center gap-2 min-w-0">
                <StateSeal size={16} />
                <span className="hidden sm:inline">Government of Maharashtra &middot; Urban Development Department</span>
                <span className="sm:hidden truncate">Govt. of Maharashtra</span>
              </span>
              <span className="hidden md:inline font-mono">
                GFR 2017 &middot; Rules 166 / 170 / 173
              </span>
            </div>

            {/* 2 — identity bar */}
            <div className="bg-sidebar px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-x-3 sm:gap-x-4 gap-y-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-shrink">
                <StateSeal size={32} />
                <div className="leading-none min-w-0">
                  <span className="font-display font-extrabold text-white text-[15px] tracking-wide block truncate">AARAMBH</span>
                  <span className="hidden sm:block text-[9px] text-blue-100/70 tracking-widest uppercase mt-0.5 truncate">
                    Govt. of Maharashtra &middot; MSInS
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleLogin(e.target.value)}
                    className="bg-white/10 text-white text-xs border border-white/20 rounded px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sidebar-accent font-medium appearance-none pr-7 max-w-[150px] sm:max-w-none truncate"
                  >
                    <option disabled className="text-slate-700">Switch Role/User...</option>
                    <option value="ram" className="text-slate-700">Ram (Startup)</option>
                    <option value="arjun" className="text-slate-700">Arjun (Official - Pune)</option>
                    <option value="meera" className="text-slate-700">Meera (Official - Nagpur)</option>
                    <option value="kavita" className="text-slate-700">Dr. Kavita (Verifier)</option>
                    <option value="admin" className="text-slate-700">MSInS Admin</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-blue-100/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-white/15">
                  <div className="text-right leading-tight">
                    <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[10px] text-blue-100/70">
                      {currentUser.startupName || currentUser.department || currentUser.organization || currentUser.role}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-sidebar-active flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                  <button
                    onClick={handleResetData}
                    title="Reset sandbox data"
                    className="text-blue-100/70 hover:text-white transition p-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="text-blue-100/75 hover:text-rose-300 transition p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3 — section tabs */}
            <div className="relative bg-white hidden sm:block">
            <nav className="border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto scrollbar-thin scroll-smooth">
              <span className="hidden sm:block text-[10px] font-bold text-sidebar-active uppercase tracking-widest pr-4 mr-1 border-r border-slate-200 py-3 flex-shrink-0">
                {activeRole}
              </span>
              {getNavItems().map(item => (
                <button
                  key={item.tab}
                  onClick={() => handleNavClick(item.tab)}
                  className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    currentTab === item.tab
                      ? "border-sidebar-active text-sidebar font-semibold"
                      : "border-transparent text-slate-500 hover:text-sidebar hover:border-slate-300"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            {/* the tab strip scrolls on narrow screens — fade the edge so that reads as swipeable */}
            <div className="sm:hidden pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/85 to-transparent" />
            </div>
          </header>
        )}

        {/* ===== PHONE TAB BAR =====
            Phones get a floating capsule at the thumb end instead of the desktop
            tab strip; the strip above is hidden below `sm`. Translucent over the
            page so scrolled content shows through, and it sits above the iOS home
            indicator via safe-area inset. */}
        {currentUser && (
          <nav
            className="sm:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none print:hidden"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
            aria-label="Primary"
          >
            <div className="pointer-events-auto mx-auto w-fit max-w-[calc(100vw-20px)] flex items-center gap-0.5 px-1.5 py-1.5 rounded-[26px] bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_28px_rgba(10,40,54,0.16)]">
              {getNavItems().map(item => {
                const active = currentTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleNavClick(item.tab)}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-[20px] px-3 py-1.5 min-w-[58px] transition-colors ${
                      active ? "bg-sidebar text-white" : "text-slate-500 active:bg-slate-500/10"
                    }`}
                  >
                    {React.cloneElement(item.icon, { className: "w-[19px] h-[19px]" })}
                    <span className="text-[10px] font-semibold leading-none tracking-tight">
                      {item.short || item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className={currentUser ? "flex-grow p-4 sm:p-6 pb-28 sm:pb-6" : "flex-grow"}>
          {toast && (
            <div className={`fixed bottom-24 sm:bottom-5 right-4 sm:right-5 left-4 sm:left-auto z-[60] p-3.5 rounded-lg shadow-lg text-white flex items-center gap-3 max-w-sm border text-sm ${
              toast.type === "success" ? "bg-emerald-600 border-emerald-500" :
              toast.type === "info" ? "bg-sidebar border-sidebar-light" : "bg-rose-600 border-rose-500"
            }`}>
              {toast.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <div>
                <p className="font-semibold text-xs">Notification</p>
                <p className="text-xs opacity-90">{toast.message}</p>
              </div>
            </div>
          )}

          {!currentUser ? (
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
                handleResetData={handleResetData}
              />
            )
          ) : (
            <div>
              {activeRole === "Startup" && (
                <StartupDashboard
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  currentUser={currentUser}
                  pilots={pilots}
                  setPilots={setPilots}
                  procurements={procurements}
                  setProcurements={setProcurements}
                  setDocketModalData={setDocketModalData}
                  setContractModalData={setContractModalData}
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
                  setDocketModalData={setDocketModalData}
                  setContractModalData={setContractModalData}
                  showToast={showToast}
                  selectedPilot={selectedPilot}
                  setSelectedPilot={setSelectedPilot}
                  adoptionModalOpen={adoptionModalOpen}
                  setAdoptionModalOpen={setAdoptionModalOpen}
                  sectorRules={sectorRules}
                  setSectorRules={setSectorRules}
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
                  sectorRules={sectorRules}
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

        {docketModalData && (
          <AuditDocketModal
            data={docketModalData}
            pilots={pilots}
            procurements={procurements}
            onClose={() => setDocketModalData(null)}
            showToast={showToast}
          />
        )}

        {contractModalData && (
          <ContractDetailsModal
            data={contractModalData}
            pilots={pilots}
            procurements={procurements}
            currentUser={currentUser}
            onClose={() => setContractModalData(null)}
            showToast={showToast}
            onAcceptOffer={(procId) => {
              setProcurements(prev => prev.map(pr => pr.id === procId ? { ...pr, status: "Accepted" } : pr));
              setContractModalData(null);
              showToast("Agreement signed! Scaled procurement contract legally executed under GFR 170/173.", "success");
            }}
            onDeclineOffer={(procId) => {
              setProcurements(prev => prev.map(pr => pr.id === procId ? { ...pr, status: "Declined" } : pr));
              setContractModalData(null);
              showToast("Adoption offer declined.", "info");
            }}
          />
        )}

        {/* Footer — the signed-out landing page carries its own */}
        {currentUser && (
        <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
          <div className="px-6 text-center sm:flex sm:justify-between sm:items-center">
            <p className="text-xs text-slate-400">
              &copy; 2026 Aarambh Hub &mdash; Maharashtra State Innovation Society (MSInS) &amp; DPIIT
            </p>
            <div className="mt-2 sm:mt-0 flex justify-center gap-3 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              <span>GFR 2017 Compliant</span>
              <span>&bull;</span>
              <span>Secured Audit Trail</span>
            </div>
          </div>
        </footer>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   LOGIN PORTAL & REGISTER
   ========================================================== */
const HERO_IMG = "/mumbai-skyline.webp";
const JOURNEY_IMG = "/mumbai-waterfront.jpg";
const SEALINK_IMG = "/mumbai-sealink.jpg";
const EMBLEM_IMG = "/maharashtra-emblem.webp";

/* The supplied emblem artwork is 400x480: the seal itself sits in a ~300x300
   region at (50,15), with the "Government of Maharashtra" wordmark beneath it.
   StateSeal crops to the seal alone so it can sit inline at small sizes; the
   full artwork is used where that wordmark is actually wanted. */
function StateSeal({ size = 34, className = "" }) {
  const k = size / 300;
  return (
    <span
      className={`inline-block overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={EMBLEM_IMG}
        alt="Government of Maharashtra emblem"
        style={{
          width: 400 * k, height: 480 * k,
          marginLeft: -50 * k, marginTop: -15 * k,
          maxWidth: "none",
        }}
      />
    </span>
  );
}

function LoginPortal({ handleLogin, setRegistrationMode, handleResetData }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const demoAccounts = [
    { key: "ram", name: "Ram", role: "Startup", org: "AquaSense Technologies" },
    { key: "arjun", name: "Arjun", role: "Official — Pune", org: "Pune Municipal Corp" },
    { key: "meera", name: "Meera", role: "Official — Nagpur", org: "Nagpur Municipal Corp" },
    { key: "kavita", name: "Dr. Kavita Rao", role: "Verifier", org: "Technical Evaluation Board" },
    { key: "admin", name: "MSInS Admin", role: "Admin", org: "Maharashtra State Innovation Society" },
  ];

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setLoginError("Please enter both username and password."); return; }
    const match = demoAccounts.find(a =>
      a.key.toLowerCase() === username.trim().toLowerCase() ||
      a.name.toLowerCase() === username.trim().toLowerCase() ||
      a.name.toLowerCase().startsWith(username.trim().toLowerCase())
    );
    if (!match) { setLoginError("No matching sandbox account. Try one of the demo logins below."); return; }
    setLoginError("");
    handleLogin(match.key);
  };

  const quickLinks = [
    { icon: <Compass className="w-6 h-6" />, title: "Discover Pilots", desc: "Open municipal challenges accepting startup proposals." },
    { icon: <Award className="w-6 h-6" />, title: "Pilot Passport", desc: "A portable, verifiable record of certified outcomes." },
    { icon: <CreditCard className="w-6 h-6" />, title: "PFMS Escrow", desc: "Milestone tranches released within 48 hours." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Audit Defence", desc: "A CVC/CAG-ready docket behind every contract." },
  ];

  const pillars = [
    { n: "01", t: "Sponsor a Pilot", d: "A department posts a measurable civic problem with a budget cap and success criteria.", tone: "terracotta" },
    { n: "02", t: "Verify Independently", d: "An empanelled technical auditor scores the evidence against the published criteria.", tone: "white" },
    { n: "03", t: "Certify the Precedent", d: "A passing pilot becomes a citable precedent with a permanent audit hash.", tone: "navy" },
    { n: "04", t: "Fast-Track Adoption", d: "Any other authority may adopt that precedent without re-tendering.", tone: "steel" },
  ];

  const topics = [
    { icon: <FileText className="w-4 h-4" />, t: "Procurement Manual" },
    { icon: <ScrollText className="w-4 h-4" />, t: "GFR 2017 Rules" },
    { icon: <UserCheck className="w-4 h-4" />, t: "DPIIT Registration" },
    { icon: <Check className="w-4 h-4" />, t: "Verification Criteria" },
    { icon: <Receipt className="w-4 h-4" />, t: "Escrow & PFMS" },
    { icon: <ShieldCheck className="w-4 h-4" />, t: "Audit Docket" },
    { icon: <Handshake className="w-4 h-4" />, t: "Adoption Contracts" },
    { icon: <Settings className="w-4 h-4" />, t: "Sector Rules" },
  ];

  const toneMap = {
    terracotta: "bg-terracotta-600 text-white border-terracotta-600",
    white: "bg-white text-navy-900 border-sand-line",
    navy: "bg-navy-600 text-white border-navy-600",
    steel: "bg-steel-600 text-white border-steel-600",
  };

  return (
    <div className="bg-sand">
      {/* ============ GOVERNMENT MASTHEAD ============ */}
      <div className="bg-navy-900 text-navy-200">
        <div className="shell flex items-center justify-between gap-4 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">
            Government of Maharashtra &middot; Urban Development Department
          </span>
          <span className="hidden md:inline text-[10px] font-mono text-navy-200/70">
            GFR 2017 &middot; Rules 166 / 170 / 173
          </span>
        </div>
      </div>

      {/* ============ TOP NAV ============ */}
      <header className="bg-white border-b border-sand-line sticky top-0 z-40">
        <div className="shell flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-2.5">
            <StateSeal size={38} />
            <div className="leading-none">
              <p className="font-display font-extrabold text-navy-900 text-[17px] tracking-display">AARAMBH</p>
              <p className="text-[10px] text-slate-400 mt-1 tracking-wide">Govt. of Maharashtra &middot; MSInS</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-navy-800">
            <a href="#framework" className="hover:text-terracotta-600 transition">Framework</a>
            <a href="#process" className="hover:text-terracotta-600 transition">How It Works</a>
            <a href="#topics" className="hover:text-terracotta-600 transition">Resources</a>
            <a href="#services" className="hover:text-terracotta-600 transition">Outcomes</a>
          </nav>
          <a href="#signin" className="btn-primary !py-2.5 !px-5">
            Sign In <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="bg-white">
        <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-12 xl:gap-16 items-center py-16 lg:py-24">
          <div>
            <span className="eyebrow">Maharashtra Innovation Procurement Sandbox</span>
            <h1 className="font-display text-[2.7rem] sm:text-[3.4rem] xl:text-[3.9rem] font-extrabold leading-[1.04] mt-5 text-navy-900">
              Government Procurement Making Innovation Easier.
            </h1>
            <p className="text-[16px] leading-relaxed text-slate-500 mt-6 max-w-lg">
              Sponsor public pilots, certify the outcome through independent technical
              verification, and fast-track scaled adoption — all under the General
              Financial Rules, 2017.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <a href="#signin" className="btn-primary">
                Enter the Sandbox <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#framework" className="btn-outline">Read the Framework</a>
            </div>
          </div>

          <div className="relative">
            <img
              src={HERO_IMG}
              alt="Mumbai skyline: high-rise construction above dense low-rise neighbourhoods"
              className="w-full h-[380px] lg:h-[500px] object-cover rounded-2xl"
            />
            {/* figure lifted out of the photo, as in the reference */}
            <div className="absolute -bottom-7 -left-7 hidden sm:block bg-white rounded-xl border border-sand-line shadow-lg px-6 py-5 max-w-[220px]">
              <p className="font-display text-[2.1rem] font-extrabold text-terracotta-600 leading-none">210</p>
              <p className="text-[12px] font-bold text-navy-900 mt-1.5">Tender days eliminated</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                per adopted precedent, against a conventional tender cycle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUICK LINKS ============ */}
      <section className="bg-white border-t border-sand-line">
        <div className="shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-sand-line">
          {quickLinks.map((q) => (
            <a key={q.title} href="#signin" className="group px-0 sm:px-8 lg:px-9 first:lg:pl-0 last:lg:pr-0 py-9">
              <span className="text-terracotta-600 inline-block">{q.icon}</span>
              <h3 className="font-display font-bold text-[15px] text-navy-900 mt-4 flex items-center gap-1.5">
                {q.title}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-terracotta-600 transition" />
              </h3>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">{q.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ============ STATUTORY NOTICE ============ */}
      <section id="framework" className="scroll-mt-20 py-16 lg:py-20">
        <div className="shell">
          <div className="relative overflow-hidden rounded-2xl bg-navy-600 hatch px-8 sm:px-12 py-11">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta-200">
                <span className="w-[7px] h-[7px] rotate-45 bg-terracotta-300 inline-block" />
                General Financial Rules, 2017
              </span>
              <h2 className="font-display text-white text-[1.7rem] sm:text-[2.05rem] font-bold leading-tight mt-4">
                Rules 170, 173 &amp; 166 already permit this. Aarambh makes them usable.
              </h2>
              <p className="text-navy-100 text-[14px] leading-relaxed mt-4">
                Earnest money deposit waived for DPIIT-recognised startups. Prior turnover
                and experience criteria relaxed. A certified pilot adopted by one authority
                may be procured by another without a fresh tender.
              </p>
              <div className="flex flex-wrap gap-2.5 mt-7">
                {["Rule 170 — EMD exemption", "Rule 173 — Criteria relaxation", "Rule 166 — Precedent adoption"].map((r) => (
                  <span key={r} className="font-mono text-[11px] text-white/90 border border-white/25 rounded px-3 py-1.5">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <ScrollText className="absolute -right-8 -bottom-10 w-64 h-64 text-white/[0.06] hidden md:block" strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* ============ STATE BAND ============ */}
      <section className="relative isolate">
        <img
          src={SEALINK_IMG}
          alt="Bandra–Worli Sea Link, Mumbai"
          className="w-full h-[320px] sm:h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-navy-900/75" />
        <div className="absolute inset-0 flex items-center">
          <div className="shell grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-7 sm:gap-9 items-center">
            <StateSeal size={92} className="hidden sm:block" />
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta-200">
                <span className="w-1.5 h-1.5 bg-terracotta-300 rotate-45 inline-block" />
                Maharashtra first
              </span>
              <h2 className="font-display text-white font-extrabold text-[1.9rem] sm:text-[2.5rem] leading-[1.1] mt-4 max-w-[19ch]">
                Infrastructure this state already builds well.
              </h2>
              <p className="text-[15px] leading-relaxed text-navy-100/85 mt-4 max-w-[54ch]">
                Maharashtra runs some of the most demanding civic infrastructure in India.
                Aarambh gives its municipal corporations a lawful way to buy the next
                generation of it from the startups building it — and a record that
                survives audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MISSION + PILLARS ============ */}
      <section id="process" className="scroll-mt-20 pb-16 lg:pb-24">
        <div className="shell">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            <div>
              <span className="eyebrow">Our Mandate</span>
              <h2 className="font-display text-[1.9rem] sm:text-[2.4rem] font-bold leading-[1.18] mt-5 max-w-2xl text-navy-900">
                To make public procurement{" "}
                <span className="text-terracotta-600">open to startups</span> and{" "}
                <span className="text-terracotta-600">provable to auditors</span> — turning a
                nine-month tender into a verified 48-hour disbursal.
              </h2>
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center w-[128px] h-[128px] rounded-full border-2 border-terracotta-200 text-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-terracotta-600" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-navy-900 mt-2 leading-tight">GFR 2017<br />Compliant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {pillars.map((p) => (
              <div key={p.n} className={`border rounded-xl p-7 flex flex-col ${toneMap[p.tone]}`}>
                <span className={`font-mono text-[12px] ${p.tone === "white" ? "text-terracotta-600" : "text-white/60"}`}>{p.n}</span>
                <h3 className={`font-display font-bold text-[17px] mt-4 ${p.tone === "white" ? "text-navy-900" : "text-white"}`}>{p.t}</h3>
                <p className={`text-[13px] leading-relaxed mt-2.5 ${p.tone === "white" ? "text-slate-500" : "text-white/75"}`}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ORIGIN ============ */}
      <section className="bg-white border-y border-sand-line py-16 lg:py-24">
        <div className="shell grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          <img
            src={JOURNEY_IMG}
            alt="Mumbai waterfront"
            className="w-full h-[300px] lg:h-[420px] object-cover rounded-2xl"
          />
          <div>
            <span className="eyebrow">Where This Comes From</span>
            <p className="font-display text-[4.5rem] xl:text-[5.5rem] font-extrabold text-navy-200 leading-[0.9] mt-5">2017</p>
            <h2 className="font-display text-[1.6rem] font-bold text-navy-900 mt-3">The enabling rules</h2>
            <p className="text-[14px] text-slate-500 leading-relaxed mt-5 max-w-lg">
              The General Financial Rules were amended in 2017 to let public authorities
              buy from startups without earnest money deposits or prior-turnover tests.
              Nine years on, most departments still tender the long way — because nothing
              recorded the outcome of a pilot in a form an auditor would accept.
            </p>
            <p className="text-[14px] text-slate-500 leading-relaxed mt-4 max-w-lg">
              Aarambh is that record.
            </p>
            <a href="#signin" className="btn-outline mt-8">
              See a certified precedent <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============ TOPICS ============ */}
      <section id="topics" className="scroll-mt-20 py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Reference Material</span>
              <h2 className="font-display text-[1.9rem] sm:text-[2.2rem] font-bold mt-4 text-navy-900">Discover Popular Topics</h2>
            </div>
            <a href="#signin" className="text-[13px] font-bold text-terracotta-600 inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
              View all resources <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-9">
            {topics.map((t) => (
              <a key={t.t} href="#signin"
                 className="group bg-white border border-sand-line rounded-lg px-5 py-5 flex items-center gap-3.5 hover:border-terracotta-300 transition">
                <span className="w-9 h-9 rounded bg-terracotta-50 text-terracotta-600 flex items-center justify-center flex-shrink-0">
                  {t.icon}
                </span>
                <span className="text-[13.5px] font-semibold text-navy-900 leading-tight">{t.t}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-terracotta-600 transition" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OUTCOMES ============ */}
      <section id="services" className="scroll-mt-20 pb-16 lg:pb-20">
        <div className="shell">
          <div className="rounded-2xl bg-navy-800 hatch px-8 sm:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta-200">
                  <span className="w-[7px] h-[7px] rotate-45 bg-terracotta-300 inline-block" />
                  Sandbox to date
                </span>
                <h2 className="font-display text-white text-[1.8rem] sm:text-[2.1rem] font-bold leading-tight mt-4">
                  What the framework has returned so far.
                </h2>
              </div>
              <p className="text-navy-100 text-[14px] leading-relaxed lg:pt-8">
                Figures from the live sandbox across Pune, Nagpur and Greater Mumbai
                municipal corporations — every one traceable to a signed docket.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/15 rounded-xl overflow-hidden mt-11">
              {[
                ["48 hrs", "Milestone disbursal", "from verified delivery to funds in account"],
                ["95/100", "Median audit score", "across independently certified pilots"],
                ["₹56.5L", "Value unlocked", "in fast-tracked scaled adoption contracts"],
                ["100%", "Dockets audit-ready", "CVC / CAG inspection format, generated on demand"],
              ].map(([v, l, d]) => (
                <div key={l} className="bg-navy-800 px-6 py-8">
                  <p className="font-display text-[2.1rem] xl:text-[2.4rem] font-extrabold text-white leading-none">{v}</p>
                  <p className="text-[13px] font-bold text-terracotta-200 mt-2.5">{l}</p>
                  <p className="text-[11.5px] text-navy-200 mt-1.5 leading-snug">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SIGN IN ============ */}
      <section id="signin" className="scroll-mt-20 bg-white border-t border-sand-line py-16 lg:py-24">
        <div className="shell grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] gap-12 xl:gap-20">
          <div>
            <span className="eyebrow">Sandbox Access</span>
            <h2 className="font-display text-[2rem] sm:text-[2.4rem] font-bold leading-tight mt-5 text-navy-900">
              Sign in to the procurement sandbox.
            </h2>
            <p className="text-[14px] text-slate-500 leading-relaxed mt-5 max-w-md">
              This is a demonstration environment seeded with representative pilots,
              verifications and adoption contracts. Choose any role below to explore
              the workflow end to end.
            </p>

            <div className="mt-9 space-y-3">
              {[
                "Independent technical verification by empanelled auditors",
                "PFMS-linked milestone escrow and direct benefit transfer",
                "Immutable end-to-end audit trail for CVC / CAG inspection",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <Check className="w-4 h-4 text-terracotta-600 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-9 leading-relaxed max-w-md">
              Authorised use only. Access to this portal is logged and monitored under the
              Information Technology Act, 2000.
            </p>
          </div>

          <div className="bg-sand border border-sand-line rounded-2xl p-7 sm:p-9">
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="e.g. ram, arjun, admin..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-sand-line rounded px-3.5 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25 focus:border-terracotta-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter any password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-sand-line rounded px-3.5 py-2.5 pr-10 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25 focus:border-terracotta-600"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && <p className="text-rose-600 text-[12px] font-semibold">{loginError}</p>}

              <button type="submit" className="btn-primary w-full">
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px bg-sand-line flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or continue as</span>
              <div className="h-px bg-sand-line flex-1" />
            </div>

            <div className="space-y-2">
              {demoAccounts.map(a => (
                <button
                  key={a.key}
                  onClick={() => handleLogin(a.key)}
                  className="group w-full flex items-center gap-3 bg-white border border-sand-line hover:border-terracotta-400 rounded-lg px-3.5 py-2.5 text-left transition"
                >
                  <span className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {a.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-navy-900 leading-tight">{a.name}</span>
                    <span className="block text-[11px] text-slate-400 truncate">{a.role} &middot; {a.org}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto flex-shrink-0 group-hover:text-terracotta-600 transition" />
                </button>
              ))}
            </div>

            <div className="mt-7 pt-6 border-t border-sand-line">
              <p className="text-[12px] font-semibold text-navy-800 mb-3">New here? Register to test onboarding.</p>
              <div className="flex gap-2">
                <button onClick={() => setRegistrationMode("startup")} className="flex-1 border border-navy-200 text-navy-800 hover:border-navy-600 py-2 rounded text-[12px] font-bold transition">
                  Register Startup
                </button>
                <button onClick={() => setRegistrationMode("official")} className="flex-1 border border-navy-200 text-navy-800 hover:border-navy-600 py-2 rounded text-[12px] font-bold transition">
                  Register Official
                </button>
              </div>
              <button onClick={handleResetData} className="mt-4 text-[11px] text-slate-400 hover:text-terracotta-600 font-medium inline-flex items-center gap-1.5 transition">
                <RefreshCw className="w-3 h-3" /> Reset sandbox data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-navy-900 text-navy-200">
        <div className="shell py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <StateSeal size={34} />
              <span className="font-display font-extrabold text-white text-[15px] tracking-display">AARAMBH</span>
            </div>
            <p className="text-[12.5px] leading-relaxed mt-4 text-navy-200/80">
              State Innovation Procurement Sandbox, operated by the Maharashtra State
              Innovation Society under the Urban Development Department.
            </p>
          </div>
          {[
            ["Framework", ["GFR 2017 Rule 170", "GFR 2017 Rule 173", "GFR 2017 Rule 166", "Verification criteria"]],
            ["For Startups", ["DPIIT registration", "Discover pilots", "Pilot passport", "Escrow & disbursal"]],
            ["For Departments", ["Post a pilot", "Browse certified", "Adoption contracts", "Audit defence record"]],
          ].map(([h, items]) => (
            <div key={h}>
              <p className="font-display font-bold text-white text-[13px] uppercase tracking-wider">{h}</p>
              <ul className="mt-4 space-y-2.5">
                {items.map((i) => (
                  <li key={i}>
                    <a href="#signin" className="text-[12.5px] hover:text-terracotta-200 transition">{i}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="shell py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11.5px] text-navy-200/70">
              &copy; 2026 Aarambh &mdash; Maharashtra State Innovation Society (MSInS) &amp; DPIIT
            </p>
            <p className="text-[11px] font-mono text-navy-200/60">GFR 2017 &middot; Rules 166 / 170 / 173</p>
          </div>
        </div>
      </footer>
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [founder, setFounder] = useState("");
  const [mobile, setMobile] = useState("");
  const [dpiitNo, setDpiitNo] = useState("");
  const [dpiitStatus, setDpiitStatus] = useState("unverified");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleVerifyDPIIT = () => {
    if (!dpiitNo.trim()) { showToast("Please enter a DPIIT recognition number", "error"); return; }
    setDpiitStatus("verifying");
    setTimeout(() => {
      setDpiitStatus("verified");
      setName("SmartInfra Systems");
      showToast("DPIIT Recognition Number Verified!", "success");
    }, 1500);
  };

  const handleSendOTP = () => {
    if (!mobile || mobile.length < 10) { showToast("Please enter a valid 10-digit mobile number", "error"); return; }
    setOtpSent(true);
    showToast("Fake OTP sent: Enter any 6 digits to verify", "info");
  };

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
    if (dpiitStatus !== "verified") { showToast("Please verify your DPIIT recognition number first", "error"); return; }
    if (!otpSent || otpInput.length < 6) { showToast("Please complete the mobile OTP step (any 6 digits)", "error"); return; }
    const newKey = `startup_${Date.now()}`;
    const newStartup = {
      id: newKey, name: founder || "Startup Founder", email, role: "Startup",
      startupName: name, dpiitNo, sector: "Water & Sanitation", status: "Verified",
      passportScore: 70, details: "Self-registered startup in Sandbox."
    };
    setUsers(prev => ({ ...prev, [newKey]: newStartup }));
    showToast("Startup registration complete! Logged in automatically.", "success");
    handleLogin(newKey);
  };

  const handleRegisterOfficial = (e) => {
    e.preventDefault();
    if (emailError || !email) { showToast("Please fix the validation errors", "error"); return; }
    if (!department || !designation || !employeeId) { showToast("All fields are required", "error"); return; }
    const newRequest = { id: `req_${Date.now()}`, name, email, department, designation, employeeId };
    setOnboardingRequests(prev => [...prev, newRequest]);
    showToast("Registration submitted! Pending MSInS Admin approval.", "info");
    setMode(null);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <button onClick={() => setMode(null)} className="text-xs font-semibold text-sidebar-active hover:text-sidebar mb-4 inline-flex items-center gap-1">
        &larr; Back to Login Screen
      </button>

      {mode === "startup" ? (
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Building className="text-sidebar w-5 h-5" /> Startup Registration
          </h2>
          <p className="text-xs text-slate-500 mb-5">Register your DPIIT-recognized enterprise to participate in government pilots.</p>

          <form onSubmit={handleRegisterStartup} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">DPIIT Recognition Number</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. DPIIT98372" value={dpiitNo} onChange={(e) => setDpiitNo(e.target.value)} disabled={dpiitStatus === "verifying" || dpiitStatus === "verified"} className="flex-grow border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-active disabled:bg-slate-100" />
                {dpiitStatus !== "verified" ? (
                  <button type="button" onClick={handleVerifyDPIIT} disabled={dpiitStatus === "verifying"} className="bg-sidebar hover:bg-sidebar-dark text-white font-semibold text-xs px-3 py-1.5 rounded transition flex items-center gap-1">
                    {dpiitStatus === "verifying" ? <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : "Verify DPIIT"}
                  </button>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded border border-emerald-200 flex items-center gap-1">✓ Verified</span>
                )}
              </div>
              <p className="text-slate-400 text-[10px] mt-1 italic">* Simulated check via DPIIT national lookup service.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Startup / Entity Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter startup name" className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Founder/Contact Person</label>
                <input type="text" required placeholder="Founder name" value={founder} onChange={(e) => setFounder(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Email</label>
                <input type="email" required placeholder="email@startup.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active" />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile Number (Aadhaar Linked)</label>
                <div className="flex gap-2">
                  <input type="tel" placeholder="Enter 10 digit number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="flex-grow border border-slate-300 rounded px-3 py-1.5 text-sm" />
                  <button type="button" onClick={handleSendOTP} className="border border-sidebar text-sidebar hover:bg-slate-50 font-semibold text-[11px] px-3 rounded transition">
                    {otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Enter OTP</label>
                  <input type="text" maxLength={6} placeholder="Enter any 6 digits" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="border border-slate-300 rounded px-3 py-1.5 text-sm tracking-widest w-36 text-center" />
                  <span className="text-slate-400 text-[10px] ml-2">Any 6 digits accepted in sandbox.</span>
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-sidebar hover:bg-sidebar-dark text-white font-bold py-2 rounded shadow-sm transition mt-2 text-sm">
              Complete Registration &amp; Access App
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <User className="text-sidebar w-5 h-5" /> Government Official Registration
          </h2>
          <p className="text-xs text-slate-500 mb-5">Access credentials for Municipal Corporation, Smart City bodies, and State officials.</p>

          <form onSubmit={handleRegisterOfficial} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
              <input type="text" required placeholder="e.g. Rajesh Kumar" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Official Government Email ID</label>
              <input type="email" required placeholder="officer@pune.gov.in" value={email} onChange={(e) => handleOfficialEmailChange(e.target.value)} className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none ${emailError ? "border-rose-400 focus:ring-rose-500" : "border-slate-300 focus:ring-sidebar-active"}`} />
              {emailError ? <p className="text-rose-500 text-[10px] mt-1 font-semibold">{emailError}</p> : <p className="text-slate-400 text-[10px] mt-1">Must be @gov.in, @nic.in, or state gov email.</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Department / Municipal Body</label>
                <input type="text" required placeholder="e.g. Pune Municipal Corporation" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Official Designation</label>
                <input type="text" required placeholder="e.g. Superintending Engineer" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Official Employee ID</label>
              <input type="text" required placeholder="e.g. PMC-38291" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active" />
            </div>
            <div className="bg-amber-50 text-amber-800 text-[10px] p-2.5 rounded border border-amber-200">
              <strong>Note:</strong> Official accounts require nodal verification. MSInS Admin must approve before access is granted.
            </div>
            <button type="submit" className="w-full bg-sidebar hover:bg-sidebar-dark text-white font-bold py-2 rounded shadow-sm transition text-sm">
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
/* A startup's citable track record: every pilot it has been certified on,
   across every department — not just the one an official is currently
   reviewing. Shared by the startup's own "My Pilot Passport" tab and by the
   official's applicant review, so both render identically. Handles a
   startup with no certified pilots yet gracefully — most applicants will
   be first-timers, and that isn't a reason to hide the passport. */
function PilotPassportPanel({ startupName, dpiitNo, sector, startupId, pilots, setDocketModalData }) {
  const certifiedPilots = pilots.filter(p => p.status === "Certified" && p.application?.startupId === startupId);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-sidebar text-white px-6 py-8 text-center relative border-b-4 border-sidebar-accent">
        <div className={`absolute top-3 right-3 text-white font-bold text-[9px] uppercase tracking-wider py-0.5 px-2 rounded shadow ${certifiedPilots.length > 0 ? "bg-emerald-500" : "bg-slate-500"}`}>
          {certifiedPilots.length > 0 ? "✓ Active Passport" : "No Certifications Yet"}
        </div>
        <Award className="w-12 h-12 mx-auto text-sidebar-accent mb-2" />
        <h2 className="doc-serif text-xl font-bold tracking-wide text-white">PRECEDENT COMPLIANCE PASSPORT</h2>
        <p className="text-[10px] text-slate-300 tracking-widest uppercase mt-1">State Innovation Procurement Framework Certificate</p>
        <div className="mt-1.5 text-[10px] text-blue-100/80 font-mono">Passport ID: PP-{dpiitNo || "UNVERIFIED"}-2026</div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border-b border-slate-200 text-sm">
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Startup Name</span>
          <span className="font-bold text-slate-800 text-sm">{startupName}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-bold block">DPIIT Number</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{dpiitNo || "Not on file"}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Sector</span>
          <span className="font-bold text-slate-800 text-sm">{sector || "—"}</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-1.5">
          <CheckCircle className="text-emerald-500 w-4 h-4" /> Certified Pilots Registry
        </h3>

        {certifiedPilots.length === 0 ? (
          <div className="text-center py-5 text-slate-400 italic text-xs">
            No certified pilots linked to this passport yet. This applicant has no independently
            verified track record on Aarambh — evaluate the proposal on its own merits.
          </div>
        ) : (
          certifiedPilots.map(p => (
            <div key={p.id} className="border border-emerald-200 bg-emerald-50/30 p-5 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 py-0.5 px-1.5 rounded">Certified Outcome Precedent</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1.5">{p.title}</h4>
                  <p className="text-[11px] text-slate-500">Agency: {p.department} ({p.sponsoringOfficialName})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Certified</span>
                  <span className="font-bold text-slate-600 text-[11px]">{p.verification?.certifiedAt}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-b border-emerald-100 py-2.5 text-xs">
                <div><span className="text-[9px] text-slate-400 font-bold block">Key Metric</span><span className="font-bold text-slate-800">{p.evidence?.waterLossReduction}</span></div>
                <div><span className="text-[9px] text-slate-400 font-bold block">Duration</span><span className="font-semibold text-slate-800">{p.evidence?.duration}</span></div>
                <div><span className="text-[9px] text-slate-400 font-bold block">Audit Score</span><span className="font-bold text-emerald-700">{p.verification?.score}/100</span></div>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">Verifier Endorsement</span>
                <p className="text-[11px] text-slate-500 italic mt-0.5">"{p.verification?.notes}"</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Signed: {p.verification?.verifierName}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 flex flex-wrap justify-between items-center text-[10px] gap-2">
                <span className="font-mono text-slate-400">Hash: SHA256-{p.id}-CERT-X992</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDocketModalData({ type: "pilot", pilot: p })}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 shadow-xs transition cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-sidebar-active" /> CVC Audit Defense Docket
                  </button>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5"><ShieldCheck className="w-3.5 h-3.5" /> GFR COMPLIANT</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-50 p-5 border-t border-slate-200 text-[11px] text-slate-500 space-y-2">
        <h4 className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">GFR 2017 Exemptions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><strong className="text-slate-700 block mb-0.5">Rule 170: EMD Exemption</strong>Startups with DPIIT recognition and verified pilot outcomes are exempted from EMD/Bid Security.</div>
          <div><strong className="text-slate-700 block mb-0.5">Rule 173: Relaxation of Prior Criteria</strong>Prior turnover and experience requirements relaxed for certified passport holders.</div>
        </div>
      </div>
    </div>
  );
}

function StartupDashboard({
  currentTab, setCurrentTab, currentUser, pilots, setPilots, procurements, setProcurements,
  showToast, selectedPilot, setSelectedPilot, evidenceModalOpen, setEvidenceModalOpen,
  setDocketModalData, setContractModalData
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  // Filter offers only the domains that actually appear in the listings.
  const sectorOptions = [...new Set(pilots.map(p => p.sector).filter(Boolean))].sort();
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [applyModalOpen, setApplyModalOpen] = useState(null);
  const [proposedCost, setProposedCost] = useState("");
  const [proposedScope, setProposedScope] = useState("");
  const [timeline, setTimeline] = useState("");
  const [waterLossVal, setWaterLossVal] = useState("22% reduction");
  const [durVal, setDurVal] = useState("100 days");
  const [sensorsVal, setSensorsVal] = useState("25 sensors");
  const [notesVal, setNotesVal] = useState("");

  const ramPilots = pilots.filter(p => {
    const apps = getPilotApplications(p);
    return apps.some(a => a.startupId === currentUser.id) || p.application?.startupId === currentUser.id;
  });
  const appliedCount = ramPilots.filter(p => {
    const myApp = getPilotApplications(p).find(a => a.startupId === currentUser.id);
    return myApp?.status === "Pending" || (!myApp?.status && p.status === "Applied");
  }).length;
  const runningCount = ramPilots.filter(p => p.status === "Running" && (p.application?.startupId === currentUser.id || getPilotApplications(p).find(a => a.startupId === currentUser.id)?.status === "Selected")).length;
  const completedCount = ramPilots.filter(p => p.status === "Completed" && (p.application?.startupId === currentUser.id || getPilotApplications(p).find(a => a.startupId === currentUser.id)?.status === "Selected")).length;
  const certifiedCount = ramPilots.filter(p => p.status === "Certified" && (p.application?.startupId === currentUser.id || getPilotApplications(p).find(a => a.startupId === currentUser.id)?.status === "Selected")).length;

  const pilotsWithEscrow = ramPilots.filter(p => p.escrow);
  const totalEscrowAllocated = pilotsWithEscrow.reduce((sum, p) => sum + (p.escrow?.totalAmount || 0), 0);
  const totalEscrowDisbursed = pilotsWithEscrow.reduce((sum, p) => sum + (p.escrow?.disbursedAmount || 0), 0);

  const myAdoptions = (procurements || []).filter(pr => (pr.startupId === currentUser.id || pr.startupName === currentUser.startupName));
  const pendingOffers = myAdoptions.filter(pr => pr.status === "Pending Startup Acceptance");

  const handleAcceptAdoption = (procId) => {
    setProcurements(prev => prev.map(pr => {
      if (pr.id === procId) {
        return { ...pr, status: "Accepted" };
      }
      return pr;
    }));
    showToast("Adoption Agreement signed! Scaled procurement contract legally executed under GFR 170/173.", "success");
  };

  const handleDeclineAdoption = (procId) => {
    setProcurements(prev => prev.map(pr => {
      if (pr.id === procId) {
        return { ...pr, status: "Declined" };
      }
      return pr;
    }));
    showToast("Adoption offer declined.", "info");
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const newApp = {
      id: `app_${currentUser.id}_${Date.now()}`,
      startupId: currentUser.id,
      startupName: currentUser.startupName,
      proposedCost: parseFloat(proposedCost),
      proposedScope,
      dpiitNo: currentUser.dpiitNo,
      appliedAt: new Date().toISOString().split("T")[0],
      status: "Pending"
    };

    const updatedPilots = pilots.map(p => {
      if (p.id === applyModalOpen.id) {
        const existingApps = getPilotApplications(p);
        const filtered = existingApps.filter(a => a.startupId !== currentUser.id);
        const allApps = [...filtered, newApp];
        return {
          ...p,
          status: p.status === "Open" ? "Applied" : p.status,
          application: p.application || newApp,
          applications: allApps
        };
      }
      return p;
    });
    setPilots(updatedPilots);
    setApplyModalOpen(null);
    setProposedCost("");
    setProposedScope("");
    setTimeline("");
    showToast(`Successfully applied for "${applyModalOpen.title}"!`, "success");
  };

  const handleEvidenceSubmit = (e) => {
    e.preventDefault();
    const updatedPilots = pilots.map(p => {
      if (p.id === evidenceModalOpen) {
        return {
          ...p,
          status: "Completed",
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
        <div className="space-y-5 animate-fade-in">
          {/* Pending Adoption Offers Banner */}
          {pendingOffers.length > 0 && (
            <div className="space-y-3">
              {pendingOffers.map(offer => (
                <div key={offer.id} className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sidebar text-white p-4 sm:p-5 rounded-lg shadow-md border border-emerald-400/50 animate-slide-up">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400 text-amber-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Scaled Adoption Offer Received
                        </span>
                        <span className="text-emerald-100 text-[11px] font-mono">{offer.date}</span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {offer.adoptingDepartment} has offered a Scaled Procurement Contract!
                      </h3>
                      <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                        Based on your certified precedent <strong>"{offer.pilotTitle}"</strong>, {offer.adoptingOfficialName} ({offer.adoptingDepartment}) wants to adopt your solution fast-tracked under GFR 2017 Rules 170 &amp; 173.
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-100 pt-1">
                        <span>Contract Budget: <strong className="text-white font-bold text-sm">₹{offer.scaledBudget?.toLocaleString('en-IN')}</strong></span>
                        {offer.targetScope && <span>Scope: <strong className="text-white font-medium">{offer.targetScope}</strong></span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center flex-shrink-0 pt-1 md:pt-0">
                      <button
                        type="button"
                        onClick={() => setContractModalData({ type: "adoption", procurement: offer, pilot: pilots.find(p => p.id === offer.pilotId) })}
                        className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs py-2 px-3 rounded flex items-center gap-1 transition cursor-pointer"
                      >
                        <ScrollText className="w-3.5 h-3.5 text-amber-300" /> Review Contract Terms
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptAdoption(offer.id)}
                        className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-2 px-3.5 rounded shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-700" /> Accept &amp; Sign Agreement
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineAdoption(offer.id)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs py-2 px-3 rounded transition cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DeskHeader
            eyebrow="Startup Desk"
            title={currentUser.startupName}
            blurb="Apply to municipal pilots without earnest money or turnover tests. Each certified outcome is added to your Pilot Passport, where any department in the state can cite it."
            standing={{ label: "DPIIT Recognition", value: currentUser.dpiitNo }}
          />

          <LedgerStrip items={[
            { label: "Open to apply", value: pilots.filter(p => p.status === "Open" || p.status === "Applied").length, note: "Municipal pilots accepting proposals" },
            { label: "Running now", value: runningCount, note: "Your pilots under way" },
            { label: "Certified", value: certifiedCount, note: "Independently verified outcomes" },
            { label: "Adopted elsewhere", value: myAdoptions.filter(pr => pr.status === "Accepted").length, note: "Other departments buying on your record" },
          ]} />

          {/* Pilot status chart + applications table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Mini Donut Chart */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Lifecycle Status Breakdown</h3>
              <MiniDonutChart
                segments={[
                  { label: "Applied", value: appliedCount, color: "#3b82f6" },
                  { label: "Running", value: runningCount, color: "#8b5cf6" },
                  { label: "Completed", value: completedCount, color: "#f59e0b" },
                  { label: "Certified", value: certifiedCount, color: "#10b981" },
                ]}
              />
            </div>

            {/* Applications Table */}
            <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">My Pilot Applications</h3>
                <button onClick={() => setCurrentTab("opportunities")} className="bg-sidebar-active hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded text-xs flex items-center gap-1 transition">
                  <Search className="w-3 h-3" /> Discover Pilots
                </button>
              </div>
              {ramPilots.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">No applications found.</p>
                  <p className="text-[11px] text-slate-400">Head over to "Discover Pilots" to submit your first proposal!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left">
                        <th className="pb-2 pr-4 font-semibold">Pilot Details</th>
                        <th className="pb-2 pr-4 font-semibold">Department</th>
                        <th className="pb-2 pr-4 font-semibold">Cost</th>
                        <th className="pb-2 pr-4 font-semibold">Status</th>
                        <th className="pb-2 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {ramPilots.map(p => {
                        const myApp = getPilotApplications(p).find(a => a.startupId === currentUser.id) || p.application;
                        const isRejected = myApp?.status === "Rejected";
                        const displayStatus = isRejected ? "Rejected" : p.status;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-3 pr-4">
                              <span className="font-semibold block text-slate-800 text-xs">{p.title}</span>
                              <span className="text-[10px] text-slate-400">{p.sector}</span>
                            </td>
                            <td className="py-3 pr-4 text-xs">{p.department}</td>
                            <td className="py-3 pr-4 font-semibold text-xs">₹{myApp?.proposedCost?.toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-4"><StatusBadge status={displayStatus} /></td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end items-center gap-2">
                                {p.status === "Running" && !isRejected && (
                                  <button onClick={() => setEvidenceModalOpen(p.id)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-2 rounded text-[10px] transition">Upload Evidence</button>
                                )}
                                {(p.status === "Running" || p.status === "Completed" || p.status === "Certified") && (
                                  <button
                                    type="button"
                                    onClick={() => setContractModalData({ type: "pilot", pilot: p, application: myApp })}
                                    className="text-emerald-700 hover:text-emerald-900 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                                  >
                                    <ScrollText className="w-3 h-3" /> Agreement
                                  </button>
                                )}
                                <button onClick={() => setSelectedPilot(p)} className="text-sidebar-active hover:underline text-[10px] font-bold">View</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Scaled Government Procurement Contracts Card */}
          {myAdoptions.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Handshake className="w-4 h-4 text-emerald-600" /> Scaled Government Procurement Contracts
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Inter-municipal adoption contracts legally executed under GFR 2017 Rules 166, 170 &amp; 173.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                  {myAdoptions.filter(pr => pr.status === "Accepted").length} Executed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {myAdoptions.map(pr => (
                  <div key={pr.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">Contract Ref: {pr.id.toUpperCase()}</span>
                          <h4 className="font-bold text-sm text-slate-900">{pr.adoptingDepartment}</h4>
                          <p className="text-[10px] text-slate-500">Authorized Officer: <strong>{pr.adoptingOfficialName}</strong></p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          pr.status === "Accepted" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                          pr.status === "Declined" ? "bg-rose-100 text-rose-800 border-rose-200" :
                          "bg-amber-100 text-amber-800 border-amber-200"
                        }`}>
                          {pr.status === "Accepted" ? "✓ Contract Executed" : pr.status === "Declined" ? "✕ Declined" : "⏳ Pending Acceptance"}
                        </span>
                      </div>

                      <p className="text-xs text-emerald-700 font-bold">
                        Contract Value: ₹{pr.scaledBudget?.toLocaleString('en-IN')}
                      </p>

                      {pr.targetScope && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 line-clamp-2">
                          <span className="font-semibold text-slate-700">Scope: </span>{pr.targetScope}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setContractModalData({ type: "adoption", procurement: pr, pilot: pilots.find(p => p.id === pr.pilotId) })}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] py-1.5 px-3 rounded flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <ScrollText className="w-3.5 h-3.5" /> View Contract Agreement
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocketModalData({ type: "procurement", procurement: pr, pilot: pilots.find(p => p.id === pr.pilotId) })}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1.5 px-2.5 rounded flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-sidebar-active" /> CVC Docket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DISCOVER OPPORTUNITIES */}
      {currentTab === "opportunities" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search pilots..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
            </div>
            <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="border border-slate-200 rounded px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active">
              <option value="All">All Sectors</option>
              {sectorOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="border border-slate-200 rounded px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active">
              <option value="All">All Budgets</option>
              <option value="low">Under ₹10,00,000</option>
              <option value="high">₹10,00,000 &amp; above</option>
            </select>
            <div className="flex justify-end items-center">
              <span className="text-[10px] text-slate-400 font-bold">{pilots.filter(p => p.status === "Open" || p.status === "Applied").length} open listings</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pilots.filter(p => p.status === "Open" || p.status === "Applied")
              .filter(p => searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
              .filter(p => sectorFilter !== "All" ? p.sector === sectorFilter : true)
              .filter(p => { if (budgetFilter === "low") return p.budgetCap < 1000000; if (budgetFilter === "high") return p.budgetCap >= 1000000; return true; })
              .map(p => {
                const apps = getPilotApplications(p);
                const hasApplied = apps.some(a => a.startupId === currentUser.id);
                return (
                  <div key={p.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-sidebar/10 text-sidebar text-[10px] font-bold px-1.5 py-0.5 rounded">{p.sector}</span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {p.durationDays}d</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{p.title}</h3>
                      <p className="text-[10px] text-sidebar-active font-semibold mt-0.5">{p.department}</p>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-3">{p.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Budget Cap</span>
                        <span className="font-bold text-slate-800 text-sm">₹{p.budgetCap.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button onClick={() => setSelectedPilot(p)} className="text-[10px] text-slate-500 hover:text-slate-700 font-bold px-2 py-1">Detail</button>
                        {hasApplied ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] py-1 px-2 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" /> Applied
                          </span>
                        ) : (
                          <button onClick={() => setApplyModalOpen(p)} className="bg-sidebar hover:bg-sidebar-dark text-white font-bold text-[10px] py-1 px-2.5 rounded transition">Apply Now</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 2.5. PFMS ESCROW & MILESTONE DISBURSEMENTS */}
      {currentTab === "escrow" && (
        <div className="space-y-5 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-sidebar-darker via-sidebar to-slate-800 text-white p-6 rounded-lg shadow-sm border-b-4 border-sidebar-active flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-sidebar-active/20 text-sidebar-active border border-sidebar-active/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> PFMS Integrated
                </span>
                <span className="text-slate-400 text-xs font-mono">Gateway: PFMS-DIRECT-PAY</span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-white">PFMS Milestone Escrow &amp; Disbursement Station</h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Government pilot tranches are held in statutory escrow and released within 48 hours of verified milestone delivery, bypassing conventional 9-month invoice delays.
              </p>
            </div>
            <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded text-left sm:text-right flex-shrink-0">
              <span className="text-[10px] text-slate-300 uppercase font-bold block">Linked Settlement Account</span>
              <span className="text-xs font-mono font-bold text-white block">HDFC Bank &bull;&bull;&bull;&bull; 4921</span>
              <span className="text-[9px] text-emerald-300 font-bold">✓ Direct Benefit Transfer Active</span>
            </div>
          </div>

          {/* Stat KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<CreditCard className="text-sidebar-active w-5 h-5" />}
              label="Total Escrow Allocated"
              value={`₹${totalEscrowAllocated.toLocaleString('en-IN')}`}
            />
            <StatCard
              icon={<CheckCircle className="text-emerald-500 w-5 h-5" />}
              label="Disbursed into Account"
              value={`₹${totalEscrowDisbursed.toLocaleString('en-IN')}`}
            />
            <StatCard
              icon={<Clock className="text-blue-500 w-5 h-5" />}
              label="Disbursement Speed"
              value="48 Hours"
            />
            <StatCard
              icon={<ShieldCheck className="text-amber-500 w-5 h-5" />}
              label="Tender Wait Eliminated"
              value="210 Days Saved"
            />
          </div>

          {/* Active Escrow Pilots */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Receipt className="w-4 h-4 text-sidebar-active" /> Active Pilot Escrow Accounts
            </h3>

            {pilotsWithEscrow.length === 0 ? (
              <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400">
                <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">No Active Escrow Contracts</p>
                <p className="text-xs mt-1">Escrow accounts activate automatically once a municipal official awards a pilot.</p>
              </div>
            ) : (
              pilotsWithEscrow.map((p) => {
                const escrowPct = Math.round((p.escrow.disbursedAmount / p.escrow.totalAmount) * 100);
                return (
                  <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-sidebar/10 text-sidebar text-[10px] font-bold px-2 py-0.5 rounded">
                            {p.department}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            Virtual A/C: {p.escrow.pfmsAccountRef}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{p.title}</h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">Escrow Capital Released</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          ₹{p.escrow.disbursedAmount.toLocaleString('en-IN')} / ₹{p.escrow.totalAmount.toLocaleString('en-IN')} ({escrowPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Disbursement Progress</span>
                        <span>{escrowPct}% Released</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${escrowPct}%` }}
                        />
                      </div>
                    </div>

                    {/* 3 Milestones Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {p.escrow.milestones.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-lg border transition flex flex-col justify-between space-y-3 ${
                            m.status === "Disbursed"
                              ? "bg-emerald-50/40 border-emerald-200"
                              : m.status === "Ready for Review"
                              ? "bg-blue-50/40 border-blue-200"
                              : "bg-slate-50 border-slate-200 opacity-85"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="font-bold text-xs text-slate-800 leading-snug">{m.title}</span>
                              <span className="text-[10px] font-bold text-slate-400 font-mono">{m.percentage}%</span>
                            </div>
                            <p className="text-emerald-800 font-bold text-sm">₹{m.amount.toLocaleString('en-IN')}</p>
                            <p className="text-slate-600 text-[10px] mt-1.5 leading-relaxed">{m.deliverable}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60">
                            {m.status === "Disbursed" ? (
                              <div className="space-y-1">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                  <Check className="w-3 h-3" /> Disbursed via PFMS
                                </span>
                                <p className="text-[9px] text-slate-400 font-mono truncate">Ref: {m.txRef}</p>
                                <p className="text-[9px] text-slate-400 font-mono">Date: {m.disbursedAt}</p>
                              </div>
                            ) : m.status === "Ready for Review" ? (
                              <div className="space-y-1">
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3" /> Under Municipal Review
                                </span>
                                <p className="text-[9px] text-slate-500 italic">Sponsoring engineer is reviewing telemetry for release.</p>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px] flex items-center gap-1 font-medium">
                                <Lock className="w-3 h-3" /> Locked until prior milestone
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. PILOT PASSPORT */}
      {currentTab === "passport" && (
        <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
          <PilotPassportPanel
            startupName={currentUser.startupName}
            dpiitNo={currentUser.dpiitNo}
            sector={currentUser.sector}
            startupId={currentUser.id}
            pilots={pilots}
            setDocketModalData={setDocketModalData}
          />
        </div>
      )}

      {selectedPilot && <PilotDetailModal pilot={selectedPilot} onClose={() => setSelectedPilot(null)} currentUser={currentUser} />}

      {/* APPLY MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-lg border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Apply for Pilot Listing</h3>
                <p className="text-[11px] text-slate-500">{applyModalOpen.title}</p>
              </div>
              <button onClick={() => setApplyModalOpen(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div className="bg-slate-50 p-2.5 rounded border text-[11px] space-y-0.5">
                <div><strong>Startup:</strong> {currentUser.startupName}</div>
                <div><strong>DPIIT:</strong> {currentUser.dpiitNo}</div>
                <div><strong>Budget Cap:</strong> ₹{applyModalOpen.budgetCap.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Proposed Cost (INR)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-sm">₹</span>
                  <input type="number" required max={applyModalOpen.budgetCap} placeholder="Within budget cap" value={proposedCost} onChange={(e) => setProposedCost(e.target.value)} className="w-full pl-6 pr-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Scope &amp; Method</label>
                <textarea required rows={3} placeholder="Outline deployment scope..." value={proposedScope} onChange={(e) => setProposedScope(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Timeline (Days)</label>
                <input type="number" required placeholder="e.g. 90" value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setApplyModalOpen(null)} className="px-3 py-1.5 border border-slate-300 rounded text-xs hover:bg-slate-50 font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-sidebar hover:bg-sidebar-dark text-white rounded text-xs font-semibold transition">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD EVIDENCE MODAL */}
      {evidenceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-lg border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Upload Outcome Evidence</h3>
                <p className="text-[11px] text-slate-500">Provide verified telemetry data &amp; outcome metrics.</p>
              </div>
              <button onClick={() => setEvidenceModalOpen(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleEvidenceSubmit} className="space-y-3">
              <div className="bg-amber-50 text-amber-800 text-[10px] p-2.5 rounded border border-amber-200">
                <strong>Attention:</strong> Uploading evidence marks the pilot as Completed.
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Key Performance Metric</label>
                <input type="text" required placeholder="e.g. 22% reduction" value={waterLossVal} onChange={(e) => setWaterLossVal(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Duration</label>
                  <input type="text" required placeholder="e.g. 90 Days" value={durVal} onChange={(e) => setDurVal(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assets Deployed</label>
                  <input type="text" required placeholder="e.g. 25 sensors" value={sensorsVal} onChange={(e) => setSensorsVal(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Technical Summary</label>
                <textarea rows={2} placeholder="Summarize outcomes..." value={notesVal} onChange={(e) => setNotesVal(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Evidence File</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50">
                  <FileText className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-sidebar block">Water_Audit_Telemetry_Report.pdf</span>
                  <span className="text-[9px] text-slate-400">Mocked file uploaded</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEvidenceModalOpen(null)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-sidebar hover:bg-sidebar-dark text-white rounded text-xs font-semibold transition">Submit Evidence</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   2. GOVERNMENT OFFICIAL DASHBOARD & VIEWS
   ========================================================== */
function OfficialDashboard({
  currentTab, setCurrentTab, currentUser, pilots, setPilots, procurements, setProcurements,
  showToast, selectedPilot, setSelectedPilot, adoptionModalOpen, setAdoptionModalOpen, sectorRules,
  setSectorRules, setDocketModalData, setContractModalData
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newSector, setNewSector] = useState("Water & Sanitation");
  const [customSector, setCustomSector] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [feedbackPilotId, setFeedbackPilotId] = useState(null);
  const [sponsorNotes, setSponsorNotes] = useState("");
  const [viewPassportApp, setViewPassportApp] = useState(null);
  const [officialEvidencePilotId, setOfficialEvidencePilotId] = useState(null);
  const [oeOutcome, setOeOutcome] = useState("");
  const [oeDuration, setOeDuration] = useState("");
  const [oeAssets, setOeAssets] = useState("");
  const [oeSummary, setOeSummary] = useState("");
  const [browseQuery, setBrowseQuery] = useState("");
  const [browseSector, setBrowseSector] = useState("All");
  const [procureDept, setProcureDept] = useState(currentUser.department);
  const [procureBudget, setProcureBudget] = useState("");
  const [adoptionScope, setAdoptionScope] = useState("");

  const myPilots = pilots.filter(p => p.sponsoringOfficialId === currentUser.id);
  const myProcurements = procurements.filter(pr => pr.adoptingOfficialId === currentUser.id);

  const handlePostPilot = (e) => {
    e.preventDefault();
    if (!newTitle || !newBudget || !newDuration) { showToast("Please fill in all fields", "error"); return; }
    const isOther = newSector === OTHER_SECTOR;
    const resolvedSector = isOther ? customSector.trim() : newSector;
    if (isOther && !resolvedSector) { showToast("Please name the sector", "error"); return; }
    // A newly named sector joins the registry so it can be filtered on and given
    // success criteria by the admin, exactly like the built-in domains.
    if (isOther && !sectorRules[resolvedSector]) {
      setSectorRules(prev => ({ ...prev, [resolvedSector]: [] }));
    }
    const newPilot = {
      id: `p_${Date.now()}`, title: newTitle, department: currentUser.department,
      sponsoringOfficialId: currentUser.id, sponsoringOfficialName: currentUser.name,
      budgetCap: parseFloat(newBudget), durationDays: parseInt(newDuration),
      sector: resolvedSector, description: newDesc, status: "Open",
      application: null, applications: [], evidence: null, verification: null
    };
    setPilots(prev => [newPilot, ...prev]);
    setNewTitle(""); setNewBudget(""); setNewDuration(""); setNewDesc(""); setCustomSector("");
    setCurrentTab("dashboard");
    showToast(`New pilot opportunity "${newTitle}" posted!`, "success");
  };

  const handleSelectStartup = (pilotId, startupId) => {
    // Read the name from current props before the update, not inside the
    // setPilots updater — React runs that updater during its own render
    // pass, after this function has already returned, so a variable
    // mutated in there and read here (below) would still hold its default.
    const targetPilot = pilots.find(p => p.id === pilotId);
    const selectedName = getPilotApplications(targetPilot).find(a => a.startupId === startupId)?.startupName || "Startup";
    setPilots(prev => prev.map(p => {
      if (p.id === pilotId) {
        const apps = getPilotApplications(p);
        const target = apps.find(a => a.startupId === startupId);
        const updatedApps = apps.map(a => {
          if (a.startupId === startupId) {
            return { ...a, status: "Selected" };
          }
          if (a.status === "Pending" || !a.status) {
            return { ...a, status: "Rejected" };
          }
          return a;
        });
        const selectedApp = updatedApps.find(a => a.startupId === startupId) || target;
        const escrowData = createPilotEscrow(selectedApp?.proposedCost || p.budgetCap);
        return {
          ...p,
          status: "Running",
          application: { ...(selectedApp || {}), status: "Selected" },
          applications: updatedApps,
          escrow: escrowData
        };
      }
      return p;
    }));
    showToast(`"${selectedName}" selected! Pilot is now in 'Running' status with PFMS Escrow initialized.`, "success");
  };

  const handleDisburseMilestone = (pilotId, milestoneId) => {
    let disbursedAmount = 0;
    let startupName = "Startup";
    setPilots(prev => prev.map(p => {
      if (p.id === pilotId && p.escrow) {
        startupName = p.application?.startupName || "Startup";
        const currentIdx = p.escrow.milestones.findIndex(m => m.id === milestoneId);
        const updatedMilestones = p.escrow.milestones.map((m, idx) => {
          if (m.id === milestoneId) {
            disbursedAmount = m.amount;
            return {
              ...m,
              status: "Disbursed",
              disbursedAt: new Date().toISOString().split("T")[0],
              txRef: `TXN-PFMS-${Math.floor(10000 + Math.random() * 90000)}`
            };
          }
          if (idx === currentIdx + 1 && m.status === "Pending") {
            return { ...m, status: "Ready for Review" };
          }
          return m;
        });
        const totalDisbursed = updatedMilestones.filter(m => m.status === "Disbursed").reduce((sum, m) => sum + m.amount, 0);
        return {
          ...p,
          escrow: {
            ...p.escrow,
            disbursedAmount: totalDisbursed,
            milestones: updatedMilestones
          }
        };
      }
      return p;
    }));
    showToast(`PFMS Disbursement of ₹${disbursedAmount.toLocaleString('en-IN')} approved for ${startupName}!`, "success");
  };

  const handleRejectStartup = (pilotId, startupId) => {
    let rejectedName = "Startup";
    setPilots(prev => prev.map(p => {
      if (p.id === pilotId) {
        const apps = getPilotApplications(p);
        const target = apps.find(a => a.startupId === startupId);
        if (target) rejectedName = target.startupName;
        const updatedApps = apps.map(a => {
          if (a.startupId === startupId) {
            return { ...a, status: "Rejected" };
          }
          return a;
        });
        const hasPending = updatedApps.some(a => a.status === "Pending" || !a.status);
        const hasSelected = updatedApps.some(a => a.status === "Selected");
        const nextStatus = hasSelected ? "Running" : (hasPending ? "Applied" : "Open");
        return {
          ...p,
          status: nextStatus,
          application: p.application?.startupId === startupId ? null : p.application,
          applications: updatedApps
        };
      }
      return p;
    }));
    showToast(`Application from "${rejectedName}" rejected.`, "info");
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setPilots(pilots.map(p => p.id === feedbackPilotId ? { ...p, evidence: { ...p.evidence, sponsorFeedback: sponsorNotes } } : p));
    setFeedbackPilotId(null); setSponsorNotes("");
    showToast("Sponsor outcome feedback logged successfully.", "success");
  };

  // Only the awarded startup can normally upload evidence from its own dashboard —
  // but a seeded/demo applicant with no login (or a vendor slow to self-report)
  // would otherwise leave the pilot stuck at "Running" forever, since nothing
  // would ever move it to "Completed" for the verifier to see. The sponsoring
  // official can log it on the vendor's behalf so the pilot always has a path
  // to independent audit.
  const handleOfficialEvidenceSubmit = (e) => {
    e.preventDefault();
    setPilots(prev => prev.map(p => {
      if (p.id !== officialEvidencePilotId) return p;
      return {
        ...p,
        status: "Completed",
        evidence: {
          waterLossReduction: oeOutcome,
          duration: oeDuration,
          sensorsDeployed: oeAssets,
          summary: oeSummary || "Pilot executed successfully matching initial scope specifications.",
          docs: "Sponsor_Logged_Outcome_Report.pdf",
          submittedAt: new Date().toISOString().split("T")[0],
          loggedBy: "sponsor"
        }
      };
    }));
    setOfficialEvidencePilotId(null); setOeOutcome(""); setOeDuration(""); setOeAssets(""); setOeSummary("");
    showToast("Outcome evidence logged. Pilot is now queued for independent verification.", "success");
  };

  const handleConfirmAdoption = (e) => {
    e.preventDefault();
    if (!procureBudget) { showToast("Please enter the scaled procurement budget", "error"); return; }
    const targetPilot = pilots.find(p => p.id === adoptionModalOpen);
    const targetStartupId = targetPilot.application?.startupId || "ram";
    const targetStartupName = targetPilot.application?.startupName || "AquaSense Technologies";
    const newProc = {
      id: `pr_${Date.now()}`,
      pilotId: targetPilot.id,
      pilotTitle: targetPilot.title,
      startupId: targetStartupId,
      startupName: targetStartupName,
      sponsoringDepartment: targetPilot.department,
      adoptingOfficialId: currentUser.id,
      adoptingOfficialName: currentUser.name,
      adoptingDepartment: procureDept,
      scaledBudget: parseFloat(procureBudget),
      targetScope: adoptionScope || `City-wide deployment across ${targetPilot.sector} infrastructure in ${procureDept}.`,
      status: "Pending Startup Acceptance",
      justification: `Fast-track scaled adoption offer issued to startup "${targetStartupName}" based on certified pilot precedent PP-${targetPilot.application?.dpiitNo || "DPIIT98372"}-2026. This procurement is executed with regulatory exemptions under General Financial Rules (GFR) 2017 Rule 170 (EMD exemption) and Rule 173 (relaxation of turnover & experience parameters for verified precedents).`,
      date: new Date().toISOString().split("T")[0]
    };
    setProcurements(prev => [newProc, ...prev]);
    setAdoptionModalOpen(null); setProcureBudget(""); setAdoptionScope("");
    setCurrentTab("procurement-history");
    showToast(`Official Adoption Offer sent to ${targetStartupName}! Awaiting startup acceptance.`, "info");
  };

  return (
    <div>
      {/* 1. DASHBOARD / SPONSOR HUB */}
      {currentTab === "dashboard" && (
        <div className="space-y-5 animate-fade-in">
          <DeskHeader
            eyebrow="Sponsor Desk"
            title={currentUser.department}
            blurb="Post a measurable civic problem with its success criteria fixed in advance, release milestone payments as work is verified, and adopt precedents other cities have already certified."
            standing={{ label: "Employee ID", value: currentUser.employeeId }}
          />

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Pilots Sponsored by {currentUser.department}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage pilot listings, evaluate applicant proposals, and select or reject startups.</p>
              </div>
              <button onClick={() => setCurrentTab("post-pilot")} className="bg-sidebar-active hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded text-xs flex items-center gap-1 transition self-start sm:self-auto shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Post a Pilot
              </button>
            </div>

            {myPilots.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm text-slate-600">No sponsored pilots found.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click "Post a Pilot" above to publish your first civic challenge opportunity.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPilots.map(p => {
                  const apps = getPilotApplications(p);
                  const pendingCount = apps.filter(a => a.status === "Pending" || !a.status).length;
                  return (
                    <div key={p.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white hover:border-slate-300 transition">
                      {/* Pilot Opportunity Bar */}
                      <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={p.status} />
                            <span className="bg-slate-200/80 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">{p.sector}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Ref: {p.id}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">{p.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                            <span>Budget Cap: <strong className="text-slate-800 font-semibold">₹{p.budgetCap.toLocaleString('en-IN')}</strong></span>
                            <span>Duration: <strong className="text-slate-700 font-medium">{p.durationDays} Days</strong></span>
                            <span>Applicants: <strong className="text-sidebar font-semibold">{apps.length}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                          {p.status === "Running" && (
                            <button
                              onClick={() => { setOfficialEvidencePilotId(p.id); setOeOutcome(""); setOeDuration(""); setOeAssets(""); setOeSummary(""); }}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] py-1.5 px-3 rounded shadow-sm transition"
                              title="Log the vendor's outcome evidence so this pilot can go to independent verification"
                            >
                              Log Outcome Evidence
                            </button>
                          )}
                          {p.status === "Completed" && !p.evidence?.sponsorFeedback && (
                            <button
                              onClick={() => { setFeedbackPilotId(p.id); setSponsorNotes(""); }}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] py-1.5 px-3 rounded shadow-sm transition"
                            >
                              Feedback
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPilot(p)}
                            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] py-1.5 px-3 rounded transition shadow-2xs"
                          >
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Under the pilot opportunity: List of Applicants */}
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-sidebar" />
                            List of Applicants ({apps.length})
                          </h4>
                          {pendingCount > 0 && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              {pendingCount} Pending Review
                            </span>
                          )}
                        </div>

                        {apps.length === 0 ? (
                          <div className="p-4 rounded border border-dashed border-slate-200 text-center text-slate-400 text-xs bg-slate-50/40">
                            <p className="font-medium text-slate-500">No applicants yet</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">When startups submit proposals, they will appear here under this opportunity.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {apps.map((app, idx) => {
                              const isPending = !app.status || app.status === "Pending";
                              const isSelected = app.status === "Selected";
                              const isRejected = app.status === "Rejected";

                              return (
                                <div
                                  key={app.id || idx}
                                  className={`p-3.5 rounded-lg border transition ${
                                    isSelected
                                      ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200"
                                      : isRejected
                                      ? "bg-slate-50/70 border-slate-200 opacity-75"
                                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    {/* Applicant Details */}
                                    <div className="space-y-1 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-slate-800 text-xs">{app.startupName}</span>
                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-blue-200">
                                          {app.dpiitNo || "DPIIT"}
                                        </span>
                                        {isSelected && (
                                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Selected Partner
                                          </span>
                                        )}
                                        {isRejected && (
                                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                                            <X className="w-3 h-3" /> Rejected
                                          </span>
                                        )}
                                        {isPending && (
                                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Under Review
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-600">
                                        <span>
                                          Proposed Cost: <strong className="text-slate-800 font-semibold">₹{app.proposedCost?.toLocaleString('en-IN')}</strong>
                                          {p.budgetCap && (
                                            <span className="text-[10px] text-slate-400 ml-1">
                                              ({Math.round(((p.budgetCap - app.proposedCost) / p.budgetCap) * 100)}% under budget cap)
                                            </span>
                                          )}
                                        </span>
                                        {app.appliedAt && (
                                          <span className="text-slate-400">
                                            Applied: <span className="text-slate-600 font-medium">{app.appliedAt}</span>
                                          </span>
                                        )}
                                      </div>

                                      {app.proposedScope && (
                                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1 leading-relaxed">
                                          <span className="font-semibold text-slate-700">Proposed Scope: </span>{app.proposedScope}
                                        </p>
                                      )}
                                    </div>

                                    {/* Action Buttons: Select and Reject next to each other */}
                                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                                      <button
                                        type="button"
                                        onClick={() => setViewPassportApp({ startupId: app.startupId, startupName: app.startupName, dpiitNo: app.dpiitNo, sector: p.sector })}
                                        className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] py-1.5 px-3 rounded flex items-center gap-1 transition"
                                        title="View this applicant's certified track record"
                                      >
                                        <Award className="w-3 h-3 text-sidebar-active" /> Passport
                                      </button>
                                      {isPending && (p.status === "Applied" || p.status === "Open") && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleSelectStartup(p.id, app.startupId)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] py-1.5 px-3 rounded shadow-sm flex items-center gap-1 transition"
                                            title="Select this startup to award the pilot"
                                          >
                                            <Check className="w-3 h-3" /> Select
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRejectStartup(p.id, app.startupId)}
                                            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 font-semibold text-[11px] py-1.5 px-3 rounded flex items-center gap-1 transition"
                                            title="Reject this proposal"
                                          >
                                            <X className="w-3 h-3" /> Reject
                                          </button>
                                        </>
                                      )}

                                      {isSelected && (
                                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                          Active Partner
                                        </span>
                                      )}

                                      {isRejected && (
                                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                                          Declined
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* PFMS Milestone Escrow Controls */}
                      {p.escrow && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                PFMS Milestone Escrow Controls
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Virtual Account: {p.escrow.pfmsAccountRef} &bull; Vendor: {p.application?.startupName || "Selected Startup"}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-slate-400 font-bold block">Capital Disbursed</span>
                              <span className="text-xs font-bold text-emerald-700">
                                ₹{p.escrow.disbursedAmount.toLocaleString('en-IN')} / ₹{p.escrow.totalAmount.toLocaleString('en-IN')} ({Math.round((p.escrow.disbursedAmount / p.escrow.totalAmount) * 100)}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                              style={{ width: `${Math.round((p.escrow.disbursedAmount / p.escrow.totalAmount) * 100)}%` }}
                            />
                          </div>

                          {/* Milestones grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                            {p.escrow.milestones.map((m) => (
                              <div key={m.id} className="bg-white p-3 rounded border border-slate-200 flex flex-col justify-between space-y-2 text-[11px]">
                                <div>
                                  <div className="flex justify-between items-start gap-1 mb-1">
                                    <span className="font-bold text-slate-800 leading-tight">{m.title}</span>
                                    <span className="text-slate-400 font-bold text-[10px]">{m.percentage}%</span>
                                  </div>
                                  <p className="text-emerald-700 font-bold text-xs">₹{m.amount.toLocaleString('en-IN')}</p>
                                  <p className="text-slate-500 text-[10px] mt-1 leading-snug">{m.deliverable}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  {m.status === "Disbursed" ? (
                                    <div className="space-y-0.5">
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Disbursed via PFMS
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-mono block">{m.txRef}</span>
                                    </div>
                                  ) : m.status === "Ready for Review" ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDisburseMilestone(p.id, m.id)}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-2 rounded flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                                    >
                                      <CreditCard className="w-3 h-3" /> Approve &amp; Disburse
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                                      <Lock className="w-3 h-3" /> Awaiting Prior Tranche
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. POST A PILOT */}
      {currentTab === "post-pilot" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-base font-bold text-slate-800 mb-1">Post a New Municipal Pilot Challenge</h2>
          <p className="text-xs text-slate-500 mb-5">Define a measurable public problem with clear criteria for startup testing.</p>

          <form onSubmit={handlePostPilot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Challenge Title</label>
              <input type="text" required placeholder="e.g. AI Leak Detection System - Ward 4" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Budget Allocation (INR)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                  <input type="number" required placeholder="500000" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pilot Period (Days)</label>
                <input type="number" required placeholder="60" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Civic Domain / Sector</label>
              <select value={newSector} onChange={(e) => setNewSector(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sidebar-active">
                {Object.keys(sectorRules).map(s => <option key={s} value={s}>{s}</option>)}
                <option value={OTHER_SECTOR}>{OTHER_SECTOR} — name a new domain</option>
              </select>
              {newSector === OTHER_SECTOR && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    placeholder="Name the sector, e.g. Solid Waste Management"
                    className="w-full border border-sidebar-active/50 bg-terracotta-50 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This domain joins the registry once the pilot is posted. MSInS can then set its success criteria.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Problem Statement &amp; Scope</label>
              <textarea rows={4} placeholder="Describe the physical problem, deployment area, and success outcomes..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="bg-sidebar hover:bg-sidebar-dark text-white font-semibold text-xs py-2 px-4 rounded shadow-sm transition">Post Opportunity</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. BROWSE CERTIFIED PILOTS */}
      {currentTab === "browse-certified" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Search by technology, keyword, or startup..." value={browseQuery} onChange={(e) => setBrowseQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
            </div>
            <select value={browseSector} onChange={(e) => setBrowseSector(e.target.value)} className="border border-slate-200 rounded px-3 py-1.5 text-xs bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-sidebar-active">
              <option value="All">All Domains</option>
              {Object.keys(sectorRules).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {pilots.filter(p => p.status === "Certified")
              .filter(p => browseQuery ? (p.title.toLowerCase().includes(browseQuery.toLowerCase()) || p.application?.startupName?.toLowerCase().includes(browseQuery.toLowerCase())) : true)
              .filter(p => browseSector !== "All" ? p.sector === browseSector : true)
              .map(p => (
                <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  <div className="lg:col-span-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5"><Award className="w-3 h-3" /> Certified</span>
                      <span className="text-[10px] font-semibold text-slate-400">{p.sector}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{p.title}</h3>
                    <p className="text-[10px] text-slate-500">By <strong className="text-sidebar">{p.application?.startupName}</strong> at {p.department}</p>
                    <p className="text-[10px] text-slate-500 italic line-clamp-2">"{p.verification?.notes}"</p>

                    {/* Shared adoption info */}
                    {procurements.filter(pr => pr.pilotId === p.id && pr.status === "Accepted").map(pr => (
                      <div key={pr.id} className="mt-1.5 p-2 bg-emerald-50/80 border border-emerald-200 rounded flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                        <span className="text-slate-700 font-medium flex items-center gap-1">
                          <Handshake className="w-3.5 h-3.5 text-emerald-700" />
                          Adopted by <strong>{pr.adoptingDepartment}</strong> (&thinsp;₹{pr.scaledBudget?.toLocaleString('en-IN')}&thinsp;)
                        </span>
                        <button
                          type="button"
                          onClick={() => setContractModalData({ type: "adoption", procurement: pr, pilot: p })}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[9px] py-1 px-2 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        >
                          <ScrollText className="w-3 h-3" /> Inspect Contract
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Audited Outcome</p>
                    <p className="text-xs font-bold text-emerald-800">{p.evidence?.waterLossReduction}</p>
                    <p className="text-[10px] text-slate-500">Duration: {p.evidence?.duration} | Score: {p.verification?.score}/100</p>
                  </div>
                  <div className="flex lg:flex-col gap-2 justify-end">
                    <button onClick={() => setSelectedPilot(p)} className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-[10px] py-1.5 px-2.5 rounded w-full text-center transition">View Log</button>
                    <button onClick={() => setAdoptionModalOpen(p.id)} className="bg-sidebar hover:bg-sidebar-dark text-white font-semibold text-[10px] py-1.5 px-2.5 rounded w-full text-center flex items-center justify-center gap-1 transition"><ArrowUpRight className="w-3 h-3" /> Adopt</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. PROCUREMENT HISTORY / AUDIT DEFENSE */}
      {currentTab === "procurement-history" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-sidebar text-white p-5 rounded-lg shadow-sm border-b-4 border-sidebar-accent">
            <h2 className="text-base font-bold flex items-center gap-2"><ShieldCheck className="text-sidebar-accent w-5 h-5" /> Audit Defense Procurement Record</h2>
            <p className="text-xs text-slate-300 mt-1">Official ledger of sponsored pilots and fast-track adoptions with GFR 2017 exemption references.</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3 border-b pb-2 uppercase tracking-wider">Sponsored Pilots Ledger</h3>
            {myPilots.length === 0 ? <p className="text-xs text-slate-400 italic">No pilots sponsored yet.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left">
                      <th className="pb-2 pr-4 font-semibold">Reference</th>
                      <th className="pb-2 pr-4 font-semibold">Cost</th>
                      <th className="pb-2 pr-4 font-semibold">Startup</th>
                      <th className="pb-2 pr-4 font-semibold">Status</th>
                      <th className="pb-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myPilots.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pr-4"><span className="font-semibold text-slate-800 block">{p.title}</span><span className="text-[9px] text-slate-400 font-mono">ID: {p.id}</span></td>
                        <td className="py-2.5 pr-4 font-semibold">₹{p.application?.proposedCost?.toLocaleString('en-IN') || p.budgetCap.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 pr-4 font-medium text-sidebar">{p.application?.startupName || "Unassigned"}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${p.status === "Certified" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                            {p.status === "Certified" ? "Verified" : p.status}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            {(p.status === "Running" || p.status === "Completed" || p.status === "Certified") && (
                              <button
                                type="button"
                                onClick={() => setContractModalData({ type: "pilot", pilot: p, application: p.application })}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <ScrollText className="w-3 h-3" /> Agreement
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDocketModalData({ type: "pilot", pilot: p })}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-sidebar-active" /> Audit Memo
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

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3 border-b pb-2 uppercase tracking-wider">Fast-Track Scaled Adoptions Ledger</h3>
            {myProcurements.length === 0 ? <p className="text-xs text-slate-400 italic">No scaled adoptions recorded yet.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left">
                      <th className="pb-2 pr-4 font-semibold">Procurement / Pilot</th>
                      <th className="pb-2 pr-4 font-semibold">Vendor Startup</th>
                      <th className="pb-2 pr-4 font-semibold">Budget</th>
                      <th className="pb-2 pr-4 font-semibold">Adoption Status</th>
                      <th className="pb-2 pr-4 font-semibold">GFR Code</th>
                      <th className="pb-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myProcurements.map(pr => (
                      <tr key={pr.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pr-4">
                          <span className="font-semibold text-slate-800 block">{pr.pilotTitle}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{pr.date} | Ref: {pr.id}</span>
                          {pr.targetScope && <span className="text-[10px] text-slate-500 block truncate max-w-xs">{pr.targetScope}</span>}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-sidebar block">{pr.startupName || "AquaSense Technologies"}</span>
                          <span className="text-[9px] text-slate-400">Source: {pr.sponsoringDepartment}</span>
                        </td>
                        <td className="py-2.5 pr-4 font-semibold text-emerald-700">₹{pr.scaledBudget.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            pr.status === "Accepted" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            pr.status === "Declined" ? "bg-rose-100 text-rose-800 border-rose-200" :
                            "bg-amber-100 text-amber-800 border-amber-200"
                          }`}>
                            {pr.status === "Accepted" ? "✓ Contract Executed" : pr.status === "Declined" ? "✕ Offer Declined" : "⏳ Awaiting Startup"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4"><span className="bg-blue-50 text-blue-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-blue-200">R170/R173</span></td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setContractModalData({ type: "adoption", procurement: pr, pilot: pilots.find(p => p.id === pr.pilotId) })}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            >
                              <ScrollText className="w-3 h-3" /> Contract
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocketModalData({ type: "procurement", procurement: pr, pilot: pilots.find(p => p.id === pr.pilotId) })}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-sidebar-active" /> Docket
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

          {/* State-Wide Inter-Municipal Contracts Registry (Shared Transparency) */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-sidebar-active" />
                  State-Wide Inter-Municipal Precedent Contracts Registry
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shared repository of all executed precedent contracts and SLA benchmarks across participating Urban Local Bodies (ULBs).
                </p>
              </div>
              <span className="bg-sidebar/10 text-sidebar font-bold text-[10px] px-2 py-0.5 rounded-full self-start sm:self-center">
                Mutual Open Transparency
              </span>
            </div>

            {procurements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No inter-municipal contracts registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left bg-slate-50">
                      <th className="py-2.5 px-3 font-semibold">Contract Ref &amp; Date</th>
                      <th className="py-2.5 px-3 font-semibold">Adopting ULB (Buyer)</th>
                      <th className="py-2.5 px-3 font-semibold">Vendor Startup</th>
                      <th className="py-2.5 px-3 font-semibold">Sponsoring Origin</th>
                      <th className="py-2.5 px-3 font-semibold">Contract Value</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Inspect Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {procurements.map(pr => {
                      const associatedPilot = pilots.find(p => p.id === pr.pilotId);
                      return (
                        <tr key={pr.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800 block">CTR-{pr.id.toUpperCase()}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{pr.date}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900 block">{pr.adoptingDepartment}</span>
                            <span className="text-[10px] text-slate-500">Officer: {pr.adoptingOfficialName}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-sidebar block">{pr.startupName || "AquaSense Technologies"}</span>
                            <span className="text-[9px] text-slate-400 font-mono">Precedent: {pr.pilotTitle}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">{pr.sponsoringDepartment}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">₹{pr.scaledBudget?.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              pr.status === "Accepted" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                              pr.status === "Declined" ? "bg-rose-100 text-rose-800 border-rose-200" :
                              "bg-amber-100 text-amber-800 border-amber-200"
                            }`}>
                              {pr.status === "Accepted" ? "✓ Contract Executed" : pr.status === "Declined" ? "✕ Declined" : "⏳ Pending Acceptance"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setContractModalData({ type: "adoption", procurement: pr, pilot: associatedPilot })}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <ScrollText className="w-3 h-3" /> View Contract
                              </button>
                              <button
                                type="button"
                                onClick={() => setDocketModalData({ type: "procurement", procurement: pr, pilot: associatedPilot })}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1 px-2 rounded flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-sidebar-active" /> Docket
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPLICANT PASSPORT MODAL */}
      {viewPassportApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-start sm:items-center p-4">
          <div className="max-w-2xl w-full my-6 relative animate-slide-up">
            <button
              onClick={() => setViewPassportApp(null)}
              className="absolute -top-3 -right-3 z-10 bg-white text-slate-500 hover:text-slate-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-slate-200 text-lg font-bold"
            >
              &times;
            </button>
            <PilotPassportPanel
              startupName={viewPassportApp.startupName}
              dpiitNo={viewPassportApp.dpiitNo}
              sector={viewPassportApp.sector}
              startupId={viewPassportApp.startupId}
              pilots={pilots}
              setDocketModalData={setDocketModalData}
            />
          </div>
        </div>
      )}

      {/* OFFICIAL EVIDENCE MODAL — unblocks pilots whose awarded applicant can't self-report */}
      {officialEvidencePilotId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-lg border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Log Outcome Evidence</h3>
                <p className="text-[11px] text-slate-500">
                  Record the vendor's results on their behalf — for cases where the awarded
                  startup hasn't submitted evidence through its own portal.
                </p>
              </div>
              <button onClick={() => setOfficialEvidencePilotId(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleOfficialEvidenceSubmit} className="space-y-3">
              <div className="bg-amber-50 text-amber-800 text-[10px] p-2.5 rounded border border-amber-200">
                <strong>Attention:</strong> Logging this evidence moves the pilot to independent verification.
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Key Performance Metric</label>
                <input type="text" required placeholder="e.g. 18% reduction in pipe-burst incidents" value={oeOutcome} onChange={(e) => setOeOutcome(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Duration</label>
                  <input type="text" required placeholder="e.g. 75 Days" value={oeDuration} onChange={(e) => setOeDuration(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assets Deployed</label>
                  <input type="text" required placeholder="e.g. 15 sensors" value={oeAssets} onChange={(e) => setOeAssets(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Technical Summary</label>
                <textarea rows={2} placeholder="Summarize outcomes..." value={oeSummary} onChange={(e) => setOeSummary(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOfficialEvidencePilotId(null)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-sidebar hover:bg-sidebar-dark text-white rounded text-xs font-semibold transition">Submit for Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackPilotId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-lg border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-bold text-slate-800">Sponsor Feedback</h3>
              <button onClick={() => setFeedbackPilotId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="bg-slate-50 p-2.5 rounded text-[11px] space-y-0.5">
                <p><strong>Pilot:</strong> {pilots.find(p => p.id === feedbackPilotId)?.title}</p>
                <p><strong>Outcome:</strong> {pilots.find(p => p.id === feedbackPilotId)?.evidence?.waterLossReduction}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Feedback Notes</label>
                <textarea required rows={3} placeholder="Provide compliance feedback..." value={sponsorNotes} onChange={(e) => setSponsorNotes(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setFeedbackPilotId(null)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-sidebar hover:bg-sidebar-dark text-white rounded text-xs font-semibold transition">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADOPT MODAL */}
      {adoptionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-5 shadow-lg border border-slate-200 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-emerald-600" /> Send Scaled Adoption Offer
                </h3>
                <p className="text-[10px] text-slate-500">Fast-track direct procurement offer under GFR 2017 Rules 170 &amp; 173 based on certified precedent.</p>
              </div>
              <button onClick={() => setAdoptionModalOpen(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>
            <form onSubmit={handleConfirmAdoption} className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-[11px] space-y-1">
                <span className="font-bold text-emerald-800 uppercase tracking-wide block text-[10px]">✓ Certified Precedent</span>
                <p><strong>Pilot:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.title}</p>
                <p><strong>Startup:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.application?.startupName}</p>
                <p><strong>Verified Metrics:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.evidence?.waterLossReduction}</p>
                <p><strong>Verifier:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.verification?.verifierName} (Score: {pilots.find(p => p.id === adoptionModalOpen)?.verification?.score}/100)</p>
              </div>
              <div className="bg-slate-50 p-3 rounded border text-[10px] space-y-1">
                <span className="font-bold text-slate-600 uppercase tracking-wide block">Statutory Justification</span>
                <p className="text-slate-500 italic">"Fast-tracked under State procurement sandbox policies. Vendor exempted from EMD (GFR Rule 170) and prior turnover/experience (Rule 173). Offer requires formal startup acceptance."</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Adopting Department</label>
                  <input type="text" required value={procureDept} onChange={(e) => setProcureDept(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Scaled Procurement Budget (INR)</label>
                  <input type="number" required placeholder="e.g. 2400000" value={procureBudget} onChange={(e) => setProcureBudget(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm font-semibold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Ward Deployment Scope</label>
                <textarea
                  rows={2}
                  value={adoptionScope}
                  onChange={(e) => setAdoptionScope(e.target.value)}
                  placeholder="e.g. Deploy 80 acoustic sensors across Nagpur Central Zone to replicate Pune Ward 12 water savings."
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAdoptionModalOpen(null)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Send Adoption Offer to Startup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPilot && <PilotDetailModal pilot={selectedPilot} onClose={() => setSelectedPilot(null)} currentUser={currentUser} />}
    </div>
  );
}

/* ==========================================================
   3. VERIFIER DASHBOARD & VIEWS
   ========================================================== */
function VerifierDashboard({
  currentTab, setCurrentTab, currentUser, pilots, setPilots, showToast, selectedPilot, setSelectedPilot, sectorRules
}) {
  const [activePilotId, setActivePilotId] = useState(null);
  const [score, setScore] = useState(90);
  const [notes, setNotes] = useState("");
  // Keyed by criterion index rather than fixed c1/c2/c3 — the checklist is
  // read live from the sector's published success criteria (Admin > Success
  // Criteria), which vary in count per sector and can change over time.
  const [criteriaChecks, setCriteriaChecks] = useState({});
  const [verificationMethod, setVerificationMethod] = useState("");
  const [evidenceReviewed, setEvidenceReviewed] = useState(false);
  const [noConflict, setNoConflict] = useState(false);

  const pendingList = pilots.filter(p => p.status === "Completed");
  const verifiedHistory = pilots.filter(p => p.status === "Certified" || p.status === "Rejected");

  const resetAuditForm = () => {
    setActivePilotId(null);
    setNotes("");
    setScore(90);
    setCriteriaChecks({});
    setVerificationMethod("");
    setEvidenceReviewed(false);
    setNoConflict(false);
  };

  const handleVerifyAction = (statusOption) => {
    if (!notes.trim()) { showToast("Please provide evaluator notes before deciding", "error"); return; }
    if (!verificationMethod) { showToast("Please select how this evidence was independently verified", "error"); return; }
    if (!evidenceReviewed || !noConflict) { showToast("Please confirm both compliance declarations before deciding", "error"); return; }
    const updated = pilots.map(p => {
      if (p.id === activePilotId) {
        let updatedEscrow = p.escrow;
        if (statusOption === "Certified" && p.escrow) {
          const updatedMilestones = p.escrow.milestones.map(m => {
            if (m.id === "m3" && m.status !== "Disbursed") {
              return {
                ...m,
                status: "Disbursed",
                disbursedAt: new Date().toISOString().split("T")[0],
                txRef: `TXN-PFMS-${Math.floor(10000 + Math.random() * 90000)}`
              };
            }
            return m;
          });
          const totalDisbursed = updatedMilestones.filter(m => m.status === "Disbursed").reduce((sum, m) => sum + m.amount, 0);
          updatedEscrow = {
            ...p.escrow,
            disbursedAmount: totalDisbursed,
            milestones: updatedMilestones
          };
        }
        const publishedCriteria = sectorRules[p.sector] || [];
        return {
          ...p,
          status: statusOption,
          verification: {
            verifierId: currentUser.id, verifierName: currentUser.name, score: parseInt(score),
            scorecard: publishedCriteria.length > 0
              ? publishedCriteria.map((criterion, idx) => ({ criterion, passed: criteriaChecks[idx] !== false }))
              : [{ criterion: "No success criteria were on file for this sector at audit time", passed: true }],
            verificationMethod,
            evidenceReviewed,
            noConflictOfInterest: noConflict,
            notes, certifiedAt: new Date().toISOString().split("T")[0]
          },
          escrow: updatedEscrow
        };
      }
      return p;
    });
    setPilots(updated);
    resetAuditForm();
    showToast(`Pilot verification complete: marked as ${statusOption}!${statusOption === "Certified" ? " Final milestone tranche released via PFMS." : ""}`, "success");
  };

  return (
    <div className="space-y-4">
      {/* PENDING QUEUE */}
      {currentTab === "pending" && (
        <div className="space-y-4 animate-fade-in">
          <DeskHeader
            eyebrow="Examination Bench"
            title={currentUser.organization}
            blurb="Score submitted evidence against the criteria the sponsoring department published before applications opened. Neither the startup nor the buyer grades this — that independence is what makes the record citable."
            standing={{ label: "Empanelled sector", value: currentUser.sector }}
          />

          <LedgerStrip items={[
            { label: "Awaiting audit", value: pendingList.length, note: "Pilots with evidence submitted" },
            { label: "Certified by you", value: pilots.filter(p => p.verification?.verifierId === currentUser.id).length, note: "Outcomes you have signed off" },
          ]} />

          {pendingList.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="text-center text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">Queue Cleared</p>
                <p className="text-xs mt-1">No pilot has evidence submitted and awaiting audit right now.</p>
              </div>
              {/* A pilot only reaches this queue after: posted -> a startup applies -> the
                  sponsoring official selects one -> evidence is submitted (by the startup,
                  or logged by the official). This breaks down exactly where the pipeline
                  actually stands, since an empty queue looks identical whether nothing has
                  happened yet or everything is already certified. */}
              {(() => {
                const openCount = pilots.filter(p => p.status === "Open" || p.status === "Applied").length;
                const runningCount = pilots.filter(p => p.status === "Running").length;
                const certifiedCount = pilots.filter(p => p.status === "Certified").length;
                if (openCount + runningCount + certifiedCount === 0) return null;
                return (
                  <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <span className="block font-display text-xl font-extrabold text-slate-700 tabular-nums">{openCount}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Open / awaiting a selected vendor</span>
                    </div>
                    <div>
                      <span className="block font-display text-xl font-extrabold text-slate-700 tabular-nums">{runningCount}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Running — no evidence submitted yet</span>
                    </div>
                    <div>
                      <span className="block font-display text-xl font-extrabold text-emerald-600 tabular-nums">{certifiedCount}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Already certified</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            pendingList.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">Awaiting Audit</span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1.5">{p.title}</h3>
                    <p className="text-[10px] text-slate-500">Startup: <strong className="text-sidebar">{p.application?.startupName}</strong> | {p.sector}</p>
                  </div>
                  <button onClick={() => setSelectedPilot(p)} className="text-[10px] text-sidebar-active font-bold hover:underline">Full Details</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded border">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Startup Submission</h4>
                    <ul className="text-[11px] space-y-0.5 text-slate-600">
                      <li><strong>Outcome:</strong> {p.evidence.waterLossReduction}</li>
                      <li><strong>Duration:</strong> {p.evidence.duration}</li>
                      <li><strong>Assets:</strong> {p.evidence.sensorsDeployed}</li>
                      <li className="mt-1 text-slate-400 italic">"{p.evidence.summary}"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sponsor Feedback</h4>
                    {p.evidence.sponsorFeedback ? (
                      <p className="text-[11px] text-slate-600 italic">"{p.evidence.sponsorFeedback}"</p>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 p-1.5 rounded block">Pending sponsor feedback.</span>
                    )}
                  </div>
                </div>

                {activePilotId !== p.id ? (
                  <button onClick={() => { resetAuditForm(); setActivePilotId(p.id); }} className="bg-sidebar hover:bg-sidebar-dark text-white font-semibold text-xs py-1.5 px-3 rounded transition">
                    Evaluate &amp; Complete Audit
                  </button>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border-2 border-sidebar space-y-4 animate-slide-up">
                    <div className="border-b pb-1.5">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Independent Technical Audit Form</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Every field below is retained on the certified record and reproduced in the CVC/CAG audit docket.</p>
                    </div>

                    {/* 1. Published sector criteria — read live, not hardcoded, so it always
                        reflects whatever Admin currently publishes for this pilot's sector. */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        1. Published Success Criteria — {p.sector}
                      </label>
                      {(sectorRules[p.sector] || []).length === 0 ? (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-2">
                          No success criteria are on file for "{p.sector}" yet. Admin should publish them under Success Criteria — score the submission on its narrative merits below in the meantime.
                        </p>
                      ) : (
                        <div className="space-y-1.5 bg-white p-2.5 rounded border border-slate-200">
                          {(sectorRules[p.sector] || []).map((criterion, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={criteriaChecks[idx] !== false}
                                onChange={(e) => setCriteriaChecks(prev => ({ ...prev, [idx]: e.target.checked }))}
                                className="rounded border-slate-300 text-sidebar-active"
                              />
                              <span>{criterion}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. How the evidence was actually checked, not just what was submitted. */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">2. Verification Method</label>
                      <select
                        required
                        value={verificationMethod}
                        onChange={(e) => setVerificationMethod(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sidebar-active"
                      >
                        <option value="" disabled>How was this evidence independently checked?</option>
                        <option value="Site Visit">Site Visit — physical inspection of the deployment</option>
                        <option value="Remote Telemetry Audit">Remote Telemetry Audit — cross-checked live sensor/SCADA data</option>
                        <option value="Document Review">Document Review — desk audit of submitted reports</option>
                        <option value="Third-Party Lab Report">Third-Party Lab Report — independent test certificate</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">3. Score (0-100)</label>
                        <div className="flex items-center gap-2">
                          <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} className="flex-grow accent-sidebar-active" />
                          <span className="font-bold text-xs text-slate-800 w-10 text-right">{score}/100</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">4. Technical Findings &amp; Auditor Notes</label>
                      <textarea required rows={3} placeholder="Detailed assessment: what was checked, what it showed, and why it does or doesn't support the outcome claimed..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none" />
                    </div>

                    {/* 3. Compliance declarations — a real audit form doesn't just record a
                        score, it records that the auditor is independent and actually looked. */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">5. Auditor Declarations</label>
                      <div className="space-y-1.5 bg-white p-2.5 rounded border border-slate-200">
                        <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer">
                          <input type="checkbox" checked={evidenceReviewed} onChange={(e) => setEvidenceReviewed(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-sidebar-active" />
                          <span>I have reviewed the submitted evidence documentation and consider it sufficient to support this decision.</span>
                        </label>
                        <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer">
                          <input type="checkbox" checked={noConflict} onChange={(e) => setNoConflict(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-sidebar-active" />
                          <span>I declare no financial or personal conflict of interest with the vendor or the sponsoring department.</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1 border-t border-slate-200">
                      <button onClick={resetAuditForm} className="border border-slate-300 text-slate-500 py-1.5 px-2.5 rounded text-[10px] font-semibold">Cancel</button>
                      <button
                        onClick={() => handleVerifyAction("Rejected")}
                        disabled={!notes.trim() || !verificationMethod || !evidenceReviewed || !noConflict}
                        className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-1.5 px-2.5 rounded text-[10px] transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyAction("Certified")}
                        disabled={!notes.trim() || !verificationMethod || !evidenceReviewed || !noConflict}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-1.5 px-2.5 rounded text-[10px] transition"
                      >
                        Certify
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* VERIFIED HISTORY */}
      {currentTab === "history" && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Past Audit Decisions</h3>
          {verifiedHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-5">No audits processed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left">
                    <th className="pb-2 pr-4 font-semibold">Pilot</th>
                    <th className="pb-2 pr-4 font-semibold">Startup</th>
                    <th className="pb-2 pr-4 font-semibold">Score</th>
                    <th className="pb-2 pr-4 font-semibold">Decision</th>
                    <th className="pb-2 text-right font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {verifiedHistory.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-4"><span className="font-semibold text-slate-800 block text-xs">{p.title}</span><span className="text-[10px] text-slate-400">{p.sector}</span></td>
                      <td className="py-3 pr-4 font-semibold text-sidebar text-xs">{p.application.startupName}</td>
                      <td className="py-3 pr-4 font-mono font-bold text-xs">{p.verification?.score}/100</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === "Certified" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>{p.status}</span>
                      </td>
                      <td className="py-3 text-right"><button onClick={() => setSelectedPilot(p)} className="text-slate-400 hover:text-slate-700 text-[10px] font-bold">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedPilot && <PilotDetailModal pilot={selectedPilot} onClose={() => setSelectedPilot(null)} currentUser={currentUser} />}
    </div>
  );
}

/* ==========================================================
   4. ADMIN / NODAL BODY DASHBOARD & VIEWS
   ========================================================== */
function AdminDashboard({
  currentTab, setCurrentTab, currentUser, pilots, setPilots, procurements,
  verifiers, setVerifiers, onboardingRequests, setOnboardingRequests,
  users, setUsers, sectorRules, setSectorRules, showToast
}) {
  const [vName, setVName] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vSector, setVSector] = useState("Water & Sanitation");
  const [vState, setVState] = useState("Maharashtra");
  const [activeRuleSector, setActiveRuleSector] = useState("Water & Sanitation");
  const [newRuleCriterion, setNewRuleCriterion] = useState("");
  const [oversightQuery, setOversightQuery] = useState("");

  const totalPilotsCount = pilots.length;
  const certifiedCount = pilots.filter(p => p.status === "Certified").length;
  const acceptedProcurements = procurements.filter(pr => pr.status === "Accepted");
  const scaleAdoptionsCount = acceptedProcurements.length;
  const totalPilotValue = pilots.reduce((acc, curr) => acc + (curr.application?.proposedCost || curr.budgetCap), 0);
  const totalProcurementValue = acceptedProcurements.reduce((acc, curr) => acc + curr.scaledBudget, 0);
  const totalValueUnlocked = totalPilotValue + totalProcurementValue;

  const handleAddVerifier = (e) => {
    e.preventDefault();
    if (!vName || !vEmail) { showToast("Verifier name and email are required", "error"); return; }
    const newV = { id: `v_${Date.now()}`, name: vName, sector: vSector, state: vState };
    setVerifiers(prev => [...prev, newV]);
    const userKey = `verifier_${Date.now()}`;
    setUsers(prev => ({ ...prev, [userKey]: { id: userKey, name: vName, email: vEmail, role: "Verifier", organization: `${vState} Technical Evaluation Agency`, sector: vSector } }));
    setVName(""); setVEmail("");
    showToast(`Verifier "${vName}" onboarded!`, "success");
  };

  const handleApproveOfficial = (reqId) => {
    const targetReq = onboardingRequests.find(r => r.id === reqId);
    const userKey = `official_${Date.now()}`;
    setUsers(prev => ({ ...prev, [userKey]: { id: userKey, name: targetReq.name, email: targetReq.email, role: "Government Official", department: targetReq.department, designation: targetReq.designation, employeeId: targetReq.employeeId, status: "Approved" } }));
    setOnboardingRequests(prev => prev.filter(r => r.id !== reqId));
    showToast(`Account approved for ${targetReq.name}`, "success");
  };

  const handleRejectOfficial = (reqId) => {
    setOnboardingRequests(prev => prev.filter(r => r.id !== reqId));
    showToast("Registration request rejected.", "info");
  };

  const handleAddCriterion = (e) => {
    e.preventDefault();
    if (!newRuleCriterion.trim()) return;
    setSectorRules(prev => ({ ...prev, [activeRuleSector]: [...prev[activeRuleSector], newRuleCriterion] }));
    setNewRuleCriterion("");
    showToast("Criterion added", "success");
  };

  const handleRemoveCriterion = (sector, index) => {
    const list = [...sectorRules[sector]];
    list.splice(index, 1);
    setSectorRules(prev => ({ ...prev, [sector]: list }));
    showToast("Criterion removed", "info");
  };

  return (
    <div className="space-y-4">
      {/* 1. SYSTEM ANALYTICS */}
      {currentTab === "analytics" && (
        <div className="space-y-5 animate-fade-in">
          <DeskHeader
            eyebrow="Registry Oversight"
            title="Maharashtra State Innovation Society"
            blurb="Empanel the technical auditors, publish the success criteria each sector is judged against, and hold the state-wide register of certified precedents."
            standing={{ label: "Office", value: currentUser.designation }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-stretch">
            <LedgerStrip items={[
              { label: "Pilots on register", value: totalPilotsCount, note: "Across all participating bodies" },
              { label: "Certified", value: certifiedCount, note: "Passed independent verification" },
              { label: "Adoptions", value: scaleAdoptionsCount, note: "Procured without a fresh tender" },
            ]} />
            <div className="bg-sidebar text-white rounded-md px-6 py-5 flex flex-col justify-center border-l-[3px] border-sidebar-accent min-w-[210px]">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-blue-100/75">Value unlocked</span>
              <span className="font-display text-[1.75rem] font-extrabold mt-1.5 leading-none tabular-nums">
                ₹{totalValueUnlocked.toLocaleString('en-IN')}
              </span>
              <span className="text-[10.5px] text-sidebar-accent font-semibold mt-2">
                ✓ Pilot spend + adoption contracts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Donut Chart */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pilots by Status</h3>
              <MiniDonutChart
                segments={[
                  { label: "Certified", value: pilots.filter(p => p.status === "Certified").length, color: "#10b981" },
                  { label: "Running", value: pilots.filter(p => p.status === "Running").length, color: "#3b82f6" },
                  { label: "Completed", value: pilots.filter(p => p.status === "Completed").length, color: "#f59e0b" },
                  { label: "Applied", value: pilots.filter(p => p.status === "Applied").length, color: "#6366f1" },
                  { label: "Open", value: pilots.filter(p => p.status === "Open").length, color: "#64748b" },
                ]}
              />
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Audit Status Breakdown</h3>
              <div className="flex flex-col space-y-3">
                <BarItem label="Certified" value={pilots.filter(p => p.status === "Certified").length} max={totalPilotsCount} color="bg-emerald-500" />
                <BarItem label="Running" value={pilots.filter(p => p.status === "Running").length} max={totalPilotsCount} color="bg-blue-500" />
                <BarItem label="Completed" value={pilots.filter(p => p.status === "Completed").length} max={totalPilotsCount} color="bg-amber-500" />
                <BarItem label="Applied" value={pilots.filter(p => p.status === "Applied").length} max={totalPilotsCount} color="bg-indigo-400" />
                <BarItem label="Open" value={pilots.filter(p => p.status === "Open").length} max={totalPilotsCount} color="bg-slate-400" />
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Scaled Procurements</h3>
                <AdoptionsLineChart procurements={procurements} />
              </div>
              <div className="bg-slate-50 p-3 rounded border text-[11px] space-y-1.5 mt-3">
                <div className="flex justify-between font-bold border-b pb-1 text-[10px] text-slate-500 uppercase">
                  <span>Department</span><span>Amount</span>
                </div>
                {procurements.map(pr => (
                  <div key={pr.id} className="flex justify-between">
                    <span className="text-slate-600">{pr.adoptingDepartment}</span>
                    <span className="font-semibold text-sidebar-active">₹{pr.scaledBudget.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFIER MANAGEMENT */}
      {currentTab === "verifiers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="md:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Active Technical Verifiers</h3>
            <div className="divide-y divide-slate-100">
              {verifiers.map(v => (
                <div key={v.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-700 text-xs">{v.name}</h4>
                    <p className="text-[10px] text-slate-400">{v.sector} | {v.state}</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[9px] border border-blue-200">Auditor</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-max">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Add Verifier</h3>
            <form onSubmit={handleAddVerifier} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Name</label>
                <input type="text" required placeholder="e.g. Dr. Kavita Rao" value={vName} onChange={(e) => setVName(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
                <input type="email" required placeholder="email@org" value={vEmail} onChange={(e) => setVEmail(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sector</label>
                <select value={vSector} onChange={(e) => setVSector(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm">
                  {Object.keys(sectorRules).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">State</label>
                <input type="text" required placeholder="e.g. Maharashtra" value={vState} onChange={(e) => setVState(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
              </div>
              <button type="submit" className="w-full bg-sidebar hover:bg-sidebar-dark text-white font-bold py-1.5 rounded text-xs transition">Add Verifier</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. DEPARTMENT ONBOARDING */}
      {currentTab === "onboarding" && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">Official Registration Requests</h3>
          {onboardingRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic text-xs">No pending registration approvals.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {onboardingRequests.map(r => (
                <div key={r.id} className="py-3 sm:flex sm:justify-between sm:items-center">
                  <div className="space-y-0.5">
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">Pending</span>
                    <h4 className="font-bold text-slate-800 text-sm">{r.name}</h4>
                    <p className="text-[10px] text-slate-500"><strong>{r.designation}</strong> at <strong>{r.department}</strong></p>
                    <p className="text-[10px] text-slate-400 font-mono">{r.email} | {r.employeeId}</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button onClick={() => handleRejectOfficial(r.id)} className="border border-slate-200 text-slate-500 font-semibold px-3 py-1 rounded text-[10px] hover:bg-slate-50 transition">Reject</button>
                    <button onClick={() => handleApproveOfficial(r.id)} className="bg-sidebar hover:bg-sidebar-dark text-white font-bold px-3 py-1 rounded text-[10px] transition">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SECTOR CRITERIA RULES */}
      {currentTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="md:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Success Criteria Templates</h3>
            {Object.keys(sectorRules).map(sector => (
              <div key={sector} className="space-y-1.5">
                <h4 className="font-bold text-xs text-sidebar border-l-3 border-sidebar pl-2 uppercase tracking-wide" style={{ borderLeft: "3px solid #2A3F54", paddingLeft: "8px" }}>{sector}</h4>
                <ul className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-3 rounded border">
                  {sectorRules[sector].map((criterion, idx) => (
                    <li key={idx} className="flex justify-between items-center py-0.5">
                      <span>&bull; {criterion}</span>
                      <button onClick={() => handleRemoveCriterion(sector, idx)} className="text-rose-500 font-bold hover:underline text-[10px]">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-max">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Add Criterion</h3>
            <form onSubmit={handleAddCriterion} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sector</label>
                <select value={activeRuleSector} onChange={(e) => setActiveRuleSector(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm">
                  {Object.keys(sectorRules).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Criterion Text</label>
                <input type="text" required placeholder="e.g. pilot ran ≥90 days" value={newRuleCriterion} onChange={(e) => setNewRuleCriterion(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-sidebar hover:bg-sidebar-dark text-white font-bold py-1.5 rounded text-xs transition">Add Criterion</button>
            </form>
          </div>
        </div>
      )}

      {/* 5. REGISTRY OVERSIGHT */}
      {currentTab === "oversight" && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 animate-fade-in">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Registry Master Table</h3>
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search..." value={oversightQuery} onChange={(e) => setOversightQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
            </div>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] text-slate-500 font-bold uppercase tracking-wider text-left">
                  <th className="pb-2 pr-4">Reference</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Entities</th>
                  <th className="pb-2 pr-4">Value</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {pilots
                  .filter(p => oversightQuery ? (p.title.toLowerCase().includes(oversightQuery.toLowerCase()) || p.department.toLowerCase().includes(oversightQuery.toLowerCase())) : true)
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2 pr-4"><span className="font-semibold text-slate-800 block">{p.title}</span><span className="text-[9px] text-slate-400 font-mono">{p.id}</span></td>
                      <td className="py-2 pr-4 font-semibold uppercase text-slate-400 text-[9px]">PILOT ({p.sector})</td>
                      <td className="py-2 pr-4"><p>Dept: {p.department}</p><p>Startup: {p.application?.startupName || "—"}</p></td>
                      <td className="py-2 pr-4 font-semibold">₹{p.application?.proposedCost?.toLocaleString('en-IN') || p.budgetCap.toLocaleString('en-IN')}</td>
                      <td className="py-2"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                {procurements
                  .filter(pr => oversightQuery ? (pr.pilotTitle.toLowerCase().includes(oversightQuery.toLowerCase()) || pr.adoptingDepartment.toLowerCase().includes(oversightQuery.toLowerCase())) : true)
                  .map(pr => (
                    <tr key={pr.id} className="bg-emerald-50/20 hover:bg-emerald-50/40">
                      <td className="py-2 pr-4"><span className="font-semibold text-emerald-900 block">{pr.pilotTitle}</span><span className="text-[9px] text-slate-400 font-mono">{pr.id}</span></td>
                      <td className="py-2 pr-4 font-bold text-emerald-700 uppercase text-[9px]">PROCUREMENT</td>
                      <td className="py-2 pr-4"><p>Adopter: {pr.adoptingDepartment}</p><p>Source: {pr.sponsoringDepartment}</p></td>
                      <td className="py-2 pr-4 font-bold text-sidebar-active">₹{pr.scaledBudget.toLocaleString('en-IN')}</td>
                      <td className="py-2"><span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[9px] border border-emerald-200">Adopted</span></td>
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

/* ==========================================================
   SHARED COMPONENTS
   ========================================================== */
function TabButton({ active, label, onClick, icon }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${active ? "bg-sidebar text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}>
      {icon}<span>{label}</span>
    </button>
  );
}

function AdoptionsLineChart({ procurements }) {
  const points = [...procurements].sort((a, b) => a.date.localeCompare(b.date)).map((pr, i) => ({ date: pr.date, cumulative: i + 1 }));
  if (points.length === 0) {
    return <div className="mt-2 h-32 flex items-center justify-center bg-slate-50 rounded border text-[10px] text-slate-400">No scaled adoptions yet.</div>;
  }
  const W = 380, H = 140, PAD = 28;
  const maxY = Math.max(2, points[points.length - 1].cumulative);
  const x = (i) => PAD + (points.length === 1 ? (W - 2 * PAD) / 2 : (i * (W - 2 * PAD)) / (points.length - 1));
  const y = (v) => H - PAD - (v / maxY) * (H - 2 * PAD);
  const path = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(pt.cumulative)}`).join(" ");
  const area = `${path} L ${x(points.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;
  return (
    <div className="mt-2 bg-slate-50 rounded border p-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cumulative Adoptions</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" role="img">
        {[0, 0.5, 1].map((f) => <line key={f} x1={PAD} x2={W - PAD} y1={y(maxY * f)} y2={y(maxY * f)} stroke="#e2e8f0" strokeWidth="1" />)}
        <text x={4} y={y(maxY) + 4} fontSize="11" fill="#64748b">{maxY}</text>
        <text x={4} y={y(0) + 4} fontSize="11" fill="#64748b">0</text>
        <path d={area} fill="#1ABB9C" opacity="0.12" />
        <path d={path} fill="none" stroke="#1ABB9C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((pt, i) => (
          <g key={pt.date + i}>
            <circle cx={x(i)} cy={y(pt.cumulative)} r="3.5" fill="#1ABB9C" />
            <text x={x(i)} y={H - PAD + 14} fontSize="10" fill="#475569" textAnchor="middle">{pt.date}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function MiniDonutChart({ segments }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  if (total === 0) return <div className="h-40 flex items-center justify-center text-[10px] text-slate-400">No data</div>;
  const R = 60, r = 38, cx = 80, cy = 70;
  let cumAngle = -90;
  const arcs = segments.filter(s => s.value > 0).map(s => {
    const angle = (s.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + R * Math.cos(startRad), y1 = cy + R * Math.sin(startRad);
    const x2 = cx + R * Math.cos(endRad), y2 = cy + R * Math.sin(endRad);
    const ix1 = cx + r * Math.cos(startRad), iy1 = cy + r * Math.sin(startRad);
    const ix2 = cx + r * Math.cos(endRad), iy2 = cy + r * Math.sin(endRad);
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    return { ...s, d };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 140" className="w-32 h-28 flex-shrink-0">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">Total</text>
      </svg>
      <div className="space-y-1.5">
        {segments.filter(s => s.value > 0).map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600">{s.label}</span>
            <span className="font-bold text-slate-800 ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarItem({ label, value, max, color }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px] font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-800 font-bold">{value}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.max(percent, 2)}%` }} />
      </div>
    </div>
  );
}

/* A government statistics return rather than a row of floating cards: one ruled
   block, hairline divisions, tabular figures. Replaces the 4-up StatCard grid. */
function LedgerStrip({ items }) {
  // Static strings so Tailwind's scanner keeps these classes.
  const cols = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[items.length] || "lg:grid-cols-4";
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white h-full">
      <div className="h-[3px] bg-sidebar-active" />
      <div className={`grid grid-cols-2 ${cols} gap-px bg-slate-200 h-full`}>
        {items.map((it, i) => (
          <div
            key={it.label}
            /* an odd count leaves a hole in the 2-up phone grid — let the last one span it */
            className={`bg-white px-5 py-4 ${
              items.length % 2 === 1 && i === items.length - 1 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <span className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500">
              {it.label}
            </span>
            <span className="block font-display text-[1.85rem] font-extrabold text-sidebar leading-none mt-1.5 tabular-nums">
              {it.value}
            </span>
            {it.note && (
              <span className="block text-[11px] text-slate-500 mt-1.5 leading-snug">{it.note}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Each role opens on its own desk: who you are here, what this desk is for, and
   the credential you act under. Keeps the four personas from reading alike. */
function DeskHeader({ eyebrow, title, blurb, standing, action }) {
  return (
    <div className="bg-white border border-slate-200 border-l-[3px] border-l-sidebar-active rounded-r-md px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="min-w-0">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-sidebar-active">
          {eyebrow}
        </span>
        <h2 className="font-display font-bold text-[1.05rem] text-slate-800 mt-1.5 leading-tight">{title}</h2>
        <p className="text-[12.5px] text-slate-500 mt-1 max-w-[64ch] leading-relaxed">{blurb}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {standing && (
          <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
            <span className="block font-mono text-[9px] uppercase tracking-[0.13em] text-slate-500">
              {standing.label}
            </span>
            <span className="block font-mono text-[12.5px] font-semibold text-slate-800 mt-0.5">
              {standing.value}
            </span>
          </div>
        )}
        {action}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
      <span className="text-2xl font-bold text-slate-800 block mt-0.5">{value}</span>
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
  return (
    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {status === "Completed" ? "Pending Audit" : status}
    </span>
  );
}

function PilotDetailModal({ pilot, onClose, currentUser }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-5 shadow-lg border border-slate-200 animate-slide-up">
        <div className="flex justify-between items-start border-b pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={pilot.status} />
              <span className="text-[10px] text-slate-400 font-semibold">{pilot.sector}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-1">{pilot.title}</h3>
            <p className="text-[10px] text-slate-400">Ref: {pilot.id} | Budget: ₹{pilot.budgetCap.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
        </div>

        <div className="space-y-4 text-sm text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
            <p className="text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded">{pilot.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sponsor</h4>
              <p className="text-xs font-semibold text-slate-700">{pilot.department}</p>
              <p className="text-[10px] text-slate-500">Officer: {pilot.sponsoringOfficialName}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</h4>
              <p className="text-xs font-semibold text-slate-700">{pilot.durationDays} Days</p>
            </div>
          </div>

          {pilot.applications && pilot.applications.length > 0 ? (
            <div className="border border-slate-200 rounded p-3 bg-slate-50/60 space-y-2.5">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Applicant Proposals ({pilot.applications.length})</h4>
                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">DPIIT Verified</span>
              </div>
              <div className="space-y-2">
                {pilot.applications.map((app, idx) => (
                  <div key={app.id || idx} className="bg-white p-2.5 rounded border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{app.startupName} <span className="font-mono font-normal text-slate-400">({app.dpiitNo})</span></span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        app.status === "Selected" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                        app.status === "Rejected" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                        "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>{app.status || "Pending"}</span>
                    </div>
                    <p className="text-slate-700"><strong>Cost:</strong> ₹{app.proposedCost?.toLocaleString('en-IN')}</p>
                    {app.proposedScope && <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 text-[10px] leading-relaxed"><strong>Scope:</strong> {app.proposedScope}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : pilot.application ? (
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50 space-y-1.5">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Application</h4>
                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">DPIIT Verified</span>
              </div>
              <p className="text-[11px]"><strong>Startup:</strong> {pilot.application.startupName} ({pilot.application.dpiitNo})</p>
              <p className="text-[11px]"><strong>Cost:</strong> ₹{pilot.application.proposedCost?.toLocaleString('en-IN')}</p>
              <p className="text-[11px] bg-white p-2 rounded border"><strong>Scope:</strong> {pilot.application.proposedScope}</p>
            </div>
          ) : null}

          {pilot.evidence && (
            <div className="border border-amber-200 rounded p-3 bg-amber-50/10 space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 border-b pb-1">Outcome Evidence</h4>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div><strong>Metric:</strong> <span className="font-bold text-sidebar-active">{pilot.evidence.waterLossReduction}</span></div>
                <div><strong>Assets:</strong> {pilot.evidence.sensorsDeployed}</div>
              </div>
              <p className="text-[11px] bg-white p-2 rounded border"><strong>Narrative:</strong> {pilot.evidence.summary}</p>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] font-mono text-slate-400">{pilot.evidence.docs}</span>
                <span className="text-[9px] text-slate-400">Submitted: {pilot.evidence.submittedAt}</span>
              </div>
              {pilot.evidence.sponsorFeedback && (
                <div className="bg-slate-50 p-2 rounded border mt-1 text-[11px]">
                  <strong>Sponsor Feedback:</strong>
                  <p className="italic text-slate-500 mt-0.5">"{pilot.evidence.sponsorFeedback}"</p>
                </div>
              )}
            </div>
          )}

          {pilot.verification && (
            <div className="border border-emerald-200 rounded p-3 bg-emerald-50/20 space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 border-b pb-1">Certification</h4>
              <p className="text-[11px]"><strong>Score:</strong> <span className="font-bold text-emerald-700">{pilot.verification.score}/100</span></p>
              {pilot.verification.verificationMethod && (
                <p className="text-[11px]"><strong>Verification Method:</strong> {pilot.verification.verificationMethod}</p>
              )}
              <div className="space-y-0.5">
                {pilot.verification.scorecard.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[10px] font-semibold">
                    {c.passed ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                    <span className={c.passed ? "text-emerald-700" : "text-rose-700"}>{c.criterion}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] bg-white p-2 rounded border italic">"{pilot.verification.notes}"</p>
              <p className="text-[9px] font-bold text-slate-400">By: {pilot.verification.verifierName} on {pilot.verification.certifiedAt}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-3 mt-4 flex justify-end">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-1.5 px-3 rounded text-xs transition">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   5. CVC / CAG VIGILANCE AUDIT DEFENSE DOCKET MODAL
   ========================================================== */
function AuditDocketModal({ data, pilots, procurements, onClose, showToast }) {
  const pilot = data.pilot || (data.procurement ? pilots.find(p => p.id === data.procurement.pilotId) : pilots[0]) || pilots[0];
  const procurement = data.procurement || procurements.find(pr => pr.pilotId === pilot?.id) || procurements[0];
  const startup = pilot?.application || {
    startupName: procurement?.startupName || "AquaSense Technologies",
    dpiitNo: "DPIIT98372",
    proposedCost: 750000
  };

  const docketRef = `MAHA-MSInS-DOCKET-${pilot?.id?.toUpperCase() || "P1"}-2026`;
  const scaledAmount = procurement?.scaledBudget || 2400000;
  const estimatedTenderCost = Math.round(scaledAmount * 1.6);
  const totalSavings = estimatedTenderCost - scaledAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(docketRef);
    }
    showToast("Audit Docket Reference copied to clipboard!", "success");
  };

  return (
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-3 sm:p-5 print:p-0 print:bg-white">
      <div className="print-document bg-white rounded-lg max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none animate-slide-up">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-sidebar text-white px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 print:hidden flex-shrink-0 border-b-2 border-sidebar-accent">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0 text-sidebar-accent" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white">CVC / CAG Vigilance Audit Defense Docket</h3>
              <p className="text-[10px] text-blue-100/70 font-mono line-clamp-2 sm:line-clamp-none">Statutory Exemption Certificate under GFR 2017 Rules 166, 170 &amp; 173</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRef}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Copy Ref
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-sidebar-active hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Scrollable Printable Memo Content */}
        <div className="p-4 sm:p-8 overflow-y-auto print:overflow-visible space-y-6 text-slate-800 font-serif leading-relaxed text-xs">
          {/* Government Formal Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-500 bg-amber-50 text-amber-900 font-bold text-lg mb-1 shadow-xs">
              🏛️
            </div>
            <h2 className="doc-serif text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
              Government of Maharashtra
            </h2>
            <h3 className="doc-serif text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-700">
              Urban Development Department &amp; Maharashtra State Innovation Society (MSInS)
            </h3>
            <p className="text-[10px] text-slate-500 font-sans tracking-wide">
              Civil Secretariat, Mantralaya, Mumbai – 400032 | State Innovation Procurement Sandbox Framework
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-2 text-[10px] font-sans pt-2 border-t border-slate-200 text-slate-600">
              <span><strong>Docket Ref:</strong> {docketRef}</span>
              <span><strong>Issued Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span><strong>Vigilance Code:</strong> GFR-2017-R170/173/166</span>
            </div>
          </div>

          {/* Memo Title */}
          <div className="text-center space-y-1 bg-slate-50 p-3 rounded border border-slate-200 font-sans">
            <span className="bg-emerald-100 text-emerald-900 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
              Official Memorandum &bull; Statutory Audit Defense
            </span>
            <h4 className="doc-serif font-bold text-sm text-slate-900 uppercase">
              Compliance Certificate for Precedent-Based Public Procurement
            </h4>
            <p className="text-[11px] text-slate-600 italic">
              Record of Due Diligence, Empirical Precedent Verification &amp; Price Reasonableness
            </p>
          </div>

          {/* 1. Contracting Parties */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sidebar-active inline-block rounded-xs"></span>
              1. Contracting Entities &amp; Precedent Provenance
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50/70 p-3 rounded border border-slate-200">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Procuring / Adopting Entity</p>
                <p className="font-bold text-slate-800">{procurement?.adoptingDepartment || "Nagpur Municipal Corporation"}</p>
                <p className="text-slate-600 text-[10px]">Competent Authority: {procurement?.adoptingOfficialName || "Meera (Addl. Commissioner)"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Sponsoring / Pilot Entity</p>
                <p className="font-bold text-slate-800">{pilot?.department || "Pune Municipal Corporation"}</p>
                <p className="text-slate-600 text-[10px]">Superintending Officer: {pilot?.sponsoringOfficialName || "Arjun"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Technology Vendor (Startup)</p>
                <p className="font-bold text-sidebar">{startup.startupName}</p>
                <p className="text-slate-600 text-[10px]">DPIIT Registration No: <strong className="font-mono text-slate-900">{startup.dpiitNo}</strong></p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Precedent Pilot Title</p>
                <p className="font-bold text-slate-800 truncate">{pilot?.title}</p>
                <p className="text-slate-600 text-[10px]">Sector: {pilot?.sector} | Duration: {pilot?.durationDays} Days</p>
              </div>
            </div>
          </div>

          {/* 2. Statutory Regulatory Justification Matrix */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sidebar-active inline-block rounded-xs"></span>
              2. Statutory Exemption Matrix (General Financial Rules 2017)
            </h4>
            <div className="border border-slate-200 rounded overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3 text-left">Statutory Rule</th>
                    <th className="py-2 px-3 text-left">Prescribed Exemption</th>
                    <th className="py-2 px-3 text-left">Audit Compliance Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono">GFR Rule 170</td>
                    <td className="py-2 px-3">Exemption from Earnest Money Deposit (Bid Security)</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">✓ Verified DPIIT Certificate {startup.dpiitNo}. EMD requirement legally waived.</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono">GFR Rule 173(i)</td>
                    <td className="py-2 px-3">Relaxation of Prior Turnover and Prior Experience conditions</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">✓ Precedent Pilot verified with &ge;15% outcome benchmark, waiving ₹10 Cr turnover condition.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono">GFR Rule 166</td>
                    <td className="py-2 px-3">Single Source Procurement for Proprietary Civic Innovation</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">✓ Proprietary acoustic IoT telemetry tested and certified. No comparable domestic alternative available.</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono">MSInS Sandbox GR</td>
                    <td className="py-2 px-3">State Government Resolution on Inter-Agency Scaling</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">✓ Municipal Commissioner authorized to adopt certified sandbox precedent without separate RFP.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Independent Empirical Verification Findings */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sidebar-active inline-block rounded-xs"></span>
              3. Independent Technical Verification Findings
            </h4>
            <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded space-y-2 text-[11px]">
              <div className="flex justify-between items-center border-b border-emerald-200 pb-1.5">
                <span className="font-bold text-emerald-950">Auditor: {pilot?.verification?.verifierName || "Dr. Kavita Rao (Water Infrastructure Audit Board)"}</span>
                <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">Score: {pilot?.verification?.score || 95}/100</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <p><strong>Quantified Outcome:</strong> {pilot?.evidence?.waterLossReduction || "22% reduction in water wastage"}</p>
                <p><strong>Operating Duration:</strong> {pilot?.evidence?.duration || "90 continuous operational days"}</p>
                <p><strong>Hardware Deployed:</strong> {pilot?.evidence?.sensorsDeployed || "25 acoustic sensors"}</p>
                <p><strong>Safety &amp; Incidents:</strong> Zero pipe damage / zero safety incidents recorded</p>
              </div>
              <p className="text-slate-600 italic bg-white p-2 rounded border border-emerald-100">
                "{pilot?.verification?.notes || "Outcome evidence is thoroughly documented and cross-verified via SCADA data. Flow telemetry confirms the 22% drop in water wastage. Very strong performance and highly replicable design."}"
              </p>
            </div>
          </div>

          {/* 4. Financial Due Diligence & Public Savings */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-sidebar-active inline-block rounded-xs"></span>
              4. Price Reasonableness &amp; Public Value Benchmark
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Scaled Contract Value</span>
                <span className="text-sm font-bold text-slate-900">₹{scaledAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Open Tender Benchmark</span>
                <span className="text-sm font-bold text-slate-500 line-through">₹{estimatedTenderCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[9px] font-bold uppercase text-emerald-800 block">Public Treasury Savings</span>
                <span className="text-sm font-bold text-emerald-700">₹{totalSavings.toLocaleString('en-IN')} (37.6%)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1 font-serif">
              "The undersigned Competent Financial Authority certifies that the contract rates reflect demonstrated economies of scale from the pilot phase and represent superior value for public money compared to prevailing market benchmarks."
            </p>
          </div>

          {/* 5. Formal Digital Signature Blocks */}
          <div className="pt-4 border-t-2 border-slate-300 font-sans grid grid-cols-3 gap-4 text-center">
            <div className="border border-slate-200 p-3 rounded bg-slate-50/50">
              <div className="h-10 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-700 border-b border-dashed pb-1">
                ✓ DIGITALLY SIGNED
              </div>
              <p className="font-bold text-[10px] text-slate-800 mt-1">{pilot?.sponsoringOfficialName || "Arjun"}</p>
              <p className="text-[9px] text-slate-500">Superintending Engineer<br/>Pune Municipal Corporation</p>
            </div>
            <div className="border border-slate-200 p-3 rounded bg-slate-50/50">
              <div className="h-10 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-700 border-b border-dashed pb-1">
                ✓ INDEPENDENT AUDIT CLEARANCE
              </div>
              <p className="font-bold text-[10px] text-slate-800 mt-1">{pilot?.verification?.verifierName || "Dr. Kavita Rao"}</p>
              <p className="text-[9px] text-slate-500">Accredited Technical Verifier<br/>Water Infrastructure Audit Board</p>
            </div>
            <div className="border border-slate-200 p-3 rounded bg-slate-50/50">
              <div className="h-10 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-700 border-b border-dashed pb-1">
                ✓ STATUTORY APPROVAL SEAL
              </div>
              <p className="font-bold text-[10px] text-slate-800 mt-1">{procurement?.adoptingOfficialName || "Meera"}</p>
              <p className="text-[9px] text-slate-500">Additional Commissioner<br/>Nagpur Municipal Corporation</p>
            </div>
          </div>

          {/* Footer Clearance Notice */}
          <div className="text-[9px] text-slate-400 font-mono text-center border-t pt-3 flex justify-between items-center">
            <span>AUDIT COMPLIANT &bull; CAG / CVC STATUTORY DEFENSE DOCKET</span>
            <span>IMMUTABLE HASH: SHA256-DOCKET-2026-X992</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   6. BILATERAL PUBLIC PROCUREMENT CONTRACT VIEWER MODAL
   ========================================================== */
function ContractDetailsModal({
  data, pilots, procurements, currentUser, onClose, showToast, onAcceptOffer, onDeclineOffer
}) {
  const isAdoption = data.type === "adoption";
  const procurement = data.procurement || (isAdoption ? procurements.find(pr => pr.id === data.procurementId) : null);
  const pilot = data.pilot || (procurement ? pilots.find(p => p.id === procurement.pilotId) : data.pilot) || pilots[0];
  const application = data.application || pilot?.application || {
    startupName: procurement?.startupName || "AquaSense Technologies",
    dpiitNo: "DPIIT98372",
    proposedCost: 750000
  };

  const isPendingMyAcceptance = isAdoption && procurement?.status === "Pending Startup Acceptance" && (currentUser?.id === procurement?.startupId || currentUser?.id === "ram");
  const contractId = isAdoption ? `CTR-MAHA-SCALE-${procurement?.id?.toUpperCase() || "PR1"}` : `CTR-MAHA-PILOT-${pilot?.id?.toUpperCase() || "P1"}`;

  const buyerEntity = isAdoption ? (procurement?.adoptingDepartment || "Nagpur Municipal Corporation") : pilot?.department;
  const buyerOfficer = isAdoption ? (procurement?.adoptingOfficialName || "Meera, Additional Commissioner") : `${pilot?.sponsoringOfficialName || "Arjun"}, Superintending Engineer`;
  const sellerEntity = isAdoption ? (procurement?.startupName || "AquaSense Technologies") : (application?.startupName || "AquaSense Technologies");
  const sellerOfficer = "Ram (Founder & Managing Director)";
  const dpiitNumber = application?.dpiitNo || "DPIIT98372";
  const contractBudget = isAdoption ? (procurement?.scaledBudget || 2400000) : (application?.proposedCost || pilot?.budgetCap || 750000);
  const executionDate = isAdoption ? (procurement?.date || "2026-08-12") : (pilot?.verification?.certifiedAt || "2026-04-10");

  const tranche1 = Math.round(contractBudget * 0.30);
  const tranche2 = Math.round(contractBudget * 0.40);
  const tranche3 = contractBudget - tranche1 - tranche2;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contractId);
    }
    showToast("Contract Identifier copied to clipboard!", "success");
  };

  return (
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-center p-3 sm:p-5 print:p-0 print:bg-white">
      <div className="print-document bg-white rounded-lg max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none animate-slide-up">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-sidebar text-white px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 print:hidden flex-shrink-0 border-b-2 border-sidebar-accent">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <ScrollText className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0 text-emerald-400" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white">Public Procurement Contract &amp; Service Agreement</h3>
              <p className="text-[10px] text-blue-100/70 font-mono truncate">Bilateral Municipal Agreement &bull; Ref: {contractId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRef}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Copy ID
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Agreement
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Scrollable Printable Contract Body */}
        <div className="p-4 sm:p-8 overflow-y-auto print:overflow-visible space-y-6 text-slate-800 font-serif leading-relaxed text-xs">
          {/* Header Seal */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-emerald-600 bg-emerald-50 text-emerald-900 font-bold text-lg mb-1 shadow-xs">
              📜
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
              Government Service Contract &amp; Work Order
            </h2>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-700">
              Executed under General Financial Rules (GFR) 2017 &amp; Maharashtra State Innovation Sandbox
            </h3>
            <p className="text-[10px] text-slate-500 font-sans tracking-wide">
              Registered in State Precedent Procurement Ledger &bull; Form 83-A Bilateral Agreement
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-2 text-[10px] font-sans pt-2 border-t border-slate-200 text-slate-600">
              <span><strong>Contract ID:</strong> {contractId}</span>
              <span><strong>Execution Date:</strong> {executionDate}</span>
              <span>
                <strong>Contract Status:</strong>{" "}
                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                  (isAdoption && procurement?.status === "Accepted") || (!isAdoption && pilot?.status === "Certified")
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : isAdoption && procurement?.status === "Declined"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {(isAdoption && procurement?.status === "Accepted") || (!isAdoption && pilot?.status === "Certified")
                    ? "✓ EXECUTED & LEGALLY BINDING"
                    : isAdoption && procurement?.status === "Declined"
                    ? "✕ OFFER DECLINED"
                    : "⏳ AWAITING COUNTER-SIGNATURE"}
                </span>
              </span>
            </div>
          </div>

          {/* Parties Summary Box */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 inline-block rounded-xs"></span>
              Contracting Parties &amp; Legal Signatories
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3.5 rounded border border-slate-200">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">First Party (Purchaser / Municipal Entity)</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{buyerEntity}</p>
                <p className="text-slate-600 text-[10px]">Authorized Signatory: {buyerOfficer}</p>
                <p className="text-slate-500 text-[10px]">Statutory Jurisdiction: Urban Local Body (ULB), Maharashtra</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Second Party (Technology Contractor)</p>
                <p className="font-bold text-sidebar text-xs mt-0.5">{sellerEntity}</p>
                <p className="text-slate-600 text-[10px]">Authorized Signatory: {sellerOfficer}</p>
                <p className="text-slate-500 text-[10px]">
                  DPIIT Recognition: <strong className="font-mono text-slate-800">{dpiitNumber}</strong> | MSME Registered
                </p>
              </div>
            </div>
          </div>

          {/* Contract Overview & Provenance */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 inline-block rounded-xs"></span>
              Preamble &amp; Precedent Provenance
            </h4>
            <div className="bg-slate-50/70 p-3 rounded border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
              <p>
                WHEREAS the First Party desires to procure and deploy proven civic technology for municipal operations; AND WHEREAS the Second Party has demonstrated empirical efficacy through a certified Maharashtra State Innovation Society (MSInS) sandbox pilot: <strong>"{pilot?.title}"</strong> sponsored by <strong>{pilot?.department}</strong>, audited and verified by independent auditor <strong>{pilot?.verification?.verifierName || "Dr. Kavita Rao"} (Score: {pilot?.verification?.score || 95}/100)</strong>;
              </p>
              <p className="mt-1.5">
                NOW THEREFORE, in exercise of statutory powers under <strong>General Financial Rules (GFR) 2017 Rules 166, 170 and 173</strong>, the parties hereto agree to execute this public procurement contract without redundant re-tendering.
              </p>
            </div>
          </div>

          {/* Article 1: Scope of Work */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 inline-block rounded-xs"></span>
              Article 1: Scope of Work &amp; Deliverables
            </h4>
            <div className="bg-white p-3 rounded border border-slate-200 space-y-1.5 text-[11px]">
              <p className="text-slate-800">
                <strong>Deployment Target &amp; Geographical Bounds:</strong>
              </p>
              <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                "{isAdoption ? (procurement?.targetScope || "City-wide deployment across municipal water supply zones with SCADA integration.") : (application?.proposedScope || pilot?.description)}"
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[10px] pt-1">
                <li>Hardware supply, installation, calibration, and commissioning within designated wards.</li>
                <li>Real-time telemetry data integration with municipal central command SCADA dashboard.</li>
                <li>Periodic preventive maintenance and telemetry uptime assurance.</li>
              </ul>
            </div>
          </div>

          {/* Article 2: Commercial Value & Milestone Payment Schedule */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 inline-block rounded-xs"></span>
              Article 2: Commercial Value &amp; Phased Escrow Schedule (PFMS)
            </h4>
            <div className="border border-slate-200 rounded overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3 text-left">Tranche / Milestone</th>
                    <th className="py-2 px-3 text-left">Deliverable Trigger</th>
                    <th className="py-2 px-3 text-right">Percentage</th>
                    <th className="py-2 px-3 text-right">Disbursement Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-900">Tranche 1: Mobilization</td>
                    <td className="py-2 px-3">Site survey, hardware delivery &amp; baseline connectivity</td>
                    <td className="py-2 px-3 text-right font-mono">30%</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">₹{tranche1.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900">Tranche 2: Mid-Term Telemetry</td>
                    <td className="py-2 px-3">Continuous 45-day live sensor stream &amp; interim report</td>
                    <td className="py-2 px-3 text-right font-mono">40%</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">₹{tranche2.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-900">Tranche 3: Handover &amp; Acceptance</td>
                    <td className="py-2 px-3">Final technical audit sign-off &amp; municipal handover</td>
                    <td className="py-2 px-3 text-right font-mono">30%</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">₹{tranche3.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-emerald-50/70 font-bold">
                    <td colSpan={3} className="py-2 px-3 text-slate-900 uppercase text-[10px]">Total Contract Value (Inclusive of Taxes)</td>
                    <td className="py-2 px-3 text-right text-emerald-800 text-xs">₹{contractBudget.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">
              *All milestone payments shall be transferred via Public Financial Management System (PFMS) directly to the vendor's designated DBT account within 72 hours of municipal verification.
            </p>
          </div>

          {/* Article 3: Service Level Agreement & Safe Harbor */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 inline-block rounded-xs"></span>
              Article 3: Service Level Agreement (SLA) &amp; Safe Harbor Clause
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Performance Guarantee Benchmark</span>
                <p className="text-slate-600 text-[10px]">
                  Vendor guarantees minimum 15% reduction in non-revenue water wastage (benchmarked against Pune precedent of 22%). SCADA telemetry uptime must exceed 98.5%.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Innovation Safe Harbor Protection</span>
                <p className="text-slate-600 text-[10px]">
                  In accordance with State Innovation Sandbox Framework, startup shall not face blacklisting or forfeiture for telemetry baseline deviations, subject to a 21-day calibration cure period.
                </p>
              </div>
            </div>
          </div>

          {/* Signatures & Mutual Binding */}
          <div className="pt-4 border-t-2 border-slate-300 font-sans grid grid-cols-2 gap-6 text-center">
            <div className="border border-slate-200 p-3 rounded bg-slate-50/50">
              <div className="h-10 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-700 border-b border-dashed pb-1">
                ✓ COUNTERSIGNED BY FIRST PARTY
              </div>
              <p className="font-bold text-[10px] text-slate-800 mt-1">{buyerOfficer}</p>
              <p className="text-[9px] text-slate-500">{buyerEntity}</p>
            </div>
            <div className="border border-slate-200 p-3 rounded bg-slate-50/50">
              <div className="h-10 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-700 border-b border-dashed pb-1">
                {isAdoption && procurement?.status === "Pending Startup Acceptance" ? (
                  <span className="text-amber-600">⏳ PENDING STARTUP ACCEPTANCE</span>
                ) : (
                  "✓ DIGITALLY EXECUTED BY SECOND PARTY"
                )}
              </div>
              <p className="font-bold text-[10px] text-slate-800 mt-1">{sellerOfficer}</p>
              <p className="text-[9px] text-slate-500">{sellerEntity} ({dpiitNumber})</p>
            </div>
          </div>

          {/* Pending acceptance call to action if Ram is viewing */}
          {isPendingMyAcceptance && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 font-sans shadow-md animate-slide-up">
              <div>
                <h4 className="font-bold text-sm text-white">Review Complete. Ready to execute contract?</h4>
                <p className="text-[11px] text-emerald-100">By clicking accept, this bilateral agreement becomes legally binding under GFR 170 &amp; 173.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onAcceptOffer(procurement.id)}
                  className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-2 px-4 rounded shadow transition cursor-pointer"
                >
                  ✓ Accept &amp; Sign Now
                </button>
                <button
                  type="button"
                  onClick={() => onDeclineOffer(procurement.id)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs py-2 px-3 rounded transition cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="text-[9px] text-slate-400 font-mono text-center border-t pt-3 flex justify-between items-center">
            <span>MUTUAL TRANSPARENCY &bull; MAHARASHTRA STATE PRECEDENT CONTRACT REGISTRY</span>
            <span>IMMUTABLE HASH: SHA256-CONTRACT-2026-X992</span>
          </div>
        </div>
      </div>
    </div>
  );
}
