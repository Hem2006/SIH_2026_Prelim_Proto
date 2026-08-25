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
  Handshake
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

  // Sidebar state
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

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
    if (user.role === "Startup") setCurrentTab("dashboard");
    else if (user.role === "Government Official") setCurrentTab("dashboard");
    else if (user.role === "Verifier") setCurrentTab("pending");
    else if (user.role === "Admin") setCurrentTab("analytics");
    showToast(`Logged in as ${user.name} (${user.role})`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    setSidebarMobileOpen(false);
    showToast("Logged out successfully", "info");
  };

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setSidebarMobileOpen(false);
  };

  const getNavItems = () => {
    if (activeRole === "Startup") return [
      { label: "Dashboard", tab: "dashboard", icon: <Home className="w-4 h-4" /> },
      { label: "Discover Pilots", tab: "opportunities", icon: <Compass className="w-4 h-4" /> },
      { label: "My Pilot Passport", tab: "passport", icon: <Award className="w-4 h-4" /> },
    ];
    if (activeRole === "Government Official") return [
      { label: "Sponsor Hub", tab: "dashboard", icon: <Home className="w-4 h-4" /> },
      { label: "Post a Pilot", tab: "post-pilot", icon: <Plus className="w-4 h-4" /> },
      { label: "Browse Certified", tab: "browse-certified", icon: <Award className="w-4 h-4" /> },
      { label: "Audit Defense Record", tab: "procurement-history", icon: <ShieldCheck className="w-4 h-4" /> },
    ];
    if (activeRole === "Verifier") return [
      { label: "Pending Verifications", tab: "pending", icon: <Clock className="w-4 h-4" /> },
      { label: "Verification History", tab: "history", icon: <CheckCircle className="w-4 h-4" /> },
    ];
    if (activeRole === "Admin") return [
      { label: "System Analytics", tab: "analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "Verifier Management", tab: "verifiers", icon: <Users className="w-4 h-4" /> },
      { label: "Official Approvals", tab: "onboarding", icon: <UserCheck className="w-4 h-4" /> },
      { label: "Success Criteria", tab: "rules", icon: <Settings className="w-4 h-4" /> },
      { label: "Registry Oversight", tab: "oversight", icon: <Database className="w-4 h-4" /> },
    ];
    return [];
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans">
      {/* ===== SIDEBAR (only when logged in) ===== */}
      {currentUser && (
        <>
          {sidebarMobileOpen && (
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarMobileOpen(false)} />
          )}
          <aside className={`fixed top-0 left-0 h-full w-[230px] bg-sidebar z-50 flex flex-col transition-transform duration-200 ${sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
            {/* Brand */}
            <div className="px-5 py-4 flex items-center gap-2.5 border-b border-white/10">
              <div className="bg-sidebar-active text-white p-1.5 rounded-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white text-sm tracking-wide block">PRECEDENT</span>
                <span className="text-[9px] text-slate-400 tracking-widest uppercase block">Procurement Hub</span>
              </div>
              <button onClick={() => setSidebarMobileOpen(false)} className="ml-auto text-slate-400 hover:text-white lg:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile */}
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sidebar-active flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.startupName || currentUser.department || currentUser.organization || currentUser.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
              <div className="px-5 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeRole}</span>
              </div>
              {getNavItems().map(item => (
                <button
                  key={item.tab}
                  onClick={() => handleNavClick(item.tab)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-colors ${
                    currentTab === item.tab
                      ? "bg-sidebar-darker text-sidebar-active border-r-[3px] border-sidebar-active"
                      : "text-slate-300 hover:text-white hover:bg-sidebar-hover"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Sidebar footer */}
            <div className="px-5 py-3 border-t border-white/10 space-y-2">
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-[11px] font-medium transition w-full"
              >
                <RefreshCw className="w-3 h-3" /> Reset Sandbox Data
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-rose-400 text-xs font-medium transition w-full"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className={currentUser ? "lg:ml-[230px] min-h-screen flex flex-col" : "min-h-screen flex flex-col"}>
        {/* Top Header (only when logged in) */}
        {currentUser && (
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between h-[50px] px-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 p-1">
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-semibold text-slate-600 hidden sm:block">
                  {activeRole === "Startup" && currentTab === "dashboard" && "Startup Dashboard"}
                  {activeRole === "Startup" && currentTab === "opportunities" && "Discover Pilots"}
                  {activeRole === "Startup" && currentTab === "passport" && "Pilot Passport"}
                  {activeRole === "Government Official" && currentTab === "dashboard" && "Sponsor Hub"}
                  {activeRole === "Government Official" && currentTab === "post-pilot" && "Post a Pilot"}
                  {activeRole === "Government Official" && currentTab === "browse-certified" && "Browse Certified Pilots"}
                  {activeRole === "Government Official" && currentTab === "procurement-history" && "Audit Defense Record"}
                  {activeRole === "Verifier" && currentTab === "pending" && "Pending Verifications"}
                  {activeRole === "Verifier" && currentTab === "history" && "Verification History"}
                  {activeRole === "Admin" && currentTab === "analytics" && "System Analytics"}
                  {activeRole === "Admin" && currentTab === "verifiers" && "Verifier Management"}
                  {activeRole === "Admin" && currentTab === "onboarding" && "Official Approvals"}
                  {activeRole === "Admin" && currentTab === "rules" && "Success Criteria"}
                  {activeRole === "Admin" && currentTab === "oversight" && "Registry Oversight"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleLogin(e.target.value)}
                    className="bg-slate-50 text-slate-700 text-xs border border-slate-200 rounded px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sidebar-active font-medium appearance-none pr-7"
                  >
                    <option disabled>Switch Role/User...</option>
                    <option value="ram">Ram (Startup)</option>
                    <option value="arjun">Arjun (Official - Pune)</option>
                    <option value="meera">Meera (Official - Nagpur)</option>
                    <option value="kavita">Dr. Kavita (Verifier)</option>
                    <option value="admin">MSInS Admin</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={currentUser ? "flex-grow p-4 sm:p-6" : "flex-grow"}>
          {toast && (
            <div className={`fixed bottom-5 right-5 z-[60] p-3.5 rounded-lg shadow-lg text-white flex items-center gap-3 max-w-sm border text-sm ${
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
        <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
          <div className="px-6 text-center sm:flex sm:justify-between sm:items-center">
            <p className="text-xs text-slate-400">
              &copy; 2026 Precedent Hub &mdash; Maharashtra State Innovation Society (MSInS) &amp; DPIIT
            </p>
            <div className="mt-2 sm:mt-0 flex justify-center gap-3 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              <span>GFR 2017 Compliant</span>
              <span>&bull;</span>
              <span>Secured Audit Trail</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ==========================================================
   LOGIN PORTAL & REGISTER
   ========================================================== */
function LoginPortal({ handleLogin, setRegistrationMode, handleResetData }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const demoAccounts = [
    { key: "ram", name: "Ram", role: "Startup", org: "AquaSense Technologies", badge: "bg-blue-100 text-blue-800" },
    { key: "arjun", name: "Arjun", role: "Official — Pune", org: "Pune Municipal Corp", badge: "bg-purple-100 text-purple-800" },
    { key: "meera", name: "Meera", role: "Official — Nagpur", org: "Nagpur Municipal Corp", badge: "bg-purple-100 text-purple-800" },
    { key: "kavita", name: "Dr. Kavita Rao", role: "Verifier", org: "Technical Evaluation Board", badge: "bg-amber-100 text-amber-800" },
    { key: "admin", name: "MSInS Admin", role: "Admin", org: "Maharashtra State Innovation Society", badge: "bg-rose-100 text-rose-800" },
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Illustration / Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-sidebar-darker overflow-hidden items-center justify-center p-12">
        {/* decorative blurred blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sidebar-active/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center max-w-md">
          <div className="flex items-center gap-2.5 mb-10 self-start">
            <div className="bg-white/10 border border-white/20 text-white p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">PRECEDENT</span>
          </div>

          {/* Isometric-style dashboard mockup */}
          <div className="relative w-72 h-52 mb-12">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-5 -rotate-3">
              <div className="flex items-end gap-2.5 h-24">
                {[40, 65, 45, 85, 60, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-sidebar-active to-blue-300" style={{ height: `${h}%` }} />
                ))}
              </div>
              <svg viewBox="0 0 240 40" className="w-full h-8 mt-2" preserveAspectRatio="none">
                <polyline points="0,30 40,20 80,25 120,10 160,15 200,4 240,8" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex justify-between text-white/50 text-[9px] mt-1 font-semibold uppercase tracking-wider">
                <span>Applied</span><span>Certified</span><span>Adopted</span>
              </div>
            </div>

            {/* Floating badge: percentage ring */}
            <div className="absolute -top-6 -left-8 bg-white rounded-xl shadow-xl p-2.5 flex items-center gap-2 rotate-3">
              <div className="w-8 h-8 rounded-full border-4 border-sidebar-active flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-sidebar-active" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 leading-none">+22%</p>
                <p className="text-[8px] text-slate-400 leading-none mt-0.5">Efficiency</p>
              </div>
            </div>

            {/* Floating badge: coin */}
            <div className="absolute -top-4 -right-6 w-11 h-11 bg-amber-400 rounded-full shadow-xl flex items-center justify-center rotate-6">
              <IndianRupee className="w-5 h-5 text-amber-900" />
            </div>

            {/* Floating badge: verified */}
            <div className="absolute -bottom-5 -left-6 bg-white rounded-lg shadow-xl px-2.5 py-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[9px] font-bold text-slate-700">DPIIT Verified</span>
            </div>

            {/* Floating badge: handshake */}
            <div className="absolute -bottom-6 -right-4 w-12 h-12 bg-sidebar-active rounded-full shadow-xl flex items-center justify-center -rotate-6">
              <Handshake className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-white text-xl font-bold text-center">Startup-to-Scale Procurement, Simplified</h1>
          <p className="text-blue-100/80 text-sm text-center mt-2 leading-relaxed">
            Sponsor pilots, certify outcomes, and fast-track scaled adoption — all under one compliant, auditable sandbox.
          </p>

          <div className="mt-8 space-y-2.5 self-start">
            {["GFR 2017 Rule 170 & 173 Compliant", "Independent Technical Verification", "End-to-End Audit Trail"].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-blue-50/90 text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="bg-sidebar text-white p-2 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
            <span className="text-slate-800 font-bold text-lg tracking-wide">PRECEDENT</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to access the procurement sandbox.</p>

          <form onSubmit={handleManualLogin} className="mt-6 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Username</label>
              <input
                type="text"
                placeholder="e.g. ram, arjun, admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active/40 focus:border-sidebar-active"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter any password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active/40 focus:border-sidebar-active"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && <p className="text-rose-500 text-[11px] font-semibold">{loginError}</p>}

            <button type="submit" className="w-full bg-sidebar hover:bg-sidebar-dark text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm">
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or use a demo account</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="flex flex-wrap gap-2">
            {demoAccounts.map(a => (
              <button
                key={a.key}
                onClick={() => handleLogin(a.key)}
                title={`${a.name} — ${a.role} (${a.org})`}
                className="flex items-center gap-2 border border-slate-200 hover:border-sidebar-active hover:bg-slate-50 rounded-full pl-1.5 pr-3 py-1.5 transition"
              >
                <div className="w-6 h-6 rounded-full bg-sidebar flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {a.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-700">{a.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-slate-500 text-[11px] mb-2.5 font-semibold">New here? Register to test onboarding.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setRegistrationMode("startup")} className="border border-sidebar text-sidebar hover:bg-slate-50 py-1.5 px-3 rounded text-[11px] font-bold transition">
                Register Startup
              </button>
              <button onClick={() => setRegistrationMode("official")} className="border border-sidebar text-sidebar hover:bg-slate-50 py-1.5 px-3 rounded text-[11px] font-bold transition">
                Register Official
              </button>
            </div>
            <button onClick={handleResetData} className="mt-4 text-[10px] text-slate-400 hover:text-slate-600 font-medium inline-flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5" /> Reset sandbox data
            </button>
          </div>
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
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded border border-emerald-200 flex items-center gap-1">&check; Verified</span>
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
function StartupDashboard({
  currentTab, setCurrentTab, currentUser, pilots, setPilots, procurements,
  showToast, selectedPilot, setSelectedPilot, evidenceModalOpen, setEvidenceModalOpen
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [applyModalOpen, setApplyModalOpen] = useState(null);
  const [proposedCost, setProposedCost] = useState("");
  const [proposedScope, setProposedScope] = useState("");
  const [timeline, setTimeline] = useState("");
  const [waterLossVal, setWaterLossVal] = useState("22% reduction");
  const [durVal, setDurVal] = useState("100 days");
  const [sensorsVal, setSensorsVal] = useState("25 sensors");
  const [notesVal, setNotesVal] = useState("");

  const ramPilots = pilots.filter(p => p.application?.startupId === currentUser.id);
  const appliedCount = ramPilots.filter(p => p.status === "Applied").length;
  const runningCount = ramPilots.filter(p => p.status === "Running").length;
  const completedCount = ramPilots.filter(p => p.status === "Completed").length;
  const certifiedCount = ramPilots.filter(p => p.status === "Certified").length;

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!proposedCost || !proposedScope) { showToast("Please fill in the application details", "error"); return; }
    const updatedPilots = pilots.map(p => {
      if (p.id === applyModalOpen.id) {
        return { ...p, status: "Applied", application: { startupId: currentUser.id, startupName: currentUser.startupName, proposedCost: parseFloat(proposedCost), proposedScope, dpiitNo: currentUser.dpiitNo, appliedAt: new Date().toISOString().split("T")[0] } };
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
        return { ...p, status: "Completed", evidence: { waterLossReduction: waterLossVal, duration: durVal, sensorsDeployed: sensorsVal, summary: notesVal || "Pilot executed successfully matching initial scope specifications.", docs: "Evidence_Report_Telemetry_Log.pdf", submittedAt: new Date().toISOString().split("T")[0] } };
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
          {/* Top stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={<Clock className="text-slate-500 w-5 h-5" />} label="Applied" value={appliedCount} />
            <StatCard icon={<TrendingUp className="text-blue-500 w-5 h-5" />} label="Running Pilots" value={runningCount} />
            <StatCard icon={<AlertTriangle className="text-amber-500 w-5 h-5" />} label="Completed" value={completedCount} />
            <StatCard icon={<Award className="text-emerald-500 w-5 h-5" />} label="Certified" value={certifiedCount} />
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-sidebar to-sidebar-darker text-white rounded-lg p-4 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Passport Score</span>
                <Award className="w-4 h-4 text-sidebar-active" />
              </div>
              <div className="mt-1.5 flex items-baseline">
                <span className="text-3xl font-bold">{currentUser.passportScore}</span>
                <span className="text-sm font-semibold text-slate-300 ml-1">/100</span>
              </div>
              <div className="w-full bg-sidebar-dark rounded-full h-1.5 mt-2">
                <div className="bg-sidebar-active h-1.5 rounded-full" style={{ width: `${currentUser.passportScore}%` }} />
              </div>
            </div>
          </div>

          {/* Pilot status chart + applications table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Mini Donut Chart */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pilot Status Overview</h3>
              <MiniDonutChart
                segments={[
                  { label: "Applied", value: appliedCount, color: "#6366f1" },
                  { label: "Running", value: runningCount, color: "#3b82f6" },
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
                      {ramPilots.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-3 pr-4">
                            <span className="font-semibold block text-slate-800 text-xs">{p.title}</span>
                            <span className="text-[10px] text-slate-400">{p.sector}</span>
                          </td>
                          <td className="py-3 pr-4 text-xs">{p.department}</td>
                          <td className="py-3 pr-4 font-semibold text-xs">₹{p.application?.proposedCost?.toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {p.status === "Running" && (
                                <button onClick={() => setEvidenceModalOpen(p.id)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-2 rounded text-[10px] transition">Upload Evidence</button>
                              )}
                              <button onClick={() => setSelectedPilot(p)} className="text-sidebar-active hover:underline text-[10px] font-bold">View</button>
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
              <option value="Water & Sanitation">Water &amp; Sanitation</option>
              <option value="Energy & Cleantech">Energy &amp; Cleantech</option>
            </select>
            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="border border-slate-200 rounded px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active">
              <option value="All">All Budgets</option>
              <option value="low">Under ₹10,00,000</option>
              <option value="high">₹10,00,000 &amp; above</option>
            </select>
            <div className="flex justify-end items-center">
              <span className="text-[10px] text-slate-400 font-bold">{pilots.filter(p => p.status === "Open").length} open listings</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pilots.filter(p => p.status === "Open")
              .filter(p => searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
              .filter(p => sectorFilter !== "All" ? p.sector === sectorFilter : true)
              .filter(p => { if (budgetFilter === "low") return p.budgetCap < 1000000; if (budgetFilter === "high") return p.budgetCap >= 1000000; return true; })
              .map(p => (
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
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelectedPilot(p)} className="text-[10px] text-slate-500 hover:text-slate-700 font-bold px-2 py-1">Detail</button>
                      <button onClick={() => setApplyModalOpen(p)} className="bg-sidebar hover:bg-sidebar-dark text-white font-bold text-[10px] py-1 px-2.5 rounded transition">Apply Now</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. PILOT PASSPORT */}
      {currentTab === "passport" && (
        <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-sidebar text-white px-6 py-8 text-center relative border-b-4 border-sidebar-active">
              <div className="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider py-0.5 px-2 rounded shadow">
                &check; Active Passport
              </div>
              <Award className="w-12 h-12 mx-auto text-sidebar-active mb-2" />
              <h2 className="text-xl font-bold tracking-wide">PRECEDENT COMPLIANCE PASSPORT</h2>
              <p className="text-[10px] text-slate-300 tracking-widest uppercase mt-1">State Innovation Procurement Framework Certificate</p>
              <div className="mt-1.5 text-[10px] text-slate-400 font-mono">Passport ID: PP-{currentUser.dpiitNo}-2026</div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border-b border-slate-200 text-sm">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Startup Name</span>
                <span className="font-bold text-slate-800 text-sm">{currentUser.startupName}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">DPIIT Number</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{currentUser.dpiitNo}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Sector</span>
                <span className="font-bold text-slate-800 text-sm">{currentUser.sector}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-1.5">
                <CheckCircle className="text-emerald-500 w-4 h-4" /> Certified Pilots Registry
              </h3>

              {pilots.filter(p => p.status === "Certified" && p.application?.startupId === currentUser.id).length === 0 ? (
                <div className="text-center py-5 text-slate-400 italic text-xs">No certified pilots linked to this passport yet.</div>
              ) : (
                pilots.filter(p => p.status === "Certified" && p.application?.startupId === currentUser.id).map(p => (
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
                    <div className="bg-white p-2.5 rounded border border-slate-200 flex justify-between items-center text-[10px]">
                      <span className="font-mono text-slate-400">Hash: SHA256-{p.id}-CERT-X992</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5"><ShieldCheck className="w-3.5 h-3.5" /> GFR COMPLIANT</span>
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
  showToast, selectedPilot, setSelectedPilot, adoptionModalOpen, setAdoptionModalOpen, sectorRules
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newSector, setNewSector] = useState("Water & Sanitation");
  const [newDesc, setNewDesc] = useState("");
  const [feedbackPilotId, setFeedbackPilotId] = useState(null);
  const [sponsorNotes, setSponsorNotes] = useState("");
  const [browseQuery, setBrowseQuery] = useState("");
  const [browseSector, setBrowseSector] = useState("All");
  const [procureDept, setProcureDept] = useState(currentUser.department);
  const [procureBudget, setProcureBudget] = useState("");

  const myPilots = pilots.filter(p => p.sponsoringOfficialId === currentUser.id);
  const myProcurements = procurements.filter(pr => pr.adoptingOfficialId === currentUser.id);

  const handlePostPilot = (e) => {
    e.preventDefault();
    if (!newTitle || !newBudget || !newDuration) { showToast("Please fill in all fields", "error"); return; }
    const newPilot = {
      id: `p_${Date.now()}`, title: newTitle, department: currentUser.department,
      sponsoringOfficialId: currentUser.id, sponsoringOfficialName: currentUser.name,
      budgetCap: parseFloat(newBudget), durationDays: parseInt(newDuration),
      sector: newSector, description: newDesc, status: "Open",
      application: null, evidence: null, verification: null
    };
    setPilots(prev => [newPilot, ...prev]);
    setNewTitle(""); setNewBudget(""); setNewDuration(""); setNewDesc("");
    setCurrentTab("dashboard");
    showToast(`New pilot opportunity "${newTitle}" posted!`, "success");
  };

  const handleSelectStartup = (pilotId, startupId) => {
    setPilots(pilots.map(p => p.id === pilotId ? { ...p, status: "Running" } : p));
    showToast("Startup selected! Pilot is now in 'Running' status.", "success");
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setPilots(pilots.map(p => p.id === feedbackPilotId ? { ...p, evidence: { ...p.evidence, sponsorFeedback: sponsorNotes } } : p));
    setFeedbackPilotId(null); setSponsorNotes("");
    showToast("Sponsor outcome feedback logged successfully.", "success");
  };

  const handleConfirmAdoption = (e) => {
    e.preventDefault();
    if (!procureBudget) { showToast("Please enter the scaled procurement budget", "error"); return; }
    const targetPilot = pilots.find(p => p.id === adoptionModalOpen);
    const newProc = {
      id: `pr_${Date.now()}`, pilotId: targetPilot.id, pilotTitle: targetPilot.title,
      sponsoringDepartment: targetPilot.department, adoptingOfficialId: currentUser.id,
      adoptingOfficialName: currentUser.name, adoptingDepartment: procureDept,
      scaledBudget: parseFloat(procureBudget),
      justification: `Fast-track scaled adoption approved for startup "${targetPilot.application.startupName}" based on certified pilot precedent PP-${targetPilot.application.dpiitNo}-2026. This procurement is executed with regulatory exemptions under General Financial Rules (GFR) 2017 Rule 170 (EMD exemption) and Rule 173 (relaxation of turnover & experience parameters for verified precedents).`,
      date: new Date().toISOString().split("T")[0]
    };
    setProcurements(prev => [newProc, ...prev]);
    setAdoptionModalOpen(null); setProcureBudget("");
    setCurrentTab("procurement-history");
    showToast("Scaled Procurement completed! Audit trail compiled.", "success");
  };

  return (
    <div>
      {/* 1. DASHBOARD / SPONSOR HUB */}
      {currentTab === "dashboard" && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Pilots Sponsored by {currentUser.department}</h2>
              </div>
              <button onClick={() => setCurrentTab("post-pilot")} className="bg-sidebar-active hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded text-xs flex items-center gap-1 transition">
                <Plus className="w-3 h-3" /> Post a Pilot
              </button>
            </div>
            {myPilots.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm">No sponsored pilots.</p>
                <p className="text-[11px]">Click "Post a Pilot" to list your first opportunity.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left">
                      <th className="pb-2 pr-4 font-semibold">Pilot Opportunity</th>
                      <th className="pb-2 pr-4 font-semibold">Budget Cap</th>
                      <th className="pb-2 pr-4 font-semibold">Applicant</th>
                      <th className="pb-2 pr-4 font-semibold">Status</th>
                      <th className="pb-2 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myPilots.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3 pr-4">
                          <span className="font-semibold block text-slate-800 text-xs">{p.title}</span>
                          <span className="text-[10px] text-slate-400">{p.durationDays} Days</span>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-xs">₹{p.budgetCap.toLocaleString('en-IN')}</td>
                        <td className="py-3 pr-4">
                          {p.application ? (
                            <div>
                              <span className="font-semibold text-sidebar block text-xs">{p.application.startupName}</span>
                              <span className="text-[10px] text-slate-400">₹{p.application.proposedCost.toLocaleString('en-IN')}</span>
                            </div>
                          ) : <span className="text-slate-400 text-[10px] italic">None yet</span>}
                        </td>
                        <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1.5 items-center">
                            {p.status === "Applied" && <button onClick={() => handleSelectStartup(p.id, p.application.startupId)} className="bg-sidebar hover:bg-sidebar-dark text-white font-semibold text-[10px] py-1 px-2 rounded transition">Select</button>}
                            {p.status === "Completed" && !p.evidence?.sponsorFeedback && <button onClick={() => { setFeedbackPilotId(p.id); setSponsorNotes(""); }} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px] py-1 px-2 rounded">Feedback</button>}
                            <button onClick={() => setSelectedPilot(p)} className="text-sidebar-active hover:underline text-[10px] font-bold">Details</button>
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

      {/* 2. POST A PILOT */}
      {currentTab === "post-pilot" && (
        <div className="max-w-2xl mx-auto bg-white p-5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Post a Pilot Opportunity</h2>
          <form onSubmit={handlePostPilot} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Title</label>
              <input type="text" required placeholder="e.g. Acoustic Leak Detection in Pune Ward 12" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Budget Cap (INR)</label>
                <input type="number" required placeholder="e.g. 800000" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Duration (Days)</label>
                <input type="number" required placeholder="e.g. 90" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sector</label>
              <select value={newSector} onChange={(e) => setNewSector(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sidebar-active">
                {Object.keys(sectorRules).map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Problem Description &amp; Scope</label>
              <textarea required rows={3} placeholder="Detail the challenge, goals, deployment criteria..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
            </div>
            <button type="submit" className="w-full bg-sidebar hover:bg-sidebar-dark text-white font-bold py-2 rounded shadow-sm transition text-sm">Post Opportunity</button>
          </form>
        </div>
      )}

      {/* 3. BROWSE CERTIFIED */}
      {currentTab === "browse-certified" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search technologies or startups..." value={browseQuery} onChange={(e) => setBrowseQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-active" />
            </div>
            <select value={browseSector} onChange={(e) => setBrowseSector(e.target.value)} className="border border-slate-200 rounded px-2 py-2 text-xs">
              <option value="All">All Sectors</option>
              <option value="Water & Sanitation">Water &amp; Sanitation</option>
              <option value="Energy & Cleantech">Energy &amp; Cleantech</option>
            </select>
            <div className="flex justify-end items-center">
              <span className="text-[10px] text-slate-400 font-bold">{pilots.filter(p => p.status === "Certified").length} Certified Precedents</span>
            </div>
          </div>

          <div className="space-y-3">
            {pilots.filter(p => p.status === "Certified")
              .filter(p => browseQuery ? (p.title.toLowerCase().includes(browseQuery.toLowerCase()) || p.application.startupName.toLowerCase().includes(browseQuery.toLowerCase())) : true)
              .filter(p => browseSector !== "All" ? p.sector === browseSector : true)
              .map(p => (
                <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  <div className="lg:col-span-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5"><Award className="w-3 h-3" /> Certified</span>
                      <span className="text-[10px] font-semibold text-slate-400">{p.sector}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{p.title}</h3>
                    <p className="text-[10px] text-slate-500">By <strong className="text-sidebar">{p.application.startupName}</strong> at {p.department}</p>
                    <p className="text-[10px] text-slate-500 italic line-clamp-2">"{p.verification.notes}"</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Audited Outcome</p>
                    <p className="text-xs font-bold text-emerald-800">{p.evidence.waterLossReduction}</p>
                    <p className="text-[10px] text-slate-500">Duration: {p.evidence.duration} | Score: {p.verification.score}/100</p>
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
          <div className="bg-sidebar text-white p-5 rounded-lg shadow-sm border-b-4 border-sidebar-active">
            <h2 className="text-base font-bold flex items-center gap-2"><ShieldCheck className="text-sidebar-active w-5 h-5" /> Audit Defense Procurement Record</h2>
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
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myPilots.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pr-4"><span className="font-semibold text-slate-800 block">{p.title}</span><span className="text-[9px] text-slate-400 font-mono">ID: {p.id}</span></td>
                        <td className="py-2.5 pr-4 font-semibold">₹{p.application?.proposedCost?.toLocaleString('en-IN') || p.budgetCap.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 pr-4 font-medium text-sidebar">{p.application?.startupName || "Unassigned"}</td>
                        <td className="py-2.5">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${p.status === "Certified" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                            {p.status === "Certified" ? "Verified" : p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3 border-b pb-2 uppercase tracking-wider">Fast-Track Adoptions Ledger</h3>
            {myProcurements.length === 0 ? <p className="text-xs text-slate-400 italic">No scaled adoptions recorded yet.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider text-left">
                      <th className="pb-2 pr-4 font-semibold">Procurement</th>
                      <th className="pb-2 pr-4 font-semibold">Budget</th>
                      <th className="pb-2 pr-4 font-semibold">Source Dept</th>
                      <th className="pb-2 font-semibold">GFR Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {myProcurements.map(pr => (
                      <tr key={pr.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pr-4"><span className="font-semibold text-slate-800 block">{pr.pilotTitle}</span><span className="text-[9px] text-slate-400 font-mono">{pr.date} | {pr.id}</span></td>
                        <td className="py-2.5 pr-4 font-semibold text-sidebar-active">₹{pr.scaledBudget.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 pr-4">{pr.sponsoringDepartment}</td>
                        <td className="py-2.5"><span className="bg-blue-50 text-blue-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-blue-200">R170/R173</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
          <div className="bg-white rounded-lg max-w-2xl w-full p-5 shadow-lg border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Fast-Track Scaled Procurement</h3>
                <p className="text-[10px] text-slate-500">Adopt a certified pilot precedent directly.</p>
              </div>
              <button onClick={() => setAdoptionModalOpen(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>
            <form onSubmit={handleConfirmAdoption} className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-[11px] space-y-1">
                <span className="font-bold text-emerald-800 uppercase tracking-wide block text-[10px]">&check; Certified Precedent</span>
                <p><strong>Pilot:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.title}</p>
                <p><strong>Startup:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.application.startupName}</p>
                <p><strong>Metrics:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.evidence.waterLossReduction}</p>
                <p><strong>Verifier:</strong> {pilots.find(p => p.id === adoptionModalOpen)?.verification.verifierName}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded border text-[10px] space-y-1">
                <span className="font-bold text-slate-600 uppercase tracking-wide block">Auto-Generated Justification</span>
                <p className="text-slate-500 italic">"Fast-tracked under State procurement sandbox policies. Vendor exempted from EMD (GFR Rule 170) and prior experience (Rule 173)."</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Adopting Department</label>
                  <input type="text" required value={procureDept} onChange={(e) => setProcureDept(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Scaled Budget (INR)</label>
                  <input type="number" required placeholder="e.g. 2400000" value={procureBudget} onChange={(e) => setProcureBudget(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAdoptionModalOpen(null)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Confirm Procurement</button>
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
  currentTab, setCurrentTab, currentUser, pilots, setPilots, showToast, selectedPilot, setSelectedPilot
}) {
  const [activePilotId, setActivePilotId] = useState(null);
  const [score, setScore] = useState(90);
  const [notes, setNotes] = useState("");
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(true);
  const [c3, setC3] = useState(true);

  const pendingList = pilots.filter(p => p.status === "Completed");
  const verifiedHistory = pilots.filter(p => p.status === "Certified" || p.status === "Rejected");

  const handleVerifyAction = (statusOption) => {
    if (!notes.trim()) { showToast("Please provide evaluator notes before deciding", "error"); return; }
    const updated = pilots.map(p => {
      if (p.id === activePilotId) {
        return { ...p, status: statusOption, verification: {
          verifierId: currentUser.id, verifierName: currentUser.name, score: parseInt(score),
          scorecard: [ { criterion: "≥15% measurable improvement", passed: c1 }, { criterion: "pilot ran ≥60 days", passed: c2 }, { criterion: "no safety incidents", passed: c3 } ],
          notes, certifiedAt: new Date().toISOString().split("T")[0]
        }};
      }
      return p;
    });
    setPilots(updated);
    setActivePilotId(null); setNotes("");
    showToast(`Pilot verification complete: marked as ${statusOption}!`, "success");
  };

  return (
    <div className="space-y-4">
      {/* PENDING QUEUE */}
      {currentTab === "pending" && (
        <div className="space-y-4 animate-fade-in">
          {pendingList.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-slate-200 text-center text-slate-400 shadow-sm">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Queue Cleared</p>
              <p className="text-xs mt-1">All submitted pilots have been audited.</p>
            </div>
          ) : (
            pendingList.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">Awaiting Audit</span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1.5">{p.title}</h3>
                    <p className="text-[10px] text-slate-500">Startup: <strong className="text-sidebar">{p.application.startupName}</strong> | {p.sector}</p>
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
                  <button onClick={() => { setActivePilotId(p.id); setNotes(""); setScore(90); }} className="bg-sidebar hover:bg-sidebar-dark text-white font-semibold text-xs py-1.5 px-3 rounded transition">
                    Evaluate &amp; Complete Audit
                  </button>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border-2 border-sidebar space-y-4 animate-slide-up">
                    <h4 className="font-bold text-xs text-slate-800 border-b pb-1 uppercase tracking-wider">Technical Evaluator Scorecard</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={c1} onChange={(e) => setC1(e.target.checked)} className="rounded border-slate-300 text-sidebar-active" />
                        <span>&ge;15% measurable improvement</span>
                      </label>
                      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={c2} onChange={(e) => setC2(e.target.checked)} className="rounded border-slate-300 text-sidebar-active" />
                        <span>Pilot ran &ge;60 days</span>
                      </label>
                      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={c3} onChange={(e) => setC3(e.target.checked)} className="rounded border-slate-300 text-sidebar-active" />
                        <span>Zero safety incidents</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Score (0-100)</label>
                        <div className="flex items-center gap-2">
                          <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} className="flex-grow accent-sidebar-active" />
                          <span className="font-bold text-xs text-slate-800 w-10 text-right">{score}/100</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Auditor Notes</label>
                      <textarea required rows={2} placeholder="Detailed assessment..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setActivePilotId(null)} className="border border-slate-300 text-slate-500 py-1 px-2.5 rounded text-[10px] font-semibold">Cancel</button>
                      <button onClick={() => handleVerifyAction("Rejected")} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2.5 rounded text-[10px]">Reject</button>
                      <button onClick={() => handleVerifyAction("Certified")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded text-[10px]">Certify</button>
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
  const scaleAdoptionsCount = procurements.length;
  const totalPilotValue = pilots.reduce((acc, curr) => acc + (curr.application?.proposedCost || curr.budgetCap), 0);
  const totalProcurementValue = procurements.reduce((acc, curr) => acc + curr.scaledBudget, 0);
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Building className="text-slate-500 w-5 h-5" />} label="Total Pilots" value={totalPilotsCount} />
            <StatCard icon={<Award className="text-emerald-600 w-5 h-5" />} label="Certified Precedents" value={certifiedCount} />
            <StatCard icon={<CheckCircle className="text-blue-600 w-5 h-5" />} label="Adoptions" value={scaleAdoptionsCount} />
            <div className="bg-gradient-to-br from-sidebar to-sidebar-darker text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Value Unlocked</span>
              <span className="text-xl font-bold mt-1">₹{totalValueUnlocked.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-sidebar-active font-bold mt-1">&check; Economy Scaling</span>
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
                  <option value="Water & Sanitation">Water &amp; Sanitation</option>
                  <option value="Energy & Cleantech">Energy &amp; Cleantech</option>
                  <option value="Healthcare & Medtech">Healthcare &amp; Medtech</option>
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
                  <option value="Water & Sanitation">Water &amp; Sanitation</option>
                  <option value="Energy & Cleantech">Energy &amp; Cleantech</option>
                  <option value="Healthcare & Medtech">Healthcare &amp; Medtech</option>
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
        <text x={4} y={y(maxY) + 4} fontSize="8" fill="#94a3b8">{maxY}</text>
        <text x={4} y={y(0) + 4} fontSize="8" fill="#94a3b8">0</text>
        <path d={area} fill="#1ABB9C" opacity="0.12" />
        <path d={path} fill="none" stroke="#1ABB9C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((pt, i) => (
          <g key={pt.date + i}>
            <circle cx={x(i)} cy={y(pt.cumulative)} r="3.5" fill="#1ABB9C" />
            <text x={x(i)} y={H - PAD + 12} fontSize="7" fill="#64748b" textAnchor="middle">{pt.date}</text>
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

          {pilot.application && (
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50 space-y-1.5">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Application</h4>
                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">DPIIT Verified</span>
              </div>
              <p className="text-[11px]"><strong>Startup:</strong> {pilot.application.startupName} ({pilot.application.dpiitNo})</p>
              <p className="text-[11px]"><strong>Cost:</strong> ₹{pilot.application.proposedCost.toLocaleString('en-IN')}</p>
              <p className="text-[11px] bg-white p-2 rounded border"><strong>Scope:</strong> {pilot.application.proposedScope}</p>
            </div>
          )}

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
