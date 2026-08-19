/**
 * Minimal RFC4180 CSV parse/stringify for Luma guest exports.
 * Handles quoted fields, escaped quotes, and CRLF/LF line endings.
 */

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const records = parseRecords(text);
  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = records[0] ?? [];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < records.length; i++) {
    const record = records[i];
    if (!record || record.every((cell) => cell.trim() === "")) {
      continue;
    }

    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      if (!header) continue;
      row[header] = record[c] ?? "";
    }
    rows.push(row);
  }

  return { headers, rows };
}

export function stringifyCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(row[header] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function parseRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        continue;
      }
      field += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\r") {
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      field = "";
      records.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  return records;
}
