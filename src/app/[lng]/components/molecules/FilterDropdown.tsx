// src/app/[lng]/components/molecules/FilterDropdown.tsx
"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type FilterOption = { label: string; value: string }

type Props = {
  icon?: React.ReactNode
  label: string
  options: FilterOption[]
  value: string[]
  onChange?: (next: string[]) => void
}

export default function FilterDropdown({
  icon,
  label,
  options,
  value,
  onChange,
}: Props) {
  const setChecked = (v: string, checked: boolean) => {
    const next = checked ? Array.from(new Set([...value, v])) : value.filter(x => x !== v)
    onChange?.(next)
  }

  const count = value.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex h-9 items-center gap-2 rounded-full border-[#02A78B]/50 bg-[#E0F0ED]/40 px-3 text-foreground hover:bg-[#E0F0ED]/70"
        >
          {icon}
          <span className="text-sm">{label}</span>
          {count > 0 && (
            <span className="rounded-full bg-[#02A78B] px-2 py-0.5 text-xs text-white">{count}</span>
          )}
          <ChevronDown className="size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(opt => {
          const checked = value.includes(opt.value)
          return (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={checked}
              onCheckedChange={(c) => setChecked(opt.value, !!c)}
              className="cursor-pointer"
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
