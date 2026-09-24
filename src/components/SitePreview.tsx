import type { WebsiteSchema } from "@/lib/types";
import { waLink } from "@/lib/text";

function Action({
  label,
  phone,
  accent,
  foreground,
}: {
  label: string;
  phone: string;
  accent: string;
  foreground: string;
}) {
  const href = phone ? waLink(phone, label) : null;
  const className = "inline-flex rounded-full px-5 py-3 text-sm font-semibold";
  if (!href) {
    return (
      <span className={className} style={{ background: accent, color: foreground }}>
        {label}
      </span>
    );
  }
  return (
    <a className={className} style={{ background: accent, color: "#1a1210" }} href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export function SitePreview({ schema }: { schema: WebsiteSchema }) {
  const { theme } = schema;
  return (
    <article style={{ background: theme.background, color: theme.foreground }} className="overflow-hidden rounded-3xl border border-white/10">
      {schema.sections.map((section, index) => {
        if (section.type === "navbar") {
          return (
            <header key={index} className="flex items-center justify-between px-5 py-4 sm:px-8">
              <strong className="font-display text-lg">{section.props.businessName}</strong>
              <span className="text-xs" style={{ color: theme.muted }}>
                {section.props.city}
              </span>
            </header>
          );
        }
        if (section.type === "hero") {
          const center = section.variant === "center";
          return (
            <section key={index} className={`px-5 py-12 sm:px-8 ${center ? "text-center" : "sm:grid sm:grid-cols-2 sm:items-end sm:gap-10"}`}>
              <div>
                <p className="text-xs uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
                  {section.props.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{section.props.title}</h2>
              </div>
              <div className={center ? "mx-auto mt-6 max-w-xl" : "mt-6"}>
                <p className="text-base leading-7" style={{ color: theme.muted }}>
                  {section.props.subtitle}
                </p>
                <div className="mt-6">
                  <Action label={section.props.cta} phone={section.props.whatsapp} accent={theme.accent} foreground={theme.background} />
                </div>
              </div>
            </section>
          );
        }
        if (section.type === "services") {
          return (
            <section key={index} className="px-5 py-10 sm:px-8">
              <h3 className="font-display text-2xl">{section.props.title}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {section.props.items.map((item) => (
                  <div key={item.title} className="rounded-2xl p-4" style={{ background: theme.surface }}>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6" style={{ color: theme.muted }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        if (section.type === "about") {
          return (
            <section key={index} className="grid gap-6 px-5 py-10 sm:grid-cols-2 sm:px-8">
              <div>
                <h3 className="font-display text-2xl">{section.props.title}</h3>
                <p className="mt-3 leading-7" style={{ color: theme.muted }}>
                  {section.props.text}
                </p>
              </div>
              <ul className="space-y-3">
                {section.props.points.map((point) => (
                  <li key={point} className="rounded-2xl px-4 py-3 text-sm" style={{ background: theme.surface }}>
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          );
        }
        if (section.type === "proof") {
          return (
            <section key={index} className="px-5 py-10 sm:px-8">
              <h3 className="font-display text-2xl">{section.props.title}</h3>
              <p className="mt-2 text-sm" style={{ color: theme.accent }}>
                {section.props.note}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {section.props.quotes.map((quote) => (
                  <blockquote key={quote} className="rounded-2xl p-4 text-sm leading-6" style={{ background: theme.surface }}>
                    “{quote}”
                  </blockquote>
                ))}
              </div>
            </section>
          );
        }
        if (section.type === "faq") {
          return (
            <section key={index} className="px-5 py-10 sm:px-8">
              <h3 className="font-display text-2xl">{section.props.title}</h3>
              <div className="mt-4 space-y-3">
                {section.props.items.map((item) => (
                  <details key={item.q} className="rounded-2xl px-4 py-3" style={{ background: theme.surface }}>
                    <summary className="cursor-pointer font-semibold">{item.q}</summary>
                    <p className="mt-2 text-sm leading-6" style={{ color: theme.muted }}>
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          );
        }
        if (section.type === "gallery") {
          const row = section.variant === "row";
          return (
            <section key={index} className="px-5 py-10 sm:px-8">
              <h3 className="font-display text-2xl">{section.props.title}</h3>
              <div className={`mt-4 grid gap-3 ${row ? "sm:grid-cols-3" : "grid-cols-2"}`}>
                {section.props.items.map((item) => (
                  <div key={item} className="flex aspect-[4/3] items-end rounded-2xl p-4" style={{ background: theme.surface }}>
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        if (section.type === "contact") {
          const href = section.props.whatsapp ? waLink(section.props.whatsapp, section.props.title) : null;
          return (
            <section key={index} className="px-5 py-8 sm:px-8">
              <div className="rounded-3xl p-5" style={{ background: theme.surface }}>
                <h3 className="font-display text-2xl">{section.props.title}</h3>
                <p className="mt-2 text-sm" style={{ color: theme.muted }}>{section.props.text}</p>
                <p className="mt-2 text-sm">{section.props.city}</p>
                {href ? (
                  <a className="mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold" style={{ background: theme.accent, color: "#1a1210" }} href={href} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </section>
          );
        }
        if (section.type === "cta") {
          return (
            <section key={index} className="mx-5 mb-8 rounded-3xl px-5 py-8 sm:mx-8" style={{ background: theme.accent, color: "#1a1210" }}>
              <h3 className="font-display text-3xl">{section.props.title}</h3>
              <p className="mt-2">{section.props.text}</p>
              <div className="mt-5">
                <Action label={section.props.cta} phone={section.props.whatsapp} accent="#1a1210" foreground={theme.accent} />
              </div>
            </section>
          );
        }
        const stacked = section.variant === "stacked";
        return (
          <footer key={index} className={`px-5 py-6 text-sm sm:px-8 ${stacked ? "space-y-1" : "flex items-center justify-between"}`} style={{ color: theme.muted }}>
            <span>{section.props.businessName}</span>
            <span>{section.props.city}</span>
          </footer>
        );
      })}
    </article>
  );
}
