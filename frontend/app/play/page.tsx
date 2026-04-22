import { RunnerGame, type RunnerGameMode } from "@/components/runner/RunnerGame";

type PlayPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function PlayPage({ searchParams }: PlayPageProps) {
  const raw = searchParams.mode;
  const modeParam = Array.isArray(raw) ? raw[0] : raw;
  const gameMode: RunnerGameMode = modeParam === "racing" ? "racing" : "endless";
  const startRaw = searchParams.start;
  const startParam = Array.isArray(startRaw) ? startRaw[0] : startRaw;
  const autoStart =
    gameMode === "endless" && (startParam === "1" || startParam === "true" || startParam === "yes");
  return <RunnerGame gameMode={gameMode} autoStart={autoStart} />;
}
