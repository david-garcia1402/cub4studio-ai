import { composeProject } from "./compose";
import type { Briefing, Section, WebsiteSchema } from "./types";

const SECTION_TYPES = new Set([
  "navbar",
  "hero",
  "services",
  "about",
  "gallery",
  "proof",
  "faq",
  "cta",
  "contact",
  "footer",
]);

export type AiSource = "local" | "ai";

export interface AiProvider {
  compose(briefing: Briefing, id: string): Promise<{ schema: WebsiteSchema; source: AiSource }>;
}

function asSchema(value: unknown, id: string, product: Briefing["product"]): WebsiteSchema | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as WebsiteSchema;
  if (!Array.isArray(raw.sections) || !raw.theme || !raw.seo) return null;
  const sections = raw.sections.filter(
    (section): section is Section =>
      Boolean(section) &&
      typeof section === "object" &&
      SECTION_TYPES.has((section as Section).type) &&
      typeof (section as Section).props === "object",
  );
  if (sections.length === 0) return null;
  const serialized = JSON.stringify(sections);
  if (/<script|javascript:|onerror=/i.test(serialized)) return null;
  return {
    project: { id, product, businessName: raw.project?.businessName || "" },
    theme: raw.theme,
    seo: {
      title: String(raw.seo.title || "").slice(0, 120),
      description: String(raw.seo.description || "").slice(0, 180),
    },
    sections,
    delivery: Array.isArray(raw.delivery) ? raw.delivery : [],
  };
}

async function composeWithModel(briefing: Briefing, id: string): Promise<WebsiteSchema | null> {
  const key = process.env.AI_API_KEY;
  if (!key) return null;
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Você devolve só JSON de um site. Campos: theme, seo, sections, delivery. Cada section tem type, variant e props de texto. Tipos permitidos: navbar, hero, services, about, gallery, proof, faq, cta, contact, footer. Sem HTML, sem script, sem URL externa.",
          },
          {
            role: "user",
            content: JSON.stringify({ userContent: briefing }),
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    return asSchema(JSON.parse(content), id, briefing.product);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function createAiProvider(): AiProvider {
  return {
    async compose(briefing, id) {
      const paid = process.env.AI_GENERATION_ENABLED === "true" && Boolean(process.env.AI_API_KEY);
      if (!paid) {
        return { schema: composeProject(briefing, id), source: "local" };
      }
      const schema = await composeWithModel(briefing, id);
      if (!schema) {
        throw new Error("provider_failed");
      }
      if (!schema.project.businessName) {
        schema.project.businessName = briefing.businessName;
      }
      return { schema, source: "ai" };
    },
  };
}
