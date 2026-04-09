"use client";

import { useState } from "react";
import type { GridPattern } from "@/types/pattern";

interface PatternGridProps {
  pattern: GridPattern;
}

const GRIDLINE_OPTIONS = [
  { label: "None", value: "none", color: "transparent" },
  { label: "White", value: "white", color: "#FFFFFF" },
  { label: "Light Gray", value: "lightgray", color: "#CCCCCC" },
  { label: "Gray", value: "gray", color: "#888888" },
  { label: "Dark Gray", value: "darkgray", color: "#444444" },
  { label: "Black", value: "black", color: "#000000" },
] as const;

/**
 * Displays the generated crochet grid pattern as a visual grid
 * of colored cells, plus a color palette legend and gridline controls.
 */
export default function PatternGrid({ pattern }: PatternGridProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [gridlineColor, setGridlineColor] = useState<string>("#888888");

  // Build a lookup from hex → color name for hover tooltips
  const colorNames: Record<string, string> = {};
  for (const color of pattern.palette) {
    colorNames[color.hex.toUpperCase()] = color.name;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Crochet Pattern</h2>
      <p className="text-sm text-foreground/50 mb-4">
        {pattern.width} stitches wide × {pattern.height} rows tall
      </p>

      {/* Color palette legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {pattern.palette.map((color, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded border border-foreground/10"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-xs text-foreground/70">{color.name}</span>
          </div>
        ))}
      </div>

      {/* Gridline color selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-foreground/60">Gridlines:</span>
        <div className="flex gap-1.5">
          {GRIDLINE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGridlineColor(option.color)}
              className={`
                w-7 h-7 rounded border-2 transition-all
                ${gridlineColor === option.color
                  ? "border-foreground scale-110"
                  : "border-foreground/20 hover:border-foreground/40"
                }
              `}
              style={{
                backgroundColor: option.color === "transparent"
                  ? "transparent"
                  : option.color,
              }}
              title={option.label}
            >
              {/* Show an X for the "None" option */}
              {option.value === "none" && (
                <span className="text-xs text-foreground/50 font-bold">X</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hover indicator */}
      {hoveredColor && (
        <p className="text-xs text-foreground/60 mb-2">
          {colorNames[hoveredColor.toUpperCase()] || hoveredColor}
        </p>
      )}

      {/* Grid */}
      <div className="overflow-auto max-h-[70vh] border border-foreground/10 rounded-lg">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${pattern.width}, 1fr)`,
            minWidth: `${pattern.width * 12}px`,
          }}
        >
          {pattern.grid.flatMap((row, rowIndex) =>
            row.map((hex, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square"
                style={{
                  backgroundColor: hex,
                  // Apply gridline as a 1px border in the chosen color
                  boxShadow: gridlineColor !== "transparent"
                    ? `inset 0 0 0 0.5px ${gridlineColor}`
                    : "none",
                }}
                onMouseEnter={() => setHoveredColor(hex)}
                onMouseLeave={() => setHoveredColor(null)}
                title={colorNames[hex.toUpperCase()] || hex}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
