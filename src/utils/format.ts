export const euro = (value: number): string =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

export const percent = (value: number): string =>
  new Intl.NumberFormat("de-DE", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);

export const savingsPercent = (regular: number, price: number): number =>
  Math.max(0, 1 - price / regular);

export const germanDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const germanDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  expired: boolean;
}

export const durationBetween = (from: Date, to: Date): Duration => {
  const totalMs = to.getTime() - from.getTime();
  const expired = totalMs <= 0;
  const abs = Math.abs(totalMs);
  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  const seconds = Math.floor((abs / 1000) % 60);
  return { days, hours, minutes, seconds, totalMs, expired };
};

export const relativeDays = (iso: string): string => {
  const diff = durationBetween(new Date(iso), new Date());
  if (diff.days === 0) return "heute";
  if (diff.days === 1) return "gestern";
  return `vor ${diff.days} Tagen`;
};
