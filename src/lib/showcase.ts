import type { ProductType } from "./types";

export type ShowcaseIdea = {
  slug: string;
  name: string;
  segment: string;
  product: ProductType;
  headline: string;
  text: string;
  tags: string[];
  /** Duas cores que pintam a capa do card. */
  palette: [string, string];
};

/**
 * Ideias de projeto que a cub4Studio monta com o cliente.
 * São conceitos de partida, não cases entregues. Editar aqui muda a vitrine da home.
 */
export const SHOWCASE: ShowcaseIdea[] = [
  {
    slug: "cafe-de-bairro",
    name: "Grão & Prosa",
    segment: "Cafeteria de bairro",
    product: "landing",
    headline: "Cardápio, reserva e rota em um toque.",
    text: "Página leve, dobra com foto do balcão e botão de WhatsApp fixo no celular.",
    tags: ["Landing page", "WhatsApp", "Mobile first"],
    palette: ["#e8583f", "#5b1f16"],
  },
  {
    slug: "clinica-estetica",
    name: "Studio Vale",
    segment: "Clínica de estética",
    product: "criativo",
    headline: "Sequência de anúncios com prova social.",
    text: "Três criativos: dor, antes e depois, oferta com prazo. Feed e stories no mesmo sistema.",
    tags: ["Criativos", "Meta Ads", "Stories"],
    palette: ["#e0b15a", "#3a2a0f"],
  },
  {
    slug: "barbearia",
    name: "Barba & Cia",
    segment: "Barbearia",
    product: "reel",
    headline: "Gancho em dois segundos, corte no ritmo.",
    text: "Roteiro de 20 s, cortes na batida e CTA para agendar direto pelo link.",
    tags: ["Reel", "Roteiro", "CTA"],
    palette: ["#7c4dff", "#1d1040"],
  },
  {
    slug: "moda-autoral",
    name: "Atelier Nó",
    segment: "Moda autoral",
    product: "foto",
    headline: "Still editorial para catálogo e feed.",
    text: "Direção de luz, fundo e composição para peças venderem sem modelo.",
    tags: ["Foto de marca", "Still", "Catálogo"],
    palette: ["#f7f1ea", "#6b5a4e"],
  },
  {
    slug: "imobiliaria",
    name: "Norte Imóveis",
    segment: "Imobiliária",
    product: "automacao",
    headline: "Lead do anúncio cai no WhatsApp com resposta pronta.",
    text: "Formulário curto, mensagem automática com o imóvel e passagem para o corretor.",
    tags: ["Automação", "Funil", "Leads"],
    palette: ["#2ec4b6", "#0b3a37"],
  },
  {
    slug: "restaurante",
    name: "Cantina do Porto",
    segment: "Restaurante",
    product: "landing",
    headline: "Delivery, reserva e localização acima da dobra.",
    text: "Landing com pratos em destaque, horário de hoje e dois botões que resolvem.",
    tags: ["Landing page", "Delivery", "Reserva"],
    palette: ["#ff8a6a", "#4a1a10"],
  },
];
