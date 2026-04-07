import { z } from "zod";

export const recentSchoolEntrySchema = z.object({
  schoolId: z.string().uuid(),
  lastOpenedAt: z.string().datetime().optional(),
});

export const recentSchoolsPayloadSchema = z.array(recentSchoolEntrySchema);

export type RecentSchoolEntry = z.infer<typeof recentSchoolEntrySchema>;
export type RecentSchoolsPayload = z.infer<typeof recentSchoolsPayloadSchema>;
