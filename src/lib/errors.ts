/**
 * Error codes and messages for the Event Horizon Gallery
 * Each error has a code, title, message, and optional action
 */

export type ErrorCode =
  | "SESSION_EXPIRED"
  | "SESSION_INVALID"
  | "SESSION_ERROR"
  | "NETWORK_ERROR"
  | "CAPACITY_FULL"
  | "RATE_LIMITED"
  | "CHECKIN_FAILED"
  | "HEARTBEAT_FAILED"
  | "QUEUE_ERROR"
  | "UNKNOWN";

export interface ErrorDefinition {
  code: ErrorCode;
  title: string;
  message: string;
  type: "error" | "warning" | "info";
  actionLabel?: string;
}

export const errorDefinitions: Record<ErrorCode, ErrorDefinition> = {
  SESSION_EXPIRED: {
    code: "SESSION_EXPIRED",
    title: "Session Expired",
    message: "Your gallery session has timed out due to inactivity. Please check in again to continue browsing.",
    type: "warning",
    actionLabel: "Check In Again",
  },
  SESSION_INVALID: {
    code: "SESSION_INVALID",
    title: "Invalid Session",
    message: "Your session token is no longer valid. This may happen if you cleared your cookies or opened the site in a different browser.",
    type: "error",
    actionLabel: "Start Fresh",
  },
  SESSION_ERROR: {
    code: "SESSION_ERROR",
    title: "Session Error",
    message: "We encountered an issue verifying your session. Please try again.",
    type: "error",
    actionLabel: "Try Again",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    title: "Connection Lost",
    message: "Unable to reach the gallery servers. Please check your internet connection and try again.",
    type: "error",
    actionLabel: "Retry",
  },
  CAPACITY_FULL: {
    code: "CAPACITY_FULL",
    title: "Gallery at Capacity",
    message: "The gallery is currently full. You've been added to the waiting queue and will be admitted automatically when space becomes available.",
    type: "info",
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    title: "Too Many Requests",
    message: "You're making requests too quickly. Please wait a moment before trying again.",
    type: "warning",
  },
  CHECKIN_FAILED: {
    code: "CHECKIN_FAILED",
    title: "Check-In Failed",
    message: "Unable to complete your check-in. Please verify your information and try again.",
    type: "error",
    actionLabel: "Try Again",
  },
  HEARTBEAT_FAILED: {
    code: "HEARTBEAT_FAILED",
    title: "Connection Interrupted",
    message: "We lost connection to your session. Attempting to reconnect...",
    type: "warning",
  },
  QUEUE_ERROR: {
    code: "QUEUE_ERROR",
    title: "Queue Error",
    message: "There was an issue with your position in the queue. Please refresh the page.",
    type: "error",
    actionLabel: "Refresh",
  },
  UNKNOWN: {
    code: "UNKNOWN",
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again or contact support if the issue persists.",
    type: "error",
    actionLabel: "Dismiss",
  },
};

// Map URL reason parameters to error codes
export const reasonToErrorCode: Record<string, ErrorCode> = {
  expired: "SESSION_EXPIRED",
  invalid: "SESSION_INVALID",
  error: "SESSION_ERROR",
  network: "NETWORK_ERROR",
  capacity: "CAPACITY_FULL",
  ratelimit: "RATE_LIMITED",
  checkin: "CHECKIN_FAILED",
  heartbeat: "HEARTBEAT_FAILED",
  queue: "QUEUE_ERROR",
};

export function getErrorFromReason(reason: string | null): ErrorDefinition | null {
  if (!reason) return null;
  const code = reasonToErrorCode[reason] || "UNKNOWN";
  return errorDefinitions[code];
}

export function getError(code: ErrorCode): ErrorDefinition {
  return errorDefinitions[code] || errorDefinitions.UNKNOWN;
}
