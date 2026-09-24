export const PRODUCT_TYPES = [
  "landing",
  "criativo",
  "foto",
  "reel",
  "automacao",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export type ChatTurn = {
  role: "user" | "assistant";
  text: string;
};

export type Briefing = {
  product: ProductType;
  businessName: string;
  segment: string;
  city: string;
  offer: string;
  audience: string;
  goal: string;
  whatsapp: string;
  style: string;
  colors: string;
  prompts: ChatTurn[];
};

export type Theme = {
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  mood: "dark" | "light";
};

export type Section =
  | {
      type: "navbar";
      variant: "solid";
      props: { businessName: string; city: string };
    }
  | {
      type: "hero";
      variant: "split" | "center";
      props: {
        eyebrow: string;
        title: string;
        subtitle: string;
        cta: string;
        whatsapp: string;
      };
    }
  | {
      type: "services";
      variant: "cards";
      props: { title: string; items: { title: string; text: string }[] };
    }
  | {
      type: "about";
      variant: "split";
      props: { title: string; text: string; points: string[] };
    }
  | {
      type: "proof";
      variant: "quotes";
      props: { title: string; note: string; quotes: string[] };
    }
  | {
      type: "faq";
      variant: "list";
      props: { title: string; items: { q: string; a: string }[] };
    }
  | {
      type: "cta";
      variant: "band";
      props: { title: string; text: string; cta: string; whatsapp: string };
    }
  | {
      type: "footer";
      variant: "simple";
      props: { businessName: string; city: string };
    };

export type DeliveryPiece = {
  label: string;
  title: string;
  detail: string;
};

export type WebsiteSchema = {
  project: {
    id: string;
    product: ProductType;
    businessName: string;
  };
  theme: Theme;
  seo: { title: string; description: string };
  sections: Section[];
  delivery: DeliveryPiece[];
};

export type StoredProject = {
  id: string;
  briefing: Briefing;
  schema: WebsiteSchema;
  createdAt: string;
};
