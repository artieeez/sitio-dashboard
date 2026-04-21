import { z } from "zod";

export const wixIntegrationSettingsSchema = z.object({
  siteId: z.string().nullable(),
  publicKey: z.string().nullable(),
  privateApiKeyPrefix: z.string().nullable(),
});

export type WixIntegrationSettings = z.infer<
  typeof wixIntegrationSettingsSchema
>;
