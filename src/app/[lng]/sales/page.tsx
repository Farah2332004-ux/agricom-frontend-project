// src/app/[lng]/sales/page.tsx
"use client";

import * as React from "react";
import SalesFilters from "../components/organisms/SalesFilters";
import SalesTabs from "../components/organisms/SalesTabs";
import SalesSchedule from "../components/organisms/SalesSchedule";
import CropForecastPanel from "../components/organisms/CropForecastPanel";
import ClientForecastPanel from "../components/organisms/ClientForecastPanel";
import { visibleWeeks } from "../components/common/weeks";
import { useSalesUI } from "./ui";

/** Join array into "A", "A & B", or "A, B & C" */
function humanize(parts: string[]) {
  const xs = parts.filter(Boolean);
  if (!xs.length) return "";
  if (xs.length === 1) return xs[0]!;
  if (xs.length === 2) return `${xs[0]} & ${xs[1]}`;
  return `${xs.slice(0, -1).join(", ")} & ${xs.slice(-1)}`;
}

/** Map keys from ClientsDropdown to display labels for the “Showing …” line */
const CLIENT_LABELS: Record<string, string> = {
  // Channel
  retailer: "Retailer",
  online: "Online Shop",
  warehouse: "Warehouse",
  horcea: "HORCEA",
  institution: "Institution",
  processor: "Processor",
  association: "Association",
  public: "Public Sector",
  // Segment (extend with your exact keys/labels)
  vip: "VIP",
  family: "Family Pack",
  student: "Student",
  business: "Business",
  // Persona (extend to match your keys)
  bulk: "Bulk Buyer",
  chef: "Chef/Caterer",
  procurement: "Procurement",
  health: "Health-Conscious",
};

export default function SalesPage() {
  const ui = useSalesUI(); // ensures store is initialized

  // Left “Showing …” sentence
  const typeBits: string[] = [];
  if (ui.showConfirmed) typeBits.push("Confirmed Orders");
  if (ui.showPotential) typeBits.push("Potential Orders");
  if (ui.showExpected)  typeBits.push("Expected Orders");
  const typesLabel = typeBits.length ? humanize(typeBits) : "Orders";

  const isClients = (ui.tab ?? "crops") === "clients";

  // Crops
  const crops = ui.selectedCrops?.length ? ui.selectedCrops : [ui.crop ?? "Broccoli"];
  const cropLabel = crops.join(", ");

  // Clients (humanize selected keys)
  const clientNames = (ui.clientsSelected ?? [])
    .map((k) => CLIENT_LABELS[k])
    .filter(Boolean);
  const clientLabel = clientNames.length ? humanize(clientNames) : "All Clients";

  // Weeks and panel visibility
  const weeks = visibleWeeks(ui.weekStart, ui.window, 1, 52, true);
  const [showCropForecast, setShowCropForecast] = React.useState(true);
  const [showClientForecast, setShowClientForecast] = React.useState(true);

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-12">
      {/* Filters */}
      <SalesFilters />

      {/* Tabs row + “Showing …” on same line */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[15px]">
          Showing <b>{typesLabel}</b> for <b>{isClients ? clientLabel : cropLabel}</b>
        </p>
        <SalesTabs />
      </div>

      {/* Forecast panel (Crops or Clients) */}
      {!isClients ? (
        showCropForecast && (
          <div className="mt-3">
            <CropForecastPanel
              weeks={weeks}
              cropLabel={crops[0]}
              onClose={() => setShowCropForecast(false)}
            />
          </div>
        )
      ) : (
        showClientForecast && (
          <div className="mt-3">
            <ClientForecastPanel
              weeks={weeks}
              clientLabel={clientLabel}
              onClose={() => setShowClientForecast(false)}
            />
          </div>
        )
      )}

      {/* Main schedule */}
      <SalesSchedule />
    </main>
  );
}
