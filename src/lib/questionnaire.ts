import { supabase } from "./supabase";
import type { QuestionnaireData } from "@/types/questionnaire";

/** Save questionnaire responses to Supabase */
export async function saveQuestionnaire(data: QuestionnaireData) {
  const { error } = await supabase.from("questionnaire_responses").insert({
    image_url: data.imageUrl,
    stitch_width: data.stitchWidth,
    difficulty_level: data.difficultyLevel,
    pattern_style: data.patternStyle,
    color_count: data.colorCount,
  });

  if (error) {
    throw new Error(error.message);
  }
}
