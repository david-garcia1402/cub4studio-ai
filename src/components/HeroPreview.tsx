import { LogoMark } from "./Logo";

/** Mock de um preview gerado, no celular, para mostrar o resultado antes de o visitante começar. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />

      <div className="relative animate-float-slow">
        <div className="mx-auto w-[260px] rounded-[2.4rem] border border-white/15 bg-ink-3 p-2 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-black/60">
          <div className="overflow-hidden rounded-[1.9rem] bg-[#f4efe7] text-[#1a1210]">
            <div className="flex items-center justify-between px-4 pt-3 text-[10px] text-[#1a1210]/60">
              <span>9:41</span>
              <span className="mx-auto h-4 w-16 -translate-x-2 rounded-full bg-ink" />
              <span>●●●</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-display text-sm">Grão &amp; Prosa</span>
              <span className="text-[9px] text-[#1a1210]/60">Blumenau</span>
            </div>
            <div className="px-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-brand">Cafeteria de bairro</p>
              <p className="mt-1 font-display text-[19px] leading-[1.1]">Café coado na hora, a duas quadras de você.</p>
              <p className="mt-2 text-[10px] leading-4 text-[#1a1210]/65">Pão de fermentação natural, brunch no fim de semana e reserva pelo WhatsApp.</p>
              <span className="mt-3 inline-flex rounded-full bg-brand px-3 py-1.5 text-[10px] font-semibold text-white">Reservar mesa</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
              {["Coados", "Brunch", "Doces"].map((item, index) => (
                <div key={item} className="rounded-lg bg-white p-2 shadow-sm">
                  <div className={`h-8 rounded-md ${index === 0 ? "bg-brand/80" : index === 1 ? "bg-gold/80" : "bg-ink-4/80"}`} />
                  <p className="mt-1.5 text-[9px] font-semibold">{item}</p>
                </div>
              ))}
            </div>
            <div className="mx-4 my-4 rounded-xl bg-ink p-3 text-cream">
              <p className="font-display text-[13px]">Hoje tem mesa às 16h.</p>
              <p className="text-[9px] text-sand">Chame no WhatsApp.</p>
            </div>
          </div>
        </div>

        <div className="absolute -left-4 top-14 hidden animate-float items-center gap-2 rounded-2xl border border-white/10 bg-ink-2/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-400" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Preview pronto
        </div>

        <div className="absolute -right-2 bottom-20 hidden w-44 animate-float rounded-2xl border border-white/10 bg-ink-2/90 p-3 text-xs shadow-xl backdrop-blur [animation-delay:1.2s] sm:block">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span className="font-semibold">cub4Studio</span>
          </div>
          <p className="mt-2 leading-5 text-sand">Briefing já vai escrito na mensagem do WhatsApp.</p>
        </div>

        <div className="absolute -right-6 top-6 hidden rounded-2xl border border-white/10 bg-ink-2/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:block">
          <span className="text-mute">Formato</span>
          <p className="font-semibold text-cream">Landing page</p>
        </div>
      </div>
    </div>
  );
}
