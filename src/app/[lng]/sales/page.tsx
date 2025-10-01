"use client";

import * as React from "react";
import SalesFilters from "../components/organisms/SalesFilters";
import SalesTabs from "../components/organisms/SalesTabs";
import SalesSchedule from "../components/organisms/SalesSchedule";
import CropForecastPanel from "../components/organisms/CropForecastPanel";
import SalesSimulator from "../components/organisms/SalesSimulator";
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

  // Which blocks are shown
  const typeBits: string[] = [];
  if (ui.showConfirmed) typeBits.push("Confirmed Orders");
  if (ui.showPotential) typeBits.push("Potential Orders");
  if (ui.showExpected)  typeBits.push("Expected Orders");
  const typesLabel = typeBits.length ? humanize(typeBits) : "Orders";

  // Primary label depends on tab
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);
  const [showForecast, setShowForecast] = React.useState(true);

  const crops = ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"];
  const cropLabel = crops.join(", ");

  // clients summary
  const clientPicks = ui.clientsSelected ?? [];
  const clientLabel = clientPicks.length ? humanize(clientPicks) : "All Clients";

  const leftLine =
    ui.tab === "clients"
      ? `Showing ${typesLabel} for ${clientLabel}`
      : `Showing ${typesLabel} for ${cropLabel}`;

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-12">
      {/* Filters */}
      <SalesFilters />

      {/* Info + tabs row */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[15px]">{leftLine}</p>
        <SalesTabs />
      </div>

      {/* Crop forecast (only for Crops tab) */}
      {ui.tab === "crops" && showForecast && (
        <div className="mt-3">
          <CropForecastPanel
            weeks={weeks}
            cropLabel={crops[0]}
            onClose={() => setShowForecast(false)}
          />
        </div>
      )}

      {/* Schedule */}
      <SalesSchedule />

      {/* Sales Simulator (mounted once; controlled by store) */}
      {ui.salesSimOpen && ui.salesSimCtx && (
        <SalesSimulator
          open={ui.salesSimOpen}
          crop={ui.salesSimCtx.label}
          weeks={ui.salesSimCtx.weeks}
          baselines={ui.salesSimCtx.baselines}
          onClose={ui.closeSalesSimulator}
        />
      )}
    </main>
  );
}
