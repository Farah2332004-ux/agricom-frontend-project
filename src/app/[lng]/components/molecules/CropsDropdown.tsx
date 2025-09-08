// src/app/[lng]/components/molecules/CropsDropdown.tsx
"use client"

import * as React from "react"
import { Sprout, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  crops: string[]
  methods: string[]
  value: { crop: string | null; method: string | null }
  onChange?: (next: { crop: string | null; method: string | null }) => void
  label?: string
}

export default function CropsDropdown({
  crops,
  methods,
  value,
  onChange,
  label = "Crops",
}: Props) {
  const setCrop = (c: string) => onChange?.({ ...value, crop: c })
  const setMethod = (m: string) => onChange?.({ ...value, method: m })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* icon + text only */}
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
        {/* no inner border/card — just padded content */}
        <div className="w-[540px] max-w-[80vw] p-4">
          <div className="text-[13px] font-medium text-[#02A78B]">Crop</div>
          <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-2">
            {crops.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="crop"
                  className="size-3.5 accent-[#02A78B]"
                  checked={value.crop === c}
                  onChange={() => setCrop(c)}
                />
                {c}
              </label>
            ))}
          </div>

          <div className="mt-4 text-[13px] font-medium text-[#02A78B]">Growth Method</div>
          <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-2">
            {methods.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="method"
                  className="size-3.5 accent-[#02A78B]"
                  checked={value.method === m}
                  onChange={() => setMethod(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
