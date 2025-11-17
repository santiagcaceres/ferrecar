export function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

export function getStartOfWeek(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split("T")[0]
}

export function getStartOfMonth(): string {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
  }).format(amount)
}
