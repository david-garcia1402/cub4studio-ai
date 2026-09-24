"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useSyncExternalStore } from "react";
import { ContactModal } from "@/components/ContactModal";
import { DeliveryBoard } from "@/components/DeliveryBoard";
import { SitePreview } from "@/components/SitePreview";
import { Wordmark } from "@/components/Wordmark";
import { findProject, readProjectsSnapshot, subscribeProjects, updateProject } from "@/lib/storage";
import type { WebsiteSchema } from "@/lib/types";

const serverSnapshot = () => null;

function ProjectScreen() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const snapshot = useSyncExternalStore(subscribeProjects, readProjectsSnapshot, serverSnapshot);
  const project = useMemo(
    () => (snapshot === null ? undefined : findProject(snapshot, params.id)),
    [snapshot, params.id],
  );
  const [open, setOpen] = useState(() => search.get("novo") === "1");
  const [instruction, setInstruction] = useState("");
  const [note, setNote] = useState("");

  async function adjust() {
    if (!project || !instruction.trim()) return;
    const response = await fetch("/api/ai/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema: project.schema, instruction }),
    });
    const data = (await response.json()) as { schema?: WebsiteSchema; error?: string };
    if (!response.ok || !data.schema) {
      setNote(data.error ?? "Não consegui ajustar.");
      return;
    }
    updateProject({ ...project, schema: data.schema });
    setInstruction("");
    setNote("Ajuste aplicado no preview.");
  }

  if (project === undefined) {
    return <p className="px-5 py-10 text-sm text-[#b5a89f]">Abrindo projeto...</p>;
  }
  if (!project) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-4xl">Esse projeto não está neste navegador.</h1>
        <Link href="/criar" className="mt-6 inline-flex rounded-full bg-[#e8583f] px-5 py-3 font-semibold text-white">
          Criar outro
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link href="/">
          <Wordmark />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-[#e8583f] px-4 py-2 text-sm font-semibold text-white">
          Falar com a cub4Studio
        </button>
      </header>
      <p className="mb-4 text-sm text-[#b5a89f]">{project.schema.seo.title}</p>
      {project.schema.sections.length > 0 ? <SitePreview schema={project.schema} /> : <DeliveryBoard schema={project.schema} />}
      <section className="mt-6 rounded-3xl border border-white/10 p-4">
        <h2 className="font-semibold">Pedir um ajuste</h2>
        <p className="mt-1 text-sm text-[#b5a89f]">Exemplos: fundo escuro, visual claro, botão: Pedir orçamento.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#161022] px-4 py-3"
            aria-label="Ajuste"
          />
          <button type="button" onClick={adjust} className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#1a1210]">
            Aplicar
          </button>
        </div>
        {note ? <p className="mt-2 text-sm text-[#e0b15a]">{note}</p> : null}
      </section>
      <ContactModal briefing={project.briefing} open={open} onClose={() => setOpen(false)} />
    </main>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<p className="px-5 py-10 text-sm text-[#b5a89f]">Abrindo projeto...</p>}>
      <ProjectScreen />
    </Suspense>
  );
}
