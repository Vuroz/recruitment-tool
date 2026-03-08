export function formatDateISO(date: Date | string | null | undefined): string {
    if (!date) return "-";
    const parsed = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toISOString().slice(0, 10);
}
