"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number; // ms, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  info: {
    bg: "bg-paper",
    border: "border-fog",
    icon: "ℹ",
  },
  success: {
    bg: "bg-paper",
    border: "border-ink",
    icon: "✓",
  },
  warning: {
    bg: "bg-paper",
    border: "border-ink/50",
    icon: "⚠",
  },
  error: {
    bg: "bg-paper",
    border: "border-ink",
    icon: "✕",
  },
};

function Toast({ toast, onDismiss }: ToastProps) {
  const style = typeStyles[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        ${style.bg} ${style.border}
        border-2 rounded-xl shadow-museum
        max-w-md w-full
      `}
    >
      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 h-0.5 bg-ink/30"
        />
      )}

      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-ink/10 font-mono text-sm">
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{toast.title}</p>
          <p className="text-fog text-sm mt-0.5 leading-relaxed">{toast.message}</p>

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline underline-offset-4 hover:text-ink/70 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 p-1 text-fog hover:text-ink transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}

const positionStyles = {
  "top-right": "top-4 right-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export function ToastContainer({ toasts, onDismiss, position = "top-center" }: ToastContainerProps) {
  const hasToasts = toasts.length > 0;

  return (
    <>
      {/* Backdrop blur overlay */}
      <AnimatePresence>
        {hasToasts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-99 bg-ink/20 backdrop-blur-sm pointer-events-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Toast container */}
      <div
        className={`fixed z-100 flex flex-col gap-2 pointer-events-none ${positionStyles[position]}`}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onDismiss={onDismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
