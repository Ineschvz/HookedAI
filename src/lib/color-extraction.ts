import { getPalette } from "colorthief";
import { supabase } from "./supabase";

/** Minimum squared RGB distance between accepted palette colors.
 *  35² = 1225 — rejects truly identical shades (diff of ~10-15 per channel)
 *  while keeping subtle but important tones (e.g. white background vs
 *  cream petals which differ by ~20-30 per channel). */
const MIN_DISTANCE_SQ = 1225;

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
 */
function colorDistanceSq(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/**
 * Greedy deduplication: accept colors one by one, skipping any
 * that are too close to an already-accepted color.
 */
function deduplicateColors(hexColors: string[], targetCount: number): string[] {
  if (hexColors.length <= 1) return hexColors;

  const rgbColors = hexColors.map(hexToRgb);
  const accepted: number[] = [0]; // Always keep the most dominant color

  for (let i = 1; i < rgbColors.length && accepted.length < targetCount; i++) {
    const candidate = rgbColors[i];
    const isFarEnough = accepted.every(
      (idx) => colorDistanceSq(candidate, rgbColors[idx]) >= MIN_DISTANCE_SQ
    );
    if (isFarEnough) {
      accepted.push(i);
    }
  }

  return accepted.map((idx) => hexColors[idx]);
}

/**
 * Extract dominant colors from an image URL using Color Thief.
 * Over-requests colors then deduplicates near-identical shades
 * so images with dominant backgrounds (e.g. white on white)
 * still produce a diverse palette.
 */
export async function extractColors(
  imageUrl: string,
  colorCount: number
): Promise<string[]> {
  const img = await loadImage(imageUrl);

  // Over-request to give deduplication room to filter similar colors
  const requestCount = Math.min(colorCount * 3, 20);
  const palette = await getPalette(img, { colorCount: requestCount });

  if (!palette) {
    throw new Error("Failed to extract colors from image.");
  }

  const allHexColors = palette.map((color) => color.hex().toUpperCase());

  // Filter near-duplicates, keeping the most distinct colors
  return deduplicateColors(allHexColors, colorCount);
}

/**
 * Load an image element from a URL, setting crossOrigin
 * so Canvas can read pixel data from cross-origin sources.
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Failed to load image for color extraction."));
    img.src = url;
  });
}

/**
 * Save an extracted color palette to Supabase for later use.
 */
export async function savePalette(
  imageUrl: string,
  colors: string[],
  colorCount: number
): Promise<void> {
  const { error } = await supabase.from("extracted_palettes").insert({
    image_url: imageUrl,
    colors,
    color_count: colorCount,
  });

  if (error) {
    throw new Error(error.message);
  }
}
