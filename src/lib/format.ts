export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value > 999_999 ? "compact" : "standard" }).format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
