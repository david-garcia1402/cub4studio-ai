import Link from "next/link";
import type { ShowcaseIdea } from "@/lib/showcase";
import { productLabel } from "@/lib/studio";
import type { ProductType } from "@/lib/types";

/** Composição abstrata que sugere o formato do projeto sem depender de imagem. */
function Cover({ product, palette }: { product: ProductType; palette: [string, string] }) {
  const [a, b] = palette;
  const glass = "rounded-md bg-white/85 shadow-sm";
  const base = "relative aspect-[4/3] overflow-hidden rounded-2xl";
  const bg = { background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` };

  if (product === "landing") {
    return (
      <div className={base} style={bg}>
        <div className="absolute inset-x-6 top-6 bottom-0 rounded-t-xl bg-ink/85 p-3 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 group-hover:-translate-y-2">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
          </div>
          <div className="mt-3 h-2 w-2/3 rounded bg-white/80" />
          <div className="mt-1.5 h-2 w-1/2 rounded bg-white/40" />
          <div className="mt-3 h-5 w-20 rounded-full" style={{ background: a }} />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <div className="h-8 rounded bg-white/10" />
            <div className="h-8 rounded bg-white/10" />
            <div className="h-8 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }
  if (product === "criativo") {
    return (
      <div className={base} style={bg}>
        <div className="absolute left-1/2 top-1/2 size-28 -translate-x-[30%] -translate-y-[62%] rotate-[9deg] rounded-xl bg-white/20 ring-1 ring-white/30 transition-transform duration-500 group-hover:translate-x-[-20%] group-hover:rotate-[12deg]" />
        <div className="absolute left-1/2 top-1/2 size-28 -translate-x-[70%] -translate-y-[38%] rotate-[-8deg] rounded-xl bg-ink/85 p-3 shadow-xl ring-1 ring-white/10 transition-transform duration-500 group-hover:rotate-[-4deg]">
          <div className="h-2 w-10 rounded bg-white/40" />
          <div className="mt-6 h-3 w-20 rounded bg-white/90" />
          <div className="mt-1.5 h-3 w-14 rounded bg-white/90" />
          <div className="mt-3 h-4 w-12 rounded-full" style={{ background: a }} />
        </div>
      </div>
    );
  }
  if (product === "reel") {
    return (
      <div className={base} style={bg}>
        <div className="absolute left-1/2 top-4 h-[130%] w-24 -translate-x-1/2 rounded-[1.4rem] bg-ink/85 p-2 ring-1 ring-white/10 transition-transform duration-500 group-hover:-translate-y-2">
          <div className="mx-auto h-1 w-8 rounded-full bg-white/30" />
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/20">
            <div className="h-full w-1/3 rounded-full" style={{ background: a }} />
          </div>
          <div className="mt-10 ml-auto flex w-6 flex-col gap-2">
            <span className="size-6 rounded-full bg-white/20" />
            <span className="size-6 rounded-full bg-white/20" />
            <span className="size-6 rounded-full bg-white/20" />
          </div>
          <div className="mt-4 h-2 w-2/3 rounded bg-white/80" />
          <div className="mt-1.5 h-2 w-1/2 rounded bg-white/40" />
        </div>
        <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 1.5v9l7-4.5-7-4.5Z" fill="currentColor" />
          </svg>
        </span>
      </div>
    );
  }
  if (product === "foto") {
    return (
      <div className={base} style={bg}>
        <div className="absolute inset-6 rounded-xl border border-white/30 transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-1/2 top-[58%] size-16 -translate-x-1/2 rounded-full bg-ink/70 blur-md" />
        <div className="absolute left-1/2 top-1/2 h-24 w-14 -translate-x-1/2 -translate-y-1/2 rounded-t-full rounded-b-lg bg-ink/90 ring-1 ring-white/20" />
        <div className="absolute right-8 top-8 flex gap-1">
          <span className="h-3 w-3 rounded-sm border border-white/60" />
          <span className="h-3 w-3 rounded-sm border border-white/60" />
        </div>
      </div>
    );
  }
  return (
    <div className={base} style={bg}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 200 150" fill="none" aria-hidden="true">
        <path d="M40 40 C 90 40, 90 75, 140 75 M40 110 C 90 110, 90 75, 140 75" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
      <div className={`absolute left-[10%] top-[16%] flex h-10 w-[26%] items-center justify-center text-[10px] font-semibold text-ink ${glass}`}>Anúncio</div>
      <div className={`absolute left-[10%] bottom-[16%] flex h-10 w-[26%] items-center justify-center text-[10px] font-semibold text-ink ${glass}`}>Form</div>
      <div className="absolute left-[62%] top-1/2 flex h-12 w-[26%] -translate-y-1/2 items-center justify-center rounded-lg bg-ink text-[10px] font-semibold text-white ring-1 ring-white/20 transition-transform duration-500 group-hover:translate-x-1">
        Whats
      </div>
    </div>
  );
}

export function ShowcaseCard({ idea, className = "" }: { idea: ShowcaseIdea; className?: string }) {
  return (
    <article
      className={`group flex flex-col rounded-3xl border border-white/8 bg-ink-2/80 p-3 transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_30px_60px_-30px_rgba(232,88,63,0.45)] ${className}`}
    >
      <Cover product={idea.product} palette={idea.palette} />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{productLabel(idea.product)}</span>
          <span className="text-xs text-mute">{idea.segment}</span>
        </div>
        <h3 className="mt-2 font-display text-2xl leading-tight">{idea.name}</h3>
        <p className="mt-1 font-medium text-sand">{idea.headline}</p>
        <p className="mt-2 text-sm leading-6 text-mute">{idea.text}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {idea.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-sand">
              {tag}
            </li>
          ))}
        </ul>
        <Link
          href={`/criar?produto=${idea.product}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cream transition-colors group-hover:text-brand"
        >
          Criar um parecido
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
