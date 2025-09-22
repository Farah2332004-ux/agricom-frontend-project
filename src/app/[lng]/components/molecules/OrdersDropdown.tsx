"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type OrdersFilterItem = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type Props = {
  items: OrdersFilterItem[];
  value?: string[];
  onChange?: (next: string[]) => void;
  onClearAll?: () => void;
  onSelectAll?: (all: string[]) => void;
  label?: string;
};

const PANEL = "min-w-[520px] p-4";
const GRID  = "grid grid-cols-2 gap-2 md:grid-cols-3";
const CHIP  = "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors";
const ACTIVE= "bg-[#E0F0ED] text-[#02A78B]";

export default function OrdersDropdown({
  items,
  value = [],
  onChange = () => {},
  onClearAll,
  onSelectAll,
  label = "Orders",
}: Props) {
  const selected = value;

  const toggle = (v: string) => {
    const next = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    onChange(next);
  };

  const clearAll  = () => { onChange([]); onClearAll?.(); };
  const selectAll = () => {
    const all = items.map((i) => i.value);
    onChange(all);
    onSelectAll?.(all);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex items-center gap-2 text-[16px] font-medium hover:text-[#02A78B]">
          {label}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={PANEL}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Orders Filter</div>
          <div className="flex items-center gap-4">
            <button className="text-[#02A78B] text-sm" onClick={selectAll}>Select all</button>
            <button className="text-[#02A78B] text-sm" onClick={clearAll}>Clear</button>
          </div>
        </div>

        <div className={GRID}>
          {items.map((i) => {
            const active = selected.includes(i.value);
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
