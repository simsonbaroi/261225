// Simple Taka formatting utility
export function formatTaka(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '৳0.00';
  
  return `৳${numAmount.toFixed(2)}`;
}

export function parseTakaAmount(value: string): number {
  // Remove all non-digit and non-decimal characters
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}