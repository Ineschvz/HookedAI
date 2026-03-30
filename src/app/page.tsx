import ImageUpload from "@/components/ImageUpload";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Main heading */}
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        HookedAI
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-md">
        Turn any photo into a crochet pattern powered by AI.
      </p>

      {/* Image upload */}
      <div className="mt-10 w-full max-w-lg">
        <ImageUpload />
      </div>
    </div>
  );
}
