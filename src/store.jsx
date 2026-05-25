import { createContext, useContext, useState, useCallback } from "react";
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

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const advanceCandidate = useCallback(
    (id) => {
      let toast = null;
      setCandidates((cs) =>
        cs.map((c) => {
          if (c.id !== id) return c;
          const step = STAGE_FLOW[c.status];
          if (!step) return c;
          toast = step.toast;
          return {
            ...c,
            status: step.next,
            activity: [
              ...c.activity,
              { date: new Date().toISOString().slice(0, 10), text: `Advanced to ${step.next} by recruiter` },
            ],
          };
        })
      );
      if (toast) showToast(toast);
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
      showToast("Candidate restored to To Review");
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
      showToast("Application declined successfully");
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
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-sgi-50 border-sgi-200 text-sgi-700"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
