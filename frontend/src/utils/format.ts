// frontend/src/utils/format.ts

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat('en-US');

export const formatCurrency = (value: number | null | undefined) => currency.format(value ?? 0);
export const formatCompactCurrency = (value: number) => `$${compact.format(value)}`;
export const formatNumber = (value: number | null | undefined) => integer.format(value ?? 0);

/** "2026-11-03" -> "3 Nov 2026". Parses the parts by hand so no timezone shift can move the day. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '-';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Short axis label for chart dates: "2026-11-03" -> "3 Nov". */
export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
