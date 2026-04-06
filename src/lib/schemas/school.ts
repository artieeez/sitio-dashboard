import { z } from "zod";
import { dateTimeStringSchema, uuidStringSchema } from "./common";

export const schoolSchema = z.object({
  id: uuidStringSchema,
  active: z.boolean(),
  url: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export const schoolCreateSchema = z.object({
  url: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const schoolUpdateSchema = schoolCreateSchema.partial();

export type School = z.infer<typeof schoolSchema>;
