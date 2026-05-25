import { useMemo, useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Check,
  X,
  SlidersHorizontal,
  Info,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  Settings,
} from "lucide-react";
import { useApp } from "../store";

const FILTERS = [
  { key: "ga", label: "Georgia only" },
  { key: "nosp", label: "No sponsorship" },
  { key: "hybrid", label: "Hybrid OK" },
  { key: "sql", label: "SQL required" },
];

const STATUS_TABS = ["All", "To Review", "Screening", "Declined", "Knocked Out"];
const TAB_LABEL = {
  All: "All",
  "To Review": "Review",
  Screening: "Screen",
  Declined: "Declined",
  "Knocked Out": "Knockout",
};

const STATUS_DOT = {
  "To Review": "bg-amber-500",
  Screening: "bg-sgi",
  Declined: "bg-red-500",
  "Knocked Out": "bg-[#bbb]",
};

const STATUS_TEXT = {
  "To Review": "text-amber-700",
  Screening: "text-sgi",
  Declined: "text-red-600",
  "Knocked Out": "text-[#888]",
};

export default function Screening() {
  const { candidates, activeReq, advanceCandidate, declineCandidate } = useApp();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("summary");
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [bulkDecline, setBulkDecline] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
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
    <div className="flex h-[calc(100vh-48px)] bg-white">
      {/* Left panel */}
      <div className="w-[380px] shrink-0 border-r border-[#f0f0f0] flex flex-col">
        {/* Search + filters */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0 group">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sgi-100 via-sgi-50 to-sgi-100 opacity-60 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex items-center bg-[#f8faff] border border-sgi-100 rounded-lg pl-2.5 pr-1.5 py-1.5 transition focus-within:border-sgi-400 focus-within:shadow-[0_0_0_3px_rgba(24,95,165,0.12)]">
                <Sparkles size={13} className="text-sgi shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: Top 5 in Atlanta with 5+ years analytics"
                  className="flex-1 min-w-0 bg-transparent border-0 pl-2 pr-1 py-0 text-[13px] text-[#1a1a1a] placeholder:italic placeholder:text-sgi-300 focus:outline-none"
                />
                <span className="shrink-0 text-[9px] font-bold tracking-wide bg-sgi text-white px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                title="Filters"
                aria-label="Filters"
                className={`relative flex items-center p-2 rounded transition ${
                  filterOpen || activeFilterCount > 0
                    ? "text-sgi bg-sgi-50"
                    : "text-[#888] hover:text-[#1a1a1a] hover:bg-[#fafafa]"
                }`}
              >
                <SlidersHorizontal size={14} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 grid place-items-center text-[9px] font-bold text-white bg-sgi rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white border border-[#ececec] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-1.5">
                  {FILTERS.map((f) => {
                    const on = !!filters[f.key];
                    return (
                      <label
                        key={f.key}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#fafafa] cursor-pointer text-[12px] text-[#1a1a1a]"
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setFilters((s) => ({ ...s, [f.key]: !s[f.key] }))
                          }
                          className="w-3.5 h-3.5 accent-[#1a1a1a]"
                        />
                        {f.label}
                      </label>
                    );
                  })}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => setFilters({})}
                      className="w-full text-left px-2 py-1.5 mt-1 border-t border-[#f0f0f0] text-[11px] text-[#888] hover:text-[#1a1a1a]"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="border-b border-[#f0f0f0] flex gap-1">
          {STATUS_TABS.map((t) => {
            const on = statusFilter === t;
            return (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                style={{ letterSpacing: "0.03em" }}
                className={`flex-1 basis-0 min-w-0 text-[11px] uppercase font-semibold text-center px-2 py-2 border-b-2 -mb-px transition whitespace-nowrap ${
                  on
                    ? "border-sgi text-[#1a1a1a]"
                    : "border-transparent text-[#888] hover:text-[#1a1a1a]"
                }`}
                title={t}
              >
                {TAB_LABEL[t]}
              </button>
            );
          })}
        </div>

        {/* Select All header */}
        <SelectAllHeader
          ids={sorted.map((c) => c.id)}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-2 h-9 px-3 bg-[#F8F9FA] border-b border-[#E2E8F0] whitespace-nowrap">
            <span className="text-[12px] text-[#6B7280] shrink-0">
              — {selectedIds.size} of {sorted.length} selected
            </span>
            <div className="flex items-center gap-2 shrink-0 text-[12px]">
              <button
                onClick={() => setBulkDecline(true)}
                className="text-[#DC2626] hover:underline"
              >
                Decline
              </button>
              <span className="text-[#E2E8F0]">|</span>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => advanceCandidate(id));
                  setSelectedIds(new Set());
                }}
                className="text-[#185FA5] hover:underline"
              >
                Advance
              </button>
              <span className="text-[#E2E8F0]">|</span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[#6B7280] hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Candidate list */}
        <div className="flex-1 overflow-auto">
          {sorted.map((c) => {
            const ko = c.status === "Knocked Out";
            const isSel = selected?.id === c.id;
            const checked = selectedIds.has(c.id);
            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setTab("summary");
                  setConfirmDecline(false);
                }}
                className={`group w-full text-left pl-2.5 pr-3 py-1.5 border-b border-[#f5f5f5] flex items-center gap-2.5 transition relative cursor-pointer ${
                  isSel ? "bg-[#f8faff]" : "hover:bg-[#fafafa]"
                }`}
              >
                {isSel && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-sgi" />
                )}
                <input
                  type="checkbox"
                  checked={checked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    });
                  }}
                  className="minicheck"
                  aria-label={`Select ${c.name}`}
                />
                <div
                  className={`shrink-0 w-8 text-[11px] font-semibold text-right tabular-nums ${
                    ko
                      ? "text-[#bbb]"
                      : c.match >= 90
                      ? "text-emerald-600"
                      : c.match >= 80
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  {ko ? "—" : `${c.match}%`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-medium text-[13px] text-[#1a1a1a] truncate">
                      {c.name}
                    </span>
                    {statusFilter === "All" && <DotBadge status={c.status} />}
                  </div>
                  <div className="text-[11px] text-[#888] truncate leading-tight mt-0.5">
                    {c.title} <span className="text-[#bbb]">· {c.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="p-10 text-center text-[12px] text-[#888]">
              No candidates match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto bg-white">
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
          <div className="h-full grid place-items-center text-[#888] text-[13px]">
            Select a candidate
          </div>
        )}
      </div>

      {bulkDecline && (
        <DeclineModal
          count={selectedIds.size}
          onCancel={() => setBulkDecline(false)}
          onConfirm={() => {
            selectedIds.forEach((id) => declineCandidate(id));
            setSelectedIds(new Set());
            setBulkDecline(false);
          }}
        />
      )}
    </div>
  );
}

function Detail({ c, tab, setTab, onAdvance, confirmDecline, setConfirmDecline, onDecline }) {
  const ko = c.status === "Knocked Out";

  const TABS = [
    { id: "summary", label: "AI Summary" },
    { id: "resume", label: "Resume" },
    { id: "screening", label: "Screening Qs" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="px-8 pt-6 pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-4">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-[#1a1a1a] leading-tight">
            {c.name}
          </h1>
          <div className="flex items-center gap-3 mt-3 text-[12px] text-[#888]">
            <DotBadge status={c.status} />
            {!ko && (
              <span
                className={`font-medium ${
                  c.match >= 90
                    ? "text-emerald-600"
                    : c.match >= 80
                    ? "text-amber-600"
                    : "text-red-500"
                }`}
              >
                {c.match}% match
              </span>
            )}
            <span>{c.title}</span>
            <span className="text-[#bbb]">·</span>
            <span>{c.location}</span>
            <span className="text-[#bbb]">·</span>
            <span>Applied {c.applied}</span>
          </div>
        </div>

        {c.status === "To Review" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirmDecline(true)}
              className="h-8 px-3.5 inline-flex items-center bg-white border border-[#E2E8F0] text-[#4A5568] rounded-md text-[13px] font-medium hover:bg-[#F7FAFC]"
            >
              Decline
            </button>
            <button
              onClick={onAdvance}
              className="h-8 px-3.5 inline-flex items-center bg-[#185FA5] text-white rounded-md text-[13px] font-medium hover:bg-[#134C84]"
            >
              Advance to Screening
            </button>
          </div>
        )}
      </div>

      {confirmDecline && (
        <DeclineModal
          onCancel={() => setConfirmDecline(false)}
          onConfirm={onDecline}
        />
      )}

      {ko && c.knockoutReason && (
        <div className="mb-8 text-[12px] text-[#888]">
          <span className="font-semibold text-[#1a1a1a]">Knockout reason:</span>{" "}
          {c.knockoutReason}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#f0f0f0] mt-4 mb-4 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-[10px] uppercase tracking-wider font-medium px-3 py-2 border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-sgi text-[#1a1a1a]"
                : "border-transparent text-[#888] hover:text-[#1a1a1a]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="space-y-6">
          {/* AI Summary */}
          <section>
            <SectionTitle icon={<Sparkles size={11} />} label="AI Summary" />
            <div className="mt-3 bg-[#fafafa] border-l-2 border-l-sgi rounded-r-md py-4 pl-5 pr-5">
              <p className="text-[14px] text-[#333] leading-relaxed">
                {c.aiSummary}
              </p>
            </div>
          </section>

          {/* Screening Criteria */}
          <section>
            <SectionTitle label="Screening Criteria" />
            <ul className="mt-3 grid grid-cols-2 gap-x-10 gap-y-2.5">
              {Object.entries(c.checks).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2.5 text-[13px]">
                  {v ? (
                    <Check size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <X size={13} className="text-[#bbb] shrink-0" />
                  )}
                  <span className={v ? "text-[#333]" : "text-[#aaa] line-through"}>
                    {k}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Work Experience */}
          <section>
            <SectionTitle label="Work Experience" />
            <ol className="mt-3 relative ml-1.5 space-y-4 before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-[#ececec]">
              {c.experience.map((e, i) => (
                <li key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                  <div className="font-medium text-[13px] text-[#1a1a1a]">
                    {e.role}
                  </div>
                  <div className="text-[11px] text-[#888] mt-0.5">
                    {e.company} · {e.years}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {tab === "resume" && (
        <section className="text-[13px] text-[#333] leading-relaxed">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-1">
            {c.name}
          </h2>
          <div className="text-[#888] mb-6">
            {c.location} · {c.title} · {c.years} years experience
          </div>
          <SectionTitle label="Experience" />
          <div className="space-y-3 mt-3 mb-6">
            {c.experience.map((e, i) => (
              <div key={i}>
                <div className="font-medium text-[#1a1a1a]">
                  {e.role} — {e.company}
                </div>
                <div className="text-[11px] text-[#888]">{e.years}</div>
              </div>
            ))}
          </div>
          <SectionTitle label="Skills" />
          <p className="text-[#444] mt-3">
            SQL ({c.sql}), Python, Tableau, Looker, Snowflake, dbt, Excel modeling, A/B testing.
          </p>
        </section>
      )}

      {tab === "screening" && (
        <section className="space-y-5">
          {c.screening.map((s, i) => (
            <div key={i}>
              <div className="text-[10px] uppercase tracking-wider text-[#999] mb-1">
                Q{i + 1}
              </div>
              <div className="text-[13px] font-medium text-[#1a1a1a]">{s.q}</div>
              <div className="text-[13px] text-[#666] mt-0.5">{s.a}</div>
            </div>
          ))}
        </section>
      )}

      {tab === "activity" && (
        <ol className="relative ml-1.5 space-y-4 before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-[#ececec]">
          {c.activity.map((a, i) => (
            <li key={i} className="relative pl-5">
              <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#bbb]" />
              <div className="text-[13px] text-[#1a1a1a]">{a.text}</div>
              <div className="text-[11px] text-[#888] mt-0.5">{a.date}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#999] font-medium">
      {icon}
      {label}
    </div>
  );
}

const ACTION_OPTIONS = [
  { id: "reject", label: "Reject", status: "Rejected" },
  { id: "mark", label: "Mark for Rejection", status: "Marked for Rejection" },
  { id: "keep", label: "Keep On File", status: "Kept on File" },
];

const DISPOSITION_CODES = [
  "Not Qualified",
  "Position Filled",
  "Overqualified",
  "Location Mismatch",
  "Sponsorship Required",
];

function DeclineModal({ onCancel, onConfirm, count = 1 }) {
  const [action, setAction] = useState("reject");
  const [disposition, setDisposition] = useState("Not Qualified");
  const [dispoOpen, setDispoOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const dispoRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  useEffect(() => {
    if (!dispoOpen) return;
    const onClick = (e) => {
      if (dispoRef.current && !dispoRef.current.contains(e.target)) {
        setDispoOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dispoOpen]);

  const selectedAction = ACTION_OPTIONS.find((a) => a.id === action);

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[540px] max-w-full bg-white rounded-[12px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h3 className="text-[15px] font-semibold text-[#1a1a1a]">
            Decline Application
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-[#888] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Info bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#EAF2FB] border border-[#CFE0F2] rounded-md">
            <Info size={13} className="text-[#185FA5] shrink-0" />
            <span className="text-[12px] text-[#1a1a1a]">
              You've selected {count} application{count === 1 ? "" : "s"}.
            </span>
          </div>

          {/* Select action */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-medium text-[#888] mb-2">
              Select Action
            </div>
            <div className="space-y-1.5">
              {ACTION_OPTIONS.map((opt) => {
                const on = action === opt.id;
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#1a1a1a]"
                  >
                    <input
                      type="radio"
                      name="decline-action"
                      checked={on}
                      onChange={() => setAction(opt.id)}
                      className="w-3.5 h-3.5 accent-[#185FA5]"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-[#185FA5]">
              Application status will be marked as '{selectedAction.status}'.
            </p>
          </div>

          {/* Disposition code */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-[#888] mb-1.5">
              Disposition Code
            </label>
            <div className="relative" ref={dispoRef}>
              <button
                type="button"
                onClick={() => setDispoOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E2E8F0] rounded-md text-[13px] text-[#1a1a1a] hover:border-[#cbd5e0] focus:outline-none focus:border-[#185FA5] focus:shadow-[0_0_0_3px_rgba(24,95,165,0.12)]"
              >
                <span>{disposition}</span>
                <ChevronDown size={14} className="text-[#888]" />
              </button>
              {dispoOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border border-[#ececec] rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1">
                  {DISPOSITION_CODES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setDisposition(code);
                        setDispoOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#f8faff] ${
                        code === disposition ? "text-[#185FA5] font-medium" : "text-[#1a1a1a]"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notification */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-medium text-[#888] mb-1">
                  Template to notify candidate
                </div>
                <div className="text-[13px] text-[#1a1a1a]">-</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider font-medium text-[#888] mb-1">
                  Scheduled to be sent
                </div>
                <div className="text-[13px] text-[#1a1a1a]">
                  After 1 Day(s) (May 26, 2026) at 12 PM (ET)
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12px] text-[#185FA5] hover:underline"
              >
                <Settings size={12} />
                Manage Notification
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-medium text-[#888] mb-1.5">
              Notes
            </div>
            <div className="border border-[#E2E8F0] rounded-md focus-within:border-[#185FA5] focus-within:shadow-[0_0_0_3px_rgba(24,95,165,0.12)]">
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#E2E8F0] bg-[#fafafa]">
                <ToolbarBtn><Bold size={12} /></ToolbarBtn>
                <ToolbarBtn><Italic size={12} /></ToolbarBtn>
                <ToolbarBtn><Underline size={12} /></ToolbarBtn>
                <span className="w-px h-3.5 bg-[#e0e0e0] mx-1" />
                <ToolbarBtn><Type size={12} /></ToolbarBtn>
                <span className="w-px h-3.5 bg-[#e0e0e0] mx-1" />
                <ToolbarBtn><List size={12} /></ToolbarBtn>
                <ToolbarBtn><ListOrdered size={12} /></ToolbarBtn>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 10000))}
                placeholder="Type something..."
                className="w-full min-h-[120px] px-3 py-2 text-[13px] text-[#1a1a1a] placeholder:text-[#aaa] resize-y focus:outline-none rounded-b-md"
              />
              <div className="flex justify-end px-2 pb-1.5 text-[11px] text-[#888]">
                {notes.length}/10000
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa]">
          <button
            onClick={onCancel}
            className="h-9 px-4 inline-flex items-center bg-white border border-[#E2E8F0] text-[#4A5568] rounded-md text-[13px] font-medium hover:bg-[#F7FAFC]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 inline-flex items-center bg-[#185FA5] text-white rounded-md text-[13px] font-medium hover:bg-[#134C84]"
          >
            Decline Applications
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ children }) {
  return (
    <button
      type="button"
      className="p-1 rounded text-[#666] hover:bg-[#ececec] hover:text-[#1a1a1a]"
    >
      {children}
    </button>
  );
}

function SelectAllHeader({ ids, selectedIds, setSelectedIds }) {
  const ref = useRef(null);
  const total = ids.length;
  const selectedInView = ids.filter((id) => selectedIds.has(id)).length;
  const all = total > 0 && selectedInView === total;
  const some = selectedInView > 0 && !all;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some;
  }, [some]);

  const onToggle = () => {
    if (all || some) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1 border-b border-[#f0f0f0] whitespace-nowrap">
      <label className="flex items-center gap-2 cursor-pointer shrink-0">
        <input
          ref={ref}
          type="checkbox"
          checked={all}
          onChange={onToggle}
          className="minicheck"
          aria-label="Select all"
        />
        <span className="text-[12px] text-[#888]">Select All</span>
      </label>
      {selectedInView > 0 && (
        <span className="text-[11px] text-[#888] shrink-0">
          {selectedInView} of {total} selected
        </span>
      )}
    </div>
  );
}

function DotBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px]">
      <span
        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || "bg-[#bbb]"}`}
      />
      <span className={STATUS_TEXT[status] || "text-[#888]"}>
        {status === "Knocked Out" ? "Knocked" : status}
      </span>
    </span>
  );
}
