import { STUDIO, productLabel } from "./studio";
import type { Briefing } from "./types";
import { clean, waLink } from "./text";

const URL_BUDGET = 1600;

export function projectMessage(briefing: Briefing): string {
  const prompts = briefing.prompts
    .filter((turn) => turn.role === "user")
    .map((turn) => clean(turn.text, 220))
    .filter(Boolean)
    .slice(0, 6);

  const lines = [
    `Olá, cub4Studio. Gerei um projeto de ${productLabel(briefing.product)} para ${clean(briefing.businessName, 80) || "meu negócio"}${briefing.city ? ` em ${clean(briefing.city, 60)}` : ""}.`,
    "",
    `Objetivo: ${clean(briefing.goal, 180) || "conversar com o estúdio"}.`,
    `Oferta: ${clean(briefing.offer, 180)}.`,
    briefing.segment ? `Segmento: ${clean(briefing.segment, 80)}.` : "",
    briefing.audience ? `Público: ${clean(briefing.audience, 140)}.` : "",
    briefing.style ? `Estilo: ${clean(briefing.style, 80)}.` : "",
    briefing.colors ? `Cores: ${clean(briefing.colors, 80)}.` : "",
    "",
    "Briefing:",
    ...(prompts.length
      ? prompts.map((line, index) => `${index + 1}. ${line}`)
      : ["(sem mensagens extras no chat)"]),
  ].filter((line) => line !== "");

  let message = lines.join("\n");
  if (message.length > URL_BUDGET) {
    message = `${message.slice(0, URL_BUDGET - 1)}…`;
  }
  return message;
}

export function studioWhatsappUrl(briefing: Briefing): string {
  return (
    waLink(STUDIO.whatsappE164, projectMessage(briefing)) ??
    `https://wa.me/${STUDIO.whatsappE164}`
  );
}

export function studioInstagramUrl(): string {
  return `https://ig.me/m/${STUDIO.instagram}`;
}
