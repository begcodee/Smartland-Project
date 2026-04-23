/** Ghana Card number — expected format GHA-XXXXXXXXX-X (NIA). */

export function normalizeGhanaCardNumber(input: string): string {
  return input.trim().replace(/\s+/g, '').toUpperCase();
}

export function isValidGhanaCardFormat(normalized: string): boolean {
  return /^GHA-\d{9}-\d$/.test(normalized);
}

export function validateFullNameOnCard(name: string): boolean {
  const t = name.trim();
  return t.length >= 3 && /\s/.test(t);
}
