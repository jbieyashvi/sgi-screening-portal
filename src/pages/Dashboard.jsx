import { Link } from "react-router-dom";
import { Upload, RefreshCw, Users, UserX, ListChecks, Sparkles, ArrowDown, ArrowUp } from "lucide-react";
import { useApp } from "../store";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg grid place-items-center ${accent}`}>
          <Icon size={18} />
        </div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

const FUNNEL = [
  { stage: "Applied", count: 1474, pct: null },
  { stage: "Screened", count: 312, pct: "21.2%" },
  { stage: "Interview", count: 48, pct: "15.4%" },
  { stage: "Offer", count: 9, pct: "18.8%" },
  { stage: "Hired", count: 6, pct: "66.7%" },
];

const KNOCKOUTS = [
  { label: "Location mismatch", count: 487 },
  { label: "Salary out of range", count: 312 },
  { label: "Missing experience", count: 198 },
  { label: "Visa sponsorship", count: 89 },
];

const TIME_METRICS = [
  { label: "Screening time", value: "-62%", dir: "down" },
  { label: "Time to hire", value: "-9 days", dir: "down" },
  { label: "Recruiter agreement", value: "92%", dir: "up" },
];

const ACTIVITY = [
  { dot: "bg-emerald-500", text: "Vectorized 42 new resumes", meta: "REQ-2715 · 4 min ago" },
  { dot: "bg-sgi-500", text: "Auto-ranked 1,474 candidates", meta: "REQ-2715 · 18 min ago" },
  { dot: "bg-amber-500", text: "Knocked out 312 applicants", meta: "REQ-2715 · 1 hr ago" },
  { dot: "bg-slate-300", text: "Synced with ADP", meta: "All open reqs · 2 hr ago" },
];

export default function Dashboard() {
  const { showToast } = useApp();
  const funnelMax = FUNNEL[0].count;
  const koMax = KNOCKOUTS[0].count;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back, Candace</h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what's happening across your open requisitions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showToast("ADP sync complete — 4 reqs updated")}
            className="h-8 px-3.5 inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-md text-[13px] font-medium text-[#4A5568] hover:bg-[#F7FAFC]"
          >
            <RefreshCw size={14} /> Sync ADP
          </button>
          <Link
            to="/upload"
            className="h-8 px-3.5 inline-flex items-center gap-2 bg-[#023E8A] text-white rounded-md text-[13px] font-medium hover:bg-[#1A5EBF]"
          >
            <Upload size={14} /> Upload Resumes
          </Link>
        </div>
      </div>

      {/* top row — stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Applicants" value="1,559" accent="bg-sgi-50 text-sgi-700" />
        <StatCard icon={UserX} label="Knocked Out" value="12" accent="bg-red-50 text-red-600" />
        <StatCard icon={ListChecks} label="To Review" value="48" accent="bg-amber-50 text-amber-600" />
        <StatCard icon={Sparkles} label="AI Top Picks" value="22" accent="bg-emerald-50 text-emerald-600" />
      </div>

      {/* second row — funnel + activity */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* funnel (60%) */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Candidate Funnel</h2>
          <p className="text-[12px] text-slate-500 mt-0.5 mb-5">REQ-2715 — Senior Data Analyst · Atlanta</p>
          <div className="space-y-3.5">
            {FUNNEL.map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-[13px] text-slate-600">{f.stage}</div>
                <div className="flex-1 h-6 rounded bg-[#E8F0FB] overflow-hidden">
                  <div
                    className="h-full rounded bg-[#023E8A]"
                    style={{ width: `${Math.max((f.count / funnelMax) * 100, 1.5)}%` }}
                  />
                </div>
                <div className="w-12 shrink-0 text-right text-[11px] text-slate-400 tabular-nums">
                  {f.pct || ""}
                </div>
                <div className="w-12 shrink-0 text-right text-[13px] font-semibold text-slate-900 tabular-nums">
                  {f.count.toLocaleString("en-US")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI activity (40%) */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">AI Activity</h2>
          <ul className="space-y-3 text-sm">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${a.dot}`} />
                <div>
                  <div className="text-slate-900">{a.text}</div>
                  <div className="text-xs text-slate-500">{a.meta}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* third row — knockout reasons + time saved */}
      <div className="grid grid-cols-2 gap-6">
        {/* knockout reasons */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-5">Top Knockout Reasons</h2>
          <div className="space-y-3.5">
            {KNOCKOUTS.map((k) => (
              <div key={k.label} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-[13px] text-slate-600 truncate">{k.label}</div>
                <div className="flex-1 h-5 rounded bg-[#FEF2F2] overflow-hidden">
                  <div className="h-full rounded bg-[#FCA5A5]" style={{ width: `${(k.count / koMax) * 100}%` }} />
                </div>
                <div className="w-10 shrink-0 text-right text-[13px] font-semibold text-slate-900 tabular-nums">
                  {k.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* time saved */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Time Saved vs Manual</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] leading-none font-bold text-[#023E8A]">312</span>
            <span className="text-[20px] font-semibold text-[#023E8A]">hrs</span>
          </div>
          <p className="text-[13px] text-slate-500 mt-1">saved vs manual baseline this quarter</p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {TIME_METRICS.map((m) => (
              <div key={m.label} className="rounded-lg bg-[#F8FAFC] border border-slate-100 p-3">
                <div className="flex items-center gap-1 text-emerald-600">
                  {m.dir === "down" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                  <span className="text-[15px] font-bold tabular-nums">{m.value}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-tight">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
