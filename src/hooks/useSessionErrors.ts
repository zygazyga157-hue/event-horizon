"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { getError, ErrorCode } from "@/lib/errors";

interface UseSessionErrorsOptions {
  /** Whether to auto-redirect on session errors */
  autoRedirect?: boolean;
  /** Delay before redirect (ms) */
  redirectDelay?: number;
}

/**
 * Hook for handling session errors with toast notifications
 * Shows appropriate messages and handles redirects
 */
export function useSessionErrors(options: UseSessionErrorsOptions = {}) {
  const { autoRedirect = true, redirectDelay = 2000 } = options;
  const router = useRouter();
  const { showToast, dismissAll } = useToast();
  const hasShownError = useRef(false);

  const handleSessionExpired = useCallback(() => {
    if (hasShownError.current) return;
    hasShownError.current = true;

    const error = getError("SESSION_EXPIRED");
    
    showToast({
      type: error.type,
      title: error.title,
      message: error.message,
      duration: redirectDelay + 1000,
    });

    if (autoRedirect) {
      setTimeout(() => {
        router.push("/gate?reason=expired");
      }, redirectDelay);
    }
  }, [showToast, router, autoRedirect, redirectDelay]);

  const handleSessionInvalid = useCallback(() => {
    if (hasShownError.current) return;
    hasShownError.current = true;

    const error = getError("SESSION_INVALID");
    
    showToast({
      type: error.type,
      title: error.title,
      message: error.message,
      duration: redirectDelay + 1000,
    });

    if (autoRedirect) {
      setTimeout(() => {
        router.push("/gate?reason=invalid");
      }, redirectDelay);
    }
  }, [showToast, router, autoRedirect, redirectDelay]);

  const handleNetworkError = useCallback(() => {
    const error = getError("NETWORK_ERROR");
    
    showToast({
      type: error.type,
      title: error.title,
      message: error.message,
      duration: 5000,
      action: {
        label: "Retry",
        onClick: () => {
          window.location.reload();
        },
      },
    });
  }, [showToast]);

  const handleHeartbeatFailed = useCallback(() => {
    const error = getError("HEARTBEAT_FAILED");
    
    showToast({
      type: error.type,
      title: error.title,
      message: error.message,
      duration: 4000,
    });
  }, [showToast]);

  const showError = useCallback((code: ErrorCode) => {
    const error = getError(code);
    
    showToast({
      type: error.type,
      title: error.title,
      message: error.message,
      duration: 5000,
      action: error.actionLabel
        ? {
            label: error.actionLabel,
            onClick: () => dismissAll(),
          }
        : undefined,
    });
  }, [showToast, dismissAll]);

  const reset = useCallback(() => {
    hasShownError.current = false;
  }, []);

  return {
    handleSessionExpired,
    handleSessionInvalid,
    handleNetworkError,
    handleHeartbeatFailed,
    showError,
    reset,
  };
}
