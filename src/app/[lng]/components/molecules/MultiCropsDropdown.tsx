"use client"

import * as React from "react"
import { Sprout, ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  crops: string[]
  value: string[]                      // selected crops
  onChange: (next: string[]) => void
  methods?: string[]                   // optional: keep your method selector
  methodValue?: string | null
  onMethodChange?: (m: string | null) => void
  label?: string
}

export default function MultiCropsDropdown({
  crops,
  value,
  onChange,
  methods,
  methodValue,
  onMethodChange,
  label = "Crops",
}: Props) {
  const toggle = (c: string) => {
    const selected = new Set(value)
    if (selected.has(c)) selected.delete(c)
    else selected.add(c)
    onChange(Array.from(selected))
  }

  const selectOnly = (c: string) => onChange([c])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* icon + text only (no pill) */}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[16px] font-medium text-foreground hover:text-[#02A78B]"
        >
          <Sprout className="size-4 text-[#02A78B]" />
          {label}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="p-0">
        <div className="w-[520px] max-w-[90vw] p-4">
          {/* Crops grid */}
          <div className="mb-3 text-xs font-semibold text-muted-foreground">Crops</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {crops.map((c) => {
              const checked = value.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(c)}
                  onDoubleClick={() => selectOnly(c)}
                  className={[
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    checked ? "bg-[#E0F0ED] text-[#02A78B]" : "hover:bg-[#E0F0ED]/60",
                  ].join(" ")}
                >
                  <span className="truncate">{c}</span>
                  {checked && <Check className="size-4 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Method single-select (optional) */}
          {methods && methods.length > 0 && (
            <>
              <div className="mt-4 mb-2 text-xs font-semibold text-muted-foreground">Method</div>
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => {
                  const active = methodValue === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onMethodChange?.(m)}
                      className={[
                        "rounded-[8px] border px-3 py-1.5 text-xs",
                        active
                          ? "border-[#02A78B] bg-[#E0F0ED] text-[#02A78B]"
                          : "hover:bg-[#E0F0ED]/60",
                      ].join(" ")}
                    >
                      {m}
                    </button>
                  )
                })}
                {/* Clear method */}
                <button
                  type="button"
                  onClick={() => onMethodChange?.(null)}
                  className="rounded-[8px] border px-3 py-1.5 text-xs text-muted-foreground hover:bg-[#E0F0ED]/60"
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
