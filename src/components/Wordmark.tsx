export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-xl tracking-tight ${className}`}>
      cub<span className="text-[#e8583f]">4</span>Studio
    </span>
  );
}
