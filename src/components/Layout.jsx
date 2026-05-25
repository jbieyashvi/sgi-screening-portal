import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Upload,
  BarChart3,
  Search,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useApp } from "../store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/screening", label: "Screening", icon: Users },
  { to: "/requisitions", label: "Requisitions", icon: Briefcase },
  { to: "/upload", label: "Upload Resumes", icon: Upload },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Layout() {
  const { requisitions, activeReq, setActiveReq } = useApp();
  const active = requisitions.find((r) => r.id === activeReq);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-800">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-out ${
          collapsed ? "w-[56px]" : "w-60"
        }`}
      >
        <div
          className={`h-[68px] border-b border-slate-100 flex items-center ${
            collapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-md bg-sgi text-white grid place-items-center font-bold text-sm shrink-0">
                SGI
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-semibold text-slate-900 text-sm truncate">
                  Safe-Guard
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Recruiter Portal
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        <nav className={`flex-1 py-3 space-y-0.5 ${collapsed ? "px-2" : "px-2"}`}>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-sgi-50 text-sgi-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div
          className={`border-t border-slate-100 flex items-center ${
            collapsed ? "justify-center p-2" : "gap-3 p-3"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sgi-400 to-sgi-700 text-white grid place-items-center font-semibold text-sm shrink-0">
            CW
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                Candace W.
              </div>
              <div className="text-[11px] text-slate-500">Recruiter</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[68px] bg-white border-b border-slate-200 px-8 flex items-center gap-5">
          <div className="relative">
            <select
              value={activeReq}
              onChange={(e) => setActiveReq(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-md pl-4 pr-10 py-2.5 text-[15px] font-semibold text-slate-800 focus:outline-none focus:border-sgi"
            >
              {requisitions
                .filter((r) => r.status === "Active")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.title}
                  </option>
                ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>
          {active && (
            <div className="text-sm text-slate-500">
              {active.location} · {active.applicants} applicants
            </div>
          )}

          <div className="flex-1" />

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search candidates, reqs…"
              className="bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm w-72 focus:outline-none focus:border-sgi"
            />
          </div>

          <button className="p-2 rounded-md hover:bg-slate-100 text-slate-500">
            <Bell size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
