import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RefreshCw, Search } from "lucide-react";

/**
 * Multi-select requisition dropdown.
 * Used in Screening (header) and Dashboard (top-right filter).
 *
 * Props:
 *   value:           Set<string>          committed selection (empty = all)
 *   onChange:        (Set) => void        fired on Apply
 *   requisitions:    [{ id, title, adpSync? }]
 *   counts:          { [id]: number }
 *   totalCount:      number               shown next to the "All" row
 *   onSyncAdp:       () => void           optional Sync ADP handler
 *   allLabel:        string               row label for "All ..." (default "All Job Openings")
 *   emptyButtonLabel: string              trigger label when nothing selected (defaults to allLabel)
 *   align:           "left" | "right"     dropdown alignment (default "left")
 */
export default function ReqMultiSelect({
  value,
  onChange,
  requisitions,
  counts = {},
  totalCount = 0,
  onSyncAdp,
  allLabel = "All Job Openings",
  emptyButtonLabel,
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => new Set(value));
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const openWithDraft = () => {
    setDraft(new Set(value));
    setSearch("");
    setOpen((o) => !o);
  };

  const buttonLabel = (() => {
    if (value.size === 0) return emptyButtonLabel || allLabel;
    if (value.size === 1) {
      const id = [...value][0];
      const r = requisitions.find((x) => x.id === id);
      return r ? `${r.id} — ${r.title}` : id;
    }
    return `${value.size} Requisitions Selected`;
  })();

  const q = search.trim().toLowerCase();
  const visible = q
    ? requisitions.filter((r) => `${r.id} ${r.title}`.toLowerCase().includes(q))
    : requisitions;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openWithDraft}
        className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[13px] transition ${
          open
            ? "border-sgi-300 bg-sgi-50 text-sgi"
            : "border-[#E2E8F0] text-[#4A5568] hover:bg-[#F7FAFC]"
        }`}
      >
        <span className="font-medium truncate max-w-[260px]">{buttonLabel}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1 z-30 w-[320px] bg-white border border-[#E2E8F0] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex flex-col ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* sticky search */}
          <div className="p-2 border-b border-[#f0f0f0]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa5b1]" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requisitions…"
                className="w-full pl-7 pr-2.5 py-1.5 border border-[#E2E8F0] rounded-md text-[13px] text-[#1a1a1a] placeholder:text-[#9aa5b1] focus:outline-none focus:border-sgi-400"
              />
            </div>
          </div>

          {/* options */}
          <div className="max-h-[300px] overflow-auto p-1">
            <Row
              checked={draft.size === 0}
              onToggle={() => setDraft(new Set())}
              label={allLabel}
              count={totalCount}
            />
            {visible.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-[#9aa5b1] text-center">No requisitions found</div>
            )}
            {visible.map((r) => (
              <Row
                key={r.id}
                checked={draft.has(r.id)}
                onToggle={() =>
                  setDraft((prev) => {
                    const next = new Set(prev);
                    next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                    return next;
                  })
                }
                label={`${r.id} — ${r.title}`}
                count={counts[r.id] ?? 0}
                sync={r.adpSync}
              />
            ))}
          </div>

          {/* footer actions */}
          <div className="border-t border-[#f0f0f0] px-3 py-2 flex items-center justify-between">
            <button
              onClick={() => setDraft(new Set())}
              className="text-[12px] text-[#6B7280] hover:text-[#1a1a1a] hover:underline"
            >
              Clear
            </button>
            <button
              onClick={() => { onChange(new Set(draft)); setOpen(false); }}
              className="h-7 px-3 rounded-md bg-[#023E8A] text-white text-[12px] font-medium hover:bg-[#1A5EBF] transition"
            >
              Apply
            </button>
          </div>

          {/* sync adp */}
          {onSyncAdp && (
            <div className="border-t border-[#f0f0f0] p-1">
              <button
                onClick={() => { onSyncAdp(); setOpen(false); }}
                className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium text-sgi hover:bg-[#E8F0FB] transition"
              >
                <RefreshCw size={13} /> Sync ADP now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ checked, onToggle, label, count, sync }) {
  const syncDot =
    sync === "Synced" ? "bg-green-500" : sync === "Pending" ? "bg-orange-400" : "bg-[#cbd5e0]";
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-md px-2.5 py-2 flex items-center gap-2 transition ${
        checked ? "bg-sgi-50" : "hover:bg-[#E8F0FB]"
      }`}
    >
      <span
        className={`w-[14px] h-[14px] rounded border grid place-items-center shrink-0 transition ${
          checked ? "bg-[#023E8A] border-[#023E8A]" : "bg-white border-[#cbd5e0]"
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} className="text-white" />}
      </span>
      <span className="flex-1 text-[13px] text-[#1a1a1a] truncate">
        <span className={checked ? "font-semibold" : "font-medium"}>{label}</span>{" "}
        <span className="text-[#9aa5b1] font-normal">({count})</span>
      </span>
      {sync && <span className={`w-2 h-2 rounded-full shrink-0 ${syncDot}`} title={`ADP: ${sync}`} />}
    </button>
  );
}
