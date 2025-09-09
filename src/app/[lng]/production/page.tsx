"use client"

import ProductionFilters from "../components/organisms/ProductionFilters"
import ProductionSchedule from "../components/organisms/ProductionSchedule"
import { ProductionUIProvider } from "./ui"

export default function ProductionPage() {
  return (
    <ProductionUIProvider>
      <ProductionFilters />
      <ProductionSchedule />  {/* ← only one schedule entry point */}
    </ProductionUIProvider>
  )
}
