export function formatMonthYear(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const formatted = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateRange(startDate: string, endDate: string): string {
  const format = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(`${value}T00:00:00`)
    );
  return `${format(startDate)} – ${format(endDate)}`;
}

export function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}
