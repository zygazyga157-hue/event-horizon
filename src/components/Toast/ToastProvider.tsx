"use client";

import { createContext, useContext, useCallback, useState, ReactNode } from "react";
import { ToastContainer, ToastData } from "./Toast";

interface ToastContextValue {
  showToast: (options: Omit<ToastData, "id">) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((options: Omit<ToastData, "id">) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: ToastData = {
      ...options,
      id,
      duration: options.duration ?? 5000, // Default 5 seconds
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} position="top-center" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Convenience hooks for common toast types
export function useToastActions() {
  const { showToast, dismissToast, dismissAll } = useToast();

  return {
    info: (title: string, message: string, options?: Partial<ToastData>) =>
      showToast({ type: "info", title, message, ...options }),
    success: (title: string, message: string, options?: Partial<ToastData>) =>
      showToast({ type: "success", title, message, ...options }),
    warning: (title: string, message: string, options?: Partial<ToastData>) =>
      showToast({ type: "warning", title, message, ...options }),
    error: (title: string, message: string, options?: Partial<ToastData>) =>
      showToast({ type: "error", title, message, ...options }),
    dismiss: dismissToast,
    dismissAll,
  };
}
