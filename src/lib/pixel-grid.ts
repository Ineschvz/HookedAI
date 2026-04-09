import { loadImage } from "./color-extraction";
import type { DifficultyLevel, PatternStyle } from "@/types/questionnaire";

/**
 * Parse a hex color string like "#A1B2C3" into [r, g, b].
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/**
 * Squared Euclidean distance between two RGB colors.
 * We skip the sqrt since we only need relative ordering.
 */
function colorDistanceSq(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/**
 * Find the index of the closest palette color to the given RGB value.
 */
function nearestColorIndex(
  rgb: [number, number, number],
  paletteRgb: [number, number, number][]
): number {
  let bestIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < paletteRgb.length; i++) {
    const dist = colorDistanceSq(rgb, paletteRgb[i]);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/**
 * Mode filter: replace each cell with the most common color
 * in its neighborhood (kernel x kernel window).
 */
function modeFilter(
  grid: number[][],
  height: number,
  width: number,
  paletteSize: number,
  kernelSize: number
): number[][] {
  const half = Math.floor(kernelSize / 2);
  const result: number[][] = Array.from({ length: height }, () =>
    new Array(width).fill(0)
  );

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      // Count occurrences of each color in the neighborhood
      const counts = new Uint32Array(paletteSize);
      for (let dr = -half; dr <= half; dr++) {
        for (let dc = -half; dc <= half; dc++) {
          const nr = Math.min(Math.max(r + dr, 0), height - 1);
          const nc = Math.min(Math.max(c + dc, 0), width - 1);
          counts[grid[nr][nc]]++;
        }
      }
      // Pick the color with the highest count
      let best = grid[r][c];
      let bestCount = 0;
      for (let i = 0; i < paletteSize; i++) {
        if (counts[i] > bestCount) {
          bestCount = counts[i];
          best = i;
        }
      }
      result[r][c] = best;
    }
  }

  return result;
}

/**
 * Merge small contiguous regions into their largest neighboring color.
 * Uses flood-fill to identify connected components, then replaces
 * any region smaller than `minSize` with the most common adjacent color.
 */
function mergeSmallRegions(
  grid: number[][],
  height: number,
  width: number,
  minSize: number
): number[][] {
  const result = grid.map((row) => [...row]);
  const visited = Array.from({ length: height }, () =>
    new Array<boolean>(width).fill(false)
  );

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (visited[r][c]) continue;

      // Flood-fill to find the region
      const color = result[r][c];
      const cells: [number, number][] = [];
      const stack: [number, number][] = [[r, c]];
      visited[r][c] = true;

      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!;
        cells.push([cr, cc]);
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (
            nr >= 0 && nr < height &&
            nc >= 0 && nc < width &&
            !visited[nr][nc] &&
            result[nr][nc] === color
          ) {
            visited[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }

      // If region is large enough, keep it
      if (cells.length >= minSize) continue;

      // Find the most common neighboring color (different from current)
      const neighborCounts = new Map<number, number>();
      for (const [cr, cc] of cells) {
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
            const nc2 = result[nr][nc];
            if (nc2 !== color) {
              neighborCounts.set(nc2, (neighborCounts.get(nc2) || 0) + 1);
            }
          }
        }
      }

      // Replace with the dominant neighbor (or keep if no neighbors differ)
      let replaceColor = color;
      let maxCount = 0;
      for (const [c, count] of neighborCounts) {
        if (count > maxCount) {
          maxCount = count;
          replaceColor = c;
        }
      }

      for (const [cr, cc] of cells) {
        result[cr][cc] = replaceColor;
      }
    }
  }

  return result;
}

/**
 * Determine filter settings based on difficulty and style preferences.
 */
function getFilterSettings(
  difficulty: DifficultyLevel,
  style: PatternStyle
): { kernelSize: number; mergeThreshold: number } {
  if (style === "simple-blocky") {
    switch (difficulty) {
      case "beginner":
        return { kernelSize: 7, mergeThreshold: 9 };
      case "intermediate":
        return { kernelSize: 5, mergeThreshold: 0 };
      case "advanced":
        return { kernelSize: 3, mergeThreshold: 0 };
    }
  } else {
    // realistic
    switch (difficulty) {
      case "beginner":
        return { kernelSize: 5, mergeThreshold: 5 };
      case "intermediate":
        return { kernelSize: 3, mergeThreshold: 0 };
      case "advanced":
        return { kernelSize: 0, mergeThreshold: 0 };
    }
  }
}

/**
 * Generate a crochet grid pattern by pixel-sampling the image
 * onto a canvas at the target grid dimensions, then mapping
 * each pixel to the nearest palette color.
 */
export async function pixelSampleGrid(
  imageUrl: string,
  palette: string[],
  stitchWidth: number,
  difficulty: DifficultyLevel,
  style: PatternStyle
): Promise<{ grid: string[][]; width: number; height: number }> {
  const img = await loadImage(imageUrl);

  // Calculate proportional height based on image aspect ratio
  const gridHeight = Math.round(
    stitchWidth * (img.naturalHeight / img.naturalWidth)
  );

  // Draw image onto a small canvas — each pixel becomes one stitch
  const canvas = document.createElement("canvas");
  canvas.width = stitchWidth;
  canvas.height = gridHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, stitchWidth, gridHeight);

  // Read all pixel data
  const imageData = ctx.getImageData(0, 0, stitchWidth, gridHeight);
  const pixels = imageData.data; // RGBA flat array

  // Pre-parse palette hex values to RGB
  const paletteRgb = palette.map(hexToRgb);

  // Map each pixel to the nearest palette color index
  let indexGrid: number[][] = Array.from({ length: gridHeight }, (_, r) => {
    const row = new Array<number>(stitchWidth);
    for (let c = 0; c < stitchWidth; c++) {
      const i = (r * stitchWidth + c) * 4;
      const rgb: [number, number, number] = [pixels[i], pixels[i + 1], pixels[i + 2]];
      row[c] = nearestColorIndex(rgb, paletteRgb);
    }
    return row;
  });

  // Apply post-processing filters based on difficulty/style
  const { kernelSize, mergeThreshold } = getFilterSettings(difficulty, style);

  if (kernelSize > 0) {
    indexGrid = modeFilter(indexGrid, gridHeight, stitchWidth, palette.length, kernelSize);
  }

  if (mergeThreshold > 0) {
    indexGrid = mergeSmallRegions(indexGrid, gridHeight, stitchWidth, mergeThreshold);
  }

  // Convert color indices back to hex strings
  const grid = indexGrid.map((row) => row.map((idx) => palette[idx]));

  return { grid, width: stitchWidth, height: gridHeight };
}
