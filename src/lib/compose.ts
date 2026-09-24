import { productLabel } from "./studio";
import type { Briefing, DeliveryPiece, Section, Theme, WebsiteSchema } from "./types";
import { clean, digits } from "./text";

function themeFrom(briefing: Briefing): Theme {
  const colors = briefing.colors.toLowerCase();
  const style = briefing.style.toLowerCase();
  let accent = "#e8583f";
  if (colors.includes("azul")) accent = "#60a5fa";
  else if (colors.includes("verde")) accent = "#34d399";
  else if (colors.includes("dour") || colors.includes("ouro") || colors.includes("amare"))
    accent = "#e0b15a";
  else if (colors.includes("rosa") || colors.includes("lilás") || colors.includes("lilas"))
    accent = "#f472b6";

  const light = style.includes("claro") || style.includes("clean");
  if (light) {
    return {
      accent,
      background: "#f6f1ea",
      foreground: "#1a1210",
      muted: "#5c514c",
      surface: "#fffdf9",
      mood: "light",
    };
  }
  return {
    accent,
    background: "#100c18",
    foreground: "#f7f1ea",
    muted: "#b5a89f",
    surface: "#1a1424",
    mood: "dark",
  };
}

function userLines(briefing: Briefing): string[] {
  return briefing.prompts
    .filter((turn) => turn.role === "user")
    .map((turn) => clean(turn.text, 180))
    .filter(Boolean);
}

function ctaLabel(briefing: Briefing): string {
  const joined = userLines(briefing).join(" ").toLowerCase();
  if (joined.includes("cardápio") || joined.includes("cardapio")) return "Ver cardápio";
  if (joined.includes("agend")) return "Agendar horário";
  if (joined.includes("orçamento") || joined.includes("orcamento")) return "Pedir orçamento";
  if (briefing.product === "criativo") return "Quero esses criativos";
  return "Chamar no WhatsApp";
}

function serviceItems(briefing: Briefing): { title: string; text: string }[] {
  const chunks = briefing.offer
    .split(/[,;/|•]/)
    .map((part) => clean(part, 80))
    .filter((part) => part.length > 2)
    .slice(0, 3);

  const base =
    chunks.length >= 2
      ? chunks
      : [clean(briefing.offer, 80), clean(briefing.goal, 80), clean(briefing.audience, 80)].filter(
          Boolean,
        );

  const titles = base.slice(0, 3);
  while (titles.length < 3) titles.push(productLabel(briefing.product));

  return titles.map((title, index) => ({
    title,
    text:
      index === 0
        ? `Feito para ${clean(briefing.audience, 90) || "quem chega pelo celular"} — direto ao ponto.`
        : index === 1
          ? clean(briefing.goal, 120) || "Um caminho claro até a conversa."
          : `${clean(briefing.city, 40) || "Onde você atende"} fica visível, sem texto genérico.`,
  }));
}

function landingSections(briefing: Briefing): Section[] {
  const name = clean(briefing.businessName, 60) || "Sua marca";
  const city = clean(briefing.city, 40);
  const phone = digits(briefing.whatsapp);
  const cta = ctaLabel(briefing);
  const notes = userLines(briefing);
  const editorial = briefing.style.toLowerCase().includes("editorial");

  return [
    { type: "navbar", variant: "solid", props: { businessName: name, city } },
    {
      type: "hero",
      variant: editorial ? "center" : "split",
      props: {
        eyebrow: city
          ? `${clean(briefing.segment, 40) || "Estúdio"} · ${city}`
          : clean(briefing.segment, 48) || "Direto ao ponto",
        title: notes[0] ? `${name}. ${notes[0]}` : `${name} em uma página que conversa.`,
        subtitle: clean(briefing.offer, 180) || "O que você vende, dito com clareza.",
        cta,
        whatsapp: phone,
      },
    },
    {
      type: "services",
      variant: "cards",
      props: { title: "O que a página entrega", items: serviceItems(briefing) },
    },
    {
      type: "about",
      variant: "split",
      props: {
        title: `Por que ${name}`,
        text: notes[1] || clean(briefing.goal, 200) || "A página existe para transformar visita em conversa.",
        points: [
          clean(briefing.audience, 80) || "Público definido no briefing",
          briefing.style ? `Tom ${clean(briefing.style, 40)}` : "Tom direto",
          "Botão de WhatsApp sempre à mão",
        ],
      },
    },
    {
      type: "proof",
      variant: "quotes",
      props: {
        title: "Como a prova social entra",
        note: "Espaço de exemplo. A cub4Studio troca por depoimentos reais seus.",
        quotes: [
          "Cheguei pelo anúncio e já entendi o que eles fazem.",
          "O botão do WhatsApp estava na hora certa.",
          "Parecia a marca, não um modelo pronto.",
        ],
      },
    },
    {
      type: "faq",
      variant: "list",
      props: {
        title: "Perguntas que a página já responde",
        items: [
          { q: "O que vocês fazem?", a: clean(briefing.offer, 160) || "O serviço principal do negócio." },
          { q: "Para quem é?", a: clean(briefing.audience, 160) || "Para o cliente descrito no briefing." },
          {
            q: "Como falo com vocês?",
            a: phone ? "Pelo WhatsApp, no botão da página." : "Pelo contato que você indicar à cub4Studio.",
          },
        ],
      },
    },
    {
      type: "cta",
      variant: "band",
      props: {
        title: clean(briefing.goal, 90) || "Vamos conversar",
        text: `${name} deixa o próximo passo óbvio.`,
        cta,
        whatsapp: phone,
      },
    },
    { type: "footer", variant: "simple", props: { businessName: name, city } },
  ];
}

function deliveryFor(briefing: Briefing): DeliveryPiece[] {
  const name = clean(briefing.businessName, 60) || "a marca";
  const offer = clean(briefing.offer, 120) || "a oferta";
  const goal = clean(briefing.goal, 120) || "gerar conversa";
  const tone = clean(briefing.style, 40) || "direto";
  const note = userLines(briefing)[0] || goal;

  if (briefing.product === "criativo") {
    return [
      {
        label: "Feed",
        title: `Parada de scroll para ${name}`,
        detail: `Primeira linha sobre ${offer}. Fundo com a cor do briefing e pouco texto.`,
      },
      { label: "Stories", title: "Sequência de 3 quadros", detail: `Gancho, prova e CTA. Tom ${tone}.` },
      { label: "Anúncio", title: "Peça de tráfego", detail: `Promessa alinhada a: ${goal}.` },
    ];
  }
  if (briefing.product === "foto") {
    return [
      { label: "Luz", title: "Still principal", detail: "Luz lateral, produto em destaque, paleta pedida no briefing." },
      { label: "Enquadramento", title: "Close e contexto", detail: `${offer} aparece reconhecível em um segundo.` },
      {
        label: "Série",
        title: "Três variações",
        detail: "Mesma direção de arte, usos diferentes: site, anúncio e WhatsApp.",
      },
    ];
  }
  if (briefing.product === "reel") {
    return [
      { label: "0–3s", title: "Gancho", detail: `Uma imagem forte de ${offer} antes de qualquer logo.` },
      { label: "3–12s", title: "Desenvolvimento", detail: note },
      { label: "Fecho", title: "CTA falado", detail: `Convite curto para ${goal.toLowerCase()}.` },
    ];
  }
  if (briefing.product === "automacao") {
    return [
      { label: "Entrada", title: "Anúncio ou bio", detail: `Leva para uma página de ${name}.` },
      { label: "Conversa", title: "WhatsApp com roteiro", detail: `Perguntas curtas sobre ${offer}.` },
      { label: "Fechamento", title: "Próximo passo", detail: goal },
    ];
  }
  return [];
}

export function composeProject(briefing: Briefing, id: string): WebsiteSchema {
  const name = clean(briefing.businessName, 60) || "Sua marca";
  return {
    project: { id, product: briefing.product, businessName: name },
    theme: themeFrom(briefing),
    seo: {
      title: `${name} · ${clean(briefing.segment, 40) || productLabel(briefing.product)}`,
      description: clean(briefing.offer, 150) || clean(briefing.goal, 150),
    },
    sections: briefing.product === "landing" ? landingSections(briefing) : [],
    delivery: briefing.product === "landing" ? [] : deliveryFor(briefing),
  };
}

export function applyLocalEdit(schema: WebsiteSchema, instruction: string): WebsiteSchema {
  const text = instruction.toLowerCase();
  const next: WebsiteSchema = structuredClone(schema);

  if (text.includes("claro") || text.includes("branco")) {
    next.theme = {
      ...next.theme,
      background: "#f6f1ea",
      foreground: "#1a1210",
      muted: "#5c514c",
      surface: "#fffdf9",
      mood: "light",
    };
  }
  if (text.includes("escuro") || text.includes("dark") || text.includes("moderno")) {
    next.theme = {
      ...next.theme,
      background: "#100c18",
      foreground: "#f7f1ea",
      muted: "#b5a89f",
      surface: "#1a1424",
      mood: "dark",
    };
  }

  const ctaMatch = instruction.match(/(?:cta|bot[aã]o)\s*[:\-–]?\s*(.{3,40})/i);
  if (ctaMatch) {
    const label = clean(ctaMatch[1], 40);
    next.sections = next.sections.map((section) => {
      if (section.type === "hero") {
        return { ...section, props: { ...section.props, cta: label } };
      }
      if (section.type === "cta") {
        return { ...section, props: { ...section.props, cta: label } };
      }
      return section;
    });
  }

  return next;
}
