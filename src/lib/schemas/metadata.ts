import { z } from "zod";

export const fetchPageRequestSchema = z.object({
  url: z.string().url(),
});

export const landingMetadataSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
});

export type FetchPageRequest = z.infer<typeof fetchPageRequestSchema>;
export type LandingMetadata = z.infer<typeof landingMetadataSchema>;
