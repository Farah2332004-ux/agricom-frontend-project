// src/app/[lng]/components/organisms/Navbar.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const pathname = usePathname()
  const params = useParams() as { lng?: string }
  const lng = params?.lng ?? "en"

  const tabs = [
    { label: "Production", href: "/production" },
    { label: "Sales", href: "/sales" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-[#E0F0ED]">
      {/* thin top accent line */}
      <div className="h-1 w-full bg-[#0EA5FF]" />

      {/* grid: logo (left) | search (center) | tabs (right) */}
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-0 py-3">
        {/* left: logo flush-left */}
        <Link href={`/${lng}/production`} className="shrink-0 pl-6 justify-self-start" aria-label="Agricom home">
          <Image
            src="/images/agricom-logo.png"
            alt="Agricom"
            width={120}
            height={28}
            priority
            className="h-7 w-auto"
          />
        </Link>

        {/* center: search (centered) */}
        <form
          action={`/${lng}/search`}
          className="hidden md:flex w-[260px] items-center gap-2 rounded-lg bg-[#D9EFEA] px-3 py-2 justify-self-center"
        >
          {/* bigger icon */}
          <Search className="size-6 text-[#02A78B]" />
          <input
            name="q"
            placeholder="Search"
            className="w-full bg-transparent text-sm text-[#02A78B] placeholder:text-[#02A78B]/60 focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            className="h-7 rounded-md bg-[#02A78B] px-3 text-xs text-white hover:bg-[#0b8c77]"
          >
            Search
          </Button>
        </form>

        {/* right: equal-width tabs in one rectangle with a middle divider */}
        <nav className="justify-self-end pr-4 md:pr-6">
          <div className="relative inline-grid w-[200px] grid-cols-2 overflow-hidden rounded-[6px] border border-[#02A78B]">
            {tabs.map((t) => {
              const href = `/${lng}${t.href}`
              const active = pathname?.startsWith(href)
              return (
                <Link
                  key={t.href}
                  href={href}
                  className={[
                    "flex items-center justify-center px-4 py-1.5 text-[16px] font-medium transition-colors",
                    active
                      ? "bg-[#E0F0ED] text-[#02A78B]"
                      : "text-muted-foreground hover:bg-[#E0F0ED] hover:text-[#02A78B]",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              )
            })}
            {/* vertical middle divider */}
            <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-[#02A78B]" />
          </div>
        </nav>
      </div>
    </header>
  )
}
