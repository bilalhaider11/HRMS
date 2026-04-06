import { useContext, useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation, Link } from "react-router-dom";
import LoginPage from "../features/auth/ui/Login/LoginPage";
import UserPage from "../widgets/UserPages";
import { VerifyContext } from "./VerifyContext";
import { EmployeesProvider } from "../features/employees/modal/EmployeesContext";
import { FinanceProvider } from "../features/finance/modal/FinanceContext";
import { InventoryProvider } from "../features/inventory/modal/InventoryContext";
import { TeamsProvider } from "../features/teams/modal/teamsContext";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: any;
  path: string;
  adminOnly: boolean;
  children?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", adminOnly: false },
  { label: "Employees", icon: Users, path: "/employees", adminOnly: true },
  {
    label: "Finance", icon: DollarSign, path: "/finance", adminOnly: true,
    children: [
      { label: "Finance Listing", path: "/finance" },
      { label: "Categories", path: "/finance/category-lists" },
    ],
  },
  { label: "Inventory", icon: Package, path: "/inventory", adminOnly: true },
  { label: "Settings", icon: Settings, path: "/settings", adminOnly: false },
];

function Sidebar({
  user,
  superAdmin,
  onLogout,
  sidebarOpen,
  onClose,
}: {
  user: { name: string; email: string };
  superAdmin: boolean;
  onLogout: () => void;
  sidebarOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || superAdmin
  );

  // Auto-expand parent if a child route is active
  useEffect(() => {
    visibleItems.forEach((item) => {
      if (item.children && location.pathname.startsWith(item.path)) {
        setExpandedItems((prev) => prev.includes(item.path) ? prev : [...prev, item.path]);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
          <span className="text-lg font-semibold text-white font-inter">
            HRMS
          </span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            const isExpanded = expandedItems.includes(item.path);

            if (item.children) {
              return (
                <div key={item.path}>
                  <button
                    onClick={() => toggleExpand(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-colors ${
                      isActive
                        ? "bg-indigo-600/10 text-indigo-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-800 pl-3">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={onClose}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-inter transition-colors ${
                              isChildActive
                                ? "bg-indigo-600 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold font-inter">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate font-inter">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate font-inter">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors font-inter"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center px-5 lg:px-8">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
}

export default function AppContent() {
  const { user, setUser, superAdmin, authCheckLoading } =
    useContext(VerifyContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogOut = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/admin/login");
  }, [setUser, navigate]);

  // Close sidebar on route change (mobile)
  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (authCheckLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    );
  }

  return (
    <TeamsProvider>
      <InventoryProvider>
        <FinanceProvider>
          <EmployeesProvider>
            <div className="min-h-screen bg-slate-950">
              <Sidebar
                user={user}
                superAdmin={superAdmin}
                onLogout={handleLogOut}
                sidebarOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />

              {/* Main content */}
              <div className="lg:ml-64 min-h-screen flex flex-col">
                <TopBar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-5 lg:p-8">
                  <Routes>
                    <Route
                      path="/*"
                      element={
                        <UserPage superAdmin={superAdmin} name={user?.name || ""} />
                      }
                    />
                  </Routes>
                </main>
              </div>
            </div>
          </EmployeesProvider>
        </FinanceProvider>
      </InventoryProvider>
    </TeamsProvider>
  );
}
