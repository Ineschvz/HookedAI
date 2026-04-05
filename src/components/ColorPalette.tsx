"use client";

interface ColorPaletteProps {
  colors: string[];
}

/**
 * Displays extracted colors as a row of swatches with hex values.
 */
export default function ColorPalette({ colors }: ColorPaletteProps) {
  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Extracted Colors</h2>
      <div className="flex flex-wrap gap-4">
        {colors.map((hex, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            {/* Color swatch */}
            <div
              className="w-12 h-12 rounded-lg border border-foreground/10 shadow-sm"
              style={{ backgroundColor: hex }}
            />
            {/* Hex label */}
            <span className="text-xs text-foreground/60 font-mono">{hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
