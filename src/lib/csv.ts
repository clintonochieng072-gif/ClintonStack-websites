export function escapeCSV(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    return `"${JSON.stringify(value)}"`;
  }

  if (value === null || value === undefined) return '""';

  const str = String(value);

  // CSV rule: double quotes are escaped by doubling them
  const escaped = str.split('"').join('""');

  return `"${escaped}"`;
}
