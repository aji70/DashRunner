import { cn } from "@/lib/cn";

export function GlassPanel({
  children,
  className,
  hover = false,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--panel)] shadow-[var(--shadow-panel)] backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-orange-300/25 before:to-transparent",
        hover && "transition duration-300 hover:border-[var(--line-bright)] hover:bg-[var(--panel-hover)]",
        active && "border-[var(--line-bright)] bg-[var(--panel-active)] shadow-[0_0_0_1px_rgba(244,114,182,0.12),0_20px_50px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
