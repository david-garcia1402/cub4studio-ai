"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { clearProjects } from "@/lib/storage";

export default function AccountPage() {
  const [done, setDone] = useState(false);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-8">
        <h1 className="mt-6 font-display text-4xl">Seus dados neste navegador</h1>
        <p className="mt-4 leading-7 text-[#d9cfc6]">
          O briefing e o preview ficam só no localStorage deste aparelho. Nada é enviado à cub4Studio até você abrir o WhatsApp ou o Instagram e enviar a mensagem.
        </p>
        <button
          type="button"
          className="mt-6 rounded-full border border-white/15 px-5 py-3"
          onClick={() => {
            clearProjects();
            setDone(true);
          }}
        >
          Apagar projetos deste navegador
        </button>
        {done ? <p className="mt-3 text-sm text-[#e0b15a]">Projetos apagados neste navegador.</p> : null}
      </main>
    </>
  );
}
