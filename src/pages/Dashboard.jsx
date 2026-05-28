import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

/* ------------------------------- data ------------------------------------ */

const REQS = [
  { id: "REQ-2683", title: "Apprentice Installer / DSD",           location: "Atlanta, GA",       work: "Onsite", kind: "Backfill",     headcount: 1,  hiringManager: "Joe Copeland",      recruiter: "Spencer",            daysOpen: 22, stage: "Recruiter Phone Screen", dept: "DSD",                  dateOpened: null,         agency: false },
  { id: "REQ-2667", title: "VSC Adjuster I-III ATL",               location: "Atlanta, GA",       work: "Hybrid", kind: "New/Backfill", headcount: 17, hiringManager: "Revolving",         recruiter: "Spencer & Jon Marie", daysOpen: 22, stage: "Start Date",             dept: "Operations",           dateOpened: "May 4, 2026", agency: false },
  { id: "REQ-2766", title: "VSC Manager",                          location: "Greenville, SC",    work: "Onsite", kind: "Backfill",     headcount: 1,  hiringManager: "Addis Davis",       recruiter: "Spencer",            daysOpen: 23, stage: "Sourcing",               dept: "Operations",           dateOpened: "May 5, 2026", agency: false },
  { id: "REQ-2669", title: "Key Partner Executive I",              location: "Atlanta, GA",       work: "Hybrid", kind: "Backfill",     headcount: 4,  hiringManager: "Christina Sweeten", recruiter: "Spencer",            daysOpen: 99, stage: "HM Video Interview",     dept: "Key Partner",          dateOpened: "Feb 17, 2026", agency: true },
  { id: "REQ-2732", title: "Regional Performance Manager Honda",   location: "Remote ATL/PHL",    work: "Remote", kind: "Backfill",     headcount: 1,  hiringManager: "Marc Wagstaff",     recruiter: "Spencer",            daysOpen: 59, stage: "Start Date",             dept: "Sales & Training NVR", dateOpened: "Mar 27, 2026", agency: false },
  { id: "REQ-2746", title: "Account Development Manager VCI",      location: "Remote DFW",        work: "Remote", kind: "Backfill",     headcount: 1,  hiringManager: "Mike Baker",        recruiter: "Spencer",            daysOpen: 50, stage: "Start Date",             dept: "Sales & Training NVR", dateOpened: "Apr 6, 2026", agency: false },
];

const SOURCING = [
  { label: "LinkedIn",      pct: 56, color: "#7C3AED" }, // purple
  { label: "Indeed",        pct: 20, color: "#2563EB" }, // blue
  { label: "Career Center", pct: 19, color: "#F59E0B" }, // orange
  { label: "ZipRecruiter",  pct: 2,  color: "#EC4899" }, // pink
  { label: "Referral",      pct: 1,  color: "#023E8A" }, // brand
  { label: "Others",        pct: 1,  color: "#10B981" }, // green
];
const TOTAL_APPLICATIONS = 14077;

const STAGE_COLOR = {
  "Recruiter Phone Screen": "bg-[#E8F0FB] text-[#023E8A] border-[#BFDBFE]",
  "Sourcing":               "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
  "HM Video Interview":     "bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]",
  "Start Date":             "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
};
const STAGE_ORDER = ["Sourcing", "Recruiter Phone Screen", "HM Video Interview", "Start Date"];

const daysColor = (d) => (d < 30 ? "text-emerald-600" : d <= 60 ? "text-amber-600" : "text-red-600");

/* ------------------------------- helpers --------------------------------- */

function Donut({ data, size = 180, thickness = 26, total }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  // precompute cumulative offsets so we don't mutate during render
  const slices = data.reduce((arr, d) => {
    const prev = arr.length ? arr[arr.length - 1].end : 0;
    const len = (d.pct / 100) * C;
    arr.push({ ...d, start: prev, end: prev + len, len });
    return arr;
  }, []);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness} />
      {slices.map((d) => (
        <circle
          key={d.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={d.color}
          strokeWidth={thickness}
          strokeDasharray={`${d.len} ${C - d.len}`}
          strokeDashoffset={-d.start}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      {total != null && (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[#1a1a1a]" style={{ fontSize: 18, fontWeight: 700 }}>
            {total.toLocaleString("en-US")}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-[#6B7280]" style={{ fontSize: 10 }}>
            Total
          </text>
        </>
      )}
    </svg>
  );
}

function ReqFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const label = value === "all" ? "All Requisitions" : value;
  const query = q.trim().toLowerCase();
  const visible = query
    ? REQS.filter((r) => `${r.id} ${r.title}`.toLowerCase().includes(query))
    : REQS;

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); setQ(""); }}
        className="h-8 px-3 inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-md text-[13px] font-medium text-[#4A5568] hover:bg-[#F7FAFC]"
      >
        {label}
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-[280px] bg-white border border-[#E2E8F0] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex flex-col max-h-[360px] overflow-hidden">
          {/* sticky search */}
          <div className="sticky top-0 bg-white border-b border-[#f0f0f0] p-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa5b1]" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search requisitions…"
                className="w-full pl-7 pr-2.5 py-1.5 border border-[#E2E8F0] rounded-md text-[12px] text-[#1a1a1a] placeholder:text-[#9aa5b1] focus:outline-none focus:border-sgi-400"
              />
            </div>
          </div>

          <div className="overflow-auto py-1">
            {/* All option pinned, not filterable */}
            <button
              onClick={() => { onChange("all"); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#E8F0FB] ${value === "all" ? "text-[#023E8A] font-semibold" : "text-[#1a1a1a]"}`}
            >
              All Requisitions
            </button>
            <div className="my-1 border-t border-[#f0f0f0]" />

            {visible.length === 0 ? (
              <div className="px-3 py-3 text-center text-[12px] text-[#9aa5b1]">
                No requisitions found
              </div>
            ) : (
              visible.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { onChange(r.id); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#E8F0FB] ${value === r.id ? "text-[#023E8A] font-semibold" : "text-[#1a1a1a]"}`}
                >
                  <div>{r.id}</div>
                  <div className="text-[11px] text-[#6B7280] truncate">{r.title}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- page ------------------------------------ */

export default function Dashboard() {
  const [version, setVersion] = useState(1);
  const [reqFilter, setReqFilter] = useState("all");

  const reqs = useMemo(
    () => (reqFilter === "all" ? REQS : REQS.filter((r) => r.id === reqFilter)),
    [reqFilter]
  );

  return (
    <div className="p-8 max-w-[1480px] mx-auto">
      {/* header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Recruiting performance across {REQS.length} open requisitions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* version tabs */}
          <div className="inline-flex items-center bg-[#F1F5F9] rounded-md p-0.5">
            {[1, 2, 3].map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`h-7 px-3 rounded-[5px] text-[12px] font-medium transition ${
                  version === v ? "bg-[#023E8A] text-white" : "text-[#4A5568] hover:text-[#1a1a1a]"
                }`}
              >
                Version {v}
              </button>
            ))}
          </div>
          <ReqFilter value={reqFilter} onChange={setReqFilter} />
        </div>
      </div>

      {version === 1 && <V1 reqs={reqs} />}
      {version === 2 && <V2 reqs={reqs} />}
      {version === 3 && <V3 reqs={reqs} />}
    </div>
  );
}

/* ============================== Version 1 =============================== */

function V1({ reqs }) {
  const headcount = reqs.reduce((s, r) => s + r.headcount, 0);
  const avgDays = Math.round(reqs.reduce((s, r) => s + r.daysOpen, 0) / Math.max(reqs.length, 1));
  const apps = Math.round(TOTAL_APPLICATIONS * (reqs.length / REQS.length));

  const work = { Onsite: 0, Hybrid: 0, Remote: 0 };
  const kind = { New: 0, Backfill: 0 };
  reqs.forEach((r) => {
    work[r.work] += 1;
    // "New/Backfill" counts as the primary kind (New) so totals add to req count
    if (r.kind === "New/Backfill") kind.New += 1;
    else if (kind[r.kind] != null) kind[r.kind] += 1;
  });
  const workMax = Math.max(work.Onsite, work.Hybrid, work.Remote, 1);
  const kindMax = Math.max(kind.New, kind.Backfill, 1);

  return (
    <>
      {/* stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Open REQs" value={reqs.length} />
        <StatCard label="Total Headcount" value={headcount} />
        <StatCard label="Avg Days Open" value={avgDays} />
        <StatCard label="Total Applications" value={apps.toLocaleString("en-US")} />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* sourcing — narrower */}
        <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Candidate Sourcing</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 mb-3">
            {TOTAL_APPLICATIONS.toLocaleString("en-US")} applications · all sources
          </p>
          <div className="flex items-center gap-4">
            <div className="w-1/2 flex justify-center">
              <Donut data={SOURCING} size={160} thickness={24} total={TOTAL_APPLICATIONS} />
            </div>
            <ul className="w-1/2 space-y-2">
              {SOURCING.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-[13px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-slate-700 truncate">{s.label}</span>
                  <span className="text-slate-500 tabular-nums">{s.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* position type — wider */}
        <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Position Type</h2>
          <div className="space-y-3">
            {["Onsite", "Hybrid", "Remote"].map((k) => {
              const pct = Math.round((work[k] / reqs.length) * 100);
              return (
                <div key={k} className="flex items-center gap-3 text-[13px]">
                  <div className="w-20 text-slate-600">{k}</div>
                  <div className="flex-1 h-6 rounded bg-[#F1F5F9] overflow-hidden relative">
                    <div className="h-full rounded bg-[#023E8A]" style={{ width: `${(work[k] / workMax) * 100}%` }} />
                  </div>
                  <div className="w-12 text-right font-semibold tabular-nums text-slate-900">{work[k]}</div>
                  <div className="w-12 text-right text-slate-500 tabular-nums">{pct}%</div>
                </div>
              );
            })}
          </div>

          <h3 className="font-semibold text-slate-900 mt-6 mb-3 text-[13px]">New vs Backfill</h3>
          <div className="space-y-3">
            {["New", "Backfill"].map((k) => {
              const pct = Math.round((kind[k] / reqs.length) * 100);
              return (
                <div key={k} className="flex items-center gap-3 text-[13px]">
                  <div className="w-20 text-slate-600">{k}</div>
                  <div className="flex-1 h-6 rounded bg-[#F1F5F9] overflow-hidden">
                    <div className="h-full rounded bg-[#2979D4]" style={{ width: `${(kind[k] / kindMax) * 100}%` }} />
                  </div>
                  <div className="w-12 text-right font-semibold tabular-nums text-slate-900">{kind[k]}</div>
                  <div className="w-12 text-right text-slate-500 tabular-nums">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* req table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Requisition Status</h2>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#fbfbfc] text-[11px] uppercase tracking-wide text-[#8a93a0]">
            <tr>
              <th className="px-5 py-2.5 font-semibold">REQ #</th>
              <th className="px-3 py-2.5 font-semibold">Job Title</th>
              <th className="px-3 py-2.5 font-semibold">Location</th>
              <th className="px-3 py-2.5 font-semibold">Department</th>
              <th className="px-3 py-2.5 font-semibold">Hiring Manager</th>
              <th className="px-3 py-2.5 font-semibold">Recruiter</th>
              <th className="px-3 py-2.5 font-semibold text-right">Days Open</th>
              <th className="px-3 py-2.5 font-semibold pr-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map((r) => (
              <tr key={r.id} className="border-t border-[#f3f4f6]">
                <td className="px-5 py-3 font-medium text-[#023E8A]">{r.id}</td>
                <td className="px-3 py-3 text-slate-800">{r.title}</td>
                <td className="px-3 py-3 text-slate-600">{r.location}</td>
                <td className="px-3 py-3 text-slate-600">{r.dept}</td>
                <td className="px-3 py-3 text-slate-600">{r.hiringManager}</td>
                <td className="px-3 py-3 text-slate-600">{r.recruiter}</td>
                <td className={`px-3 py-3 text-right font-semibold tabular-nums ${daysColor(r.daysOpen)}`}>{r.daysOpen}</td>
                <td className="px-3 py-3 pr-5">
                  <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${STAGE_COLOR[r.stage]}`}>
                    {r.stage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============================== Version 2 =============================== */

function V2({ reqs }) {
  const [recF, setRecF] = useState("all");
  const [stageF, setStageF] = useState("all");

  const recruiters = useMemo(() => {
    const m = {};
    REQS.forEach((r) => { m[r.recruiter] = (m[r.recruiter] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count }));
  }, []);

  const visible = reqs.filter((r) => {
    if (recF !== "all" && r.recruiter !== recF) return false;
    if (stageF !== "all" && r.stage !== stageF) return false;
    return true;
  });

  const headcount = reqs.reduce((s, r) => s + r.headcount, 0);
  const avgDays = Math.round(reqs.reduce((s, r) => s + r.daysOpen, 0) / Math.max(reqs.length, 1));
  const apps = Math.round(TOTAL_APPLICATIONS * (reqs.length / REQS.length));

  return (
    <>
      {/* tinted stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <ColorStat label="Total Open REQs"    value={reqs.length}                  bg="#E8F0FB" fg="#023E8A" />
        <ColorStat label="Total Headcount"    value={headcount}                    bg="#DCFCE7" fg="#16A34A" />
        <ColorStat label="Avg Days Open"      value={avgDays}                      bg="#FEF3C7" fg="#B45309" />
        <ColorStat label="Total Applications" value={apps.toLocaleString("en-US")} bg="#F3E8FF" fg="#7C3AED" />
      </div>

      {/* filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <Select label="Recruiter" value={recF} onChange={setRecF} options={[{ value: "all", label: "All Recruiters" }, ...recruiters.map((r) => ({ value: r.name, label: `${r.name} (${r.count})` }))]} />
        <Select label="Status" value={stageF} onChange={setStageF} options={[{ value: "all", label: "All Statuses" }, ...STAGE_ORDER.map((s) => ({ value: s, label: s }))]} />
      </div>

      {/* req table — clean, single header row */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Requisition Pipeline</h2>
        </div>
        <table className="w-full text-left text-[12px] table-fixed">
          <colgroup>
            <col style={{ width: 70 }} />
            <col style={{ width: 170 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 95 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead className="bg-[#fbfbfc] text-[11px] uppercase tracking-wide text-[#8a93a0]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">REQ #</th>
              <th className="px-2 py-2.5 font-semibold">Job Title</th>
              <th className="px-2 py-2.5 font-semibold">Location</th>
              <th className="px-2 py-2.5 font-semibold">Position</th>
              <th className="px-2 py-2.5 font-semibold">Type</th>
              <th className="px-2 py-2.5 font-semibold">Department</th>
              <th className="px-2 py-2.5 font-semibold">Date Opened</th>
              <th className="px-2 py-2.5 font-semibold">Hiring Manager</th>
              <th className="px-2 py-2.5 font-semibold">Recruiter</th>
              <th className="px-2 py-2.5 font-semibold text-right">Headcount</th>
              <th className="px-2 py-2.5 font-semibold text-right">Days Open</th>
              <th className="px-2 py-2.5 font-semibold pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const title = r.title.replace(/Manager/g, "Mgr");
              return (
                <tr key={r.id} className="border-t border-[#f3f4f6] hover:bg-[#F8FAFC] transition">
                  <td className="px-3 py-2.5 font-medium text-[#023E8A] whitespace-nowrap">{r.id}</td>
                  <td className="px-2 py-2.5 text-slate-800 truncate" title={r.title}>{title}</td>
                  <td className="px-2 py-2.5 text-slate-600 truncate" title={r.location}>{r.location}</td>
                  <td className="px-2 py-2.5 text-slate-600">{r.work}</td>
                  <td className="px-2 py-2.5 whitespace-nowrap"><TypeChips kind={r.kind} /></td>
                  <td className="px-2 py-2.5 text-slate-600 truncate" title={r.dept}>{r.dept}</td>
                  <td className="px-2 py-2.5 text-slate-600 truncate" title={r.dateOpened || ""}>
                    {r.dateOpened || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-2 py-2.5 text-slate-600 truncate" title={r.hiringManager}>{r.hiringManager}</td>
                  <td className="px-2 py-2.5 text-slate-600 truncate" title={r.recruiter}>{r.recruiter}</td>
                  <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-slate-900">{r.headcount}</td>
                  <td className={`px-2 py-2.5 text-right font-semibold tabular-nums ${daysColor(r.daysOpen)}`}>{r.daysOpen}</td>
                  <td className="px-2 py-2.5 pr-3">
                    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full border whitespace-nowrap ${STAGE_COLOR[r.stage]}`}>
                      {r.stage}
                    </span>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={12} className="px-5 py-10 text-center text-slate-400 text-[13px]">
                  No requisitions match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* recruiter summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Recruiter Workload</h2>
        <div className="grid grid-cols-3 gap-3">
          {recruiters.map((r) => (
            <div key={r.name} className="rounded-lg border border-slate-100 bg-[#F8FAFC] p-3">
              <div className="text-[12px] text-slate-500">{r.name}</div>
              <div className="text-[20px] font-bold text-[#023E8A] tabular-nums">{r.count}</div>
              <div className="text-[11px] text-slate-400">req{r.count === 1 ? "" : "s"}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ColorStat({ label, value, bg, fg = "#1a1a1a" }) {
  return (
    <div className="rounded-xl p-5" style={{ background: bg, color: fg }}>
      <div className="text-[12px] opacity-80">{label}</div>
      <div className="text-[28px] font-bold mt-1 tabular-nums leading-none">{value}</div>
    </div>
  );
}

function TypeChips({ kind }) {
  const newChip  = <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">New</span>;
  const bfChip   = <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626]">Backfill</span>;
  if (kind === "New") return newChip;
  if (kind === "Backfill") return bfChip;
  // "New/Backfill" → both with + separator
  return (
    <span className="inline-flex items-center gap-1">
      {newChip}
      <span className="text-slate-400">+</span>
      {bfChip}
    </span>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-slate-600">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 px-2.5 border border-[#E2E8F0] rounded-md text-[13px] bg-white focus:outline-none focus:border-sgi-400"
      >
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </label>
  );
}

/* ============================== Version 3 =============================== */

function V3({ reqs }) {
  const avgDays = Math.round(reqs.reduce((s, r) => s + r.daysOpen, 0) / Math.max(reqs.length, 1));
  const backfill = reqs.filter((r) => r.kind === "Backfill").length;
  const remote = reqs.filter((r) => r.work === "Remote").length;
  const hybrid = reqs.filter((r) => r.work === "Hybrid").length;
  const pct = (n) => Math.round((n / Math.max(reqs.length, 1)) * 100);

  // department breakdown
  const dept = {};
  reqs.forEach((r) => { dept[r.dept] = (dept[r.dept] || 0) + 1; });
  const DEPT_COLORS = { Operations: "#023E8A", DSD: "#F59E0B", "Key Partner": "#7C3AED", "Sales & Training NVR": "#10B981" };
  const deptData = Object.entries(dept).map(([label, count]) => ({
    label,
    pct: (count / reqs.length) * 100,
    color: DEPT_COLORS[label] || "#94A3B8",
    count,
  }));

  const maxDays = Math.max(...reqs.map((r) => r.daysOpen), 1);

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Avg Days Open" value={avgDays} />
        <StatCard label="Backfill Rate" value={`${pct(backfill)}%`} />
        <StatCard label="Remote Positions" value={`${pct(remote)}%`} />
        <StatCard label="Hybrid Positions" value={`${pct(hybrid)}%`} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* sourcing donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Candidate Sourcing</h2>
          <p className="text-[12px] text-slate-500 mb-3">{TOTAL_APPLICATIONS.toLocaleString("en-US")} applications</p>
          <div className="flex flex-col items-center">
            <Donut data={SOURCING} size={160} thickness={22} total={TOTAL_APPLICATIONS} />
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 w-full">
              {SOURCING.map((s) => (
                <li key={s.label} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1 text-slate-700 truncate">{s.label}</span>
                  <span className="text-slate-500 tabular-nums">{s.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* days open bars */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Days Open per REQ</h2>
          <p className="text-[12px] text-slate-500 mb-4">Color-coded by age threshold</p>
          <div className="space-y-2.5">
            {reqs.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 text-[12px] cursor-default"
                title={`${r.id} — ${r.title}`}
              >
                <div className="w-16 shrink-0 text-slate-600 tabular-nums">{r.id.replace("REQ-", "")}</div>
                <div className="flex-1 h-5 rounded bg-[#F1F5F9] overflow-hidden">
                  <div
                    className={`h-full rounded ${r.daysOpen < 30 ? "bg-emerald-400" : r.daysOpen <= 60 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${(r.daysOpen / maxDays) * 100}%` }}
                  />
                </div>
                <div className={`w-9 text-right font-semibold tabular-nums ${daysColor(r.daysOpen)}`}>{r.daysOpen}</div>
              </div>
            ))}
          </div>
        </div>

        {/* department pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Department Breakdown</h2>
          <p className="text-[12px] text-slate-500 mb-3">{reqs.length} requisitions</p>
          <div className="flex flex-col items-center">
            <Donut data={deptData} size={160} thickness={42} />
            <ul className="space-y-1.5 mt-4 w-full">
              {deptData.map((d) => (
                <li key={d.label} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 text-slate-700 truncate">{d.label}</span>
                  <span className="text-slate-500 tabular-nums">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* position type matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Position Type Matrix</h2>
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#fbfbfc] text-[11px] uppercase tracking-wide text-[#8a93a0]">
            <tr>
              <th className="px-5 py-2.5 font-semibold">REQ #</th>
              <th className="px-3 py-2.5 font-semibold">Title</th>
              <th className="px-3 py-2.5 font-semibold text-center">Headcount</th>
              <th className="px-3 py-2.5 font-semibold text-center">Onsite</th>
              <th className="px-3 py-2.5 font-semibold text-center">Hybrid</th>
              <th className="px-3 py-2.5 font-semibold text-center">Remote</th>
              <th className="px-3 py-2.5 font-semibold text-center">New</th>
              <th className="px-3 py-2.5 font-semibold text-center">Backfill</th>
              <th className="px-3 py-2.5 font-semibold text-center pr-5">Agency</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map((r) => {
              const isNew = r.kind === "New" || r.kind === "New/Backfill";
              const isBackfill = r.kind === "Backfill" || r.kind === "New/Backfill";
              return (
                <tr key={r.id} className="border-t border-[#f3f4f6]">
                  <td className="px-5 py-2.5 font-medium text-[#023E8A]">{r.id}</td>
                  <td className="px-3 py-2.5 text-slate-700">{r.title}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-bold tabular-nums ${r.headcount > 1 ? "text-[16px] text-[#023E8A]" : "text-slate-900"}`}>
                      {r.headcount}
                    </span>
                  </td>
                  <Cell on={r.work === "Onsite"} />
                  <Cell on={r.work === "Hybrid"} />
                  <Cell on={r.work === "Remote"} />
                  <Cell on={isNew} />
                  <Cell on={isBackfill} />
                  <td className="px-3 py-2.5 text-center pr-5">
                    {r.agency ? (
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E8F0FB] text-[#023E8A]">Yes</span>
                    ) : (
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-slate-500">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Cell({ on }) {
  return (
    <td className="px-3 py-2.5 text-center">
      {on ? (
        <span className="inline-block w-4 h-4 rounded-full bg-[#023E8A]" />
      ) : (
        <span className="inline-block w-4 h-4 rounded-full bg-[#F1F5F9] border border-slate-200" />
      )}
    </td>
  );
}

/* ------------------------------ shared bits ------------------------------ */

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-[12px] text-slate-500">{label}</div>
      <div className="text-[26px] font-bold text-slate-900 mt-1 tabular-nums">{value}</div>
    </div>
  );
}
