export function isStrongPassword(pw: string): boolean {
  if (pw.length < 12 || pw.length > 128) return false;
  let categories = 0;
  if (/[A-Z]/.test(pw)) categories++;
  if (/[a-z]/.test(pw)) categories++;
  if (/[0-9]/.test(pw)) categories++;
  if (/[^A-Za-z0-9]/.test(pw)) categories++;
  return categories >= 3;
}

export const PASSWORD_RULES_MESSAGE =
  "Password must be 12+ characters with at least 3 of: uppercase, lowercase, digit, symbol.";
