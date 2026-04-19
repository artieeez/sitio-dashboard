import { z } from "zod";

import {
  type WixPaymentEventListItem,
  wixPaymentEventListItemSchema,
} from "@/lib/wix-payment-event-schemas";

function uuidFromIndex(i: number): string {
  const hex = i.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex.slice(0, 12)}`;
}

function buildEvent(i: number): WixPaymentEventListItem {
  const id = uuidFromIndex(i);
  const isOrphan = i % 4 === 0 || i % 7 === 0;
  const tripTitle = isOrphan
    ? null
    : `Viagem ${((i % 5) + 1).toString().padStart(2, "0")}`;

  const cents = 1000 + i * 137;
  const total = (cents / 100).toFixed(2);

  const baseDate = new Date(
    Date.UTC(2026, 3, 1 + (i % 28), 12 + (i % 6), 30, 0),
  );
  const dateCreated = baseDate.toISOString();

  return wixPaymentEventListItemSchema.parse({
    event: {
      id,
      dateCreated,
      buyerInfoId: uuidFromIndex(i + 1000),
      buyerIndoFirstname: `Nome${i}`,
      buyerIndoLastname: `Sobrenome${i}`,
      buyerIndoPhone: `+55 51 9${(80000000 + i).toString().slice(0, 8)}`,
      buyerIndoEmail: `comprador${i}@example.com`,
      buyerIndoContactId: uuidFromIndex(i + 2000),
      orderId: uuidFromIndex(i + 3000),
      orderTotal: total,
      billingInfoPaymentMethod: i % 2 === 0 ? "creditCard" : "pix",
      billingInfoCountry: "BR",
      billingInfoSubdivision: "BR-RS",
      billingInfoCity: "Porto Alegre",
      billingInfoZipCode: `${90000000 + (i % 9999)}`.slice(0, 8),
      billingInfoPhone: `+55 51 3${(30000000 + i).toString().slice(0, 8)}`,
      billingInfoEmail: `cobranca${i}@example.com`,
      billingInfoVatIdNumber: `${(100000000 + i).toString().padStart(11, "0")}`,
      billingInfoVatIdType: "CPF",
      billingInfoStreetNumber: `${(i % 900) + 1}`,
      billingInfoStreetName: `Rua Exemplo ${i}`,
      lineItemsName: `Ingresso / taxa ${i}`,
      lineItemsProductId: `prod-${i}`,
      lineItemsOptions: i % 3 === 0 ? `Opção A+${i}` : "",
      lineItemsCustomTextFields: i % 5 === 0 ? `Nota ${i}` : "",
    },
    isOrphan,
    tripTitle,
  });
}

const rawRows = Array.from({ length: 42 }, (_, i) => buildEvent(i + 1));

export const MOCK_WIX_PAYMENT_EVENT_ROWS: WixPaymentEventListItem[] = z
  .array(wixPaymentEventListItemSchema)
  .parse(rawRows);

export function findWixPaymentEventListItemById(
  id: string,
): WixPaymentEventListItem | undefined {
  return MOCK_WIX_PAYMENT_EVENT_ROWS.find((row) => row.event.id === id);
}
