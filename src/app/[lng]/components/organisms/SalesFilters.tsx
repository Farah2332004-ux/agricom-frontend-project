"use client";

import * as React from "react";
import {
  Sprout,
  Megaphone,
  Boxes,
  CircleDollarSign,
  User,
  FileText,
  CheckCircle2,
  Clipboard,
  Zap,
  FileClock,
  ClipboardList,
  Filter as FilterIcon,
} from "lucide-react";

import CropsDropdown from "../molecules/CropsDropdown";
import OrdersDropdown, { type OrdersItem } from "../molecules/OrdersDropdown";
import PromotionsDropdown, { type PromotionsItem } from "../molecules/PromotionsDropdown";
import IndicatorToggle from "../molecules/IndicatorToggle";
import { useSalesUI } from "../../sales/ui";

const BRAND = "#02A78B";
const BORDER = "#E0F0ED";

/** Screenshot-style icons */
const ConfirmedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className="relative inline-flex">
    <FileText className={className} />
    <CheckCircle2 className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5" style={{ color: BRAND }} />
  </span>
);
const PotentialIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className="relative inline-flex">
    <Clipboard className={className} />
    <Zap className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 text-emerald-600" />
  </span>
);

export default function SalesFilters() {
  const ui = useSalesUI();

  const crops = ["Broccoli", "Tomato", "Potato", "Cabbage", "Onion", "Spinach"];
  const methods = ["Organic","Conventional","Hydroponic","Urban","Aquaponic","Tunnel","GreenHouse","Open Field","Vertical Farming"];

  const ordersItems: OrdersItem[] = [
    { value: "standing",     label: "Standing" },
    { value: "online_shop",  label: "Online shop" },
    { value: "email_ads",    label: "Email Ads" },
    { value: "institution",  label: "Institutional" },
    { value: "pack_station", label: "Pack station" },
    { value: "recipe_packs", label: "Recipe Packs" },
    { value: "box_based",    label: "Box-Based" },
  ];
  const promosItems: PromotionsItem[] = [
    { value: "discount",     label: "Discount" },
    { value: "bundle",       label: "Bundle" },
    { value: "free_delivery",label: "Free Delivery" },
    { value: "flash_offer",  label: "Flash Offer" },
    { value: "reward",       label: "Reward" },
    { value: "pack_referral",label: "Pack Referral" },
  ];

  return (
    <section className="mb-3 w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
        {/* Left: Filters */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-sm leading-none text-muted-foreground">
            <FilterIcon className="size-4" /> Filter By:
          </span>

          <div className="flex flex-wrap items-center gap-5">
            {/* Crops */}
            <div className="inline-flex items-center gap-2">
              <Sprout className="size-4" style={{ color: BRAND }} />
              <CropsDropdown
                crops={crops}
                methods={methods}
                value={{ crops: ui.selectedCrops, method: ui.method }}
                onChange={(next) => {
                  ui.setSelectedCrops(next.crops ?? []);
                  ui.setMethod(next.method ?? null);
                  if (next.crops && next.crops.length === 1) ui.setCrop(next.crops[0]);
                }}
                onClearAll={() => { ui.setSelectedCrops([]); ui.setMethod(null); }}
                onSelectAll={() => ui.setSelectedCrops(crops)}
                label="Crops"
              />
            </div>

            {/* Orders */}
            <div className="inline-flex items-center gap-2">
              <ClipboardList className="size-4" style={{ color: BRAND }} />
              <OrdersDropdown
                items={ordersItems}
                value={ui.selectedOrders}
                onChange={(v) => ui.setSelectedOrders(v)}
                onClearAll={() => ui.setSelectedOrders([])}
                onSelectAll={() => ui.setSelectedOrders(ordersItems.map(i => i.value))}
                label="Orders"
              />
            </div>

            {/* Promotions */}
            <div className="inline-flex items-center gap-2">
              <Megaphone className="size-4" style={{ color: BRAND }} />
              <PromotionsDropdown
                items={promosItems}
                value={ui.selectedPromos}
                onChange={(v) => ui.setSelectedPromos(v)}
                onClearAll={() => ui.setSelectedPromos([])}
                onSelectAll={() => ui.setSelectedPromos(promosItems.map(i => i.value))}
                label="Promotions"
              />
            </div>
          </div>
        </div>

        {/* Right: Indicators (Show) */}
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none text-muted-foreground">Show:</span>
          <div className="flex flex-wrap items-center gap-2">
            <IndicatorToggle
              icon={ConfirmedIcon}
              label="Confirmed Orders"
              pressed={ui.showConfirmed}
              onPressedChange={(v) => ui.setShowConfirmed(v)}
            />
            <IndicatorToggle
              icon={PotentialIcon}
              label="Potential Orders"
              pressed={ui.showPotential}
              onPressedChange={(v) => ui.setShowPotential(v)}
            />
            <IndicatorToggle
              icon={FileClock}
              label="Expected Orders"
              pressed={ui.showExpected}
              onPressedChange={(v) => ui.setShowExpected(v)}
            />
            <IndicatorToggle
              icon={Boxes}
              label="Quantity"
              pressed={ui.showQuantity}
              onPressedChange={(v) => ui.setShowQuantity(v)}
            />
            <IndicatorToggle
              icon={CircleDollarSign}
              label="Revenue"
              pressed={ui.showRevenue}
              onPressedChange={(v) => ui.setShowRevenue(v)}
            />
            <IndicatorToggle
              icon={Megaphone}
              label="Promotion"
              pressed={ui.showPromoLinked}
              onPressedChange={(v) => ui.setShowPromoLinked(v)}
            />
            <IndicatorToggle
              icon={User}
              label="Channel Mix"
              pressed={ui.showChannelMix}
              onPressedChange={(v) => ui.setShowChannelMix(v)}
            />
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="mt-3 h-px w-full" style={{ background: BORDER }} />
    </section>
  );
}
