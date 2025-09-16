// src/app/[lng]/production/page.tsx
"use client"

import ProductionFilters from "../components/organisms/ProductionFilters"
import ProductionSchedule from "../components/organisms/ProductionSchedule"
import ImpactDialog from "../components/common/ImpactDialog";
import WeatherPanel from "../components/organisms/WeatherPanel" // <-- add
import { useProductionUI } from "./ui"

export default function ProductionPage() {
  const ui = useProductionUI()
  return (
    <>
      <ProductionFilters />
 <ImpactDialog />
      <ProductionSchedule />
    </>
  )
}
