import { z } from "zod";

export const wixIntegrationSettingsSchema = z.object({
  publicKeyPrefix: z.string().nullable(),
  privateApiKeyPrefix: z.string().nullable(),
});

export type WixIntegrationSettings = z.infer<typeof wixIntegrationSettingsSchema>;
