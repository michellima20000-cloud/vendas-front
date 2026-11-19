"use client";

import { X, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/35 backdrop-blur p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <h2 id="confirm-title" className="font-display text-lg font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-primary-light hover:text-primary disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-text-secondary">{message}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-primary/10 px-5 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "btn-primary",
              variant === "destructive" && "bg-red-600 hover:bg-red-700"
            )}
          >
            {isLoading ? <LoaderCircle size={18} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}