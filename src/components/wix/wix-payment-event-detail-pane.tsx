import { XIcon } from "lucide-react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { Button } from "@/components/ui/button";
import type { WixPaymentEvent } from "@/lib/wix-payment-event-schemas";
import { ptBR } from "@/messages/pt-BR";

const DETAIL_FIELD_ORDER: (keyof WixPaymentEvent)[] = [
  "id",
  "dateCreated",
  "buyerInfoId",
  "buyerIndoFirstname",
  "buyerIndoLastname",
  "buyerIndoPhone",
  "buyerIndoEmail",
  "buyerIndoContactId",
  "orderId",
  "orderTotal",
  "billingInfoPaymentMethod",
  "billingInfoCountry",
  "billingInfoSubdivision",
  "billingInfoCity",
  "billingInfoZipCode",
  "billingInfoPhone",
  "billingInfoEmail",
  "billingInfoVatIdNumber",
  "billingInfoVatIdType",
  "billingInfoStreetNumber",
  "billingInfoStreetName",
  "lineItemsName",
  "lineItemsProductId",
  "lineItemsOptions",
  "lineItemsCustomTextFields",
];

function labelForKey(key: keyof WixPaymentEvent): string {
  const map = ptBR.wixIntegration.detailFields;
  if (key in map) {
    return map[key as keyof typeof map];
  }
  return key;
}

export type WixPaymentEventDetailPaneProps = {
  event: WixPaymentEvent;
};

export function WixPaymentEventDetailPane({
  event,
}: WixPaymentEventDetailPaneProps) {
  const { requestCloseDetail } = useListDetailLayout();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 font-medium text-base">
          {ptBR.wixIntegration.detailTitle}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 px-2"
          onClick={() => requestCloseDetail()}
          aria-label={ptBR.listDetail.detailClose}
        >
          <XIcon className="size-4 shrink-0" aria-hidden />
        </Button>
      </div>
      <dl className="grid min-w-0 gap-x-4 gap-y-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
        {DETAIL_FIELD_ORDER.map((key) => {
          const value = event[key];
          if (value === undefined) return null;
          return (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{labelForKey(key)}</dt>
              <dd className="min-w-0 break-words font-mono text-foreground text-xs">
                {value === "" ? "—" : String(value)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
