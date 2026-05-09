"use client";

import { useEffect, useRef, useState } from "react";
import { LogEvent } from "./types";

export function useSSE(url: string) {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.onmessage = (e: MessageEvent) => {
      try {
        const event: LogEvent = JSON.parse(e.data as string);
        if (event.type === "ping") return;
        setLogs((prev) => [...prev, event]);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => setIsConnected(false);

    return () => {
      es.close();
    };
  }, [url]);

  const clearLogs = () => setLogs([]);

  return { logs, isConnected, clearLogs };
}
