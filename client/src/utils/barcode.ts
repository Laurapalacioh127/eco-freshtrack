export const BARCODE_PATTERN = /^\d{8,14}$/;

// Strips spaces and dashes; returns null when the result is not an 8-14 digit code.
export const normalizeBarcode = (raw: string): string | null => {
  const cleaned = raw.replace(/[\s-]/g, '');
  return BARCODE_PATTERN.test(cleaned) ? cleaned : null;
};
