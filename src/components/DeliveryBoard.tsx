import { productLabel } from "@/lib/studio";
import type { WebsiteSchema } from "@/lib/types";

export function DeliveryBoard({ schema }: { schema: WebsiteSchema }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#161022] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e8583f]">{productLabel(schema.project.product)}</p>
      <h2 className="mt-2 font-display text-4xl text-[#f7f1ea]">{schema.project.businessName}</h2>
      <p className="mt-3 max-w-xl text-[#d9cfc6]">{schema.seo.description}</p>
      <div className="mt-6 grid gap-3">
        {schema.delivery.map((piece) => (
          <article key={piece.label} className="rounded-2xl bg-[#100c18] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#e0b15a]">{piece.label}</p>
            <h3 className="mt-1 text-lg font-semibold text-[#f7f1ea]">{piece.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#b5a89f]">{piece.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
