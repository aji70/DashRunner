import { cn } from "@/lib/cn";

export function InlineNotice({
  children,
  tone = "info",
  className,
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "warn";
  className?: string;
}) {
  const tones = {
    info: "border-cyan-400/20 bg-cyan-500/[0.07] text-cyan-100/85",
    success: "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-100/90",
    warn: "border-amber-300/25 bg-amber-400/[0.08] text-amber-50/90",
  } as const;
  return (
    <p role="status" className={cn("rounded-xl border px-4 py-3 font-rajdhani text-sm leading-relaxed", tones[tone], className)}>
      {children}
    </p>
  );
}
