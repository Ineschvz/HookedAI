import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, grid, palette, width, height } = await req.json();

    if (!grid || !palette?.length || !width || !height) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Use Claude to generate human-readable yarn color names for each hex
    const colorNamingResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `For each hex color below, suggest a human-readable yarn color name suitable for crochet patterns (e.g. "Sage Green", "Cream White", "Ocean Blue"). Return ONLY valid JSON — an array of objects with "hex" and "name" fields, in the same order.

Hex colors: ${JSON.stringify(palette)}`,
        },
      ],
    });

    // Parse named palette from Claude's response
    const textBlock = colorNamingResponse.content.find((b) => b.type === "text");
    let namedPalette: { hex: string; name: string }[] = palette.map(
      (hex: string) => ({ hex, name: hex })
    );

    if (textBlock && textBlock.type === "text") {
      try {
        // Strip markdown code fences if present
        const cleaned = textBlock.text
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();
        namedPalette = JSON.parse(cleaned);
      } catch {
        // Fall back to hex as name if parsing fails
        console.error("Failed to parse color names from Claude, using hex values.");
      }
    }

    // Save to Supabase
    const { error: dbError } = await supabase.from("generated_patterns").insert({
      image_url: imageUrl,
      grid_data: grid,
      color_palette: namedPalette,
      grid_width: width,
      grid_height: height,
    });

    if (dbError) {
      console.error("Failed to save pattern to Supabase:", dbError.message);
    }

    return NextResponse.json({
      grid,
      palette: namedPalette,
      width,
      height,
    });
  } catch (err) {
    console.error("Generate pattern error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
