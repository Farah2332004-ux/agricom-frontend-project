"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CropsValue = { crops: string[]; method: string | null };

type Props = {
  crops: string[];
  methods: string[];
  value?: Partial<CropsValue>;
  onChange: (next: CropsValue) => void;
  onClearAll?: () => void;
  onSelectAll?: (all: string[]) => void;
  label?: string;
};

const PANEL = "min-w-[560px] p-4";
const GRID  = "grid grid-cols-2 gap-3";
const CHIP  = "inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-sm hover:bg-[#E0F0ED]/60";
const ACTIVE= "border-[#02A78B] bg-[#E0F0ED] text-[#02A78B]";

export default function CropsDropdown({
  crops: cropList,
  methods,
  value: rawValue,
  onChange,
  onClearAll,
  onSelectAll,
  label = "Crops",
}: Props) {
  const value: CropsValue = {
    crops: rawValue?.crops ?? [],
    method: rawValue?.method ?? null,
  };

  const selected = new Set(value.crops);
  const method = value.method;

  const toggleCrop = (c: string) => {
    const next = new Set(selected);
    next.has(c) ? next.delete(c) : next.add(c);
    onChange({ crops: Array.from(next), method });
  };

  const setMethod = (m: string | null) => onChange({ crops: Array.from(selected), method: m });

  const clearAll = () => {
    onChange({ crops: [], method: null });
    onClearAll?.();
  };
  const selectAll = () => {
    onChange({ crops: [...cropList], method });
    onSelectAll?.(cropList);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* label + chevron so the down arrow always shows */}
        <button className="inline-flex items-center gap-2 text-[16px] font-medium hover:text-[#02A78B]">
          {label}
          {selected.size ? <span className="opacity-70 text-sm">({selected.size})</span> : null}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={PANEL}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Crops</div>
          <div className="flex items-center gap-4">
            <button className="text-[#02A78B] text-sm" onClick={selectAll}>Select all</button>
            <button className="text-[#02A78B] text-sm" onClick={clearAll}>Clear</button>
          </div>
        </div>

        <div className={`${GRID} mb-4`}>
          {cropList.map((c) => {
            const active = selected.has(c);
            return (
              <button
                key={c}
                type="button"
                className={`${CHIP} justify-start ${active ? ACTIVE : ""}`}
                onClick={() => toggleCrop(c)}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="text-sm font-medium mb-2">Method</div>
        <div className={GRID}>
          {[...methods, "Clear"].map((m) => {
            const isClear = m === "Clear";
            const active  = !isClear && method === m;
            return (
              <button
                key={m}
                type="button"
                className={`${CHIP} ${active ? ACTIVE : ""}`}
                onClick={() => setMethod(isClear ? null : m)}
              >
                {m}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
