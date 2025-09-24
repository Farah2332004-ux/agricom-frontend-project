// src/app/[lng]/components/organisms/SalesFilters.tsx
"use client";

import * as React from "react";
import {
  Sprout,
  Megaphone,
  Boxes,
  CircleDollarSign,
  User,
  ClipboardList,  // Orders filter icon + base for Confirmed
  Clipboard,      // base for Potential
  Zap,            // small bolt overlay
  FileClock,
  ShoppingBasket,
  Receipt,
  Mail,
  Landmark,
  Package,
  BookOpen,
  Box,
  BadgePercent,
  Truck,
  Flashlight,
  Trophy,
  Share2,
  Check,          // small check overlay
} from "lucide-react";

import CropsDropdown from "../molecules/CropsDropdown";
import OrdersDropdown, { type OrdersItem } from "../molecules/OrdersDropdown";
import PromotionsDropdown, { type PromoItem } from "../molecules/PromotionsDropdown";
import IndicatorToggle from "../molecules/IndicatorToggle";
import { useSalesUI } from "../../sales/ui";

const BRAND = "#02A78B";

/* -------- Composite icons that inherit color from the toggle (white) -------- */
const ConfirmedDocIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className="relative inline-flex">
    {/* inherits .text-white and size from parent via className */}
    <ClipboardList className={className} />
    {/* tiny white check in the corner */}
    <Check className="absolute -right-0.5 -bottom-0.5 h-3 w-3 text-white" />
  </span>
);

const PotentialDocIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className="relative inline-flex">
    <Clipboard className={className} />
    {/* tiny white bolt in the corner */}
    <Zap className="absolute -right-0.5 -bottom-0.5 h-3 w-3 text-white" />
  </span>
);

export default function SalesFilters() {
  const ui = useSalesUI();

  const crops = ["Broccoli", "Tomato", "Potato", "Cabbage", "Onion", "Spinach"];
  const methods = ["Organic", "Conventional", "Hydroponic", "Open Field"];

  // Orders (list remains the same)
  const ordersItems: OrdersItem[] = [
    { label: "Standing",     value: "standing",     icon: ShoppingBasket },
    { label: "Online shop",  value: "online",       icon: Receipt },
    { label: "Email Ads",    value: "email",        icon: Mail },
    { label: "Institutional",value: "institution",  icon: Landmark },
    { label: "Pack station", value: "pack",         icon: Package },
    { label: "Recipe Packs", value: "recipe",       icon: BookOpen },
    { label: "Box-Based",    value: "box",          icon: Box },
  ];

  // Promotions (unchanged)
  const promoItems: PromoItem[] = [
    { label: "Discount",      value: "discount", icon: BadgePercent },
    { label: "Bundle",        value: "bundle",   icon: Box },
    { label: "Free Delivery", value: "free",     icon: Truck },
    { label: "Flash Offer",   value: "flash",    icon: Flashlight },
    { label: "Reward",        value: "reward",   icon: Trophy },
    { label: "Pack Referral", value: "referral", icon: Share2 },
  ];

  return (
    <section className="mb-3 w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
        {/* Left: Filters */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-sm leading-none text-muted-foreground">
            Filter By:
          </span>

          <div className="flex flex-wrap items-center gap-5">
            {/* Crops */}
            <div className="inline-flex items-center gap-2">
              <Sprout className="size-4" style={{ color: BRAND }} />
              <CropsDropdown
                crops={crops}
                methods={methods}
                value={{ crops: ui.selectedCrops, method: null }}
                onChange={(next) => {
                  ui.setSelectedCrops(next.crops ?? []);
                  if (next.crops && next.crops.length === 1) ui.setCrop(next.crops[0]);
                }}
                onClearAll={() => ui.setSelectedCrops([])}
                onSelectAll={() => ui.setSelectedCrops(crops)}
                label="Crops"
              />
            </div>

            {/* Orders — icon matches your “clipboard” reference */}
            <div className="inline-flex items-center gap-2">
              <ClipboardList className="size-4" style={{ color: BRAND }} />
              <OrdersDropdown
                items={ordersItems}
                value={ui.ordersFilter}
                onChange={(next) => ui.setOrdersFilter(next)}
              />
            </div>

            {/* Promotions */}
            <div className="inline-flex items-center gap-2">
              <Megaphone className="size-4" style={{ color: BRAND }} />
              <PromotionsDropdown
                items={promoItems}
                value={ui.promotionsFilter}
                onChange={(next) => ui.setPromotionsFilter(next)}
                label="Promotions"
              />
            </div>
          </div>
        </div>

        {/* Right: Indicators */}
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-none text-muted-foreground">Show:</span>
          <div className="flex flex-wrap items-center gap-2">
            <IndicatorToggle
              icon={(p) => <ConfirmedDocIcon className={p.className} />}
              label="Confirmed Orders"
              pressed={ui.showConfirmed}
              onPressedChange={(v) => ui.setShowConfirmed(v)}
            />
            <IndicatorToggle
              icon={(p) => <PotentialDocIcon className={p.className} />}
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
      <div className="mt-3 h-px w-full bg-[#E0F0ED]" />
    </section>
  );
}
