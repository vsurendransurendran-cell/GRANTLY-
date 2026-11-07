function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function today() {
  return toLocalDateString(new Date())
}

export function addDays(amount, from = today()) {
  const date = parseLocalDate(from)
  const offset = Number(amount)
  if (!date || !Number.isFinite(offset)) return ''
  date.setDate(date.getDate() + Math.trunc(offset))
  return toLocalDateString(date)
}

export function daysLeft(deadline, from = today()) {
  const targetDate = parseLocalDate(deadline)
  const currentDate = parseLocalDate(from)
  if (!targetDate || !currentDate) return Number.NaN
  return Math.round((targetDate.getTime() - currentDate.getTime()) / 86_400_000)
}

export function urgencyOf(deadline) {
  const remaining = daysLeft(deadline)
  if (Number.isNaN(remaining)) return 'open'
  if (remaining < 0) return 'closed'
  if (remaining <= 7) return 'urgent'
  if (remaining <= 21) return 'soon'
  return 'open'
}

export function formatDate(value, options = {}) {
  const date = parseLocalDate(value)
  if (!date) return 'Date unavailable'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date)
}
