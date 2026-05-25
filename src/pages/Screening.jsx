import { useMemo, useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Check,
  X,
  MapPin,
  Calendar,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../store";

const FILTERS = [
  { key: "ga", label: "Georgia only" },
  { key: "nosp", label: "No sponsorship" },
  { key: "hybrid", label: "Hybrid OK" },
  { key: "sql", label: "SQL required" },
];

const STATUS_TABS = ["All", "To Review", "Screening", "Declined", "Knocked Out"];

export default function Screening() {
  const { candidates, activeReq, advanceCandidate, declineCandidate } = useApp();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("summary");
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filterOpen]);

  const activeFilterCount = FILTERS.reduce(
    (n, f) => (filters[f.key] ? n + 1 : n),
    0
  );

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

  return (
    <div className="flex h-[calc(100vh-68px)]">
      {/* Left panel */}
      <div className="w-[420px] border-r border-slate-200 bg-white flex flex-col">
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Sparkles
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sgi-500"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try: "Top 5 in Atlanta with 5+ yrs analytics"'
                className="w-full bg-sgi-50/60 border border-sgi-100 rounded-md pl-9 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sgi-500"
              />
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition ${
                  filterOpen || activeFilterCount > 0
                    ? "bg-sgi-50 border-sgi-200 text-sgi-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-[11px] font-semibold bg-sgi text-white rounded-full px-1.5 py-0.5 leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 z-20 w-60 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  {FILTERS.map((f) => {
                    const on = !!filters[f.key];
                    return (
                      <label
                        key={f.key}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setFilters((s) => ({ ...s, [f.key]: !s[f.key] }))
                          }
                          className="w-4 h-4 accent-sgi"
                        />
                        {f.label}
                      </label>
                    );
                  })}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => setFilters({})}
                      className="w-full text-left px-3 py-2 mt-1 border-t border-slate-100 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status tabs — flex flex-1, all equal */}
        <div className="border-b border-slate-200 flex">
          {STATUS_TABS.map((t) => {
            const on = statusFilter === t;
            return (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`flex-1 min-w-0 text-[12px] font-medium text-center px-1 py-2.5 border-b-2 -mb-px transition whitespace-nowrap ${
                  on
                    ? "border-sgi text-sgi"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
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
                className={`w-full text-left px-4 py-2.5 border-b border-slate-100 flex items-center gap-3 hover:bg-slate-50/70 transition relative ${
                  isSel ? "bg-sgi-50/30" : ""
                }`}
              >
                {isSel && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-sgi rounded-r" />
                )}
                <div
                  className={`w-10 h-10 rounded-full grid place-items-center text-[11px] font-semibold shrink-0 ${
                    ko
                      ? "bg-slate-100 text-slate-400"
                      : c.match >= 90
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : c.match >= 80
                      ? "bg-sgi-50 text-sgi-700 ring-1 ring-sgi-100"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                  }`}
                >
                  {ko ? "—" : `${c.match}%`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {c.name}
                    </span>
                    {statusFilter === "All" && <MiniBadge status={c.status} />}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {c.location}
                  </div>
                </div>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 mb-10 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-[28px] font-bold text-slate-900 leading-tight">
              {c.name}
            </h1>
            <StatusPill status={c.status} />
            {!ko && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  c.match >= 90
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-sgi-50 text-sgi-700 border border-sgi-100"
                }`}
              >
                {c.match}% match
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
            <span className="flex items-center gap-2">
              <Briefcase size={14} /> {c.title}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} /> {c.location}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={14} /> Applied {c.applied}
            </span>
          </div>
        </div>

        {c.status === "To Review" && (
          <div className="flex gap-2 shrink-0">
            {confirmDecline ? (
              <div className="flex items-center gap-2 bg-white border border-red-200 rounded-md px-3 py-2">
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
                className="px-4 py-2.5 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Decline
              </button>
            )}
            <button
              onClick={onAdvance}
              className="px-5 py-2.5 bg-sgi text-white rounded-md text-sm font-medium hover:bg-sgi-600"
            >
              Advance to Screening
            </button>
          </div>
        )}
      </div>

      {ko && c.knockoutReason && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <strong>Knockout reason:</strong> {c.knockoutReason}
        </div>
      )}

      {/* Underline tabs */}
      <div className="border-b border-slate-200 mb-8 flex gap-8">
        {[
          { id: "summary", label: "AI Summary" },
          { id: "resume", label: "Resume" },
          { id: "screening", label: "Screening Qs" },
          { id: "activity", label: "Activity" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-4 text-sm font-medium border-b-2 -mb-px transition ${
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
        <div className="space-y-8">
          {/* AI Summary — gray bg, left blue accent */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl border-l-4 border-l-sgi p-7">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-sgi" />
              <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                AI Summary
              </h2>
            </div>
            <p className="text-[15px] text-slate-700 leading-relaxed">{c.aiSummary}</p>
          </section>

          {/* Screening Criteria — minimal */}
          <section className="bg-white border border-slate-200 rounded-xl p-7">
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-5">
              Screening Criteria
            </h2>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              {Object.entries(c.checks).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 text-sm">
                  {v ? (
                    <Check size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <X size={16} className="text-red-400 shrink-0" />
                  )}
                  <span className={v ? "text-slate-700" : "text-slate-400 line-through"}>
                    {k}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Work Experience — clean timeline */}
          <section className="bg-white border border-slate-200 rounded-xl p-7">
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-6">
              Work Experience
            </h2>
            <ol className="relative ml-1.5 space-y-5 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
              {c.experience.map((e, i) => (
                <li key={i} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-sgi" />
                  <div className="font-medium text-slate-900 text-sm">{e.role}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
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
                <div className="font-medium">
                  {e.role} — {e.company}
                </div>
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
          <ol className="relative ml-1.5 space-y-4 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
            {c.activity.map((a, i) => (
              <li key={i} className="relative pl-6">
                <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300" />
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

function MiniBadge({ status }) {
  const map = {
    "To Review": "bg-amber-50 text-amber-700 border-amber-200",
    Screening: "bg-sgi-50 text-sgi-700 border-sgi-200",
    Declined: "bg-red-50 text-red-700 border-red-200",
    "Knocked Out": "bg-slate-100 text-slate-500 border-slate-200",
  };
  const label = status === "Knocked Out" ? "Knocked" : status;
  return (
    <span
      className={`shrink-0 text-[10px] leading-none px-1.5 py-0.5 rounded-full border font-medium whitespace-nowrap ${
        map[status] || "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    "To Review": "bg-amber-50 text-amber-700 border-amber-200",
    Screening: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Declined: "bg-red-50 text-red-700 border-red-200",
    "Knocked Out": "bg-red-50 text-red-700 border-red-200",
  };
  const label = status === "Knocked Out" ? "Knocked out" : status;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
        map[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {label}
    </span>
  );
}
