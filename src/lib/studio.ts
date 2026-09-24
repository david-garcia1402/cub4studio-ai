export const STUDIO = {
  name: "cub4Studio",
  whatsappDisplay: "(47) 99994-0399",
  whatsappE164: "5547999940399",
  instagram: "cub4studio",
  email: "cub4studio@gmail.com",
  accent: "#e8583f",
  background: "#0d0817",
} as const;

export const PRODUCT_LABEL: Record<string, string> = {
  landing: "Landing page",
  criativo: "Criativos para anúncio",
  foto: "Foto de marca",
  reel: "Reel / vídeo",
  automacao: "Automação e funil",
};

export function productLabel(product: string): string {
  return PRODUCT_LABEL[product] ?? "Projeto";
}
