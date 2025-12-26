import { formatTaka, parseTakaAmount } from '../../../shared/currencies';

export const useTakaFormat = () => {
  const format = (amount: number | string): string => {
    return formatTaka(amount);
  };

  const parse = (value: string): number => {
    return parseTakaAmount(value);
  };

  return {
    format,
    parse,
  };
};