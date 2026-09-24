"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PRODUCT_LABEL } from "@/lib/studio";
import { PRODUCT_TYPES, type Briefing, type ChatTurn, type ProductType, type StoredProject } from "@/lib/types";
import { saveProject } from "@/lib/storage";

const products: { id: ProductType; label: string }[] = [
  { id: "landing", label: "Landing page" },
  { id: "criativo", label: "Criativos" },
  { id: "foto", label: "Foto" },
  { id: "reel", label: "Reel" },
  { id: "automacao", label: "Automação" },
];

const questions = [
  "O que a pessoa precisa sentir nos primeiros segundos?",
  "Qual ação principal? Ex.: chamar no WhatsApp, agendar, ver cardápio.",
  "Tem mais algum detalhe que não pode faltar?",
];

const empty: Briefing = {
  product: "landing",
  businessName: "",
  segment: "",
  city: "",
  offer: "",
  audience: "",
  goal: "",
  whatsapp: "",
  style: "",
  colors: "",
  prompts: [],
};

function isProduct(value: string | null): value is ProductType {
  return PRODUCT_TYPES.includes(value as ProductType);
}

function CreateFlow() {
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState<"form" | "chat">("form");
  const [draft, setDraft] = useState<Briefing>(() => {
    const requested = search.get("produto");
    return isProduct(requested) ? { ...empty, product: requested } : empty;
  });
  const [chat, setChat] = useState<ChatTurn[]>([{ role: "assistant", text: questions[0] }]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const userCount = useMemo(() => chat.filter((turn) => turn.role === "user").length, [chat]);

  function update(field: keyof Briefing, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function sendChat() {
    const text = message.trim();
    if (!text) return;
    const next = [...chat, { role: "user" as const, text }];
    if (userCount < questions.length - 1) {
      next.push({ role: "assistant", text: questions[userCount + 1] });
    }
    setChat(next);
    setMessage("");
  }

  async function generate() {
    setPending(true);
    setError("");
    const briefing = { ...draft, prompts: chat };
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing, idempotencyKey: crypto.randomUUID() }),
      });
      const data = (await response.json()) as { project?: StoredProject; error?: string };
      if (!response.ok || !data.project) {
        setError(data.error ?? "Não consegui montar o projeto.");
        return;
      }
      saveProject(data.project);
      router.push(`/projetos/${data.project.id}?novo=1`);
    } catch {
      setError("Falha de rede. Tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <SiteHeader>
        <ol className="flex items-center gap-2 text-xs text-[#b5a89f]" aria-label="Etapas">
          <li className={`rounded-full px-3 py-1 ${step === "form" ? "bg-[#e8583f]/15 text-[#e8583f]" : ""}`}>1. Briefing</li>
          <li className={`rounded-full px-3 py-1 ${step === "chat" ? "bg-[#e8583f]/15 text-[#e8583f]" : ""}`}>2. Chat</li>
          <li className="hidden rounded-full px-3 py-1 sm:block">3. Preview</li>
        </ol>
      </SiteHeader>
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      {step === "form" ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setStep("chat");
          }}
        >
          <h1 className="font-display text-4xl">Conta o básico do negócio.</h1>
          <fieldset>
            <legend className="mb-2 text-sm text-[#b5a89f]">O que você quer</legend>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => update("product", product.id)}
                  className={`rounded-full px-4 py-2 text-sm ${draft.product === product.id ? "bg-[#e8583f] text-white" : "bg-[#161022]"}`}
                >
                  {product.label}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Nome do negócio" value={draft.businessName} onChange={(value) => update("businessName", value)} required />
          <Field label="Segmento" value={draft.segment} onChange={(value) => update("segment", value)} />
          <Field label="Cidade" value={draft.city} onChange={(value) => update("city", value)} />
          <Field label="O que você vende" value={draft.offer} onChange={(value) => update("offer", value)} required />
          <Field label="Público" value={draft.audience} onChange={(value) => update("audience", value)} />
          <Field label="Objetivo" value={draft.goal} onChange={(value) => update("goal", value)} required />
          <Field label="WhatsApp do negócio" value={draft.whatsapp} onChange={(value) => update("whatsapp", value)} />
          <Field label="Estilo" value={draft.style} onChange={(value) => update("style", value)} placeholder="escuro, claro, editorial" />
          <Field label="Cores" value={draft.colors} onChange={(value) => update("colors", value)} placeholder="coral, azul, verde..." />
          <button type="submit" className="rounded-full bg-[#e8583f] px-6 py-3 font-semibold text-white">
            Ir para o chat
          </button>
        </form>
      ) : (
        <section className="mt-8">
          <h1 className="font-display text-4xl">Agora com as suas palavras.</h1>
          <p className="mt-2 text-sm text-[#b5a89f]">
            {PRODUCT_LABEL[draft.product]} para {draft.businessName}.
          </p>
          <div className="mt-6 space-y-3">
            {chat.map((turn, index) => (
              <p
                key={`${turn.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${turn.role === "assistant" ? "bg-[#161022]" : "ml-auto bg-[#e8583f] text-white"}`}
              >
                {turn.text}
              </p>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendChat();
              }}
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#161022] px-4 py-3"
              placeholder="Escreva aqui"
              aria-label="Mensagem"
            />
            <button type="button" onClick={sendChat} className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#1a1210]">
              Enviar
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-[#e8583f]">{error}</p> : null}
          <button
            type="button"
            disabled={pending || userCount < 1}
            onClick={generate}
            className="mt-6 rounded-full bg-[#e8583f] px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Montando..." : "Montar meu projeto"}
          </button>
        </section>
      )}
    </main>
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<p className="px-5 py-10 text-sm text-[#b5a89f]">Abrindo briefing...</p>}>
      <CreateFlow />
    </Suspense>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[#b5a89f]">{label}</span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-[#161022] px-4 py-3 text-base"
      />
    </label>
  );
}
