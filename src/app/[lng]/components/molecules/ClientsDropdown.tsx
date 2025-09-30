"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** One selectable item */
export type ClientItem = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type Section = {
  title: string;
  items: ClientItem[];
};

type Props = {
  /** flat array of selected values */
  value: string[];
  onChange: (next: string[]) => void;
  onClearAll?: () => void;
  onSelectAll?: (all: string[]) => void;
  /** panel sections (Channel / Segment / Persona) */
  sections: Section[];
  label?: string; // defaults to "Clients"
};

const PANEL = "min-w-[620px] p-4";
const GRID  = "grid grid-cols-2 gap-2 md:grid-cols-3";
const CHIP  = "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors";
const ACTIVE= "bg-[#E0F0ED] text-[#02A78B]";

export default function ClientsDropdown({
  value,
  onChange,
  onClearAll,
  onSelectAll,
  sections,
  label = "Clients",
}: Props) {
  const toggle = (v: string) => {
    const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
    onChange(next);
  };

  const clearAll  = () => { onChange([]); onClearAll?.(); };
  const selectAll = () => {
    const all: string[] = sections.flatMap(s => s.items.map(i => i.value));
    onChange(all); onSelectAll?.(all);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[16px] font-medium hover:text-[#02A78B]"
        >
          {label}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={PANEL}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">{label}</div>
          <div className="flex items-center gap-4">
            <button className="text-[#02A78B] text-sm" onClick={selectAll}>Select all</button>
            <button className="text-[#02A78B] text-sm" onClick={clearAll}>Clear</button>
          </div>
        </div>

        {sections.map((sec) => (
          <div key={sec.title} className="mb-4 last:mb-0">
            <div className="mb-2 text-[13px] font-semibold text-[#02A78B]">{sec.title}</div>
            <div className={GRID}>
              {sec.items.map((i) => {
                const active = value.includes(i.value);
                const Icon = i.icon;
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => toggle(i.value)}
                    className={[CHIP, active ? ACTIVE : "hover:bg-[#E0F0ED]/60"].join(" ")}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    <span>{i.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
