import { RUNNER_CHARACTERS, CITY_ROUTES } from "@/lib/gameCatalog";

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
