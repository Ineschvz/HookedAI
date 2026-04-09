import { pixelSampleGrid } from "./pixel-grid";
import type { GridPattern } from "@/types/pattern";
import type { DifficultyLevel, PatternStyle } from "@/types/questionnaire";

interface GeneratePatternParams {
  imageUrl: string;
  colors: string[];
  stitchWidth: number;
  difficultyLevel: DifficultyLevel;
  patternStyle: PatternStyle;
  colorCount: number;
}

/**
 * Generate a crochet grid pattern:
 * 1. Client-side canvas pixel sampling to build the grid (fast, accurate)
 * 2. Server-side API call to name colors and save to Supabase
 */
export async function generatePattern(
  params: GeneratePatternParams
): Promise<GridPattern> {
  // Step 1: Generate the grid client-side via canvas pixel sampling
  const { grid, width, height } = await pixelSampleGrid(
    params.imageUrl,
    params.colors,
    params.stitchWidth,
    params.difficultyLevel,
    params.patternStyle
  );

  // Step 2: Send grid to API for color naming and Supabase persistence
  const res = await fetch("/api/generate-pattern", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl: params.imageUrl,
      grid,
      palette: params.colors,
      width,
      height,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to generate pattern.");
  }

  return res.json();
}
