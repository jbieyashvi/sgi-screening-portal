import { useMemo, useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Zap,
  Download,
  Mail,
  Phone,
  MapPin,
  Columns3,
  Eye,
  Info,
} from "lucide-react";
import { useApp } from "../store";

/* ----------------------------- status mapping ---------------------------- */

const STAGE = {
  "To Review": {
    label: "To Review",
    cls: "bg-[#F5F0E8] text-[#92400E]",
  },
  Screening: {
    label: "Screening",
    cls: "bg-sgi-50 text-sgi",
  },
  Interview: {
    label: "Interview",
    cls: "bg-indigo-50 text-indigo-700",
  },
  Offer: {
    label: "Offer",
    cls: "bg-[#DCFCE7] text-[#16A34A]",
  },
  Declined: {
    label: "Declined",
    cls: "bg-[#FEE2E2] text-[#DC2626]",
  },
  "Knocked Out": {
    label: "Knocked Out",
    cls: "bg-[#F1F5F9] text-[#475569]",
  },
};

// Advance button labels by current stage
const ADVANCE_TABLE = { "To Review": "To Screen", Screening: "To Interview", Interview: "Send Offer" };
const ADVANCE_DRAWER = { "To Review": "Advance to Screening", Screening: "Advance to Interview", Interview: "Send Offer" };

const SOURCE_CLS = {
  Indeed: "bg-[#E8F0FB] text-sgi-700 border-sgi-100",
  LinkedIn: "bg-[#eaf1fb] text-[#0a66c2] border-[#cfe0f5]",
  ZipRecruiter: "bg-[#f0f7ec] text-green-700 border-green-200",
};

const SOURCE_FILTER_OPTS = ["Indeed", "LinkedIn", "ZipRecruiter"].map((s) => ({
  value: s,
  label: s,
  cls: SOURCE_CLS[s],
}));

// stage filter options map back to candidate.status values
const STAGE_FILTER_OPTS = [
  { value: "To Review", label: "To Review", cls: STAGE["To Review"].cls },
  { value: "Screening", label: "Screening", cls: STAGE["Screening"].cls },
  { value: "Interview", label: "Interview", cls: STAGE["Interview"].cls },
  { value: "Offer", label: "Offer", cls: STAGE["Offer"].cls },
  { value: "Declined", label: "Declined", cls: STAGE["Declined"].cls },
  { value: "Knocked Out", label: "Knocked Out", cls: STAGE["Knocked Out"].cls },
];

// range bucketing for Match / Salary column filters
const matchBucket = (m) => {
  if (m == null) return null;
  if (m >= 90) return "90+";
  if (m >= 75) return "75-89";
  if (m >= 60) return "60-74";
  return "<60";
};

const salaryBucket = (s) => {
  const n = Number(String(s).replace(/[^0-9]/g, ""));
  if (!n) return null;
  if (n < 50000) return "<50";
  if (n < 75000) return "50-75";
  if (n < 100000) return "75-100";
  if (n <= 150000) return "100-150";
  return "150+";
};

const MATCH_FILTER_OPTS = [
  { value: "90+", label: "90% and above", badge: "90%+", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "75-89", label: "75% - 89%", badge: "75-89%", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "60-74", label: "60% - 74%", badge: "60-74%", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "<60", label: "Below 60%", badge: "<60%", cls: "bg-red-50 text-red-700 border-red-200" },
];

const SALARY_FILTER_OPTS = [
  { value: "<50", label: "Below $50,000" },
  { value: "50-75", label: "$50,000 - $75,000" },
  { value: "75-100", label: "$75,000 - $100,000" },
  { value: "100-150", label: "$100,000 - $150,000" },
  { value: "150+", label: "Above $150,000" },
];

const matchBadge = (m) => {
  if (m == null) return { text: "—", cls: "bg-[#F1F5F9] text-[#94A3B8]" };
  if (m >= 85) return { text: `${m}%`, cls: "bg-[#DCFCE7] text-[#16A34A]" };
  if (m >= 70) return { text: `${m}%`, cls: "bg-[#FEF3C7] text-[#B45309]" };
  return { text: `${m}%`, cls: "bg-[#FEE2E2] text-[#DC2626]" };
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ------------------------------- columns ---------------------------------- */

// toggleable data columns (between locked Name and locked Actions), in render order
const COLUMNS = [
  { key: "requisition", label: "Requisition" },
  { key: "contact", label: "Contact" },
  { key: "source", label: "Applied Via" },
  { key: "location", label: "Location" },
  { key: "applied", label: "Applied Date" },
  { key: "salary", label: "Desired Salary" },
  { key: "match", label: "Match Score" },
  { key: "stage", label: "Stage" },
  { key: "hiringManager", label: "Hiring Manager" },
  { key: "recruiter", label: "Recruiter" },
];

// hidden by default
const DEFAULT_HIDDEN = ["requisition", "hiringManager", "recruiter"];

// Columns dropdown order (Name + Actions are locked, always visible)
const COLUMN_TOGGLES = [
  { key: "name", label: "Name", locked: true },
  { key: "contact", label: "Contact" },
  { key: "source", label: "Applied Via" },
  { key: "location", label: "Location" },
  { key: "applied", label: "Applied Date" },
  { key: "salary", label: "Desired Salary" },
  { key: "match", label: "Match Score" },
  { key: "stage", label: "Stage" },
  { key: "actions", label: "Actions", locked: true },
  { key: "hiringManager", label: "Hiring Manager" },
  { key: "recruiter", label: "Recruiter" },
  { key: "requisition", label: "Requisition" },
];

const STAT_CARDS = [
  { key: "all", label: "Total", color: "text-[#1a1a1a]" },
  { key: "To Review", label: "To Review", color: "text-amber-600" },
  { key: "Screening", label: "Screening", color: "text-sgi" },
  { key: "Interview", label: "Interview", color: "text-indigo-600" },
  { key: "Declined", label: "Declined", color: "text-red-600" },
  { key: "Knocked Out", label: "Knocked Out", color: "text-[#888]" },
];

/* ================================ page =================================== */

export default function Screening() {
  const { candidates, requisitions, advanceCandidate, setCandidateStage, restoreCandidate, declineCandidate, showToast } =
    useApp();

  const [reqFilter, setReqFilter] = useState("REQ-2715");
  const [query, setQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDecline, setBulkDecline] = useState(false);
  const [bulkAdvOpen, setBulkAdvOpen] = useState(false);
  const [declineTarget, setDeclineTarget] = useState(null);
  const bulkAdvRef = useRef(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [drawerWidth, setDrawerWidth] = useState(420); // resizable inline drawer
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const w = Math.min(600, Math.max(320, window.innerWidth - e.clientX));
      setDrawerWidth(w);
    };
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging]);

  // column filters (applied sets)
  const [srcF, setSrcF] = useState(() => new Set());
  const [locF, setLocF] = useState(() => new Set());
  const [stageF, setStageF] = useState(() => new Set(["To Review"]));
  const [matchF, setMatchF] = useState(() => new Set());
  const [salaryF, setSalaryF] = useState(() => new Set());
  const [openFilter, setOpenFilter] = useState(null); // "source" | "location" | "stage" | "match" | "salary" | null

  const [hiddenCols, setHiddenCols] = useState(() => new Set(DEFAULT_HIDDEN));
  const [colsOpen, setColsOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [rpp, setRpp] = useState(10);
  const [rppOpen, setRppOpen] = useState(false);
  const [page, setPage] = useState(1);

  const colsRef = useRef(null);
  const reqRef = useRef(null);
  const rppRef = useRef(null);

  useOutside(colsRef, colsOpen, () => setColsOpen(false));
  useOutside(reqRef, reqOpen, () => setReqOpen(false));
  useOutside(rppRef, rppOpen, () => setRppOpen(false));
  useOutside(bulkAdvRef, bulkAdvOpen, () => setBulkAdvOpen(false));

  const isColVisible = (key) => !hiddenCols.has(key);

  /* ----------------------------- filtering ------------------------------- */

  const reqCandidates = useMemo(
    () => (reqFilter === "all" ? candidates : candidates.filter((c) => c.reqId === reqFilter)),
    [candidates, reqFilter]
  );

  const counts = useMemo(() => {
    const c = { all: reqCandidates.length, "To Review": 0, Screening: 0, Interview: 0, Offer: 0, Declined: 0, "Knocked Out": 0 };
    reqCandidates.forEach((x) => {
      if (c[x.status] != null) c[x.status] += 1;
    });
    return c;
  }, [reqCandidates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reqCandidates.filter((c) => {
      if (srcF.size && !srcF.has(c.appliedVia)) return false;
      if (locF.size && !locF.has(c.location)) return false;
      if (stageF.size && !stageF.has(c.status)) return false;
      if (matchF.size && !matchF.has(matchBucket(c.match))) return false;
      if (salaryF.size && !salaryF.has(salaryBucket(c.desiredSalary))) return false;
      if (q) {
        const hay = `${c.name} ${c.email} ${c.title} ${c.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reqCandidates, query, srcF, locF, stageF, matchF, salaryF]);

  // filter dropdown option lists
  const sourceOpts = SOURCE_FILTER_OPTS;
  const stageOpts = STAGE_FILTER_OPTS;
  const locationOpts = useMemo(
    () =>
      [...new Set(reqCandidates.map((c) => c.location))]
        .sort()
        .map((l) => ({ value: l, label: l })),
    [reqCandidates]
  );

  const rank = (s) =>
    ({ Offer: 0, Interview: 1, Screening: 2, "To Review": 3, Declined: 4, "Knocked Out": 5 }[s] ?? 3);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const r = rank(a.status) - rank(b.status);
        if (r !== 0) return r;
        return (b.match || 0) - (a.match || 0);
      }),
    [filtered]
  );

  // reset to page 1 whenever the filter/result set changes (render-time adjust)
  const totalPages = Math.max(1, Math.ceil(sorted.length / rpp));
  const filterKey = `${reqFilter}|${query}|${rpp}|${[...srcF].sort()}|${[...locF].sort()}|${[...stageF].sort()}|${[...matchF].sort()}|${[...salaryF].sort()}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (filterKey !== prevKey) {
    setPrevKey(filterKey);
    setPage(1);
  }
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rpp;
  const pageRows = sorted.slice(start, start + rpp);

  const selected = candidates.find((c) => c.id === selectedId) || null;
  const drawerOpen = !!selected;

  const openRow = (id) => {
    setSelectedId(id);
  };

  const toggleId = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const activeReqObj = requisitions.find((r) => r.id === reqFilter);
  const reqCounts = useMemo(() => {
    const m = {};
    candidates.forEach((c) => { m[c.reqId] = (m[c.reqId] || 0) + 1; });
    return m;
  }, [candidates]);
  const colSpanCount =
    1 + 1 + COLUMNS.filter((c) => isColVisible(c.key)).length + 1; // checkbox + name + visible data cols + actions

  // active filters — grouped by type, with an individually-removable pill per value
  const optLabel = (opts, v) => opts.find((o) => o.value === v)?.label ?? v;
  const removeFromSet = (setter, v) =>
    setter((prev) => {
      const n = new Set(prev);
      n.delete(v);
      return n;
    });
  const filterGroups = [
    { id: "src", name: "Applied Via", set: srcF, fmt: (v) => v, setter: setSrcF },
    { id: "loc", name: "Location", set: locF, fmt: (v) => v, setter: setLocF },
    { id: "stg", name: "Stage", set: stageF, fmt: (v) => optLabel(STAGE_FILTER_OPTS, v), setter: setStageF },
    { id: "mat", name: "Match", set: matchF, fmt: (v) => optLabel(MATCH_FILTER_OPTS, v), setter: setMatchF },
    { id: "sal", name: "Desired Salary", set: salaryF, fmt: (v) => optLabel(SALARY_FILTER_OPTS, v), setter: setSalaryF },
  ]
    .filter((g) => g.set.size > 0)
    .map((g) => ({
      id: g.id,
      name: g.name,
      values: [...g.set].map((v) => ({ raw: v, label: g.fmt(v), remove: () => removeFromSet(g.setter, v) })),
    }));
  const clearAllFilters = () => {
    setSrcF(new Set());
    setLocF(new Set());
    setStageF(new Set());
    setMatchF(new Set());
    setSalaryF(new Set());
  };

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT: table column (shrinks when drawer open) */}
      <div className="flex-1 flex flex-col min-w-0">
      {/* ---------------------------- top bar ---------------------------- */}
      <div className="px-5 pt-4 pb-3 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-[20px] font-bold text-[#1a1a1a] leading-none">
              Candidates
            </h1>
            {/* Requisition dropdown */}
            <div className="relative" ref={reqRef}>
              <button
                onClick={() => setReqOpen((o) => !o)}
                className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-[13px] transition ${
                  reqOpen
                    ? "border-sgi-300 bg-sgi-50 text-sgi"
                    : "border-[#E2E8F0] text-[#4A5568] hover:bg-[#F7FAFC]"
                }`}
              >
                <span className="font-medium truncate max-w-[260px]">
                  {reqFilter === "all" ? "All Job Openings" : `${activeReqObj?.id} — ${activeReqObj?.title}`}
                </span>
                <ChevronDown size={14} className={`shrink-0 transition-transform ${reqOpen ? "rotate-180" : ""}`} />
              </button>
              {reqOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-[320px] bg-white border border-[#E2E8F0] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-1">
                  <ReqOption
                    active={reqFilter === "all"}
                    onClick={() => { setReqFilter("all"); setReqOpen(false); }}
                    label="All Job Openings"
                    count={candidates.length}
                  />
                  {requisitions
                    .filter((r) => (reqCounts[r.id] || 0) > 0)
                    .map((r) => (
                      <ReqOption
                        key={r.id}
                        active={reqFilter === r.id}
                        onClick={() => { setReqFilter(r.id); setReqOpen(false); }}
                        label={`${r.id} — ${r.title}`}
                        count={reqCounts[r.id]}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-[420px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b1]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates by name, email..."
              className="w-full h-8 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-md text-[13px] text-[#1a1a1a] placeholder:text-[#9aa5b1] focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2, 62, 138,0.1)]"
            />
          </div>

          {/* Columns */}
          <div className="relative" ref={colsRef}>
            <button
              onClick={() => setColsOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-md border text-[12px] font-medium transition ${
                colsOpen ? "border-sgi bg-sgi-50 text-sgi" : "border-sgi text-sgi bg-white hover:bg-sgi-50"
              }`}
            >
              <Columns3 size={13} /> Columns
            </button>
            {colsOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-white border border-[#E2E8F0] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-1.5">
                {COLUMN_TOGGLES.map((col) => (
                  <label
                    key={col.key}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-[12px] text-[#1a1a1a] ${
                      col.locked ? "opacity-60 cursor-not-allowed" : "hover:bg-[#fafafa] cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={col.locked ? true : !hiddenCols.has(col.key)}
                      disabled={col.locked}
                      onChange={() =>
                        setHiddenCols((prev) => {
                          const next = new Set(prev);
                          next.has(col.key) ? next.delete(col.key) : next.add(col.key);
                          return next;
                        })
                      }
                      className="minicheck"
                    />
                    {col.label}
                    {col.locked && <span className="ml-auto text-[10px] text-[#bbb]">locked</span>}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Focus mode */}
          <button
            onClick={() => {
              if (sorted.length === 0) return;
              const i = sorted.findIndex((c) => c.id === selectedId);
              setFocusIndex(i < 0 ? 0 : i);
              setFocusOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-md border border-sgi text-sgi bg-white text-[12px] font-medium hover:bg-sgi-50 transition"
          >
            <Eye size={13} /> Focus Mode
          </button>
        </div>

        {/* ----------------------- AI search bar ----------------------- */}
        <div className="mt-3 flex items-center gap-2 h-9 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-2.5 pr-1">
          <Sparkles size={14} className="text-sgi shrink-0" />
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAi()}
            placeholder="Ask AI about candidates... e.g. Best candidates for Atlanta hybrid role"
            className="flex-1 min-w-0 bg-transparent text-[12.5px] text-[#1a1a1a] placeholder:text-[#94A3B8] focus:outline-none"
          />
          <button
            onClick={runAi}
            className="shrink-0 h-[26px] px-2.5 rounded bg-sgi text-white text-[11px] font-semibold hover:bg-sgi-600 transition"
          >
            Ask AI
          </button>
        </div>

        {/* -------------------- active filter chips -------------------- */}
        {filterGroups.length > 0 && (
          <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-2">
            {filterGroups.map((g) => (
              <div key={g.id} className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">{g.name}</span>
                <div className="flex items-center flex-wrap gap-1">
                  {g.values.map((v) => (
                    <span
                      key={v.raw}
                      className="inline-flex items-center gap-1 bg-[#E8F0FB] border border-[#C9DCF4] rounded-full px-2.5 py-[2px] text-[12px] text-[#023E8A]"
                    >
                      {v.label}
                      <button
                        onClick={v.remove}
                        className="text-[#6E9CDB] hover:text-[#023E8A]"
                        aria-label={`Remove ${v.label}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={clearAllFilters} className="ml-auto text-[12px] text-sgi hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* ------------------------- stats bar ------------------------- */}
        <div className="mt-3 flex items-center gap-1 flex-wrap">
          {STAT_CARDS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1.5 px-3 py-1 text-[13px]">
              <span className="text-[#6B7280]">{s.label}:</span>
              <span className={`font-bold tabular-nums ${s.color}`}>{counts[s.key]}</span>
              {i < STAT_CARDS.length - 1 && <span className="ml-1 text-[#e2e2e2]">|</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------- table ----------------------------- */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[#fbfbfc] shadow-[0_1px_0_#eee]">
            <tr className="text-[11px] uppercase tracking-wide text-[#8a93a0]">
              <Th className="w-9 pl-5">
                <SelectAll ids={pageRows.map((c) => c.id)} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
              </Th>
              <Th>Name</Th>
              {isColVisible("requisition") && <Th>Requisition</Th>}
              {isColVisible("contact") && <Th>Contact</Th>}
              {isColVisible("source") && (
                <Th className="min-w-[90px]">
                  <FilterHead label="Applied Via">
                    <ColumnFilter
                      id="source"
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      options={sourceOpts}
                      applied={srcF}
                      onApply={setSrcF}
                      showBadge
                    />
                  </FilterHead>
                </Th>
              )}
              {isColVisible("location") && (
                <Th className="min-w-[100px]">
                  <FilterHead label="Location">
                    <ColumnFilter
                      id="location"
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      options={locationOpts}
                      applied={locF}
                      onApply={setLocF}
                    />
                  </FilterHead>
                </Th>
              )}
              {isColVisible("applied") && <Th className="min-w-[90px]">Applied</Th>}
              {isColVisible("salary") && (
                <Th className="min-w-[110px]">
                  <FilterHead label="Desired Salary">
                    <ColumnFilter
                      id="salary"
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      options={SALARY_FILTER_OPTS}
                      applied={salaryF}
                      onApply={setSalaryF}
                    />
                  </FilterHead>
                </Th>
              )}
              {isColVisible("match") && (
                <Th className="min-w-[70px]">
                  <FilterHead label="Match">
                    <ColumnFilter
                      id="match"
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      options={MATCH_FILTER_OPTS}
                      applied={matchF}
                      onApply={setMatchF}
                      showBadge
                    />
                  </FilterHead>
                </Th>
              )}
              {isColVisible("stage") && (
                <Th className="min-w-[90px]">
                  <FilterHead label="Stage">
                    <ColumnFilter
                      id="stage"
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      options={stageOpts}
                      applied={stageF}
                      onApply={setStageF}
                      showBadge
                    />
                  </FilterHead>
                </Th>
              )}
              {isColVisible("hiringManager") && <Th className="min-w-[110px]">Hiring Manager</Th>}
              {isColVisible("recruiter") && <Th className="min-w-[100px]">Recruiter</Th>}
              <Th className="text-center min-w-[140px]">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((c, i) => {
              const isSel = selectedId === c.id;
              const checked = selectedIds.has(c.id);
              const mb = matchBadge(c.match);
              const stage = STAGE[c.status] || STAGE["To Review"];
              return (
                <tr
                  key={c.id}
                  onClick={() => openRow(c.id)}
                  className={`group cursor-pointer border-b border-[#f3f4f6] transition relative ${
                    isSel ? "bg-sgi-50" : i % 2 ? "bg-[#fcfcfd]" : "bg-white"
                  } hover:bg-sgi-50/60`}
                >
                  {/* checkbox + selected indicator */}
                  <Td className="w-9 pl-5 relative">
                    {isSel && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-sgi" />}
                    <input
                      type="checkbox"
                      checked={checked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleId(c.id)}
                      className="minicheck"
                      aria-label={`Select ${c.name}`}
                    />
                  </Td>

                  {/* name */}
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[13px] text-[#1a1a1a] truncate max-w-[160px]">{c.name}</span>
                      <IntExtBadge internal={c.internal} />
                      {c.aiReviewed && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold tracking-wide bg-sgi-50 text-sgi border border-sgi-100 px-1 py-0.5 rounded shrink-0">
                          <Sparkles size={8} /> AI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#9aa5b1] mt-0.5 truncate max-w-[160px]">{c.title}</div>
                  </Td>

                  {/* requisition */}
                  {isColVisible("requisition") && (
                    <Td>
                      <div className="text-[12px] font-medium text-sgi">{c.reqId}</div>
                      <div className="text-[11px] text-[#9aa5b1] truncate max-w-[170px]">
                        {requisitions.find((r) => r.id === c.reqId)?.title || "—"}
                      </div>
                    </Td>
                  )}

                  {/* contact */}
                  {isColVisible("contact") && (
                    <Td>
                      <a
                        href={`mailto:${c.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-[12px] text-[#4A5568] hover:text-sgi hover:underline truncate max-w-[170px]"
                      >
                        {c.email}
                      </a>
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-[11px] text-[#9aa5b1] hover:text-sgi"
                      >
                        {c.phone}
                      </a>
                    </Td>
                  )}

                  {/* applied via */}
                  {isColVisible("source") && (
                    <Td>
                      <span className={`inline-block text-[11px] font-medium px-1.5 py-px rounded-full ${SOURCE_CLS[c.appliedVia] || "bg-[#f5f5f5] text-[#666]"}`}>
                        {c.appliedVia}
                      </span>
                    </Td>
                  )}

                  {/* location */}
                  {isColVisible("location") && (
                    <Td className="text-[12px] text-[#4A5568] whitespace-nowrap">
                      {(c.appliedLocations && c.appliedLocations[0]) || c.location}
                      {c.appliedLocations && c.appliedLocations.length > 1 && (
                        <span
                          title={c.appliedLocations.join(", ")}
                          className="ml-1 text-[11px] font-medium text-sgi cursor-help"
                        >
                          +{c.appliedLocations.length - 1} more
                        </span>
                      )}
                    </Td>
                  )}

                  {/* applied date */}
                  {isColVisible("applied") && (
                    <Td className="text-[12px] text-[#4A5568] whitespace-nowrap">{fmtDate(c.applied)}</Td>
                  )}

                  {/* desired salary */}
                  {isColVisible("salary") && (
                    <Td className="text-[12px] font-medium text-[#1a1a1a] tabular-nums whitespace-nowrap">
                      {c.desiredSalary}
                    </Td>
                  )}

                  {/* match */}
                  {isColVisible("match") && (
                    <Td>
                      <span className={`inline-block min-w-[38px] text-center text-[11px] font-bold px-1.5 py-px rounded-full tabular-nums ${mb.cls}`}>
                        {mb.text}
                      </span>
                    </Td>
                  )}

                  {/* stage */}
                  {isColVisible("stage") && (
                    <Td>
                      <span className={`inline-block text-[11px] font-medium px-1.5 py-px rounded-full whitespace-nowrap ${stage.cls}`}>
                        {stage.label}
                      </span>
                    </Td>
                  )}

                  {/* hiring manager */}
                  {isColVisible("hiringManager") && (
                    <Td className="text-[12px] text-[#4A5568] whitespace-nowrap">{c.hiringManager}</Td>
                  )}

                  {/* recruiter */}
                  {isColVisible("recruiter") && (
                    <Td className="text-[12px] text-[#4A5568] whitespace-nowrap">{c.recruiter}</Td>
                  )}

                  {/* actions */}
                  <Td>
                    <div className="flex items-center justify-center gap-1.5">
                      {ADVANCE_TABLE[c.status] && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); advanceCandidate(c.id); }}
                            className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-medium bg-[#E8F0FB] text-[#023E8A] hover:bg-[#d8e6f8] transition"
                          >
                            {ADVANCE_TABLE[c.status]}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeclineTarget(c); }}
                            className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-medium bg-[#FEE2E2] text-[#DC2626] hover:bg-[#fcd0d0] transition"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {c.status === "Offer" && (
                        <>
                          <span className="text-[11px] text-[#9aa5b1]">Offer Sent</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeclineTarget(c); }}
                            className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-medium bg-[#FEE2E2] text-[#DC2626] hover:bg-[#fcd0d0] transition"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {c.status === "Declined" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); restoreCandidate(c.id); }}
                          className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-medium bg-[#E8F0FB] text-[#023E8A] hover:bg-[#d8e6f8] transition"
                        >
                          Restore
                        </button>
                      )}
                      {c.status === "Knocked Out" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openRow(c.id); }}
                          className="text-[11px] text-[#9aa5b1] hover:text-[#6B7280] hover:underline"
                        >
                          Review Manually
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={colSpanCount} className="py-16 text-center text-[13px] text-[#9aa5b1]">
                  No candidates match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --------------------- bulk action bar (above pagination) -------- */}
      <div
        className={`shrink-0 transition-[height] duration-200 ease-out ${
          selectedIds.size > 0
            ? "h-[52px] border-t border-[#C9DCF4] shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
            : "h-0 overflow-hidden"
        }`}
      >
        <div className="h-[52px] bg-[#E8F0FB] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[13px]">
            <span className="font-medium text-[#1a1a1a]">
              {selectedIds.size} candidate{selectedIds.size === 1 ? "" : "s"} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[12px] text-[#6B7280] hover:text-[#1a1a1a] hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                showToast(
                  `Downloading ${selectedIds.size} resumes... Resumes will be saved to your downloads folder`
                )
              }
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-white border border-[#E2E8F0] text-[#4A5568] text-[13px] font-medium hover:bg-[#F7FAFC] transition"
            >
              <Download size={14} /> Download Resumes
            </button>
            <div className="relative" ref={bulkAdvRef}>
              <button
                onClick={() => setBulkAdvOpen((o) => !o)}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-sgi text-white text-[13px] font-medium hover:bg-sgi-600 transition"
              >
                Advance Selected
                <ChevronDown size={14} className={`transition-transform ${bulkAdvOpen ? "rotate-180" : ""}`} />
              </button>
              {bulkAdvOpen && (
                <div className="absolute right-0 bottom-full mb-1.5 z-40 w-[200px] bg-white border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1.5">
                  {[
                    { stage: "Screening", label: "Move to Screening" },
                    { stage: "Interview", label: "Move to Interview" },
                    { stage: "Offer", label: "Move to Offer" },
                  ].map((o) => (
                    <button
                      key={o.stage}
                      onClick={() => {
                        const n = selectedIds.size;
                        selectedIds.forEach((id) => setCandidateStage(id, o.stage));
                        setSelectedIds(new Set());
                        setBulkAdvOpen(false);
                        showToast(`${n} candidate${n === 1 ? "" : "s"} moved to ${o.stage}`);
                      }}
                      className="block w-full text-left text-[13px] text-[#1a1a1a] px-4 py-2 hover:bg-[#E8F0FB]"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setBulkDecline(true)}
              className="h-8 px-3.5 rounded-md bg-white border border-[#DC2626] text-[#DC2626] text-[13px] font-medium hover:bg-red-50 transition"
            >
              Decline Selected
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------- pagination --------------------------- */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-[#f0f0f0] text-[12px] text-[#6B7280] flex-wrap">
        <span>
          {sorted.length === 0
            ? "No candidates"
            : `Showing ${start + 1}–${Math.min(start + rpp, sorted.length)} of ${sorted.length} candidates`}
        </span>

        <div className="flex items-center gap-1">
          <PageBtn disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Prev</PageBtn>
          {getPages(safePage, totalPages).map((p, idx) =>
            p === "…" ? (
              <span key={`e${idx}`} className="px-1.5 text-[#bbb]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[28px] h-7 px-2 rounded-md text-[12px] transition ${
                  p === safePage ? "bg-sgi text-white font-semibold" : "text-[#4A5568] hover:bg-[#f3f4f6]"
                }`}
              >
                {p}
              </button>
            )
          )}
          <PageBtn disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next</PageBtn>
        </div>

        <div className="relative flex items-center gap-2" ref={rppRef}>
          <span>Rows per page:</span>
          <button
            onClick={() => setRppOpen((o) => !o)}
            className="flex items-center gap-1 h-7 px-2 border border-[#E2E8F0] rounded-md hover:bg-[#F7FAFC]"
          >
            {rpp} <ChevronDown size={13} />
          </button>
          {rppOpen && (
            <div className="absolute right-0 bottom-full mb-1 z-30 w-20 bg-white border border-[#E2E8F0] rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1">
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => { setRpp(n); setRppOpen(false); }}
                  className={`block w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#E8F0FB] ${
                    n === rpp ? "text-sgi font-medium" : "text-[#1a1a1a]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      </div>
      {/* END LEFT column */}

      {/* RIGHT: inline drawer (table shrinks, no overlay; drag left edge to resize) */}
      <aside
        style={{ width: drawerOpen ? drawerWidth : 0 }}
        className={`relative shrink-0 h-full overflow-hidden border-l border-[#ececec] ${
          dragging ? "" : "transition-[width] duration-300 ease-out"
        } ${drawerOpen ? "" : "border-l-0"}`}
      >
        {selected && (
          <div style={{ width: drawerWidth }} className="h-full">
            {/* drag-to-resize handle */}
            <div
              onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
              title="Drag to resize"
              className={`absolute left-0 top-0 z-20 h-full w-1 cursor-col-resize transition-colors ${
                dragging ? "bg-sgi-300" : "bg-[#ececec] hover:bg-[#cbd5e0]"
              }`}
            />
            <Drawer
              key={selected.id}
              c={selected}
              onClose={() => setSelectedId(null)}
              onAdvance={() => advanceCandidate(selected.id)}
              onRestore={() => restoreCandidate(selected.id)}
              onResume={() => showToast(`Downloading ${selected.name}'s resume`)}
              onRequestDecline={() => setDeclineTarget(selected)}
            />
          </div>
        )}
      </aside>

      {/* focus mode full-screen modal */}
      {focusOpen && sorted.length > 0 && (
        <FocusModal
          list={sorted}
          index={Math.min(focusIndex, sorted.length - 1)}
          setIndex={setFocusIndex}
          onClose={() => setFocusOpen(false)}
          onAdvance={(id) => advanceCandidate(id)}
          onRestore={(id) => restoreCandidate(id)}
          onDecline={(cand) => setDeclineTarget(cand)}
          onResume={(cand) => showToast(`Downloading ${cand.name}'s resume`)}
        />
      )}

      {/* row-level decline modal */}
      {declineTarget && (
        <DeclineModal
          count={1}
          onCancel={() => setDeclineTarget(null)}
          onConfirm={() => {
            declineCandidate(declineTarget.id);
            setDeclineTarget(null);
          }}
        />
      )}

      {/* bulk decline modal */}
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

  function runAi() {
    setQuery(aiQuery);
    if (aiQuery.trim()) showToast("Ranking candidates with AI…");
  }
}

/* ============================ drawer panel =============================== */

const DRAWER_TABS = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Notes" },
];

function Drawer({ c, onClose, onAdvance, onRestore, onResume, onRequestDecline }) {
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState("");
  const mb = matchBadge(c.match);
  const stage = STAGE[c.status] || STAGE["To Review"];

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-[#888] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2 pr-8">
          <h2 className="text-[19px] font-bold text-[#1a1a1a] leading-tight">{c.name}</h2>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#0a66c2] hover:opacity-75 shrink-0"
            title="LinkedIn profile"
          >
            <LinkedInIcon size={15} />
          </a>
          <button
            onClick={onResume}
            title="Download resume"
            className="shrink-0 p-1 rounded-md text-[#9aa5b1] hover:text-sgi hover:bg-sgi-50 transition"
          >
            <Download size={15} />
          </button>
        </div>
        <div className="text-[12px] text-[#6B7280] mt-1">
          {c.title} · {c.years} yrs experience
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <IntExtBadge internal={c.internal} />
          <span className={`inline-block text-[11px] font-medium px-2 py-[3px] rounded-md ${stage.cls}`}>
            {stage.label}
          </span>
          <span className={`inline-block text-[11px] font-medium px-2 py-[3px] rounded-md tabular-nums ${mb.cls}`}>
            {mb.text === "—" ? "No match" : `${mb.text} match`}
          </span>
          {c.aiReviewed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-[3px] rounded-md bg-sgi-50 text-sgi">
              <Sparkles size={10} /> AI Reviewed
            </span>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="px-5 border-b border-[#f0f0f0] flex gap-1">
        {DRAWER_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-[12px] font-medium px-2.5 py-2.5 border-b-2 -mb-px transition ${
              tab === t.id ? "border-sgi text-[#1a1a1a]" : "border-transparent text-[#888] hover:text-[#1a1a1a]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* body */}
      <div className="flex-1 overflow-auto px-5 py-4">
        {tab === "overview" && (
          <div className="space-y-6">
            {/* ai summary */}
            <Section title="AI Summary" icon={<Sparkles size={11} />}>
              <div className="bg-[#fafafa] border-l-2 border-l-sgi rounded-r-md py-3 px-3.5">
                <p className="text-[13px] text-[#444] leading-relaxed">{c.aiSummary}</p>
              </div>
            </Section>

            {/* contact */}
            <Section title="Contact">
              <div className="space-y-2">
                <Row icon={<Mail size={13} />}>
                  <a href={`mailto:${c.email}`} className="text-sgi hover:underline">{c.email}</a>
                </Row>
                <Row icon={<Phone size={13} />}>
                  <a href={`tel:${c.phone}`} className="hover:text-sgi">{c.phone}</a>
                </Row>
                <Row icon={<MapPin size={13} />}>{c.location}</Row>
              </div>
            </Section>

            {/* applied locations */}
            {c.appliedLocations && c.appliedLocations.length > 0 && (
              <Section title="Applied Locations">
                <ul className="space-y-1.5">
                  {c.appliedLocations.map((loc) => (
                    <li key={loc} className="flex items-center gap-2 text-[13px] text-[#4A5568]">
                      <span className="w-1 h-1 rounded-full bg-[#cbd5e0] shrink-0" />
                      {loc}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* knockout + screening questions */}
            <ScreeningQsContent c={c} />

            {/* work history */}
            <Section title="Work History">
              <ol className="space-y-3">
                {c.experience.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? "bg-sgi" : "bg-[#cbd5e0]"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[13px] text-[#1a1a1a]">{e.company}</span>
                        <span className={`text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${
                          i === 0 ? "bg-sgi-50 text-sgi" : "bg-[#f2f2f2] text-[#888]"
                        }`}>
                          {i === 0 ? "Current" : "Previous"}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6B7280]">{e.role}</div>
                      <div className="text-[11px] text-[#9aa5b1]">{e.years}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        )}

        {tab === "notes" && (
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a private note about this candidate…"
              className="w-full min-h-[160px] p-3 border border-[#E2E8F0] rounded-md text-[13px] text-[#1a1a1a] placeholder:text-[#aaa] resize-y focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2, 62, 138,0.1)]"
            />
          </div>
        )}
      </div>

      {/* actions */}
      <div className="border-t border-[#f0f0f0] px-5 py-4">
        {ADVANCE_DRAWER[c.status] && (
          <>
            <button
              onClick={onAdvance}
              className="w-full h-9 rounded-md bg-sgi text-white text-[13px] font-medium hover:bg-sgi-600 transition"
            >
              {ADVANCE_DRAWER[c.status]}
            </button>
            <div className="flex items-center justify-center mt-2.5 text-[12px]">
              <button onClick={onRequestDecline} className="text-red-600 hover:underline">Decline</button>
            </div>
          </>
        )}
        {c.status === "Offer" && (
          <div className="flex items-center justify-center gap-4 text-[12px]">
            <span className="text-[#9aa5b1]">Offer Sent</span>
            <button onClick={onRequestDecline} className="text-red-600 hover:underline">Decline</button>
          </div>
        )}
        {c.status === "Declined" && (
          <button
            onClick={onRestore}
            className="w-full h-9 rounded-md bg-[#f2f2f2] text-[#555] border border-[#e2e2e2] text-[13px] font-medium hover:bg-[#e8e8e8] transition"
          >
            Restore to To Review
          </button>
        )}
        {c.status === "Knocked Out" && (
          <div className="text-center text-[12px] text-[#9aa5b1]">Review Manually</div>
        )}
      </div>
    </div>
  );
}

function ScreeningQsContent({ c }) {
  return (
    <div className="space-y-6">
      {/* knockout questions */}
      <section>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-red-600 font-semibold mb-2.5">
          <Zap size={12} className="text-red-500" />
          Knockout Questions
        </div>
        <div className="space-y-2">
          {(c.knockoutQuestions || []).map((k, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 border rounded-md px-3 py-2 ${
                k.passed ? "border-[#DCFCE7] bg-[#F0FDF4]" : "border-[#FECACA] bg-[#FEF2F2]"
              }`}
            >
              <div className="min-w-0">
                <div className="text-[11px] text-[#6B7280] truncate" title={k.question}>{k.question}</div>
                <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{k.answer}</div>
              </div>
              {k.passed ? (
                <Check size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <X size={16} className="text-red-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* screening questions */}
      <section>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-sgi font-semibold mb-2.5">
          <Info size={12} className="text-sgi" />
          Screening Questions
        </div>
        <div className="space-y-2">
          {(c.screeningQuestions || []).map((s, i) => (
            <div key={i} className="border border-[#eee] rounded-md px-3 py-2 bg-[#F9FAFB]">
              <div className="text-[11px] text-[#6B7280] truncate" title={s.question}>{s.question}</div>
              <div className="text-[13px] font-bold text-[#1a1a1a] truncate">{s.answer}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ========================== focus mode modal =========================== */

const FOCUS_TABS = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Notes" },
];

const UNIS = ["University of Georgia", "Georgia Institute of Technology", "Emory University", "Georgia State University"];
const DEGREES = ["B.S. Computer Science", "B.B.A. Business Analytics", "B.S. Statistics", "B.S. Information Systems"];

function FocusModal({ list, index, setIndex, onClose, onAdvance, onRestore, onDecline, onResume }) {
  const c = list[index];
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState("");

  // reset per-candidate fields when navigating (render-time, no effect)
  const [curId, setCurId] = useState(c?.id);
  if (c && c.id !== curId) {
    setCurId(c.id);
    setNotes("");
  }

  const atFirst = index <= 0;
  const atLast = index >= list.length - 1;
  const go = (delta) => setIndex(Math.max(0, Math.min(list.length - 1, index + delta)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(list.length - 1, i + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, setIndex, list.length]);

  if (!c) return null;
  const mb = matchBadge(c.match);
  const stage = STAGE[c.status] || STAGE["To Review"];
  const uni = UNIS[c.name.length % UNIS.length];
  const degree = DEGREES[c.years % DEGREES.length];
  const gradYear = 2026 - c.years - 1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[90vw] max-w-[1400px] h-[92vh] bg-white rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
      >
      {/* top bar */}
      <div className="h-14 shrink-0 border-b border-[#f0f0f0] flex items-center px-5">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] truncate">{c.name}</h2>
          <IntExtBadge internal={c.internal} />
          <span className="text-[12px] text-[#6B7280] truncate">{c.title}</span>
          <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md ${stage.cls}`}>
            {stage.label}
          </span>
        </div>

        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => go(-1)}
            disabled={atFirst}
            className="p-1.5 rounded-md text-[#4A5568] hover:bg-[#f3f4f6] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous candidate"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[12px] text-[#6B7280] tabular-nums whitespace-nowrap">
            {index + 1} of {list.length} candidates
          </span>
          <button
            onClick={() => go(1)}
            disabled={atLast}
            className="p-1.5 rounded-md text-[#4A5568] hover:bg-[#f3f4f6] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next candidate"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#888] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* two columns */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT PANEL */}
        <div className="w-[420px] shrink-0 border-r border-[#f0f0f0] flex flex-col min-h-0">
          {/* tabs */}
          <div className="px-5 border-b border-[#f0f0f0] flex flex-nowrap gap-1 shrink-0">
            {FOCUS_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 whitespace-nowrap text-[12px] font-medium px-3 py-2.5 border-b-2 -mb-px transition ${
                  tab === t.id ? "border-sgi text-[#1a1a1a]" : "border-transparent text-[#888] hover:text-[#1a1a1a]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* scroll content */}
          <div className="flex-1 overflow-auto px-5 py-4 min-h-0">
            {tab === "overview" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums ${mb.cls}`}>
                    {mb.text === "—" ? "No match" : `${mb.text} match`}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${stage.cls}`}>
                    {stage.label}
                  </span>
                </div>

                <div className="border-t border-[#f0f0f0]" />

                <Section title="AI Summary" icon={<Sparkles size={11} />}>
                  <div className="bg-[#fafafa] border-l-2 border-l-sgi rounded-r-md py-3 px-3.5">
                    <p className="text-[13px] text-[#444] leading-relaxed">{c.aiSummary}</p>
                  </div>
                </Section>

                <Section title="Contact">
                  <div className="space-y-2">
                    <Row icon={<Mail size={13} />}>
                      <a href={`mailto:${c.email}`} className="text-sgi hover:underline">{c.email}</a>
                    </Row>
                    <Row icon={<Phone size={13} />}>
                      <a href={`tel:${c.phone}`} className="hover:text-sgi">{c.phone}</a>
                    </Row>
                    <Row icon={<MapPin size={13} />}>{c.location}</Row>
                  </div>
                </Section>

                {c.appliedLocations && c.appliedLocations.length > 0 && (
                  <Section title="Applied Locations">
                    <ul className="space-y-1.5">
                      {c.appliedLocations.map((loc) => (
                        <li key={loc} className="flex items-center gap-2 text-[13px] text-[#4A5568]">
                          <span className="w-1 h-1 rounded-full bg-[#cbd5e0] shrink-0" />
                          {loc}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                <ScreeningQsContent c={c} />

                <Section title="Work History">
                  <ol className="space-y-3">
                    {c.experience.map((e, i) => (
                      <li key={i} className="flex gap-3">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? "bg-sgi" : "bg-[#cbd5e0]"}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[13px] text-[#1a1a1a]">{e.company}</span>
                            <span className={`text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${
                              i === 0 ? "bg-sgi-50 text-sgi" : "bg-[#f2f2f2] text-[#888]"
                            }`}>
                              {i === 0 ? "Current" : "Previous"}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#6B7280]">{e.role}</div>
                          <div className="text-[11px] text-[#9aa5b1]">{e.years}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Section>
              </div>
            )}

            {tab === "notes" && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a private note about this candidate…"
                className="w-full min-h-[200px] p-3 border border-[#E2E8F0] rounded-md text-[13px] text-[#1a1a1a] placeholder:text-[#aaa] resize-y focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2, 62, 138,0.1)]"
              />
            )}
          </div>

          {/* bottom fixed actions */}
          <div className="border-t border-[#f0f0f0] px-5 py-4 shrink-0">
            {ADVANCE_DRAWER[c.status] && (
              <>
                <button
                  onClick={() => onAdvance(c.id)}
                  className="w-full h-9 rounded-md bg-sgi text-white text-[13px] font-medium hover:bg-sgi-600 transition"
                >
                  {ADVANCE_DRAWER[c.status]}
                </button>
                <div className="flex items-center justify-center mt-2.5">
                  <button onClick={() => onDecline(c)} className="text-[12px] text-red-600 hover:underline">
                    Decline
                  </button>
                </div>
              </>
            )}
            {c.status === "Offer" && (
              <div className="flex items-center justify-center gap-4 text-[12px]">
                <span className="text-[#9aa5b1]">Offer Sent</span>
                <button onClick={() => onDecline(c)} className="text-red-600 hover:underline">Decline</button>
              </div>
            )}
            {c.status === "Declined" && (
              <button
                onClick={() => onRestore(c.id)}
                className="w-full h-9 rounded-md bg-[#f2f2f2] text-[#555] border border-[#e2e2e2] text-[13px] font-medium hover:bg-[#e8e8e8] transition"
              >
                Restore to To Review
              </button>
            )}
            {c.status === "Knocked Out" && (
              <div className="text-center text-[12px] text-[#9aa5b1]">Review Manually</div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — resume */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#f4f5f7]">
          <div className="h-12 shrink-0 border-b border-[#e8e9ec] bg-white flex items-center justify-between px-5">
            <span className="text-[13px] font-medium text-[#1a1a1a] truncate">
              {c.name} — Resume
            </span>
            <button
              onClick={() => onResume(c)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-sgi-200 text-sgi text-[12px] font-medium hover:bg-sgi-50 transition"
            >
              <Download size={14} /> Download
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-[680px] mx-auto bg-white shadow-[0_2px_24px_rgba(0,0,0,0.1)] border border-[#eee] rounded-md px-12 py-12">
              <h1 className="text-[26px] font-bold text-[#1a1a1a] text-center tracking-tight">{c.name}</h1>
              <div className="text-center text-[12px] text-[#6B7280] mt-2">
                {c.email} &nbsp;·&nbsp; {c.phone} &nbsp;·&nbsp; {c.location}
              </div>

              <ResumeSection title="Education">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-[13px] text-[#1a1a1a]">{uni}</span>
                  <span className="text-[12px] text-[#9aa5b1] tabular-nums">{gradYear}</span>
                </div>
                <div className="text-[12px] text-[#6B7280]">{degree}</div>
              </ResumeSection>

              <ResumeSection title="Work Experience">
                <div className="space-y-4">
                  {c.experience.map((e, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-[13px] text-[#1a1a1a]">
                          {e.role} — {e.company}
                        </span>
                        <span className="text-[12px] text-[#9aa5b1] whitespace-nowrap">{e.years}</span>
                      </div>
                      <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">
                        Owned reporting and analytics deliverables, partnered with stakeholders, and drove
                        data-informed decisions in the {c.industry} space.
                      </p>
                    </div>
                  ))}
                </div>
              </ResumeSection>

              <ResumeSection title="Skills">
                <p className="text-[13px] text-[#444] leading-relaxed">
                  SQL ({c.sql}), Python, Tableau, Looker, Snowflake, dbt, Excel modeling, A/B testing,
                  stakeholder communication.
                </p>
              </ResumeSection>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function ResumeSection({ title, children }) {
  return (
    <section className="mt-8">
      <h3 className="text-[11px] uppercase tracking-wider font-semibold text-[#9aa5b1] pb-1.5 mb-3 border-b border-[#eee]">
        {title}
      </h3>
      {children}
    </section>
  );
}

/* ============================== helpers ================================= */

function useOutside(ref, open, close) {
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, open, close]);
}

function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  let s = Math.max(2, current - 1);
  let e = Math.min(total - 1, current + 1);
  if (current <= 3) { s = 2; e = 4; }
  if (current >= total - 2) { s = total - 3; e = total - 1; }
  if (s > 2) pages.push("…");
  for (let i = s; i <= e; i++) pages.push(i);
  if (e < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

function Th({ children, className = "" }) {
  return <th className={`whitespace-nowrap px-2.5 py-2 font-semibold ${className}`}>{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`px-3 py-2.5 align-middle whitespace-nowrap ${className}`}>{children}</td>;
}

function FilterHead({ label, children }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {label}
      {children}
    </span>
  );
}

function ColumnFilter({ id, openFilter, setOpenFilter, options, applied, onApply, showBadge = false }) {
  const ref = useRef(null);
  const open = openFilter === id;
  const [alignRight, setAlignRight] = useState(false);
  const [draft, setDraft] = useState(() => new Set(applied));

  // on open: right-align if the icon sits in the right half of the viewport
  const toggleOpen = (e) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setAlignRight(r.left > window.innerWidth / 2);
    }
    setOpenFilter(open ? null : id);
  };

  // sync draft from applied each time the popup opens (render-time, no effect)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(new Set(applied));
  }

  useOutside(ref, open, () => setOpenFilter(null));

  const active = applied.size > 0;
  const toggle = (v) =>
    setDraft((prev) => {
      const n = new Set(prev);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });

  // Select All state
  const allRef = useRef(null);
  const allChecked = options.length > 0 && options.every((o) => draft.has(o.value));
  const someChecked = options.some((o) => draft.has(o.value)) && !allChecked;
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);
  const toggleAll = () =>
    setDraft(allChecked ? new Set() : new Set(options.map((o) => o.value)));

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        title="Filter"
        className={`p-0.5 rounded transition ${
          active ? "text-sgi" : "text-[#b0b8c1] hover:text-[#6B7280]"
        }`}
      >
        <Filter size={12} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${alignRight ? "right-0" : "left-0"} top-full mt-1 z-50 w-[220px] bg-white border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] p-3 normal-case tracking-normal`}
        >
          {options.length > 0 && (
            <>
              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-[#1a1a1a] pb-1.5">
                <input
                  ref={allRef}
                  type="checkbox"
                  className="minicheck"
                  checked={allChecked}
                  onChange={toggleAll}
                />
                Select All
              </label>
              <div className="border-t border-[#f0f0f0] mb-1.5" />
            </>
          )}
          <div className="space-y-1.5 max-h-[240px] overflow-auto">
            {options.length === 0 && (
              <div className="text-[12px] text-[#9aa5b1] py-1">No values</div>
            )}
            {options.map((o) => (
              <label
                key={o.value}
                className="flex items-center gap-2 cursor-pointer text-[12px] text-[#1a1a1a]"
              >
                <input
                  type="checkbox"
                  className="minicheck"
                  checked={draft.has(o.value)}
                  onChange={() => toggle(o.value)}
                />
                <span className="flex-1 truncate font-normal">{o.label}</span>
                {showBadge && o.cls && (
                  <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${o.cls}`}>
                    {o.badge || o.label}
                  </span>
                )}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={() => setDraft(new Set())}
              className="text-[12px] text-[#6B7280] hover:text-[#1a1a1a]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { onApply(new Set(draft)); setOpenFilter(null); }}
              className="h-7 px-3 rounded-md bg-sgi text-white text-[12px] font-medium hover:bg-sgi-600 transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-7 px-2 rounded-md text-[12px] text-[#4A5568] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function ReqOption({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-md px-3 py-2 flex items-center justify-between gap-2 transition ${
        active ? "bg-sgi-50" : "hover:bg-[#E8F0FB]"
      }`}
    >
      <span className="text-[13px] text-[#1a1a1a] truncate">
        <span className={active ? "font-semibold" : "font-medium"}>{label}</span>{" "}
        <span className="text-[#9aa5b1] font-normal">({count})</span>
      </span>
      {active && <Check size={14} className="text-sgi shrink-0" />}
    </button>
  );
}

function Section({ title, icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#999] font-semibold mb-2.5">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

function Row({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-[#4A5568]">
      <span className="text-[#9aa5b1] shrink-0">{icon}</span>
      {children}
    </div>
  );
}


function IntExtBadge({ internal }) {
  return (
    <span
      title={internal ? "Internal Applicant" : "External Applicant"}
      className={`shrink-0 text-[9px] font-bold tracking-wide px-1 py-0.5 rounded cursor-default ${
        internal ? "bg-sgi-50 text-sgi" : "bg-[#F1F5F9] text-[#475569]"
      }`}
    >
      {internal ? "Int" : "Ext"}
    </span>
  );
}

function LinkedInIcon({ size = 14, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.99H5.67v8.35h2.67zM7 8.8a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.54v-4.58c0-2.45-1.31-3.59-3.06-3.59-1.41 0-2.04.78-2.39 1.32v-1.13h-2.67c.04.75 0 8.35 0 8.35h2.67v-4.66c0-.24.02-.48.09-.65.19-.48.63-.98 1.36-.98.96 0 1.34.73 1.34 1.8v4.49h2.66z" />
    </svg>
  );
}

function SelectAll({ ids, selectedIds, setSelectedIds }) {
  const ref = useRef(null);
  const total = ids.length;
  const inView = ids.filter((id) => selectedIds.has(id)).length;
  const all = total > 0 && inView === total;
  const some = inView > 0 && !all;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some;
  }, [some]);

  const onToggle = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (all || some) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={all}
      onChange={onToggle}
      onClick={(e) => e.stopPropagation()}
      className="minicheck"
      aria-label="Select all"
    />
  );
}

/* =========================== decline modal ============================== */

const ACTION_OPTIONS = [
  { id: "reject", label: "Reject", status: "Rejected" },
  { id: "mark", label: "Mark for Rejection", status: "Marked for Rejection" },
  { id: "keep", label: "Keep On File", status: "Kept on File" },
];

function DeclineModal({ onCancel, onConfirm, count = 1 }) {
  const [action, setAction] = useState("reject");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const selectedAction = ACTION_OPTIONS.find((a) => a.id === action);

  return (
    <div onClick={onCancel} className="fixed inset-0 z-[70] bg-black/40 grid place-items-center px-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[480px] max-w-full bg-white rounded-[12px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h3 className="text-[15px] font-semibold text-[#1a1a1a]">Decline Application</h3>
          <button onClick={onCancel} className="p-1 rounded-md text-[#888] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#E8F0FB] border border-[#C9DCF4] rounded-md">
            <Info size={13} className="text-[#023E8A] shrink-0" />
            <span className="text-[12px] text-[#1a1a1a]">
              You've selected {count} application{count === 1 ? "" : "s"}.
            </span>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-medium text-[#888] mb-2">Select Action</div>
            <div className="space-y-1.5">
              {ACTION_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#1a1a1a]">
                  <input
                    type="radio"
                    name="decline-action"
                    checked={action === opt.id}
                    onChange={() => setAction(opt.id)}
                    className="w-3.5 h-3.5 accent-[#023E8A]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-[#023E8A]">
              Application status will be marked as '{selectedAction.status}'.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa]">
          <button onClick={onCancel} className="h-9 px-4 inline-flex items-center bg-white border border-[#E2E8F0] text-[#4A5568] rounded-md text-[13px] font-medium hover:bg-[#F7FAFC]">
            Cancel
          </button>
          <button onClick={onConfirm} className="h-9 px-4 inline-flex items-center bg-[#023E8A] text-white rounded-md text-[13px] font-medium hover:bg-[#1A5EBF]">
            Decline Application{count === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
