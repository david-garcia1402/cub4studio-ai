"use client";

import { useState } from "react";
import { projectMessage, studioInstagramUrl, studioWhatsappUrl } from "@/lib/contact";
import { STUDIO } from "@/lib/studio";
import type { Briefing } from "@/lib/types";

export function ContactModal({
  briefing,
  open,
  onClose,
}: {
  briefing: Briefing;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  async function openInstagram() {
    const message = projectMessage(briefing);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    window.open(studioInstagramUrl(), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#161022] p-6 text-[#f7f1ea] shadow-2xl"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-[#e8583f]">Projeto pronto</p>
        <h2 id="contact-title" className="mt-2 font-display text-3xl leading-tight">
          Gostou do projeto? Fale com a gente.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#d9cfc6]">
          O WhatsApp abre com o briefing já escrito. No Instagram, a mesma mensagem é copiada
          para você colar.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={studioWhatsappUrl(briefing)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#e8583f] px-5 py-3 text-center font-semibold text-white"
          >
            WhatsApp {STUDIO.whatsappDisplay}
          </a>
          <button
            type="button"
            onClick={openInstagram}
            className="rounded-full border border-white/15 px-5 py-3 font-semibold"
          >
            Instagram @{STUDIO.instagram}
          </button>
          {copied ? (
            <p className="text-center text-sm text-[#e0b15a]">Mensagem copiada. É só colar no Instagram.</p>
          ) : null}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full text-sm text-[#b5a89f]">
          Continuar vendo o projeto
        </button>
      </div>
    </div>
  );
}
