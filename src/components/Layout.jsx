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

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-800">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-sgi text-white grid place-items-center font-bold text-sm">
            SGI
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-slate-900 text-sm">Safe-Guard</div>
            <div className="text-[11px] text-slate-500">Recruiter Portal</div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-sgi-50 text-sgi-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sgi-400 to-sgi-700 text-white grid place-items-center font-semibold text-sm">
            CW
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Candace W.</div>
            <div className="text-[11px] text-slate-500">Recruiter</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
          <div className="relative">
            <select
              value={activeReq}
              onChange={(e) => setActiveReq(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-md pl-3 pr-9 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-sgi"
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
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>
          {active && (
            <div className="text-xs text-slate-500">
              {active.location} · {active.applicants} applicants
            </div>
          )}

          <div className="flex-1" />

          <div className="relative">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search candidates, reqs…"
              className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-sm w-64 focus:outline-none focus:border-sgi"
            />
          </div>

          <button className="p-2 rounded-md hover:bg-slate-100 text-slate-500">
            <Bell size={17} />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
