import { z } from "zod";

import { paymentConsoleEventTypeSchema } from "@/lib/wix-console-schemas";

/**
 * Zod models aligned with design-notes contracts:
 * `wix-payment-event.ui.schema.json` and `wix-payment-event-list-item.ui.schema.json`.
 */
export const wixPaymentEventSchema = z.object({
  id: z.string().uuid(),
  dateCreated: z.string(),
  buyerInfoId: z.string().uuid(),
  buyerIndoFirstname: z.string(),
  buyerIndoLastname: z.string(),
  buyerIndoPhone: z.string(),
  buyerIndoEmail: z.string(),
  buyerIndoContactId: z.string().uuid(),
  orderId: z.string().uuid(),
  orderTotal: z.string(),
  billingInfoPaymentMethod: z.string(),
  billingInfoCountry: z.string(),
  billingInfoSubdivision: z.string(),
  billingInfoCity: z.string(),
  billingInfoZipCode: z.string(),
  billingInfoPhone: z.string(),
  billingInfoEmail: z.string(),
  billingInfoVatIdNumber: z.string(),
  billingInfoVatIdType: z.string(),
  billingInfoStreetNumber: z.string(),
  billingInfoStreetName: z.string(),
  lineItemsName: z.string(),
  lineItemsProductId: z.string(),
  lineItemsOptions: z.string().optional(),
  lineItemsCustomTextFields: z.string().optional(),
});

export const wixPaymentEventListItemSchema = z.object({
  event: wixPaymentEventSchema,
  isOrphan: z.boolean(),
  tripTitle: z.string().nullable(),
  /** Console / webhook event classification (UI + filters). */
  integrationEventType: paymentConsoleEventTypeSchema,
});

export type WixPaymentEvent = z.infer<typeof wixPaymentEventSchema>;
export type WixPaymentEventListItem = z.infer<
  typeof wixPaymentEventListItemSchema
>;
