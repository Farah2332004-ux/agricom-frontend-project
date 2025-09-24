// src/app/[lng]/sales/page.tsx
"use client";

import * as React from "react";
import SalesFilters from "../components/organisms/SalesFilters";
import SalesTabs from "../components/organisms/SalesTabs";
import SalesSchedule from "../components/organisms/SalesSchedule";
import CropForecastPanel from "../components/organisms/CropForecastPanel";
import { visibleWeeks } from "../components/common/weeks";
import { useSalesUI } from "./ui";

/** Join array into "A", "A & B", or "A, B & C" */
function humanize(parts: string[]) {
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} & ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} & ${parts.slice(-1)}`;
}

export default function SalesPage() {
  const ui = useSalesUI(); // ensure store is initialized

  // Build the “Showing …” line (only general info)
  const typeBits: string[] = [];
  if (ui.showConfirmed) typeBits.push("Confirmed Orders");
  if (ui.showPotential) typeBits.push("Potential Orders");
  if (ui.showExpected)  typeBits.push("Expected Orders");

  const typesLabel = typeBits.length ? humanize(typeBits) : "Orders";
  const crops = ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"];
  const cropLabel = crops.join(", ");

  // Forecast weeks (same helper as production)
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);
  const [showForecast, setShowForecast] = React.useState(true);

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-12">
      {/* Filters (same unified style as Production) */}
      <SalesFilters />

      {/* Tabs row (right-aligned tabs) + “Showing …” text on the same row (left) */}
      <div className="mt-2 flex items-center justify-between">
        {/* Keep same style as the production text line, but only general info */}
        <p className="text-[15px]">
          Showing <b>{typesLabel}</b> for <b>{cropLabel}</b>
        </p>

        {/* Tabs on the right */}
        <SalesTabs />
      </div>

      {/* Crop Forecast (under the tabs/info row). Click X collapses it. */}
      {showForecast && (
        <div className="mt-3">
          <CropForecastPanel
            weeks={weeks}
            cropLabel={crops[0]}
            onClose={() => setShowForecast(false)}
          />
        </div>
      )}

      {/* Main schedule */}
      <SalesSchedule />
    </main>
  );
}
