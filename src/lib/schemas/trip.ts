import { z } from "zod";
import {
  dateTimeStringSchema,
  moneyMinorSchema,
  uuidStringSchema,
} from "./common";

export const tripSchema = z.object({
  id: uuidStringSchema,
  schoolId: uuidStringSchema,
  active: z.boolean(),
  wixProductId: z.string().nullable(),
  wixProductSlug: z.string().nullable(),
  wixProductPageUrl: z.string().nullable(),
  defaultExpectedAmountMinor: moneyMinorSchema.nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  /** Present once API/DB migration is deployed; omit on older responses. */
  wixMediaFileId: z.string().nullable().optional(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const tripCreateSchema = z.object({
  wixProductId: z.string().nullable().optional(),
  wixProductSlug: z.string().nullable().optional(),
  wixProductPageUrl: z.string().nullable().optional(),
  defaultExpectedAmountMinor: moneyMinorSchema.nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  wixMediaFileId: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

/** PATCH: trip copy, pricing default, active, and cover image (Wix product id stays immutable). */
export const tripUpdateSchema = z.object({
  description: z.string().nullable().optional(),
  title: z.string().max(2000).nullable().optional(),
  defaultExpectedAmountMinor: moneyMinorSchema.nullable().optional(),
  active: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  wixMediaFileId: z.string().nullable().optional(),
});

export const passengerStatusAggregatesSchema = z.object({
  pendingCount: z.number().int().min(0),
  settledPaymentsCount: z.number().int().min(0),
  settledManualCount: z.number().int().min(0),
  unavailableCount: z.number().int().min(0),
});

export const tripDeleteEligibilitySchema = z.object({
  canDelete: z.boolean(),
  passengerCount: z.number().int().min(0),
});

export type Trip = z.infer<typeof tripSchema>;
export type PassengerStatusAggregates = z.infer<
  typeof passengerStatusAggregatesSchema
>;
export type TripDeleteEligibility = z.infer<typeof tripDeleteEligibilitySchema>;
