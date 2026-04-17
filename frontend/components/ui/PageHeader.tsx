import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("space-y-3", className)}>
      {eyebrow ? (
        <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-dim)]">{eyebrow}</p>
      ) : null}
      <h1 className="font-orbitron text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">{title}</h1>
      {children ? (
        <div className="max-w-2xl font-rajdhani text-[15px] leading-relaxed text-[var(--text-secondary)]">{children}</div>
      ) : null}
    </header>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-white/[0.12] bg-black/40 px-1.5 py-0.5 font-mono text-[12px] text-cyan-200/90">
      {children}
    </kbd>
  );
}
