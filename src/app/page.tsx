"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import Questionnaire from "@/components/Questionnaire";
import ColorPalette from "@/components/ColorPalette";
import PatternGrid from "@/components/PatternGrid";
import type { UploadResult } from "@/types/upload";
import type { GridPattern } from "@/types/pattern";

export default function Home() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[] | null>(null);
  const [pattern, setPattern] = useState<GridPattern | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
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
        <ImageUpload onUploadComplete={(result) => setUploadResult(result)} />
      </div>

      {/* Questionnaire — appears after image upload */}
      {uploadResult && (
        <Questionnaire
          imageUrl={uploadResult.publicUrl}
          onColorsExtracted={(colors) => setExtractedColors(colors)}
          onPatternGenerated={(p) => setPattern(p)}
        />
      )}

      {/* Extracted color palette — appears after questionnaire submit */}
      {extractedColors && (
        <ColorPalette colors={extractedColors} />
      )}

      {/* Generated crochet pattern grid */}
      {pattern && (
        <PatternGrid pattern={pattern} />
      )}
    </div>
  );
}
