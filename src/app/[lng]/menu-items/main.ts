// src/app/[lng]/menu-items/main.ts
import type { ComponentType } from "react"
import {
  Home, Sprout, ShoppingCart, User, Settings, HelpCircle,
  BarChart3, Share2, Leaf, DollarSign, ChevronDown
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  children?: NavItem[]
  disabled?: boolean
}

export const mainNav: NavItem[] = [
  {
    label: "Farm",
    href: "/farm",
    icon: Home,
    children: [
      { label: "Plots",       href: "/farm/plots",       icon: BarChart3 },
      { label: "Partitions",  href: "/farm/partitions",  icon: Share2,    disabled: true },
      { label: "Crops",       href: "/farm/crops",       icon: Leaf,      disabled: true },
      { label: "Results",     href: "/farm/results",     icon: DollarSign,disabled: true },
    ],
  },
  { label: "Production", href: "/production", icon: Sprout },
  { label: "Sales",      href: "/sales",      icon: ShoppingCart },
]

export const secondaryNav: NavItem[] = [
  { label: "Profile",    href: "/profile",    icon: User },
  { label: "Settings",   href: "/settings",   icon: Settings },
  { label: "Help & Support", href: "/help",   icon: HelpCircle },
]
