"use client";

import * as React from "react";
import {
  Sprout,
  Megaphone,
  Boxes,
  CircleDollarSign,
  Users,
  ListChecks,
  Clipboard,
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
  ShoppingCart,
  Smartphone,
  Store,
  Home,
  Utensils,
  Factory,
  Building,
} from "lucide-react";

import CropsDropdown from "../molecules/CropsDropdown";
import OrdersDropdown, { type OrdersItem } from "../molecules/OrdersDropdown";
import PromotionsDropdown, { type PromoItem } from "../molecules/PromotionsDropdown";
import ClientsDropdown, { type ClientItem } from "../molecules/ClientsDropdown";
import IndicatorToggle from "../molecules/IndicatorToggle";
import { useSalesUI } from "../../sales/ui";

const BRAND = "#02A78B";

export default function SalesFilters() {
  const ui = useSalesUI();
  const tab = ui.tab ?? "crops";

  const crops = ["Broccoli", "Tomato", "Potato", "Cabbage", "Onion", "Spinach"];
  const methods = ["Organic", "Conventional", "Hydroponic", "Open Field"];

  const ordersItems: OrdersItem[] = [
    { label: "Standing", value: "standing", icon: ShoppingBasket },
    { label: "Online shop", value: "online", icon: Receipt },
    { label: "Email Ads", value: "email", icon: Mail },
    { label: "Institutional", value: "institution", icon: Landmark },
    { label: "Pack station", value: "pack", icon: Package },
    { label: "Recipe Packs", value: "recipe", icon: BookOpen },
    { label: "Box-Based", value: "box", icon: Box },
  ];

  const promoItems: PromoItem[] = [
    { label: "Discount", value: "discount", icon: BadgePercent },
    { label: "Bundle", value: "bundle", icon: Box },
    { label: "Free Delivery", value: "free", icon: Truck },
    { label: "Flash Offer", value: "flash", icon: Flashlight },
    { label: "Reward", value: "reward", icon: Trophy },
    { label: "Pack Referral", value: "referral", icon: Share2 },
  ];

  // Clients filter sections (values map 1:1 with schedule constants)
  const CHANNELS: ClientItem[] = [
    { label: "Retailer",     value: "retailer",    icon: Store },
    { label: "Online Shop",  value: "online",      icon: Smartphone },
    { label: "Warehouse",    value: "warehouse",   icon: Home },
    { label: "HORCEA",       value: "horcea",      icon: Utensils },
    { label: "Institution",  value: "institution", icon: Landmark },
    { label: "Processor",    value: "processor",   icon: Factory },
    { label: "Association",  value: "association", icon: Users },
    { label: "Public Sector",value: "public",      icon: Building },
  ];
  const SEGMENTS: ClientItem[] = [
    { label: "VIP",         value: "vip",      icon: Users },
    { label: "Family Pack", value: "family",   icon: Users },
    { label: "Student",     value: "student",  icon: Users },
    { label: "Business",    value: "business", icon: Users },
  ];
  const PERSONAS: ClientItem[] = [
    { label: "Bulk Buyer",     value: "bulk",        icon: ShoppingBasket },
    { label: "Chef/Caterer",   value: "chef",        icon: Utensils },
    { label: "Procurement",    value: "procurement", icon: Mail },
    { label: "Health-Conscious", value: "health",    icon: BookOpen },
  ];

  const renderMainFilter = () => {
    if (tab === "clients") {
      return (
        <div className="inline-flex items-center gap-2">
          <Users className="size-4" style={{ color: BRAND }} />
          <ClientsDropdown
            label="Clients"
            value={ui.clientsSelected}
            onChange={(next) => ui.setClientsSelected(next)}
            sections={[
              { title: "Channel", items: CHANNELS },
              { title: "Segment", items: SEGMENTS },
              { title: "Persona", items: PERSONAS },
            ]}
          />
        </div>
      );
    }
    // CROPS tab (default)
    return (
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
    );
  };

  return (
    <section className="mb-3 w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-start">
        {/* Left: Filters */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-sm leading-none text-muted-foreground">
            Filter By:
          </span>

          <div className="flex flex-wrap items-center gap-5">
            {renderMainFilter()}

            {/* Orders */}
            <div className="inline-flex items-center gap-2">
              <ShoppingCart className="size-4" style={{ color: BRAND }} />
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
            {/* Order types */}
            <IndicatorToggle
              icon={ListChecks}
              label="Confirmed Orders"
              pressed={ui.showConfirmed}
              onPressedChange={(v) => ui.setShowConfirmed(v)}
            />
            <IndicatorToggle
              icon={Clipboard}
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

            {/* Metrics */}
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

            {/* Last indicator differs by tab */}
            {tab === "clients" ? (
              <IndicatorToggle
                icon={Sprout}
                label="Crop Mix"
                pressed={ui.showCropMix}
                onPressedChange={(v) => ui.setShowCropMix(v)}
              />
            ) : (
              <IndicatorToggle
                icon={Users}
                label="Channel Mix"
                pressed={ui.showChannelMix}
                onPressedChange={(v) => ui.setShowChannelMix(v)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 h-px w-full bg-[#E0F0ED]" />
    </section>
  );
}
