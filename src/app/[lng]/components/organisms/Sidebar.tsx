// src/app/[lng]/components/organisms/Sidebar.tsx
"use client"

import { useMemo, useState } from "react"
import { usePathname, useParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import SidebarItem from "../molecules/SidebarItem"
import { mainNav, secondaryNav } from "../../menu-items/main"

function FarmGroup() {
  const pathname = usePathname()
  const params = useParams() as { lng?: string }
  const lng = params?.lng ?? "en"

  const farm = useMemo(() => mainNav.find((i) => i.href === "/farm")!, [])
  const farmActive = pathname?.startsWith(`/${lng}${farm.href}`) ?? false
  const [open, setOpen] = useState(farmActive)

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        variant="ghost"
        className={[
          // 18px Medium for top-level buttons too
          "w-full justify-start rounded-2xl px-3 py-2 text-[16px] font-medium",
          farmActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        ].join(" ")}
      >
        <div className="mr-3">
          <farm.icon className="size-5" />
        </div>
        <span className="flex-1 text-left">Farm</span>
        <ChevronDown
          className={[
            "size-4 transition-transform",
            open ? "rotate-180 text-sidebar-primary-foreground" : "",
          ].join(" ")}
        />
      </Button>

      {open && (
        <div className="space-y-1 pl-2">
          {farm.children?.map((child) => (
            <SidebarItem key={child.href} item={child} depth={1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ...imports unchanged...

// src/app/[lng]/components/organisms/Sidebar.tsx
export function SidebarDesktop() {
  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 bg-sidebar md:flex">
      <div className="flex h-full w-full flex-col">
        <ScrollArea className="flex-1">
          <div className="flex h-full flex-col px-4 pt-8 pb-4">
            {/* top section */}
            <div className="space-y-1">
              <FarmGroup />
              {mainNav
                .filter((i) => i.href !== "/farm")
                .map((item) => (
                  <SidebarItem key={item.href} item={item} depth={0} />
                ))}
            </div>

            {/* ⬇️ Pin divider + bottom group together near the bottom */}
            <div className="mt-12">
              <div className="h-px w-full bg-[var(--sidebar-border)]" />
              <div className="mt-8 mb-8 space-y-1">
                {secondaryNav.map((item) => (
                  <SidebarItem key={item.href} item={item} depth={0} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}


export function SidebarMobile() {
  return null
}
