// src/app/[lng]/sales/page.tsx
"use client";

import * as React from "react";
import SalesFilters from "../components/organisms/SalesFilters";
import SalesTabs from "../components/organisms/SalesTabs";
import SalesSchedule from "../components/organisms/SalesSchedule";
import CropForecastPanel from "../components/organisms/CropForecastPanel";
import ClientForecastPanel from "../components/organisms/ClientForecastPanel";
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

/** Build “client label” from selected Channel/Segment/Persona chips */
function buildClientLabel(selected: string[] | undefined): string {
  if (!selected || selected.length === 0) return "All Clients";
  const pretty = selected
    .map((s) =>
      s
        .split(/[-_]/g)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    )
    .sort();
  return humanize(pretty);
}

export default function SalesPage() {
  const ui = useSalesUI(); // ensure store is initialized

  // Indicators -> “Showing …”
  const typeBits: string[] = [];
  if (ui.showConfirmed) typeBits.push("Confirmed Orders");
  if (ui.showPotential) typeBits.push("Potential Orders");
  if (ui.showExpected)  typeBits.push("Expected Orders");
  const typesLabel = typeBits.length ? humanize(typeBits) : "Orders";

  const crops = ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"];
  const cropLabel = crops.join(", ");
  const clientLabel = buildClientLabel(ui.clientsSelected);

  // Weeks for both panels
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);

  // Panels visibility
  const [showCropForecast, setShowCropForecast] = React.useState(true);
  const [showClientForecast, setShowClientForecast] = React.useState(true);

  const contextLabel = (ui.tab ?? "crops") === "crops" ? cropLabel : clientLabel;

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-12">
      {/* Filters */}
      <SalesFilters />

      {/* Tabs row (right) + “Showing …” (left) */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[15px]">
          Showing <b>{typesLabel}</b> for <b>{contextLabel}</b>
        </p>
        <SalesTabs />
      </div>

      {/* Forecast panels */}
      {(ui.tab ?? "crops") === "crops" && showCropForecast && (
        <div className="mt-3">
          <CropForecastPanel
            weeks={weeks}
            cropLabel={crops[0]}
            onClose={() => setShowCropForecast(false)}
          />
        </div>
      )}

      {(ui.tab ?? "crops") === "clients" && showClientForecast && (
        <div className="mt-3">
          <ClientForecastPanel
            weeks={weeks}
            clientLabel={clientLabel}
            onClose={() => setShowClientForecast(false)}
          />
        </div>
      )}

      {/* Main schedule */}
      <SalesSchedule />

      {/* ===== Sales Simulator modal (available on both tabs) ===== */}
      {ui.salesSimOpen && ui.salesSimCtx && (
        <SalesSimulator
          open
          crop={ui.salesSimCtx.label}
          weeks={ui.salesSimCtx.weeks}
          baselines={ui.salesSimCtx.baselines}
          onClose={ui.closeSalesSimulator}
        />
      )}
    </main>
  );
}
