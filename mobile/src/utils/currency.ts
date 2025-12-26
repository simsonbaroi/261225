// Currency utility functions for Bangladeshi Taka
export const formatTaka = (amount: number): string => {
  return `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const parseTaka = (takaString: string): number => {
  return parseFloat(takaString.replace('৳', '').replace(/,/g, ''));
};