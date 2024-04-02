export function formatCurrency(value: string) {
  // Remove R$, commas, and dots, then convert to number
  const numberValue = Number(value.replace(/[R$\.,]/g, '')) / 100
  return numberValue
}
