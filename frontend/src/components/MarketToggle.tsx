"use client";

import { Market, Metal } from "@/lib/types";

interface Props {
  value: Market;
  metal: Metal;
  onChange: (m: Market) => void;
  disabled?: boolean;
}

export default function MarketToggle({ value, metal, onChange, disabled: globalDisabled = false }: Props) {
  const mcxDisabled = metal === "URANIUM";

  return (
    <div className={`flex gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800 ${globalDisabled ? "opacity-40" : ""}`}>
      {(["COMEX", "MCX"] as Market[]).map((m) => {
        const disabled = globalDisabled || (m === "MCX" && mcxDisabled);
        return (
          <button
            key={m}
            onClick={() => !disabled && onChange(m)}
            disabled={disabled}
            className={`px-4 py-1.5 rounded text-sm font-mono transition-all ${
              value === m
                ? "bg-blue-500/20 text-blue-400 border border-blue-500"
                : disabled
                  ? "text-gray-700 cursor-not-allowed"
                  : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {m}
            {disabled && <span className="ml-1 text-xs opacity-40">(N/A)</span>}
          </button>
        );
      })}
    </div>
  );
}
