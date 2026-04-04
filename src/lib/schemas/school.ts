import { z } from "zod";
import { dateTimeStringSchema, uuidStringSchema } from "./common";

export const schoolSchema = z.object({
  id: uuidStringSchema,
  name: z.string(),
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
  name: z.string().min(1),
  url: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
});

export const schoolUpdateSchema = schoolCreateSchema
  .partial()
  .extend({ active: z.boolean().optional() });

export type School = z.infer<typeof schoolSchema>;
