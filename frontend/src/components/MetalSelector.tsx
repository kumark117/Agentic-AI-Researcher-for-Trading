"use client";

import { Metal } from "@/lib/types";

const METALS: { id: Metal; label: string; symbol: string }[] = [
  { id: "GOLD",    label: "Gold",    symbol: "Au" },
  { id: "SILVER",  label: "Silver",  symbol: "Ag" },
  { id: "COPPER",  label: "Copper",  symbol: "Cu" },
  { id: "URANIUM", label: "Uranium", symbol: "U"  },
  { id: "ZINC",    label: "Zinc",    symbol: "Zn" },
];

interface Props {
  value: Metal;
  onChange: (m: Metal) => void;
  disabled?: boolean;
}

export default function MetalSelector({ value, onChange, disabled = false }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {METALS.map((m) => (
        <button
          key={m.id}
          onClick={() => !disabled && onChange(m.id)}
          disabled={disabled}
          className={`px-4 py-2 rounded border text-sm font-mono transition-all ${
            value === m.id
              ? "bg-emerald-800 border-emerald-700 text-emerald-200"
              : disabled
                ? "opacity-40 cursor-not-allowed bg-gray-900 border-emerald-900 text-emerald-400"
                : "bg-gray-900 border-emerald-900 text-emerald-400 hover:bg-emerald-900 hover:border-emerald-700 hover:text-emerald-300"
          }`}
        >
          <span className="text-xs opacity-50 mr-1">{m.symbol}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
