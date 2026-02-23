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
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  BarChart3,
  Users,
} from "lucide-react";

function AdminLayout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setShowSidebar] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
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

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-slate-900" : "bg-gray-100"}`}>
      
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        } border-r shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* LOGO */}
        <div className={`${darkMode ? "border-slate-700" : "border-gray-200"} border-b p-6`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h3 className={`text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                  Admin
                </h3>
                <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Control Panel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrentPage = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isCurrentPage
                    ? `${darkMode ? "bg-indigo-600/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"} border-l-4 border-indigo-600`
                    : `${darkMode ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* DSA SECTION */}
          <div className="mt-6">
            {sidebarOpen && (
              <p className={`text-xs font-bold uppercase tracking-wider px-4 mb-3 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                DSA Management
              </p>
            )}
            
            <button
              onClick={() => setExpandDSA(!expandDSA)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isDSAActive
                  ? `${darkMode ? "bg-indigo-600/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"} border-l-4 border-indigo-600`
                  : `${darkMode ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
              }`}
              title="DSA Problems"
            >
              <Code2 className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="font-medium whitespace-nowrap flex-1 text-left">DSA Problems</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandDSA ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {/* DSA SUBMENU */}
            {expandDSA && sidebarOpen && (
              <div className="space-y-1 mt-2 ml-4">
                {dsaItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrentPage = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isCurrentPage
                          ? `${darkMode ? "bg-indigo-600/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"} border-l-4 border-indigo-600`
                          : `${darkMode ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className={`${darkMode ? "border-slate-700" : "border-gray-200"} border-t p-3`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              darkMode
                ? "text-red-400 hover:bg-red-600/20"
                : "text-red-600 hover:bg-red-50"
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-medium whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>

        {/* TOGGLE SIDEBAR */}
        <div className={`${darkMode ? "border-slate-700" : "border-gray-200"} border-t p-3`}>
          <button
            onClick={() => setShowSidebar(!sidebarOpen)}
            className={`w-full flex items-center justify-center p-3 rounded-xl transition-all ${
              darkMode
                ? "hover:bg-slate-700/50"
                : "hover:bg-gray-100"
            }`}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP BAR */}
        <header className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"} border-b shadow-sm sticky top-0 z-40`}>
          <div className="px-6 py-4 flex justify-between items-center">
            
            {/* LEFT SIDE - TITLE */}
            <div className={`text-lg font-semibold ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
              {navItems.find((item) => isActive(item.path))?.label || 
               dsaItems.find((item) => isActive(item.path))?.label || 
               "Dashboard"}
            </div>

            {/* RIGHT SIDE - ACTIONS */}
            <div className="flex items-center gap-4">
              
              {/* DARK MODE TOGGLE */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* NOTIFICATIONS */}
              <button
                className={`relative p-2 rounded-lg transition-all ${
                  darkMode
                    ? "hover:bg-slate-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <Bell className={`w-5 h-5 ${darkMode ? "text-slate-400" : "text-gray-600"}`} />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </button>

              {/* PROFILE SECTION */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    darkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="hidden sm:block text-sm">
                    <p className={`font-medium ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                      {user?.name || "Admin"}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${darkMode ? "text-slate-400" : "text-gray-600"} ${showProfileMenu ? "rotate-180" : ""}`} />
                </button>

                {/* PROFILE DROPDOWN */}
                {showProfileMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl ${
                      darkMode ? "bg-slate-700" : "bg-white"
                    } border ${darkMode ? "border-slate-600" : "border-gray-200"}`}
                  >
                    <div className="p-4 border-b border-inherit">
                      <p className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                        {user?.name || "Admin User"}
                      </p>
                      <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 overflow-auto ${darkMode ? "bg-slate-900" : "bg-gray-100"}`}>
          <div className="p-6">
            <Outlet context={{ darkMode }} />
          </div>
        </main>
      </div>

      {/* CLOSE PROFILE MENU ON OUTSIDE CLICK */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;