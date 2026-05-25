import { Link } from "react-router-dom";
import { Upload, RefreshCw, Users, UserX, ListChecks, Sparkles } from "lucide-react";
import { useApp } from "../store";

function StatusBadge({ status }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

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

export default function Dashboard() {
  const { candidates, requisitions, showToast } = useApp();
  const knockedOut = candidates.filter((c) => c.status === "Knocked Out").length;
  const toReview = candidates.filter((c) => c.status === "To Review").length;
  const topPicks = candidates.filter((c) => c.match && c.match >= 85).length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
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
            className="h-8 px-3.5 inline-flex items-center gap-2 bg-[#185FA5] text-white rounded-md text-[13px] font-medium hover:bg-[#134C84]"
          >
            <Upload size={14} /> Upload Resumes
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Applicants"
          value={candidates.length + 1467}
          accent="bg-sgi-50 text-sgi-700"
        />
        <StatCard
          icon={UserX}
          label="Knocked Out"
          value={knockedOut}
          accent="bg-red-50 text-red-600"
        />
        <StatCard
          icon={ListChecks}
          label="To Review"
          value={toReview}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Sparkles}
          label="AI Top Picks"
          value={topPicks}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Requisitions</h2>
            <Link to="/requisitions" className="text-xs font-medium text-sgi hover:underline">
              View all →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-medium">Req ID</th>
                <th className="text-left py-3 font-medium">Job Title</th>
                <th className="text-left py-3 font-medium">Location</th>
                <th className="text-left py-3 font-medium">Applicants</th>
                <th className="text-left py-3 font-medium pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.slice(0, 6).map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.id}</td>
                  <td className="py-3 font-medium text-slate-900">{r.title}</td>
                  <td className="py-3 text-slate-600">{r.location}</td>
                  <td className="py-3 text-slate-700">{r.applicants}</td>
                  <td className="py-3 pr-5">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">AI Activity</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
              <div>
                <div className="text-slate-900">Vectorized 42 new resumes</div>
                <div className="text-xs text-slate-500">REQ-2715 · 4 min ago</div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-sgi-500 mt-2" />
              <div>
                <div className="text-slate-900">Auto-ranked 1,474 candidates</div>
                <div className="text-xs text-slate-500">REQ-2715 · 18 min ago</div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
              <div>
                <div className="text-slate-900">Knocked out 312 applicants (location)</div>
                <div className="text-xs text-slate-500">REQ-2715 · 1 hr ago</div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-300 mt-2" />
              <div>
                <div className="text-slate-900">Synced with ADP</div>
                <div className="text-xs text-slate-500">All open reqs · 2 hr ago</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
