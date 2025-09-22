"use client";

import * as React from "react";
import { useSalesUI } from "../../sales/ui";
import { Sprout, Users } from "lucide-react";

const BRAND = "#02A78B";
const BORDER = "#E0F0ED";

export default function SalesTabs() {
  const { tab, setTab } = useSalesUI();

  const Btn: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
  }> = ({ active, onClick, icon: Icon, label }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-4 py-1.5 text-sm transition-colors",
        "rounded-lg", // ⬅ smaller radius than full
        active ? "text-white" : "text-gray-700 hover:text-black",
      ].join(" ")}
      style={{ background: active ? BRAND : "transparent" }}
      role="tab"
      aria-selected={active}
    >
      <Icon className={active ? "size-4 text-white" : "size-4"} />
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className="inline-flex p-0.5"
      style={{
        border: `1px solid ${BORDER}`,
        background: "#F8FBFA",
        borderRadius: 12, // ⬅ smaller container radius
      }}
      role="tablist"
      aria-label="Sales view tabs"
    >
      <Btn active={tab === "crops"} onClick={() => setTab("crops")} icon={Sprout} label="Crops" />
      <Btn active={tab === "clients"} onClick={() => setTab("clients")} icon={Users} label="Clients" />
    </div>
  );
}
