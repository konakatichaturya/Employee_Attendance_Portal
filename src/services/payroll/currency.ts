export function formatPayCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}
