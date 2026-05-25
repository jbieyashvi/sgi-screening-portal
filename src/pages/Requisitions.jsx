import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, MinusCircle, RefreshCw } from "lucide-react";
import { useApp } from "../store";

function StatusBadge({ status }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}

function SyncBadge({ status }) {
  const config = {
    Synced: { icon: CheckCircle2, cls: "text-emerald-600" },
    Pending: { icon: Clock, cls: "text-amber-600" },
    "Not Synced": { icon: MinusCircle, cls: "text-slate-400" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.cls}`}>
      <Icon size={13} /> {status}
    </span>
  );
}

export default function Requisitions() {
  const { requisitions, setActiveReq, showToast } = useApp();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Requisitions</h1>
          <p className="text-slate-500 text-sm mt-1">
            All open job requisitions synced from ADP Workforce.
          </p>
        </div>
        <button
          onClick={() => showToast("ADP sync complete — 6 reqs updated")}
          className="h-8 px-3.5 inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-md text-[13px] font-medium text-[#4A5568] hover:bg-[#F7FAFC]"
        >
          <RefreshCw size={14} /> Sync ADP now
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Req ID</th>
              <th className="text-left py-3 font-medium">Job Title</th>
              <th className="text-left py-3 font-medium">Location</th>
              <th className="text-left py-3 font-medium">Applicants</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-left py-3 font-medium pr-5">ADP Sync</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map((r) => (
              <tr
                key={r.id}
                onClick={() => {
                  setActiveReq(r.id);
                  navigate("/screening");
                }}
                className="border-t border-slate-100 cursor-pointer hover:bg-sgi-50/40"
              >
                <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{r.id}</td>
                <td className="py-3.5">
                  <div className="font-medium text-slate-900">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.department}</div>
                </td>
                <td className="py-3.5 text-slate-600">{r.location}</td>
                <td className="py-3.5">
                  <div className="font-medium text-slate-900">{r.applicants}</div>
                </td>
                <td className="py-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-3.5 pr-5">
                  <div>
                    <SyncBadge status={r.adpSync} />
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {r.lastSync}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
