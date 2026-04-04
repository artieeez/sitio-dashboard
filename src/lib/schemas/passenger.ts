import { z } from "zod";
import {
  dateTimeStringSchema,
  moneyMinorSchema,
  uuidStringSchema,
} from "./common";

export const paymentStatusSchema = z.enum([
  "pending",
  "settled_payments",
  "settled_manual",
  "unavailable",
]);

export const passengerSchema = z.object({
  id: uuidStringSchema,
  tripId: uuidStringSchema,
  fullName: z.string(),
  cpf: z.string().nullable(),
  parentName: z.string().nullable(),
  parentPhoneNumber: z.string().nullable(),
  parentEmail: z.string().nullable(),
  expectedAmountOverrideMinor: moneyMinorSchema.nullable(),
  manualPaidWithoutInfo: z.boolean(),
  removedAt: dateTimeStringSchema.nullable(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const passengerWithStatusSchema = passengerSchema.extend({
  status: paymentStatusSchema,
  paidTotalMinor: moneyMinorSchema,
  effectiveExpectedMinor: moneyMinorSchema.nullable(),
});

export const passengerCreateSchema = z.object({
  fullName: z.string().min(1),
  cpf: z.string().nullable().optional(),
  parentName: z.string().nullable().optional(),
  parentPhoneNumber: z.string().nullable().optional(),
  parentEmail: z.string().email().nullable().optional(),
  expectedAmountOverrideMinor: moneyMinorSchema.nullable().optional(),
  confirmNameDuplicate: z.boolean().optional(),
});

export const passengerUpdateSchema = passengerCreateSchema.partial();

export type Passenger = z.infer<typeof passengerSchema>;
export type PassengerWithStatus = z.infer<typeof passengerWithStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
