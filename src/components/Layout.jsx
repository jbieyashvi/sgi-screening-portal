import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Upload,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/screening", label: "Screening", icon: Users },
  { to: "/requisitions", label: "Requisitions", icon: Briefcase },
  { to: "/upload", label: "Upload Resumes", icon: Upload },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-white text-[#1a1a1a]">
      {/* Sidebar — blue-tinted */}
      <aside
        className={`bg-white border-r border-[#DBEAFE] flex flex-col transition-all duration-200 ease-out ${
          collapsed ? "w-[56px]" : "w-[220px]"
        }`}
      >
        <div
          className={`h-12 border-b border-[#DBEAFE] flex items-center ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-[#2563EB] text-white grid place-items-center font-semibold text-[10px] shrink-0">
                SGI
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-[13px] font-semibold text-[#2563EB] truncate">
                  Safe-Guard
                </div>
                <div className="text-[10px] text-[#60A5FA] truncate">
                  Recruiter Portal
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `relative flex items-center ${
                  collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
                } py-1.5 rounded text-[13px] transition ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold"
                    : "text-[#4A5568] hover:bg-[#EFF6FF]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#2563EB] rounded-r" />
                  )}
                  <Icon
                    size={15}
                    className={`shrink-0 ${
                      isActive ? "text-[#2563EB]" : "text-[#6B7280]"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`border-t border-[#DBEAFE] flex items-center ${
            collapsed ? "justify-center p-2" : "gap-2.5 p-3"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white grid place-items-center font-semibold text-[10px] shrink-0">
            CW
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-[12px] font-semibold text-[#1a1a1a] truncate">
                Candace W.
              </div>
              <div className="text-[10px] text-[#60A5FA]">Recruiter</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
