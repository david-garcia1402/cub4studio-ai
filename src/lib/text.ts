const MAX = 280;

export function clean(value: unknown, max = MAX): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function digits(value: string): string {
  const only = value.replace(/\D/g, "");
  if (only.length < 10 || only.length > 13) return "";
  return only.startsWith("55") ? only : `55${only}`;
}

export function waLink(phone: string, text: string): string | null {
  const number = digits(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
