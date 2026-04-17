import { minikitConfig } from "../../../minikit.config";

function parseAccountAssociation(): Record<string, string> | undefined {
  const raw = process.env.FARCASTER_ACCOUNT_ASSOCIATION?.trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return undefined;
    const o = parsed as Record<string, unknown>;
    const header = o.header;
    const payload = o.payload;
    const signature = o.signature;
    if (typeof header !== "string" || typeof payload !== "string" || typeof signature !== "string") {
      return undefined;
    }
    return { header, payload, signature };
  } catch {
    return undefined;
  }
}

/** Farcaster Mini App manifest (MiniPay-friendly: Celo in `miniapp.requiredChains`). */
export async function GET() {
  const accountAssociation = parseAccountAssociation();
  const body = accountAssociation ? { accountAssociation, ...minikitConfig } : { ...minikitConfig };
  return Response.json(body);
}
