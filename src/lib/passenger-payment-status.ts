import type { PaymentStatus } from "@/lib/schemas/passenger";
import { ptBR } from "@/messages/pt-BR";

export function passengerPaymentStatusLabel(s: PaymentStatus): string {
  switch (s) {
    case "pending":
      return ptBR.status.pending;
    case "settled_payments":
      return ptBR.status.settledPayments;
    case "settled_manual":
      return ptBR.status.settledManual;
    case "unavailable":
      return ptBR.status.unavailable;
    default:
      return s;
  }
}

/** Text tone for inline / table cells (no background). */
export function passengerPaymentStatusToneClass(s: PaymentStatus): string {
  switch (s) {
    case "settled_payments":
      return "text-blue-800 dark:text-blue-200";
    case "settled_manual":
      return "text-emerald-800 dark:text-emerald-200";
    case "pending":
      return "text-amber-800 dark:text-amber-200";
    default:
      return "text-muted-foreground";
  }
}

/** Pill/badge surface aligned with `passengerPaymentStatusToneClass`. */
export function passengerPaymentStatusBadgeClass(s: PaymentStatus): string {
  switch (s) {
    case "settled_payments":
      return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200";
    case "settled_manual":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
