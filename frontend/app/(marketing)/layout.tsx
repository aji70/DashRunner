import { SiteShell } from "@/components/site/SiteShell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <div className="relative">{children}</div>
    </SiteShell>
  );
}
