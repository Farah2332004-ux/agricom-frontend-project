// src/app/[lng]/components/organisms/TaskDetailsPanel.tsx
"use client";

import * as React from "react";
import {
  X,
  ChevronDown,
  ClipboardList,
  Droplets,
  ThermometerSun,
  ShieldCheck,
  Users,
  CalendarDays,
  Scissors,
  Hammer,
  Droplets as DropletsIcon,
  Sprout,
  Wheat,
  Shovel,
  FlaskConical,
  Shield,
} from "lucide-react";
import { useProductionUI } from "../../production/ui";

/* ---- Theme & layout ---- */
const BRAND = "#02A78B";
const BORDER = "#E0F0ED";
const LABEL_W = 220;   // left label column width
const CONTROL_W = 360; // fixed control width so icons/units align perfectly

type Props = { onClose: () => void };

type Field = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea";
  editable: boolean;
  options?: string[];
  placeholder?: string;
  unitRight?: string; // e.g. "m³", "kg/ha"
};

const TASK_ICON: Record<string, React.ElementType> = {
  pruning: Scissors,
  staking: Hammer,
  irrigation: DropletsIcon,
  weeding: Sprout,
  harvest: Wheat,
  "soil-prep": Shovel,
  fertilization: FlaskConical,
  protection: Shield,
  thinning: ThermometerSun, // placeholder
};

/* ---------- Field row (icons & units perfectly aligned) ---------- */
function FieldRow({
  value,
  onChange,
  field,
}: {
  value: string;
  onChange: (v: string) => void;
  field: Field;
}) {
  const numberStyle: React.CSSProperties =
    field.type === "number"
      ? ({
          WebkitAppearance: "none",
          MozAppearance: "textfield",
        } as React.CSSProperties)
      : {};

  return (
    <div
      className="grid items-center gap-4 px-4 py-2"
      style={{ gridTemplateColumns: `${LABEL_W}px ${CONTROL_W}px` }}
    >
      <div className="text-sm text-gray-600">{field.label}</div>

      <div className="relative w-[360px]">
        {field.editable ? (
          field.type === "select" ? (
            <>
              <select
                className="h-9 w-full rounded-md border px-2 pr-9 text-sm appearance-none"
                style={{ borderColor: BORDER }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              >
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {/* custom chevron (uniform X across all rows) */}
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
            </>
          ) : field.type === "textarea" ? (
            <textarea
              rows={3}
              className="w-full rounded-md border px-2 py-1.5 text-sm"
              style={{ borderColor: BORDER }}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : field.type === "date" ? (
            (() => {
              const ref = React.useRef<HTMLInputElement>(null);
              return (
                <>
                  <input
                    ref={ref}
                    type="date"
                    className="no-native-date h-9 w-full rounded-md border px-2 pr-9 text-sm appearance-none"
                    style={{ borderColor: BORDER }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  />
                  <CalendarDays
                    className="absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-gray-500"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      // @ts-ignore
                      ref.current?.showPicker?.();
                    }}
                  />
                </>
              );
            })()
          ) : (
            <>
              <input
                type={field.type}
                className="h-9 w-full rounded-md border px-2 pr-12 text-sm"
                style={{ borderColor: BORDER, ...numberStyle }}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
              {field.unitRight ? (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {field.unitRight}
                </span>
              ) : null}
            </>
          )
        ) : (
          <span className="text-sm">{value || "—"}</span>
        )}
      </div>
    </div>
  );
}

/* ---------- Inner section (accordion)
   Header uses SAME grid as rows; chevron is absolutely positioned
   at right-2 so it aligns exactly with input icons below. ---------- */
function Section({
  title,
  icon,
  children,
  defaultOpen = false, // collapsed by default
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="mt-3">
      <summary
        className="grid cursor-pointer list-none items-center px-1 py-2"
        style={{ gridTemplateColumns: `${LABEL_W}px ${CONTROL_W}px` }}
      >
        {/* left cell: icon + title */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-sm"
            style={{ background: BRAND + "22" }}
          >
            {icon}
          </span>
          <span className="text-[15px] font-semibold">{title}</span>
        </div>
        {/* right cell: position chevron to same X as input icons */}
        <div className="relative w-full">
          <ChevronDown className="absolute left-95 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
        </div>
      </summary>

      <div className="divide-y pl-1" style={{ borderColor: BORDER }}>
        {children}
      </div>
    </details>
  );
}

/* ---------- Spec per task ---------- */
function specForTask(taskKey: string) {
  const basics: Field[] = [
    { key: "taskType", label: "Task Type", type: "text", editable: false },
    { key: "method", label: "Application Method", type: "select", editable: true, options: ["Manual", "Sprayer", "Drip", "Broadcast"] },
    { key: "date", label: "Application Date", type: "date", editable: true },
    { key: "frequency", label: "Frequency", type: "select", editable: true, options: ["Once", "Weekly", "Bi-weekly", "Monthly"] },
    { key: "dosage", label: "Dosage", type: "text", editable: true, unitRight: "" },
  ];
  const water: Field[] = [
    { key: "waterType", label: "Water Source Type", type: "select", editable: true, options: ["Well", "Municipal", "Rainwater", "Surface"] },
    { key: "authId", label: "Legal Authorization ID", type: "text", editable: true },
    { key: "maxVolume", label: "Max Allowed Volume", type: "number", editable: true, unitRight: "m³" },
  ];
  const monitoring: Field[] = [
    { key: "volApplied", label: "Volume Applied", type: "number", editable: true, unitRight: "L" },
    { key: "meter", label: "Water Meter Reading", type: "number", editable: true },
    { key: "equip", label: "Equipment Status", type: "select", editable: true, options: ["OK", "Needs Maintenance", "Out of Service"] },
  ];
  const risk: Field[] = [
    { key: "weather", label: "Weather Condition", type: "select", editable: true, options: ["Sunny", "Cloudy", "Windy", "Rainy", "Hot", "Cold"] },
    { key: "riskFound", label: "Any Risk Identified", type: "select", editable: true, options: ["No", "Yes"] },
    { key: "mitigation", label: "Mitigation Action Taken", type: "textarea", editable: true, placeholder: "Describe actions taken…" },
  ];
  const training: Field[] = [
    { key: "team", label: "Team Responsible", type: "text", editable: true },
    { key: "trained", label: "Staff Trained for Irrigation", type: "select", editable: true, options: ["Yes", "No", "In Progress"] },
  ];
  return { basics, water, monitoring, risk, training };
}

function titleForTask(key: string) {
  const names: Record<string, string> = {
    pruning: "Pruning",
    staking: "Staking",
    irrigation: "Irrigation",
    weeding: "Weeding",
    harvest: "Harvest",
    "soil-prep": "Soil Preparation",
    fertilization: "Fertilization",
    protection: "Protection",
    thinning: "Thinning",
  };
  return names[key] ?? key;
}

/* ---------- One collapsible task block (collapsed by default) ---------- */
function TaskBlock({ taskKey, initial }: { taskKey: string; initial?: Record<string, string> }) {
  const ui = useProductionUI();
  const today = new Date().toISOString().slice(0, 10);

  // Prefilled defaults (editable)
  const [values, setValues] = React.useState<Record<string, string>>({
    taskType: titleForTask(taskKey),
    method: "Manual",
    date: today,
    frequency: "Once",
    dosage: "2 kg/ha",
    waterType: "Well",
    authId: "WA-458920",
    maxVolume: "120",
    volApplied: "1500",
    meter: "34920",
    equip: "OK",
    weather: "Sunny",
    riskFound: "No",
    mitigation: "N/A",
    team: "Field Crew A",
    trained: "Yes",
    ...(initial ?? {}),
  });

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  // Guarded changes -> open global ImpactDialog
  const makeOnChange = (f: Field) => (next: string) => {
    const prev = values[f.key] ?? "";

    if (f.key === "dosage") {
      const num = parseFloat(String(next).replace(/[^\d.]/g, ""));
      if (!Number.isNaN(num) && num > 3) {
        ui.openImpactDialog({
          severity: "warning",
          title: "Yield Estimate May Be Affected",
          message: `You're changing the ${f.label.toLowerCase()} to "${next}". Based on agronomic models, this may:`,
          bullets: [
            "Decrease expected yield by 12–18%",
            "Extend maturity duration by 7–10 days",
            "Increase disease risk under high humidity",
          ],
          cancelLabel: "Cancel",
          confirmLabel: "Apply Change",
          onConfirm: () => set(f.key, next),
          onCancel: () => set(f.key, prev),
        });
        return;
      }
    }

    if (f.key === "maxVolume") {
      const vol = parseFloat(next);
      if (!Number.isNaN(vol) && vol > 200) {
        ui.openImpactDialog({
          severity: "warning",
          title: "Water Use Limit Exceeded",
          message: `Proposed value: ${next} m³. This may breach local cap or irrigation plan.`,
          bullets: ["May trigger compliance review", "Increase pumping costs"],
          onConfirm: () => set(f.key, next),
          onCancel: () => set(f.key, prev),
        });
        return;
      }
    }

    set(f.key, next);
  };

  const spec = specForTask(taskKey);
  const Icon = TASK_ICON[taskKey] ?? ClipboardList;

  return (
    <details className="rounded-2xl border shadow-sm" style={{ borderColor: BRAND + "55", background: "white" }}>
      {/* header */}
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-5 py-3">
        <div className="mr-auto flex items-center gap-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: BRAND + "22" }}>
            <Icon className="size-4" style={{ color: BRAND }} />
          </span>
          <div>
            <div className="text-[15px] font-semibold" style={{ color: BRAND }}>
              {titleForTask(taskKey)}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              Assigned Compliance: <span className="text-gray-900">Global G.A.P</span> • Certification Expires 30 August 2025
            </div>
          </div>
        </div>
        <ChevronDown className="size-4 text-gray-500" />
      </summary>

      {/* body: headers stacked; chevron aligns with inputs (shared grid) */}
      <div className="flex flex-col p-3">
        <Section title="Task Basics" icon={<ClipboardList className="size-4" style={{ color: BRAND }} />}>
          {spec.basics.map((f) => (
            <FieldRow key={f.key} field={f} value={values[f.key] ?? ""} onChange={makeOnChange(f)} />
          ))}
        </Section>

        <Section title="Water Source" icon={<Droplets className="size-4" style={{ color: BRAND }} />}>
          {spec.water.map((f) => (
            <FieldRow key={f.key} field={f} value={values[f.key] ?? ""} onChange={makeOnChange(f)} />
          ))}
        </Section>

        <Section title="Monitoring" icon={<ThermometerSun className="size-4" style={{ color: BRAND }} />}>
          {spec.monitoring.map((f) => (
            <FieldRow key={f.key} field={f} value={values[f.key] ?? ""} onChange={makeOnChange(f)} />
          ))}
        </Section>

        <Section title="Environmental Risk" icon={<ShieldCheck className="size-4" style={{ color: BRAND }} />}>
          {spec.risk.map((f) => (
            <FieldRow key={f.key} field={f} value={values[f.key] ?? ""} onChange={makeOnChange(f)} />
          ))}
        </Section>

        <Section title="Training & Awareness" icon={<Users className="size-4" style={{ color: BRAND }} />}>
          {spec.training.map((f) => (
            <FieldRow key={f.key} field={f} value={values[f.key] ?? ""} onChange={makeOnChange(f)} />
          ))}
        </Section>
      </div>
    </details>
  );
}

/* ---------- Drawer Panel (slide in/out) ---------- */
export default function TaskDetailsPanel({ onClose }: Props) {
  const ui: any = useProductionUI();
  const ctx: any = ui?.taskPanelCtx;

  if (!ui?.taskPanelOpen || !ctx || !ctx.tasks || ctx.tasks.length === 0) return null;

  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);
  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 180);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`
          absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-white
          shadow-xl transition-transform duration-200
          ${show ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-3"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div className="text-base font-semibold" style={{ color: BRAND }}>
              Task Details
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays className="size-3.5" />
              {ctx.week ? <>Week {ctx.week}</> : <>All Weeks</>}
              {ctx.crop ? <span>• {ctx.crop}</span> : null}
              {ctx.groupId ? <span>• {String(ctx.groupId).toUpperCase()}</span> : null}
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close task details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="size-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {ctx.tasks.map((t: string, i: number) => (
            <TaskBlock key={`${t}-${i}`} taskKey={t} />
          ))}
        </div>
      </div>

      {/* Hide native date indicator so our overlay calendar aligns everywhere */}
      <style jsx global>{`
        input.no-native-date::-webkit-calendar-picker-indicator {
          opacity: 0;
          display: none;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        select.appearance-none::-ms-expand {
          display: none;
        }
      `}</style>
    </div>
  );
}
