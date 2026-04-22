import { cn } from "@/lib/cn";

const variants = {
  primary:
    "border border-rose-400/40 bg-gradient-to-br from-rose-600/80 via-rose-700/60 to-violet-950/90 text-white shadow-[0_0_24px_rgba(232,121,249,0.2)] hover:from-rose-500/90 hover:border-rose-300/55",
  secondary:
    "border border-orange-400/35 bg-gradient-to-br from-orange-500/25 to-orange-950/40 text-orange-50 shadow-[0_0_20px_rgba(34,211,238,0.12)] hover:border-orange-300/50 hover:from-orange-400/35",
  ghost:
    "border border-white/[0.08] bg-white/[0.03] text-[var(--text-secondary)] hover:border-white/15 hover:bg-white/[0.06] hover:text-[var(--text-primary)]",
  danger: "border border-rose-400/35 bg-rose-950/50 text-rose-100 hover:border-rose-300/50",
} as const;

export type ButtonVariant = keyof typeof variants;

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-orbitron text-xs font-bold uppercase tracking-[0.12em] transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 sm:text-[13px]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
