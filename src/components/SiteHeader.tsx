import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

const nav = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#projetos", label: "Projetos" },
  { href: "/#servicos", label: "Serviços" },
];

export function SiteHeader({ children, showNav = false }: { children?: ReactNode; showNav?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />
        {showNav ? (
          <nav aria-label="Seções" className="hidden items-center gap-7 text-sm text-sand md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-cream">
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </header>
  );
}
