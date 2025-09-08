"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { NavItem } from "../../menu-items/main"

type Props = { item: NavItem; depth?: 0 | 1 }

export default function SidebarItem({ item, depth = 0 }: Props) {
  const pathname = usePathname()
  const params = useParams() as { lng?: string }
  const lng = params?.lng ?? "en"

  const href = `/${lng}${item.href}`
  const active = pathname?.startsWith(href)

  const base = "group flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors"

  // Top-level & children: SAME font & size (18px Medium)
  const sameTypography = "text-[16px] font-medium"

  const topStyles =
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

  // Children: same look & hover as top-level (no pill by default)
  const childStyles =
    active
      ? "text-sidebar-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

  const disabled = item.disabled ? "opacity-50 pointer-events-none" : ""

  const cls =
    depth === 0
      ? `${base} ${sameTypography} ${topStyles}`
      : `${base} ${sameTypography} ${childStyles} ${disabled}`

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} className={cls}>
            <div className={depth === 0 ? "flex items-center justify-center" : "rounded-full bg-white/20 p-1.5"}>
              <item.icon className={depth === 0 ? "size-5" : "size-5"} />
            </div>
            <span className="truncate">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="hidden md:block">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
