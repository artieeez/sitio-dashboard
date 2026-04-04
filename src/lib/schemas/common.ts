import { z } from "zod";

/** BRL amount in centavos (OpenAPI `MoneyMinor`). */
export const moneyMinorSchema = z.number().int().min(0);

export const uuidStringSchema = z.string().uuid();

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const dateTimeStringSchema = z.string().datetime({ offset: true });
