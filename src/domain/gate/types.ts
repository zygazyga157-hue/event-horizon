/**
 * Gate Domain Models
 * Session management for capacity-limited library access
 */

export type SessionStatus = "ACTIVE" | "QUEUED" | "EXPIRED" | "EXITED";

export type SessionPurpose = "Recruiter" | "Client" | "Collaborator" | "Curious";

export interface GateSession {
  id: string;
  displayName: string;
  email?: string;
  purpose?: SessionPurpose;
  status: SessionStatus;
  queuedAt?: Date;
  enteredAt?: Date;
  lastSeenAt: Date;
  createdAt: Date;
  tokenHash: string;
  ipHash: string;
}

export interface GateStatus {
  capacity: number;
  activeCount: number;
  yourStatus?: SessionStatus;
  queuePosition?: number;
}

export interface CheckinRequest {
  displayName: string;
  email?: string;
  purpose?: SessionPurpose;
  honeypot?: string;
}

export interface CheckinResponse {
  status: SessionStatus;
  passToken: string;
  capacity: number;
  activeCount: number;
  queuePosition?: number;
}

export interface HeartbeatResponse {
  status: SessionStatus;
  capacity: number;
  activeCount: number;
  queuePosition?: number;
}

// WebSocket message types
export type WSMessageType =
  | "hello"
  | "accept"
  | "reject"
  | "ping"
  | "pong"
  | "occupancy"
  | "promoted"
  | "expired";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  id?: string;
  ts: number;
  payload: T;
}

export interface WSOccupancyPayload {
  activeCount: number;
  capacity: number;
  queueLength: number;
}

export interface WSPromotedPayload {
  sessionNonce: string;
}
