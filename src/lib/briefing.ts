import { PRODUCT_TYPES, type Briefing, type ChatTurn, type ProductType } from "./types";
import { clean } from "./text";

function isProduct(value: string): value is ProductType {
  return (PRODUCT_TYPES as readonly string[]).includes(value);
}

export function parseBriefing(input: unknown): Briefing | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const product = clean(raw.product, 20);
  if (!isProduct(product)) return null;

  const businessName = clean(raw.businessName, 80);
  const offer = clean(raw.offer, 240);
  const goal = clean(raw.goal, 240);
  if (!businessName || !offer || !goal) return null;

  const prompts: ChatTurn[] = [];
  if (Array.isArray(raw.prompts)) {
    for (const turn of raw.prompts.slice(0, 12)) {
      if (!turn || typeof turn !== "object") continue;
      const item = turn as Record<string, unknown>;
      const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      const text = clean(item.text, 400);
      if (!role || !text) continue;
      prompts.push({ role, text });
    }
  }

  return {
    product,
    businessName,
    segment: clean(raw.segment, 80),
    city: clean(raw.city, 60),
    offer,
    audience: clean(raw.audience, 160),
    goal,
    whatsapp: clean(raw.whatsapp, 20),
    style: clean(raw.style, 60),
    colors: clean(raw.colors, 60),
    prompts,
  };
}
