import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContextValue";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Code2,
  LogOut,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Users,
  Star,
  Terminal,
  Shield,
} from "lucide-react";

function AdminLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setShowSidebar] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandDSA, setExpandDSA] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items
  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Subjects",
      path: "/admin/subjects",
      icon: BookOpen,
    },
    {
      label: "MCQs",
      path: "/admin/mcqs",
      icon: HelpCircle,
    },
    {
      label: "STAR Questions",
      path: "/admin/star-questions",
      icon: Star,
    },
  ];

  const dsaItems = [
    {
      label: "DSA Overview",
      path: "/admin/dsa",
      icon: Code2,
    },
    {
      label: "Topics",
      path: "/admin/dsa/topics",
      icon: BookOpen,
    },
    {
      label: "Problems",
      path: "/admin/dsa/problems",
      icon: Code2,
    },
    {
      label: "Difficulty Levels",
      path: "/admin/dsa/difficulty",
      icon: HelpCircle,
    },
    {
      label: "Solutions",
      path: "/admin/dsa/solutions",
      icon: Code2,
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isDSAActive = location.pathname.startsWith("/admin/dsa");

  const currentLabel =
    navItems.find((item) => isActive(item.path))?.label ||
    dsaItems.find((item) => isActive(item.path))?.label ||
    (isDSAActive ? "DSA Problems" : "Dashboard");

  return (
    <div className="min-h-screen flex bg-[#0a0a16] text-slate-300 selection:bg-indigo-500/30">

      {/* ── BACKGROUND EFFECTS ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      <div className="fixed inset-0 -z-10 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="admingrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admingrid)" />
        </svg>
      </div>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-[68px]"} relative z-20 border-r border-white/[0.08] bg-[#0d0d1a]/80 backdrop-blur-xl transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        {/* LOGO */}
        <div className="border-b border-white/[0.08] px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-black tracking-tight text-white">
                  Admin<span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Panel</span>
                </p>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600">Control Center v1.0</p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`} />
                {sidebarOpen && (
                  <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-indigo-300" : ""}`}>{item.label}</span>
                )}
                {active && sidebarOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}

          {/* DSA SECTION */}
          <div className="pt-3">
            {sidebarOpen && (
              <p className="text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-2 text-slate-600 font-mono">
                DSA Management
              </p>
            )}
            <button
              onClick={() => setExpandDSA(!expandDSA)}
              title={!sidebarOpen ? "DSA Problems" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isDSAActive
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Code2 className={`w-4 h-4 flex-shrink-0 ${isDSAActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-400"}`} />
              {sidebarOpen && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">DSA Problems</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandDSA ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {expandDSA && sidebarOpen && (
              <div className="mt-0.5 ml-3 space-y-0.5">
                {dsaItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                        active
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                          : "text-slate-600 hover:text-slate-400 hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* LOGOUT + COLLAPSE */}
        <div className="border-t border-white/[0.08] p-2 space-y-0.5">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            title={!sidebarOpen ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/[0.08] border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
          <button
            onClick={() => setShowSidebar(!sidebarOpen)}
            title={sidebarOpen ? "Collapse" : "Expand"}
            className="w-full flex items-center justify-center py-2 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-all"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* TOP BAR */}
        <header className="relative z-10 border-b border-white/[0.08] bg-[#0d0d1a]/60 backdrop-blur-md sticky top-0">
          <div className="px-6 py-3.5 flex justify-between items-center">

            {/* PAGE TITLE */}
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-black uppercase tracking-widest text-white font-mono">
                {currentLabel}
              </span>
            </div>

            {/* PROFILE */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-indigo-400/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-300">{user?.name || "Admin"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl bg-[#0d0d1a] border border-white/[0.1] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/[0.08]">
                    <p className="text-sm font-semibold text-white">{user?.name || "Admin User"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || "admin@example.com"}</p>
                  </div>
                  <button
                    onClick={() => { logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/[0.08] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {showProfileMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
      )}
    </div>
  );
}

export default AdminLayout;