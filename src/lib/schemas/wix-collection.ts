import { z } from "zod";

export const wixCollectionSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  visible: z.boolean().optional(),
  description: z.string().nullable().optional(),
  numberOfProducts: z.number().optional(),
  imageUrl: z.string().nullable(),
});

export const wixCollectionAutocompleteResponseSchema = z.object({
  collections: z.array(wixCollectionSummarySchema),
});

export type WixCollectionSummary = z.infer<typeof wixCollectionSummarySchema>;
