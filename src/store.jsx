import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { candidates as seedCandidates, requisitions } from "./data/mockData";

const AppCtx = createContext(null);

// recruiting pipeline progression
const STAGE_FLOW = {
  "To Review": { next: "Screening", toast: "Moved to Screening" },
  Screening: { next: "Interview", toast: "Moved to Interview" },
  Interview: { next: "Offer", toast: "Offer stage initiated" },
};

export function AppProvider({ children }) {
  const [candidates, setCandidates] = useState(seedCandidates);
  const [activeReq, setActiveReq] = useState("REQ-2715");
  const [toasts, setToasts] = useState([]);
  const [notesByCandidate, setNotesByCandidate] = useState({}); // { [id]: [{id,text,ts,author}] }

  const addNote = useCallback((cid, text) => {
    const t = text.trim();
    if (!t) return;
    const note = { id: Math.random().toString(36).slice(2), text: t, ts: Date.now(), author: "Candace W." };
    setNotesByCandidate((m) => ({ ...m, [cid]: [...(m[cid] || []), note] }));
  }, []);

  const deleteNote = useCallback((cid, nid) => {
    setNotesByCandidate((m) => ({ ...m, [cid]: (m[cid] || []).filter((n) => n.id !== nid) }));
  }, []);

  // always-current snapshot so action handlers can read a candidate synchronously
  const candidatesRef = useRef(candidates);
  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type, leaving: false }]);
    // mark leaving (fade out) after 2s, remove after the exit animation
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    }, 2000);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2250);
  }, []);

  const advanceCandidate = useCallback(
    (id) => {
      const c = candidatesRef.current.find((x) => x.id === id);
      const step = c && STAGE_FLOW[c.status];
      if (!c || !step) return;
      setCandidates((cs) =>
        cs.map((x) =>
          x.id === id
            ? {
                ...x,
                status: step.next,
                activity: [
                  ...x.activity,
                  { date: new Date().toISOString().slice(0, 10), text: `Advanced to ${step.next} by recruiter` },
                ],
              }
            : x
        )
      );
      showToast(`${c.name} moved to ${step.next}`);
    },
    [showToast]
  );

  const setCandidateStage = useCallback((id, stage) => {
    setCandidates((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              status: stage,
              activity: [
                ...c.activity,
                { date: new Date().toISOString().slice(0, 10), text: `Moved to ${stage} by recruiter` },
              ],
            }
          : c
      )
    );
  }, []);

  const restoreCandidate = useCallback(
    (id) => {
      setCandidates((cs) =>
        cs.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "To Review",
                activity: [
                  ...c.activity,
                  { date: new Date().toISOString().slice(0, 10), text: "Restored to To Review by recruiter" },
                ],
              }
            : c
        )
      );
      const c = candidatesRef.current.find((x) => x.id === id);
      showToast(`${c ? c.name : "Candidate"} restored to To Review`);
    },
    [showToast]
  );

  const declineCandidate = useCallback(
    (id) => {
      setCandidates((cs) =>
        cs.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "Declined",
                activity: [
                  ...c.activity,
                  { date: new Date().toISOString().slice(0, 10), text: "Declined by recruiter" },
                ],
              }
            : c
        )
      );
      showToast("Application declined successfully", "error");
    },
    [showToast]
  );

  return (
    <AppCtx.Provider
      value={{
        candidates,
        requisitions,
        activeReq,
        setActiveReq,
        advanceCandidate,
        setCandidateStage,
        restoreCandidate,
        declineCandidate,
        notesByCandidate,
        addNote,
        deleteNote,
        toasts,
        showToast,
      }}
    >
      {children}
      <ToastStack toasts={toasts} />
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-2.5">
      {toasts.map((t) => {
        const error = t.type === "error";
        return (
          <div
            key={t.id}
            className={`${t.leaving ? "toast-out" : "toast-in"} flex items-center gap-2.5 min-w-[240px] max-w-[340px] px-4 py-3 rounded-lg bg-white border-l-4 text-[13px] font-medium text-[#1E293B] shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
              error ? "border-[#DC2626]" : "border-[#023E8A]"
            }`}
          >
            {error ? (
              <X size={16} className="shrink-0 text-[#DC2626]" />
            ) : (
              <Check size={16} className="shrink-0 text-[#023E8A]" />
            )}
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
