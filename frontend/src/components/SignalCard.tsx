"use client";

import { Signal, SignalDirection } from "@/lib/types";

const STYLES: Record<SignalDirection, { border: string; text: string; bg: string }> = {
  BUY:  { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  SELL: { border: "border-red-500",     text: "text-red-400",     bg: "bg-red-500/10"     },
  HOLD: { border: "border-yellow-500",  text: "text-yellow-400",  bg: "bg-yellow-500/10"  },
};

interface Props {
  signal: Signal | null;
  isLoading: boolean;
}

export default function SignalCard({ signal, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="text-3xl animate-spin inline-block">⚙</div>
          <p className="text-gray-400 font-mono text-sm">Agents running...</p>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-700 font-mono text-sm italic text-center px-6">
          Select a metal and market, then click Run Research.
        </p>
      </div>
    );
  }

  if (signal.error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-red-400 font-mono text-sm">Error: {signal.error}</p>
      </div>
    );
  }

  const s = STYLES[signal.signal] ?? STYLES.HOLD;
  const confidencePct = Math.round(signal.confidence * 100);

  return (
    <div className={`border ${s.border} ${s.bg} rounded-lg p-5 h-full overflow-y-auto`}>
      {/* Signal header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`text-5xl font-bold font-mono tracking-tight ${s.text}`}>
            {signal.signal}
          </div>
          <div className="text-gray-400 font-mono text-sm mt-1">
            {signal.asset} · {signal.market}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 font-mono text-xs">Confidence</div>
          <div className={`text-2xl font-bold font-mono ${s.text}`}>{confidencePct}%</div>
        </div>
      </div>

      {/* Price strip */}
      {signal.price_data?.price != null && (
        <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-800">
          <div className="text-gray-600 font-mono text-xs mb-1">PRICE</div>
          <div className="flex items-baseline gap-3">
            <span className="text-white font-mono text-lg">
              ${signal.price_data.price.toLocaleString()}
            </span>
            <span
              className={`font-mono text-sm ${
                (signal.price_data.change_pct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {(signal.price_data.change_pct ?? 0) >= 0 ? "+" : ""}
              {signal.price_data.change_pct?.toFixed(2)}%
            </span>
          </div>
          {signal.price_data.price_inr != null && (
            <div className="text-gray-500 font-mono text-xs mt-1">
              ≈ ₹{signal.price_data.price_inr.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Rationale */}
      <div className="mb-3">
        <div className="text-gray-600 font-mono text-xs mb-1">RATIONALE</div>
        <p className="text-gray-300 text-sm leading-relaxed">{signal.rationale}</p>
      </div>

      {/* Three summaries */}
      <div className="space-y-2 mb-3">
        {[
          { label: "TECHNICAL", val: signal.technical_summary },
          { label: "SENTIMENT", val: signal.sentiment_summary },
          { label: "PRICE",     val: signal.price_summary     },
        ].map(({ label, val }) => (
          <div key={label} className="p-2 bg-gray-900/60 rounded border border-gray-800/60">
            <span className="text-gray-600 font-mono text-xs">{label}: </span>
            <span className="text-gray-400 text-xs">{val}</span>
          </div>
        ))}
      </div>

      {/* Risk flags */}
      {signal.risk_flags?.length > 0 && (
        <div className="mb-3">
          <div className="text-gray-600 font-mono text-xs mb-1">RISK FLAGS</div>
          <ul className="space-y-1">
            {signal.risk_flags.map((flag, i) => (
              <li key={i} className="flex gap-2 text-xs text-yellow-400/80">
                <span className="shrink-0">⚠</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-gray-700 font-mono text-xs mt-4 pt-2 border-t border-gray-800">
        {new Date(signal.generated_at).toLocaleString()}
      </div>
    </div>
  );
}
