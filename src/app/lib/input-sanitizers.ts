export function sanitizeNumericValue(value: string) {
  return value.replace(/\D/g, '');
}

export function sanitizeLettersValue(value: string) {
  return value
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart();
}

export function sanitizeDecimalValue(value: string) {
  return value.replace(/[^0-9.,]/g, '');
}
