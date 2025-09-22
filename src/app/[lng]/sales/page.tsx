"use client";

import * as React from "react";
import SalesFilters from "../components/organisms/SalesFilters";
import SalesTabs from "../components/organisms/SalesTabs";
import SalesSchedule from "../components/organisms/SalesSchedule";
import { useSalesUI } from "./ui";

export default function SalesPage() {
  useSalesUI(); // initialize store
  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-12">
      <SalesFilters />
      <div className="mt-2 flex justify-end">
        <SalesTabs />
      </div>
      <SalesSchedule />
    </main>
  );
}
