export function formatCurrency(amount, currency = 'USD') {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${Math.round(value).toLocaleString('en-US')}`
  }
}
