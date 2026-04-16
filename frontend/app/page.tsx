import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#2a1452,_#12091f_55%,_#05060d)] px-6">
      <div className="w-full max-w-md rounded-3xl border border-fuchsia-300/20 bg-black/20 p-8 text-center shadow-2xl backdrop-blur-md">
        <p className="font-orbitron text-xs uppercase tracking-[0.35em] text-cyan-200/75">
          Endless Runner
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-yellow-200 bg-clip-text font-orbitron text-5xl font-bold text-transparent sm:text-6xl">
          DASH
        </h1>
        <p className="mt-4 text-sm leading-6 text-cyan-50/80">
          Swipe to dodge obstacles, collect coin rush streaks, and keep your run alive.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/play"
            className="rounded-2xl border border-fuchsia-300 bg-fuchsia-500/20 px-6 py-4 font-orbitron text-base font-semibold text-cyan-50 transition hover:bg-fuchsia-500/30"
          >
            Start Run
          </Link>
          <p className="text-xs text-cyan-100/55">
            Mobile-first arcade runner
          </p>
        </div>
      </div>
    </main>
  );
}
