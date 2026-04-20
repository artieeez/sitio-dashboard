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
  defaultExpectedAmountMinor: moneyMinorSchema.nullable(),
  url: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const tripCreateSchema = z.object({
  defaultExpectedAmountMinor: moneyMinorSchema.nullable().optional(),
  url: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const tripUpdateSchema = tripCreateSchema.partial();

export const passengerStatusAggregatesSchema = z.object({
  pendingCount: z.number().int().min(0),
  settledPaymentsCount: z.number().int().min(0),
  settledManualCount: z.number().int().min(0),
  unavailableCount: z.number().int().min(0),
});

export type Trip = z.infer<typeof tripSchema>;
export type PassengerStatusAggregates = z.infer<
  typeof passengerStatusAggregatesSchema
>;
