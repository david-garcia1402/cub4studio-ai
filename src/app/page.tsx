import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

const steps = [
  { n: "01", title: "Diagnóstico", text: "Você conta o negócio, o público e o que precisa vender." },
  { n: "02", title: "Mensagem", text: "Um chat curto guarda as frases que não podem faltar." },
  { n: "03", title: "Criação", text: "O preview nasce com a cara de estúdio, no celular primeiro." },
  { n: "04", title: "Conversa", text: "Se gostar, chame a cub4Studio. A mensagem já leva o briefing." },
];

const offers = [
  ["Landing page", "Página conversora com WhatsApp."],
  ["Criativos", "Feed, stories e anúncio."],
  ["Foto de marca", "Direção de still."],
  ["Reel", "Gancho, meio e CTA."],
  ["Automação", "Funil até a conversa."],
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-6">
      <header className="flex items-center justify-between">
        <Wordmark />
        <Link href="/criar" className="rounded-full bg-[#e8583f] px-4 py-2 text-sm font-semibold text-white">
          Começar
        </Link>
      </header>
      <section className="py-16 sm:py-24">
        <p className="text-sm uppercase tracking-[0.22em] text-[#e8583f]">Estúdio de criação com IA</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
          Desenvolva a presença da sua empresa com a cub4Studio.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#d9cfc6]">
          Um tutorial rápido, um formulário e um chat. Você vê o projeto inteiro. Se fizer sentido, fala com a gente.
        </p>
        <Link href="/criar" className="mt-8 inline-flex rounded-full bg-[#e8583f] px-6 py-3 font-semibold text-white">
          Quero meu projeto
        </Link>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <article key={step.n} className="rounded-3xl border border-white/10 bg-[#161022] p-5">
            <p className="font-display text-2xl text-[#e8583f]">{step.n}</p>
            <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#b5a89f]">{step.text}</p>
          </article>
        ))}
      </section>
      <section className="py-14">
        <h2 className="font-display text-3xl">O que dá para pedir</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-5">
          {offers.map(([title, text]) => (
            <li key={title} className="rounded-2xl bg-[#161022] p-4">
              <strong className="block">{title}</strong>
              <span className="mt-1 block text-sm text-[#b5a89f]">{text}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
