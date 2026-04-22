import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "cyan" | "amber" | "magenta";
  className?: string;
}) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-[var(--text-dim)]",
    cyan: "border-orange-400/25 bg-orange-500/10 text-orange-200/90",
    amber: "border-amber-300/25 bg-amber-400/10 text-amber-100/90",
    magenta: "border-rose-400/25 bg-rose-500/10 text-rose-100/90",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 font-rajdhani text-[10px] font-bold uppercase tracking-widest",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
