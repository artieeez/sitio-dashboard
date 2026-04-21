/**
 * Trip `defaultExpectedAmountMinor` is BRL in **centavos** (integer string from API / form state).
 */
export function formatMinorStringAsBrl(minorStr: string): string {
  const t = minorStr.trim();
  if (t === "") {
    return "";
  }
  const minor = Number(t);
  if (!Number.isFinite(minor) || !Number.isInteger(minor) || minor < 0) {
    return "";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(minor / 100);
}
