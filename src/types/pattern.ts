export interface ExtractedPalette {
  id?: string;
  imageUrl: string;
  colors: string[];
  colorCount: number;
}

export interface PatternColor {
  hex: string;
  name: string;
}

export interface GridPattern {
  /** 2D array of hex colors — each row is an array of stitch colors */
  grid: string[][];
  /** Color palette with hex values and human-readable names */
  palette: PatternColor[];
  /** Number of stitches wide */
  width: number;
  /** Number of rows tall */
  height: number;
}
