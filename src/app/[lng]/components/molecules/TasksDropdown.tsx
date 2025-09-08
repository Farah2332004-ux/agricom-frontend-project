"use client"

import * as React from "react"
import { ClipboardList, ChevronDown, Hammer } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type TaskItem = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }> // optional; we’ll fall back if missing
}

type Props = {
  tasks: TaskItem[]
  value: string[]
  onChange?: (next: string[]) => void
  label?: string
}

export default function TasksDropdown({
  tasks,
  value,
  onChange,
  label = "Tasks",
}: Props) {
  const toggle = (v: string) => {
    const next = value.includes(v) ? value.filter((x) => x !== v) : [...value, v]
    onChange?.(next)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* icon + text only (no pill) */}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[16px] font-medium text-foreground hover:text-[#02A78B]"
        >
          <ClipboardList className="size-4 text-[#02A78B]" />
          {label}
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="p-0">
        <div className="w-[520px] max-w-[80vw] p-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {tasks.map((t) => {
              // Safe fallback so we never crash if an icon is undefined
              const Icon =
                (t.icon ?? Hammer) as React.ComponentType<{ className?: string }>
              const selected = value.includes(t.value)
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggle(t.value)}
                  className={[
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    selected
                      ? "bg-[#E0F0ED] text-[#02A78B]"
                      : "hover:bg-[#E0F0ED]/60",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
