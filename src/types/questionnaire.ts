export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type PatternStyle = "realistic" | "simple-blocky";

export interface QuestionnaireData {
  imageUrl: string;
  stitchWidth: number;
  difficultyLevel: DifficultyLevel;
  patternStyle: PatternStyle;
  colorCount: number;
}
