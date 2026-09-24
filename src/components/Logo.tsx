import Link from "next/link";

/**
 * Marca da cub4Studio: um cubo isométrico com a face de cima em coral.
 * Feito em SVG inline para escalar nítido do favicon ao hero.
 */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="cub4-top" x1="14" y1="10" x2="50" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff8a6a" />
          <stop offset="1" stopColor="#e8583f" />
        </linearGradient>
        <linearGradient id="cub4-left" x1="12" y1="24" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f7f1ea" />
          <stop offset="1" stopColor="#d9cfc6" />
        </linearGradient>
        <linearGradient id="cub4-right" x1="32" y1="24" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0b15a" />
          <stop offset="1" stopColor="#b98a3a" />
        </linearGradient>
      </defs>
      <path d="M32 6 54 18.5v25L32 56 10 43.5v-25L32 6Z" fill="#0d0817" opacity="0.35" />
      <path d="M32 8 52 19.5 32 31 12 19.5 32 8Z" fill="url(#cub4-top)" />
      <path d="M12 19.5 32 31v23L12 42.5v-23Z" fill="url(#cub4-left)" />
      <path d="M52 19.5 32 31v23l20-11.5v-23Z" fill="url(#cub4-right)" />
      <path d="M32 31v23" stroke="#0d0817" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M12 19.5 32 31 52 19.5" stroke="#0d0817" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M20 24.5 32 31l12-6.5" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  href = "/",
  size = "md",
  className = "",
}: {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const mark = size === "lg" ? 44 : size === "sm" ? 26 : 34;
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={mark} className="shrink-0 drop-shadow-[0_6px_14px_rgba(232,88,63,0.35)]" />
      <span className={`font-display ${text} leading-none tracking-tight text-cream`}>
        cub<span className="text-brand">4</span>Studio
      </span>
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="cub4Studio — início" className="rounded-lg transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}
