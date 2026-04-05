import { getPalette } from "colorthief";
import { supabase } from "./supabase";

/**
 * Extract dominant colors from an image URL using Color Thief.
 * Creates a temporary <img> element, loads it with crossOrigin
 * set for Supabase URLs, then extracts the palette.
 */
export async function extractColors(
  imageUrl: string,
  colorCount: number
): Promise<string[]> {
  // Create a temporary image element for Color Thief to read pixel data from
  const img = await loadImage(imageUrl);
  const palette = await getPalette(img, { colorCount });

  if (!palette) {
    throw new Error("Failed to extract colors from image.");
  }

  // Convert Color objects to uppercase hex strings
  return palette.map((color) => color.hex().toUpperCase());
}

/**
 * Load an image element from a URL, setting crossOrigin
 * so Canvas can read pixel data from cross-origin sources.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
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
