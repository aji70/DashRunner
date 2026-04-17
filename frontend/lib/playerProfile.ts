import { RUNNER_CHARACTERS, CITY_ROUTES } from "@/lib/gameCatalog";
import { apiGet, apiSend } from "@/lib/api";

const STORAGE_KEY = "dashrunner_player_profile_v1";

export type PlayerProfileV1 = {
  walletAddress: string | null;
  selectedCharacterId: number;
  selectedCityId: number;
  ownedCharacterIds: number[];
  /** Mirrors backend soft currency when synced. */
  softCurrency: number;
  lastDailyClaimIso: string | null;
  claimStreak: number;
};

const defaultProfile = (): PlayerProfileV1 => ({
  walletAddress: null,
  selectedCharacterId: 0,
  selectedCityId: 0,
  ownedCharacterIds: [0],
  softCurrency: 0,
  lastDailyClaimIso: null,
  claimStreak: 0,
});

export function loadLocalProfile(): PlayerProfileV1 {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<PlayerProfileV1>;
    const base = defaultProfile();
    return {
      ...base,
      ...parsed,
      ownedCharacterIds: Array.isArray(parsed.ownedCharacterIds)
        ? [...new Set([0, ...parsed.ownedCharacterIds.map(Number)])]
        : base.ownedCharacterIds,
    };
  } catch {
    return defaultProfile();
  }
}

export function saveLocalProfile(next: PlayerProfileV1) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function characterAccent(characterId: number): string | undefined {
  const c = RUNNER_CHARACTERS.find((x) => x.id === characterId);
  return c?.accentHex;
}

export function assertValidCityId(id: number) {
  const ok = CITY_ROUTES.some((c) => c.id === id);
  if (!ok) return 0;
  return id;
}

type ServerPlayer = {
  softCurrency: number;
  ownedCharacterIds: number[];
  selectedCharacterId: number;
  selectedCityId: number;
  lastDailyClaimUtc: string | null;
  claimStreak: number;
};

export async function pullProfileFromServer(wallet: string): Promise<PlayerProfileV1 | null> {
  try {
    const res = await apiGet<{ success: boolean; data: ServerPlayer & { wallet: string } }>(
      `/api/player/${encodeURIComponent(wallet)}`
    );
    if (!res.success || !res.data) return null;
    const d = res.data;
    const merged: PlayerProfileV1 = {
      walletAddress: d.wallet,
      softCurrency: d.softCurrency,
      ownedCharacterIds: d.ownedCharacterIds,
      selectedCharacterId: d.selectedCharacterId,
      selectedCityId: d.selectedCityId,
      lastDailyClaimIso: d.lastDailyClaimUtc ? `${d.lastDailyClaimUtc}T00:00:00.000Z` : null,
      claimStreak: d.claimStreak,
    };
    saveLocalProfile(merged);
    return merged;
  } catch {
    return null;
  }
}

export async function pushLoadoutToServer(wallet: string, characterId: number, cityId: number) {
  await apiSend(`/api/player/${encodeURIComponent(wallet)}`, {
    method: "PATCH",
    body: JSON.stringify({ selectedCharacterId: characterId, selectedCityId: cityId }),
  });
}
