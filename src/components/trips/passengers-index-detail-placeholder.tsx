import { Lightbulb } from "lucide-react";

import { ptBR } from "@/messages/pt-BR";

/** Detail pane when the trip workspace passengers list has no row selected (edit/payments). */
export function PassengersIndexDetailPlaceholder() {
  return (
    <div
      className="flex min-h-[min(240px,45dvh)] flex-col items-center justify-center gap-4 px-6 py-12 text-center"
      role="status"
    >
      <Lightbulb
        className="size-14 shrink-0 stroke-[1.25] text-muted-foreground/45"
        aria-hidden
      />
      <p className="max-w-sm text-muted-foreground text-sm">
        {ptBR.listDetail.selectPassengerPrompt}
      </p>
    </div>
  );
}
