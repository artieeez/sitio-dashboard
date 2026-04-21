import { z } from "zod";

export const wixProductSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable(),
  wixMediaFileId: z.string().nullable().optional(),
  productPageUrl: z.string().nullable(),
  defaultExpectedAmountMinor: z.number().int().nullable().optional(),
});

export const wixProductAutocompleteResponseSchema = z.object({
  products: z.array(wixProductSummarySchema),
});

export type WixProductSummary = z.infer<typeof wixProductSummarySchema>;
