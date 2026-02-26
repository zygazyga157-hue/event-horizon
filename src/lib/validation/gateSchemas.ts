/**
 * Zod validation schemas for Gate API
 */
import { z } from "zod";

export const checkinSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name must be at most 64 characters")
    .regex(/^[\p{L}\p{N}\s\-'.]+$/u, "Name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  purpose: z
    .enum(["Recruiter", "Client", "Collaborator", "Curious"])
    .optional(),
  honeypot: z
    .string()
    .max(0, "Invalid submission")
    .optional(),
  consent: z
    .boolean()
    .refine((val) => val === true, { message: "You must accept the terms" }),
});

export type CheckinInput = z.infer<typeof checkinSchema>;

export const heartbeatSchema = z.object({
  // Token comes from cookie, not body
});

export const exitSchema = z.object({
  // Token comes from cookie, not body
});

export const statusSchema = z.object({
  // Token comes from cookie (optional)
});

// API error response
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.string(), z.string()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
