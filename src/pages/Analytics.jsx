import { TrendingDown, TrendingUp, Clock, Sparkles, DollarSign } from "lucide-react";
import { funnel, analyticsMetrics } from "../data/mockData";

function MetricCard({ icon: Icon, label, value, trend, note, good = true }) {
  const isDown = trend.startsWith("-");
  const trendGood = good ? isDown : !isDown;
  const TrendIcon = isDown ? TrendingDown : TrendingUp;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-sgi-50 text-sgi grid place-items-center">
          <Icon size={18} />
        </div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      <div
        className={`mt-2 flex items-center gap-1 text-xs font-medium ${
          trendGood ? "text-emerald-600" : "text-red-600"
        }`}
      >
        <TrendIcon size={13} /> {trend}
        <span className="text-slate-400 font-normal ml-1">{note}</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const max = Math.max(...funnel.map((s) => s.count));

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Hiring pipeline performance across all active requisitions.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Clock}
          label="Time to Screen"
          value={analyticsMetrics.timeToScreen.value}
          trend={analyticsMetrics.timeToScreen.trend}
          note={analyticsMetrics.timeToScreen.note}
        />
        <MetricCard
          icon={Clock}
          label="Time to Hire"
          value={analyticsMetrics.timeToHire.value}
          trend={analyticsMetrics.timeToHire.trend}
          note={analyticsMetrics.timeToHire.note}
        />
        <MetricCard
          icon={Sparkles}
          label="AI Accuracy"
          value={analyticsMetrics.aiAccuracy.value}
          trend={analyticsMetrics.aiAccuracy.trend}
          note={analyticsMetrics.aiAccuracy.note}
          good={false}
        />
        <MetricCard
          icon={DollarSign}
          label="Cost per Hire"
          value={analyticsMetrics.costPerHire.value}
          trend={analyticsMetrics.costPerHire.trend}
          note={analyticsMetrics.costPerHire.note}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Candidate Funnel</h2>
        <p className="text-xs text-slate-500 mb-6">
          REQ-2715 — Senior Data Analyst · Atlanta
        </p>

        <div className="space-y-4">
          {funnel.map((s, i) => {
            const pct = (s.count / max) * 100;
            const conv =
              i === 0 ? null : ((s.count / funnel[i - 1].count) * 100).toFixed(1);
            return (
              <div key={s.stage}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <div className="font-medium text-slate-800">{s.stage}</div>
                  <div className="flex items-center gap-4">
                    {conv && (
                      <span className="text-xs text-slate-400">
                        {conv}% conversion
                      </span>
                    )}
                    <span className="font-semibold text-slate-900">{s.count}</span>
                  </div>
                </div>
                <div className="h-7 bg-slate-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sgi-400 to-sgi rounded-md transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Top Knockout Reasons</h2>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Location mismatch", count: 487, pct: 62 },
              { label: "Sponsorship required", count: 142, pct: 18 },
              { label: "Experience below threshold", count: 98, pct: 12 },
              { label: "Not authorized to work", count: 61, pct: 8 },
            ].map((r) => (
              <li key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-700">{r.label}</span>
                  <span className="text-slate-500 text-xs">{r.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Time Saved vs Manual</h2>
          <div className="text-4xl font-semibold text-slate-900 mb-1">312 hrs</div>
          <div className="text-sm text-slate-500 mb-5">this quarter</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Avg. screen — AI</span>
              <span className="font-medium text-slate-900">1.4 hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg. screen — manual</span>
              <span className="font-medium text-slate-400 line-through">3.7 hrs</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
              <span className="text-slate-600">Resumes auto-screened</span>
              <span className="font-medium text-slate-900">2,113</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
