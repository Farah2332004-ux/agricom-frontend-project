// src/app/[lng]/components/common/ImpactDialog.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, OctagonX, Info, X } from "lucide-react";
import { useProductionUI } from "../../production/ui";

const BRAND = "#02A78B";

export default function ImpactDialog() {
  const { impactDialogOpen, impactConfig, closeImpactDialog } = useProductionUI();

  if (!impactDialogOpen || !impactConfig) return null;

  const {
    severity = "warning",
    title,
    message,
    bullets = [],
    confirmLabel = "Apply Change",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
  } = impactConfig;

  const Icon =
    severity === "error" ? OctagonX : severity === "info" ? Info : AlertTriangle;

  const confirm = () => {
    onConfirm?.();
    closeImpactDialog();
  };
  const cancel = () => {
    onCancel?.();
    closeImpactDialog();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={cancel} />
      {/* card */}
      <div className="absolute inset-x-0 top-[15%] mx-auto w-[min(720px,92vw)] rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon
              className="size-5"
              style={{ color: severity === "error" ? "#DC2626" : "#E11D48" }}
            />
            <h3 className="text-lg font-semibold">
              {severity === "warning" ? "Warning: " : ""}
              {title}
            </h3>
          </div>
          <button
            onClick={cancel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-gray-700">{message}</p> : null}

        {bullets.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-800">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={cancel}
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={confirm}
            className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white"
            style={{ background: BRAND }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
