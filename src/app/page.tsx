export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Main heading */}
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        HookedAI
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-md">
        We're plotting your next obsession. Turn any photo into a crochet pattern powered by AI.
      </p>

      {/* Coming soon badge */}
      <span className="mt-8 inline-block rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
        Coming Soon
      </span>
    </div>
  );
}
