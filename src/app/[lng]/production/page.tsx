"use client"

import { useState } from "react"
import ProductionFilters, { type IndicatorKey } from "../components/organisms/ProductionFilters"

export default function ProductionPage() {
  const [indicators, setIndicators] = useState<Record<IndicatorKey, boolean>>({
    weather: false,
    production: true,
    demand: false,
    loss: false,
    sort: false,
  })

  const handleIndicators = (key: IndicatorKey, value: boolean) => {
    setIndicators(prev => ({ ...prev, [key]: value }))
    // TODO: show/hide rows in your grid based on `key` & `value`
  }

  return (
    <>
      <ProductionFilters
        indicators={indicators}
        onToggleIndicator={handleIndicators}
        // onChangeSelected={(sel) => {/* use selected filters */}}
      />
      {/* ...your table... */}
    </>
  )
}
