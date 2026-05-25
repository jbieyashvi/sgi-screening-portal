import { createContext, useContext, useState, useCallback } from "react";
import { candidates as seedCandidates, requisitions } from "./data/mockData";

const AppCtx = createContext(null);

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
      setCandidates((cs) =>
        cs.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "Screening",
                activity: [
                  ...c.activity,
                  { date: new Date().toISOString().slice(0, 10), text: "Advanced to Screening by recruiter" },
                ],
              }
            : c
        )
      );
      showToast("Candidate advanced to Screening");
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
