"use client";

import { useRef, useState } from "react";
import LogPanel from "@/components/LogPanel";
import MarketToggle from "@/components/MarketToggle";
import MetalSelector from "@/components/MetalSelector";
import SignalCard from "@/components/SignalCard";
import { useSSE } from "@/lib/useSSE";
import { Market, Metal, Signal } from "@/lib/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const [metal, setMetal]       = useState<Metal>("GOLD");
  const [market, setMarket]     = useState<Market>("COMEX");
  const [isLoading, setLoading] = useState(false);
  const [signal, setSignal]     = useState<Signal | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const { logs, isConnected, clearLogs } = useSSE(`${BACKEND_URL}/stream/logs`);
  const abortedRef = useRef(false);

  const reset = () => { setSignal(null); setError(null); clearLogs(); };

  const handleAbort = async () => {
    abortedRef.current = true;
    try { await fetch("/api/abort", { method: "POST" }); } catch { /* expected */ }
    setLoading(false);
    setSignal(null);
    setError(null);
    // leave logs visible so user can see what ran before abort
  };

  const handleMetalChange = (m: Metal) => {
    setMetal(m);
    if (m === "URANIUM" && market === "MCX") setMarket("COMEX");
    reset();
  };

  const handleMarketChange = (m: Market) => { setMarket(m); reset(); };

  const handleRun = async () => {
    abortedRef.current = false;
    setLoading(true);
    setSignal(null);
    setError(null);
    clearLogs();

    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metal, market }),
      });
      const data: Signal = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      setSignal(data);
    } catch (e) {
      if (!abortedRef.current) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col font-mono overflow-hidden">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Agentic AI Researcher for Trading (MCP)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Gold · Silver · Copper · Uranium · Zinc — COMEX / MCX
            </p>
          </div>
          <a
            href="/how-it-works"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded border border-emerald-900 text-emerald-400 text-xs hover:bg-emerald-900 hover:border-emerald-700 hover:text-emerald-300 transition-all"
          >
            How does it work?! ↗
          </a>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className="sticky top-[57px] z-10 border-b border-gray-800 bg-gray-950 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <MetalSelector value={metal} onChange={handleMetalChange} disabled={isLoading} />
          <MarketToggle  value={market} metal={metal} onChange={handleMarketChange} disabled={isLoading} />

          {isLoading ? (
            <button
              onClick={handleAbort}
              className="px-6 py-2 rounded text-sm font-bold transition-all bg-red-900 hover:bg-red-800 border border-red-700 text-red-300 hover:text-red-200"
            >
              ⛔ Abort
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="px-6 py-2 rounded text-sm font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black"
            >
              ▶  Run Research
            </button>
          )}

          {error && (
            <span className="text-red-400 text-xs">Error: {error}</span>
          )}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-[28rem] lg:min-h-0">
          <LogPanel logs={logs} isConnected={isConnected} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-[28rem] lg:min-h-0">
          <SignalCard signal={signal} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
