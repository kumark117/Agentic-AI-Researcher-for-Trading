"use client";

import { useEffect, useRef } from "react";
import { LogEvent } from "@/lib/types";

const AGENT_COLOR: Record<string, string> = {
  "Price Agent":     "text-yellow-400",
  "News Agent":      "text-blue-400",
  "Technical Agent": "text-purple-400",
  "Signal Agent":    "text-emerald-400",
};

const STEP_ICON: Record<string, string> = {
  Reason:  "🔍",
  Act:     "⚙️",
  Observe: "👁",
  Output:  "✅",
  Error:   "❌",
  Aborted: "⛔",
};

interface Props {
  logs: LogEvent[];
  isConnected: boolean;
}

export default function LogPanel({ logs, isConnected }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Live Agent Logs
        </span>
        <span className={`flex items-center gap-1.5 text-xs font-mono ${isConnected ? "text-emerald-400" : "text-red-400"}`}>
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
            }`}
          />
          {isConnected ? "LIVE" : "DISCONNECTED"}
        </span>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
        {logs.length === 0 ? (
          <p className="text-gray-700 italic pt-2">Waiting for agent activity...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2 leading-5 min-w-0">
              <span className="shrink-0 w-4 text-center">
                {STEP_ICON[log.step] ?? "·"}
              </span>
              <span className={`shrink-0 w-28 truncate ${AGENT_COLOR[log.agent] ?? "text-gray-400"}`}>
                [{log.agent.replace(" Agent", "")}]
              </span>
              <span className={`shrink-0 w-14 ${log.step === "Error" || log.step === "Aborted" ? "text-red-400" : "text-yellow-400"}`}>{log.step}</span>
              <span className="text-gray-300 break-all">{log.msg}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
