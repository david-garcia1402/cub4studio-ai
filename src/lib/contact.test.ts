import assert from "node:assert/strict";
import test from "node:test";
import { composeProject } from "./compose";
import { projectMessage, studioWhatsappUrl } from "./contact";
import type { Briefing } from "./types";

const briefing: Briefing = {
  product: "landing",
  businessName: "PipoCrunch",
  segment: "Alimentação",
  city: "Jaraguá do Sul",
  offer: "Pipoca gourmet",
  audience: "Famílias",
  goal: "Receber pedidos no WhatsApp",
  whatsapp: "47999999999",
  style: "escuro",
  colors: "coral",
  prompts: [{ role: "user", text: "Quero um cardápio fácil no celular." }],
};

test("mensagem leva o briefing para o WhatsApp", () => {
  const message = projectMessage(briefing);
  assert.match(message, /PipoCrunch/);
  assert.match(message, /cardápio fácil/);
  const url = studioWhatsappUrl(briefing);
  assert.ok(url.startsWith("https://wa.me/5547999940399?text="));
});

test("landing vira seções sem HTML livre", () => {
  const schema = composeProject(briefing, "abc-123");
  assert.equal(schema.sections.length > 0, true);
  assert.equal(schema.sections.some((section) => section.type === "hero"), true);
  assert.equal(JSON.stringify(schema).includes("<script"), false);
});
