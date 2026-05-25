import { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  Check,
  X,
  MapPin,
  Calendar,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../store";

const FILTERS = [
  { key: "ga", label: "Georgia only" },
  { key: "nosp", label: "No sponsorship" },
  { key: "hybrid", label: "Hybrid OK" },
  { key: "sql", label: "SQL required" },
];

export default function Screening() {
  const { candidates, activeReq, advanceCandidate, declineCandidate } = useApp();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("summary");
  const [confirmDecline, setConfirmDecline] = useState(false);

  const reqCandidates = useMemo(
    () => candidates.filter((c) => c.reqId === activeReq),
    [candidates, activeReq]
  );

  const filtered = useMemo(() => {
    return reqCandidates.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (filters.ga && !c.location.includes("GA")) return false;
      if (filters.nosp && c.sponsorship) return false;
      if (filters.hybrid && !c.hybridOK) return false;
      if (filters.sql && c.sql !== "Advanced") return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.location.toLowerCase().includes(q) &&
          !c.title.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [reqCandidates, filters, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const base = { All: reqCandidates.length, "To Review": 0, Screening: 0, Declined: 0, "Knocked Out": 0 };
    reqCandidates.forEach((c) => {
      if (base[c.status] !== undefined) base[c.status] += 1;
    });
    return base;
  }, [reqCandidates]);

  const STATUS_TABS = ["All", "To Review", "Screening", "Declined", "Knocked Out"];

  const rank = (s) => {
    if (s === "Screening") return 0;
    if (s === "To Review") return 1;
    if (s === "Declined") return 2;
    if (s === "Knocked Out") return 3;
    return 1;
  };

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const r = rank(a.status) - rank(b.status);
        if (r !== 0) return r;
        return (b.match || 0) - (a.match || 0);
      }),
    [filtered]
  );

  const selected =
    sorted.find((c) => c.id === selectedId) ||
    sorted.find((c) => c.status === "To Review") ||
    sorted[0];

  const stats = {
    total: reqCandidates.length,
    knocked: reqCandidates.filter((c) => c.status === "Knocked Out").length,
    review: reqCandidates.filter((c) => c.status === "To Review").length,
    top: reqCandidates.filter((c) => c.match && c.match >= 85).length,
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left panel */}
      <div className="w-[420px] border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Sparkles
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sgi-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try: "Top 5 in Atlanta with 5+ yrs analytics"'
              className="w-full bg-sgi-50/60 border border-sgi-100 rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sgi-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const on = filters[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setFilters((s) => ({ ...s, [f.key]: !s[f.key] }))}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                    on
                      ? "bg-sgi text-white border-sgi"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { label: "Total", value: stats.total, color: "text-slate-900" },
              { label: "Knocked", value: stats.knocked, color: "text-red-600" },
              { label: "Review", value: stats.review, color: "text-amber-600" },
              { label: "Top", value: stats.top, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-semibold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-100 px-2 pt-1 flex gap-0.5 overflow-x-auto">
          {STATUS_TABS.map((t) => {
            const on = statusFilter === t;
            return (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`px-2.5 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition ${
                  on
                    ? "border-sgi text-sgi"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t} <span className="text-slate-400">[{statusCounts[t]}]</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto">
          {sorted.map((c) => {
            const ko = c.status === "Knocked Out";
            const isSel = selected?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setTab("summary");
                  setConfirmDecline(false);
                }}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 flex items-start gap-3 hover:bg-slate-50 transition ${
                  isSel ? "bg-sgi-50/60 border-l-2 border-l-sgi" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full grid place-items-center text-xs font-semibold shrink-0 ${
                    ko
                      ? "bg-slate-100 text-slate-400"
                      : c.match >= 90
                      ? "bg-emerald-100 text-emerald-700"
                      : c.match >= 80
                      ? "bg-sgi-100 text-sgi-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {ko ? "—" : `${c.match}%`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {c.name}
                    </div>
                    <StatusPill status={c.status} />
                  </div>
                  <div className="text-xs text-slate-500 truncate">{c.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {c.location} · {c.years} yrs
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 mt-3" />
              </button>
            );
          })}
          {sorted.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No candidates match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto bg-[#F7F8FA]">
        {selected ? (
          <Detail
            c={selected}
            tab={tab}
            setTab={setTab}
            onAdvance={() => advanceCandidate(selected.id)}
            confirmDecline={confirmDecline}
            setConfirmDecline={setConfirmDecline}
            onDecline={() => {
              declineCandidate(selected.id);
              setConfirmDecline(false);
            }}
          />
        ) : (
          <div className="h-full grid place-items-center text-slate-400 text-sm">
            Select a candidate
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ c, tab, setTab, onAdvance, confirmDecline, setConfirmDecline, onDecline }) {
  const ko = c.status === "Knocked Out";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-slate-900">{c.name}</h1>
            {ko ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
                Knocked out
              </span>
            ) : (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.match >= 90
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-sgi-50 text-sgi-700 border border-sgi-200"
                }`}
              >
                {c.match}% match
              </span>
            )}
            <StatusPill status={c.status} large />

          </div>
          <div className="text-sm text-slate-500 flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5">
              <Briefcase size={13} /> {c.title}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {c.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> Applied {c.applied}
            </span>
          </div>
        </div>

        {c.status === "To Review" && (
          <div className="flex gap-2">
            {confirmDecline ? (
              <div className="flex items-center gap-2 bg-white border border-red-200 rounded-md px-3 py-1.5">
                <span className="text-xs text-slate-700">Decline {c.name}?</span>
                <button
                  onClick={() => setConfirmDecline(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onDecline}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDecline(true)}
                className="px-3.5 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-white"
              >
                Decline
              </button>
            )}
            <button
              onClick={onAdvance}
              className="px-4 py-2 bg-sgi text-white rounded-md text-sm font-medium hover:bg-sgi-600"
            >
              Advance to Screening
            </button>
          </div>
        )}
      </div>

      {ko && c.knockoutReason && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <strong>Knockout reason:</strong> {c.knockoutReason}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6 flex gap-6">
        {[
          { id: "summary", label: "AI Summary" },
          { id: "resume", label: "Resume" },
          { id: "screening", label: "Screening Qs" },
          { id: "activity", label: "Activity" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-sgi text-sgi"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-sgi-500" />
              <h2 className="font-semibold text-slate-900 text-sm">AI Summary</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{c.aiSummary}</p>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-3">Screening Criteria</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(c.checks).map(([k, v]) => (
                <div
                  key={k}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                    v
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : "bg-red-50 border-red-100 text-red-700"
                  }`}
                >
                  {v ? <Check size={15} /> : <X size={15} />}
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Work Experience</h2>
            <ol className="relative border-l-2 border-slate-100 ml-2 space-y-5">
              {c.experience.map((e, i) => (
                <li key={i} className="ml-5">
                  <div className="absolute -left-[7px] w-3 h-3 rounded-full bg-sgi-500 border-2 border-white" />
                  <div className="font-medium text-slate-900 text-sm">{e.role}</div>
                  <div className="text-xs text-slate-500">
                    {e.company} · {e.years}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {tab === "resume" && (
        <section className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">{c.name}</h2>
          <div className="text-slate-500 mb-5">
            {c.location} · {c.title} · {c.years} years experience
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Experience</h3>
          <div className="space-y-3 mb-5">
            {c.experience.map((e, i) => (
              <div key={i}>
                <div className="font-medium">{e.role} — {e.company}</div>
                <div className="text-xs text-slate-500">{e.years}</div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Skills</h3>
          <p className="text-slate-600">
            SQL ({c.sql}), Python, Tableau, Looker, Snowflake, dbt, Excel modeling, A/B testing.
          </p>
        </section>
      )}

      {tab === "screening" && (
        <section className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {c.screening.map((s, i) => (
            <div key={i} className="px-5 py-4">
              <div className="text-xs text-slate-500 mb-1">Q{i + 1}</div>
              <div className="text-sm font-medium text-slate-900 mb-1">{s.q}</div>
              <div className="text-sm text-slate-600">{s.a}</div>
            </div>
          ))}
        </section>
      )}

      {tab === "activity" && (
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <ol className="relative border-l-2 border-slate-100 ml-2 space-y-4">
            {c.activity.map((a, i) => (
              <li key={i} className="ml-5">
                <div className="absolute -left-[7px] w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                <div className="text-sm text-slate-900">{a.text}</div>
                <div className="text-xs text-slate-500">{a.date}</div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function StatusPill({ status, large = false }) {
  const map = {
    "To Review": "bg-amber-50 text-amber-700 border-amber-200",
    Screening: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Declined: "bg-red-50 text-red-700 border-red-200",
    "Knocked Out": "bg-red-50 text-red-700 border-red-200",
  };
  const label = status === "Knocked Out" ? "Knocked out" : status;
  const size = large ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5";
  return (
    <span
      className={`${size} rounded-full border font-medium shrink-0 ${
        map[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {label}
    </span>
  );
}
