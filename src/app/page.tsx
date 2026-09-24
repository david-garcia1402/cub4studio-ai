import Link from "next/link";
import { HeroPreview } from "@/components/HeroPreview";
import { Logo, LogoMark } from "@/components/Logo";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SHOWCASE } from "@/lib/showcase";
import { STUDIO } from "@/lib/studio";

const steps = [
  { n: "01", title: "Diagnóstico", text: "Você conta o negócio, o público e o que precisa vender. Leva menos de três minutos." },
  { n: "02", title: "Mensagem", text: "Um chat curto guarda as frases que não podem faltar. Do seu jeito, sem jargão." },
  { n: "03", title: "Criação", text: "O preview nasce com a cara de estúdio, no celular primeiro. Você ajusta pedindo em texto." },
  { n: "04", title: "Conversa", text: "Gostou? Chame a cub4Studio. A mensagem já vai com o briefing inteiro." },
];

const offers = [
  {
    title: "Landing page",
    text: "Página que converte: dobra clara, prova social e WhatsApp fixo no celular.",
    span: "lg:col-span-2",
    tone: "from-brand/25 to-transparent",
  },
  { title: "Criativos", text: "Feed, stories e anúncio no mesmo sistema visual.", span: "", tone: "from-gold/20 to-transparent" },
  { title: "Foto de marca", text: "Direção de still para produto e ambiente.", span: "", tone: "from-white/10 to-transparent" },
  { title: "Reel", text: "Gancho, meio e CTA com corte no ritmo.", span: "", tone: "from-[#7c4dff]/25 to-transparent" },
  {
    title: "Automação",
    text: "Do anúncio ao WhatsApp com resposta pronta e passagem para quem atende.",
    span: "lg:col-span-2",
    tone: "from-[#2ec4b6]/20 to-transparent",
  },
];

const marquee = ["Landing page", "Criativos", "Foto de marca", "Reel", "Automação", "Funil no WhatsApp", "Identidade", "Preview em minutos"];

const proofs = [
  ["5", "formatos de projeto"],
  ["~3 min", "de briefing"],
  ["0", "cadastro para ver o preview"],
  ["1", "conversa para fechar"],
];

export default function HomePage() {
  return (
    <>
      <SiteHeader showNav>
        <Link
          href="/criar"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(232,88,63,0.8)] transition-all hover:bg-brand-glow hover:shadow-[0_14px_36px_-10px_rgba(232,88,63,0.9)]"
        >
          Começar
        </Link>
      </SiteHeader>

      <main className="relative overflow-hidden">
        {/* Hero */}
        <section className="relative">
          <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(232,88,63,0.35), rgba(224,177,90,0.12) 55%, transparent 75%)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
            <div>
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brand">
                <LogoMark size={16} />
                Estúdio de criação com IA
              </p>
              <h1 className="animate-fade-up delay-1 mt-6 max-w-3xl font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
                Sua marca merece <span className="text-gradient">presença</span>, não só um site.
              </h1>
              <p className="animate-fade-up delay-2 mt-6 max-w-xl text-lg leading-8 text-sand">
                Um tutorial rápido, um formulário e um chat. Você vê o projeto inteiro antes de falar com alguém.
                Se fizer sentido, a cub4Studio assume dali.
              </p>
              <div className="animate-fade-up delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/criar"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-[0_18px_40px_-14px_rgba(232,88,63,0.9)] transition-all hover:bg-brand-glow hover:shadow-[0_22px_50px_-14px_rgba(232,88,63,1)]"
                >
                  Quero meu projeto
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href="#projetos"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 font-semibold text-cream transition-colors hover:border-white/30 hover:bg-white/5"
                >
                  Ver ideias de projeto
                </Link>
              </div>
              <dl className="animate-fade-up delay-4 mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {proofs.map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-3xl text-cream">{value}</dt>
                    <dd className="mt-1 text-xs leading-5 text-mute">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="animate-fade-up delay-2">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* Faixa */}
        <div className="relative border-y border-white/5 bg-ink-3/60 py-4" aria-hidden="true">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap px-5 text-sm uppercase tracking-[0.22em] text-mute">
            {[...marquee, ...marquee].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-10">
                {item}
                <span className="size-1.5 rounded-full bg-brand" />
              </span>
            ))}
          </div>
        </div>

        {/* Como funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Como funciona</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Quatro passos. Nenhum deles é reunião.</h2>
            <p className="mt-4 text-lg leading-8 text-sand">Você sai daqui com um preview completo e um briefing pronto para conversar.</p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.n}
                className="group relative rounded-3xl border border-white/8 bg-ink-2/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand/40"
              >
                {index < steps.length - 1 ? (
                  <span
                    className="pointer-events-none absolute right-[-18px] top-9 hidden h-px w-8 bg-gradient-to-r from-white/20 to-transparent lg:block"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand/15 font-display text-lg text-brand ring-1 ring-brand/30 transition-colors group-hover:bg-brand group-hover:text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-mute">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Projetos */}
        <section id="projetos" className="relative border-t border-white/5 bg-ink-3/40 py-24">
          <div
            className="pointer-events-none absolute right-[-200px] top-40 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(224,177,90,0.35), transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-5">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Projetos cub4Studio</p>
                <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Ideias que viram projeto em uma conversa.</h2>
                <p className="mt-4 text-lg leading-8 text-sand">
                  Conceitos de partida para tipos de negócio que atendemos. Escolha um parecido com o seu e monte a sua versão.
                </p>
              </div>
              <Link href="/criar" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-cream hover:text-brand">
                Começar do zero <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SHOWCASE.map((idea, index) => (
                <ShowcaseCard key={idea.slug} idea={idea} className={index % 3 === 1 ? "lg:translate-y-10" : ""} />
              ))}
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="servicos" className="mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Serviços</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">O que dá para pedir.</h2>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {offers.map((offer) => (
              <li
                key={offer.title}
                className={`group relative overflow-hidden rounded-3xl border border-white/8 bg-ink-2/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 ${offer.span}`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${offer.tone} opacity-70 transition-opacity group-hover:opacity-100`} aria-hidden="true" />
                <div className="relative">
                  <h3 className="font-display text-2xl">{offer.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-sand">{offer.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand via-brand-deep to-[#3b1410] px-8 py-14 text-white sm:px-14">
            <div className="pointer-events-none absolute -right-10 -top-16 opacity-20" aria-hidden="true">
              <LogoMark size={320} />
            </div>
            <div className="relative max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Pronto para começar</p>
              <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Vamos montar a presença da sua empresa?</h2>
              <p className="mt-4 text-lg leading-8 text-white/85">
                Comece pelo preview. Quando gostar, a conversa no WhatsApp já chega com o briefing escrito.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/criar" className="rounded-full bg-white px-6 py-3.5 font-semibold text-[#1a1210] transition-transform hover:scale-[1.02]">
                  Quero meu projeto
                </Link>
                <a
                  href={`https://wa.me/${STUDIO.whatsappE164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/40 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  WhatsApp {STUDIO.whatsappDisplay}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-mute">
              Estúdio de criação com IA. Landing page, criativos, foto, reel e automação com a cara do seu negócio.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-cream">Navegar</p>
              <ul className="mt-3 space-y-2 text-mute">
                <li><Link className="hover:text-cream" href="/#como-funciona">Como funciona</Link></li>
                <li><Link className="hover:text-cream" href="/#projetos">Projetos</Link></li>
                <li><Link className="hover:text-cream" href="/#servicos">Serviços</Link></li>
                <li><Link className="hover:text-cream" href="/criar">Criar projeto</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-cream">Falar</p>
              <ul className="mt-3 space-y-2 text-mute">
                <li>
                  <a className="hover:text-cream" href={`https://wa.me/${STUDIO.whatsappE164}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a className="hover:text-cream" href={`https://instagram.com/${STUDIO.instagram}`} target="_blank" rel="noopener noreferrer">
                    @{STUDIO.instagram}
                  </a>
                </li>
                <li>
                  <a className="hover:text-cream" href={`mailto:${STUDIO.email}`}>
                    {STUDIO.email}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-cream">Privacidade</p>
              <ul className="mt-3 space-y-2 text-mute">
                <li><Link className="hover:text-cream" href="/conta">Seus dados</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-mute">
            © {new Date().getFullYear()} {STUDIO.name}. Os projetos ficam no seu navegador até você decidir enviar.
          </p>
        </div>
      </footer>
    </>
  );
}
