// lib/currency.ts
// Static exchange rates relative to GBP — update occasionally
// Source: approximate mid-market rates

export type Currency = "GBP" | "EUR" | "CHF" | "USD" | "NOK" | "SEK" | "local";

export const RATES_TO_GBP: Record<string, number> = {
  GBP: 1.0,
  EUR: 0.86,
  CHF: 0.90,
  USD: 0.79,
  NOK: 0.071,
  SEK: 0.073,
};

export function toGBP(amount: number, fromCurrency: string): number {
  const rate = RATES_TO_GBP[fromCurrency] ?? 1;
  return amount * rate;
}

export function convertPrice(amount: number, fromCurrency: string, toCurrency: Currency | string): number {
  if (toCurrency === "local" || toCurrency === fromCurrency) return amount;
  const gbp = toGBP(amount, fromCurrency);
  const toRate = RATES_TO_GBP[toCurrency] ?? 1;
  return gbp / toRate;
}

export function formatPrice(amount: number, currency: string, toCurrency: Currency | string): string {
  const displayCurrency = toCurrency === "local" ? currency : toCurrency;
  const converted = convertPrice(amount, currency, toCurrency);

  const symbols: Record<string, string> = {
    GBP: "£", EUR: "€", CHF: "Fr", USD: "$", NOK: "kr", SEK: "kr",
  };

  const sym = symbols[displayCurrency] ?? displayCurrency + " ";
  const rounded = Math.round(converted);
  return `${sym}${rounded}`;
}

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "GBP", label: "£ GBP" },
  { value: "EUR", label: "€ EUR" },
  { value: "CHF", label: "Fr CHF" },
  { value: "USD", label: "$ USD" },
];
