import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Upload,
  BarChart3,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Check,
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
  const [reqOpen, setReqOpen] = useState(false);
  const reqRef = useRef(null);

  useEffect(() => {
    if (!reqOpen) return;
    const onClick = (e) => {
      if (reqRef.current && !reqRef.current.contains(e.target)) {
        setReqOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [reqOpen]);

  const openReqs = requisitions.filter((r) => r.status === "Active");

  return (
    <div className="min-h-screen flex bg-white text-[#1a1a1a]">
      {/* Sidebar — blue-tinted */}
      <aside
        className={`bg-white border-r border-[#dbe4f5] flex flex-col transition-all duration-200 ease-out ${
          collapsed ? "w-[56px]" : "w-[220px]"
        }`}
      >
        <div
          className={`h-12 border-b border-[#dbe4f5] flex items-center ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-[#185FA5] text-white grid place-items-center font-semibold text-[10px] shrink-0">
                SGI
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-[13px] font-semibold text-[#185FA5] truncate">
                  Safe-Guard
                </div>
                <div className="text-[10px] text-[#6B90C4] truncate">
                  Recruiter Portal
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#185FA5] transition"
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
                    ? "bg-[#E8F0FE] text-[#185FA5] font-semibold"
                    : "text-[#4A5568] hover:bg-[#EEF2FF]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#185FA5] rounded-r" />
                  )}
                  <Icon
                    size={15}
                    className={`shrink-0 ${
                      isActive ? "text-[#185FA5]" : "text-[#6B7280]"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`border-t border-[#dbe4f5] flex items-center ${
            collapsed ? "justify-center p-2" : "gap-2.5 p-3"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#185FA5] text-white grid place-items-center font-semibold text-[10px] shrink-0">
            CW
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-[12px] font-semibold text-[#1a1a1a] truncate">
                Candace W.
              </div>
              <div className="text-[10px] text-[#6B90C4]">Recruiter</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-white border-b border-[#f0f0f0] px-5 flex items-center gap-4">
          <div className="relative" ref={reqRef}>
            <button
              onClick={() => setReqOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition ${
                reqOpen ? "bg-[#F0F4FF]" : "hover:bg-[#F7FAFC]"
              }`}
            >
              <span className="text-[11px] font-semibold text-[#185FA5]">
                {active?.id}
              </span>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">
                {active?.title}
              </span>
              <ChevronDown
                size={13}
                className={`text-[#888] transition-transform ${
                  reqOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {reqOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-30 w-[320px] bg-white border border-[#E2E8F0] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1">
                {openReqs.map((r) => {
                  const sel = r.id === activeReq;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setActiveReq(r.id);
                        setReqOpen(false);
                      }}
                      className={`w-full text-left rounded-md px-3 py-2 transition flex items-start justify-between gap-3 ${
                        sel ? "bg-[#F0F4FF]" : "hover:bg-[#F0F4FF]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-semibold text-[#185FA5]">
                            {r.id}
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                            {r.status}
                          </span>
                        </div>
                        <div className="text-[13px] font-semibold text-[#1a1a1a] truncate">
                          {r.title}
                          <span className="text-[11px] font-normal text-[#888]">
                            {" "}· {r.location}
                          </span>
                        </div>
                      </div>
                      {sel && (
                        <Check size={14} className="text-[#185FA5] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {active && (
            <div className="text-[12px] text-[#888]">
              {active.location} · {active.applicants} applicants
            </div>
          )}

          <div className="flex-1" />

          <button className="p-1.5 rounded text-[#888] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]">
            <Bell size={15} />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
