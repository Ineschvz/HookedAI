"use client";

import { useState } from "react";
import { saveQuestionnaire } from "@/lib/questionnaire";
import type { DifficultyLevel, PatternStyle } from "@/types/questionnaire";

interface QuestionnaireProps {
  imageUrl: string;
}

export default function Questionnaire({ imageUrl }: QuestionnaireProps) {
  const [stitchWidth, setStitchWidth] = useState<number>(50);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("beginner");
  const [patternStyle, setPatternStyle] = useState<PatternStyle>("simple-blocky");
  const [colorCount, setColorCount] = useState<number>(4);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      await saveQuestionnaire({
        imageUrl,
        stitchWidth,
        difficultyLevel,
        patternStyle,
        colorCount,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-lg mx-auto mt-8 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-6 py-5 text-center">
        <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
          Your preferences have been saved!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto mt-8 space-y-6">
      <h2 className="text-xl font-semibold">Pattern Preferences</h2>

      {/* Stitch Width */}
      <div>
        <label htmlFor="stitchWidth" className="block text-sm font-medium mb-1">
          How many stitches wide do you want the final piece?
        </label>
        <input
          id="stitchWidth"
          type="number"
          min={10}
          max={500}
          value={stitchWidth}
          onChange={(e) => setStitchWidth(Number(e.target.value))}
          className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
          required
        />
        <p className="mt-1 text-xs text-foreground/50">Between 10 and 500 stitches</p>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Difficulty level?
        </label>
        <div className="flex gap-3">
          {(["beginner", "intermediate", "advanced"] as DifficultyLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficultyLevel(level)}
              className={`
                flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors
                ${
                  difficultyLevel === level
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/40"
                }
              `}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Style */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Do you prefer realistic or simple blocky patterns?
        </label>
        <div className="flex gap-3">
          {([
            { value: "realistic" as PatternStyle, label: "Realistic" },
            { value: "simple-blocky" as PatternStyle, label: "Simple & Blocky" },
          ]).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPatternStyle(option.value)}
              className={`
                flex-1 rounded-lg border px-3 py-2 text-sm transition-colors
                ${
                  patternStyle === option.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/40"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Count */}
      <div>
        <label htmlFor="colorCount" className="block text-sm font-medium mb-1">
          How many colors do you want in your color palette?
        </label>
        <input
          id="colorCount"
          type="number"
          min={2}
          max={20}
          value={colorCount}
          onChange={(e) => setColorCount(Number(e.target.value))}
          className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/30"
          required
        />
        <p className="mt-1 text-xs text-foreground/50">Between 2 and 20 colors</p>
      </div>

      {/* Error */}
      {status === "error" && error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg bg-foreground text-background py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Generate Pattern"}
      </button>
    </form>
  );
}
