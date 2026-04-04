import { z } from "zod";
import {
  dateOnlySchema,
  dateTimeStringSchema,
  moneyMinorSchema,
  uuidStringSchema,
} from "./common";

export const paymentSchema = z.object({
  id: uuidStringSchema,
  passengerId: uuidStringSchema,
  amountMinor: moneyMinorSchema,
  paidOn: dateOnlySchema,
  location: z.string().min(1),
  payerIdentity: z.string().min(1),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const paymentCreateSchema = z.object({
  amountMinor: moneyMinorSchema,
  paidOn: dateOnlySchema,
  location: z.string().min(1),
  payerIdentity: z.string().min(1),
});

export const paymentUpdateSchema = paymentCreateSchema;

export type Payment = z.infer<typeof paymentSchema>;
