/**
 * Centralized Phone Normalizer for Indian (+91) & International WhatsApp Numbers
 * Standardizes format to digits only (e.g., 9159646803 -> 919159646803)
 */
export function normalizePhoneNumber(input: string | null | undefined): string {
  if (!input) return "";

  // Remove all non-numeric characters
  let digits = input.replace(/\D/g, "");

  // Standardize 10-digit Indian numbers by prepending 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // Handle leading 0 (e.g., 09159646803 -> 919159646803)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  }

  return digits;
}

/**
 * Format normalized phone for display (e.g., 919159646803 -> +91 9159646803)
 */
export function formatPhoneDisplay(input: string | null | undefined): string {
  const normalized = normalizePhoneNumber(input);
  if (!normalized) return "";
  if (normalized.startsWith("91") && normalized.length === 12) {
    return `+91 ${normalized.slice(2)}`;
  }
  return `+${normalized}`;
}
