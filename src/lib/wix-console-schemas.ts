import { z } from "zod";

export const schoolConsoleEventTypeSchema = z.enum([
  "create",
  "updated",
  "deleted",
  "removedTrip",
  "addedTrip",
]);

export type SchoolConsoleEventType = z.infer<
  typeof schoolConsoleEventTypeSchema
>;

export const schoolConsoleEventRowSchema = z.object({
  id: z.string().uuid(),
  eventType: schoolConsoleEventTypeSchema,
  /** Present only for `create` and `updated`. */
  categoryName: z.string().nullable(),
  date: z.string(),
});

export type SchoolConsoleEventRow = z.infer<typeof schoolConsoleEventRowSchema>;

export const tripConsoleEventTypeSchema = z.enum([
  "create",
  "updated",
  "deleted",
]);

export type TripConsoleEventType = z.infer<typeof tripConsoleEventTypeSchema>;

export const tripConsoleEventRowSchema = z.object({
  id: z.string().uuid(),
  eventType: tripConsoleEventTypeSchema,
  /** Present only for `create` and `updated`. */
  tripName: z.string().nullable(),
  date: z.string(),
});

export type TripConsoleEventRow = z.infer<typeof tripConsoleEventRowSchema>;

export const paymentConsoleEventTypeSchema = z.enum([
  "order_paid",
  "order_updated",
  "refund",
  "payment_failed",
]);

export type PaymentConsoleEventType = z.infer<
  typeof paymentConsoleEventTypeSchema
>;
