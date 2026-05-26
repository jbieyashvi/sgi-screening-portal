import { useRef, useState } from "react";
import { Upload as UploadIcon, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useApp } from "../store";

export default function Upload() {
  const { showToast } = useApp();
  const [drag, setDrag] = useState(false);
  const [items, setItems] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const next = Array.from(files).map((f, i) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      progress: 0,
      status: "uploading",
    }));
    setItems((s) => [...next, ...s]);

    next.forEach((item) => {
      const total = 3000 + Math.random() * 1000;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, Math.round((elapsed / total) * 100));
        setItems((cur) =>
          cur.map((c) => (c.id === item.id ? { ...c, progress: pct } : c))
        );
        if (pct < 100) {
          setTimeout(tick, 80);
        } else {
          setItems((cur) =>
            cur.map((c) =>
              c.id === item.id ? { ...c, status: "done", progress: 100 } : c
            )
          );
          showToast(`${item.name} vectorized`);
        }
      };
      tick();
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Upload Resumes</h1>
      <p className="text-slate-500 text-sm mb-6">
        Drop PDFs, bulk uploads, or ZIPs. AI vectorizes each resume and links it to
        the active requisition.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          drag
            ? "border-sgi bg-sgi-50"
            : "border-slate-300 bg-white hover:border-sgi-300 hover:bg-sgi-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.zip"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 rounded-full bg-sgi-50 text-sgi grid place-items-center mx-auto mb-4">
          <UploadIcon size={24} />
        </div>
        <div className="font-semibold text-slate-900 mb-1">
          Drag and drop resumes here
        </div>
        <div className="text-sm text-slate-500 mb-4">
          PDF, ZIP, or bulk uploads · max 200MB
        </div>
        <button className="h-8 px-3.5 inline-flex items-center bg-[#023E8A] text-white rounded-md text-[13px] font-medium hover:bg-[#1A5EBF]">
          Browse files
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 text-sm font-semibold text-slate-900">
            Processing ({items.length})
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((it) => (
              <div key={it.id} className="px-5 py-3 flex items-center gap-3">
                <FileText size={18} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {it.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {it.status === "done" ? "Vectorized" : `${it.progress}%`}
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        it.status === "done" ? "bg-emerald-500" : "bg-sgi"
                      }`}
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                </div>
                {it.status === "done" ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Loader2 size={18} className="text-sgi animate-spin shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
