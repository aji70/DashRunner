import { cn } from "@/lib/cn";

export function TextField({
  label,
  className,
  inputClassName,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; inputClassName?: string }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">
        {label}
      </span>
      <input
        className={cn(
          "w-full rounded-xl border border-white/[0.1] bg-black/50 px-4 py-3.5 font-mono text-sm text-[var(--text-primary)] shadow-panel-inset outline-none transition placeholder:text-[var(--text-dim)] focus:border-orange-400/40 focus:ring-2 focus:ring-orange-400/20",
          inputClassName
        )}
        {...props}
      />
    </label>
  );
}
