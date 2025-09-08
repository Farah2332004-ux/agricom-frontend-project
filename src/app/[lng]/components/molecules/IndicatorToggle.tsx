"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type IndicatorToggleProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  pressed: boolean
  onPressedChange?: (next: boolean) => void
}

export default function IndicatorToggle({
  icon: Icon,
  label,
  pressed,
  onPressedChange,
}: IndicatorToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-pressed={pressed}
            onClick={() => onPressedChange?.(!pressed)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              pressed
                ? "bg-[#02A78B] text-white border-[#02A78B]"
                : "border-[#02A78B]/40 text-[#02A78B] hover:bg-[#E0F0ED]"
            )}
          >
            <Icon className="size-5" />
            <span className="sr-only">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
