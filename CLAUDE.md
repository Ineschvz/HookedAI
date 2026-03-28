# HookedAI

## Project Overview

HookedAI is an AI-powered web app that lets crocheters upload a photo and receive a crochet grid pattern. It uses computer vision and AI orchestration to analyze images, extract colors, and generate stitch-by-stitch grid patterns based on user questionnaire input (yarn weight, hook size, skill level, grid dimensions, etc.).

**Problem:** Crocheters who want to recreate real-world objects as crochet projects must manually count stitches, interpret colors, and design grid patterns by hand — a tedious, error-prone, and time-consuming process.

**Solution:** HookedAI automates pattern creation end-to-end, making it accessible to crocheters at any skill level.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Frontend:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Code Guidelines

- Keep code simple and readable — prefer clarity over cleverness.
- Add comments explaining the *why* behind non-obvious logic.
- Use TypeScript for type safety throughout.
- Use functional React components with hooks.
- Keep components small and focused on a single responsibility.
- Colocate related files (component + styles + tests) when practical.

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # Reusable React components
  lib/          # Utility functions, API helpers, AI orchestration
  types/        # Shared TypeScript types and interfaces
public/         # Static assets (images, icons)
```

## Key Concepts

- **Image Upload:** User uploads a photo of a real-world object they want to crochet.
- **Questionnaire:** User provides project preferences (grid size, yarn colors, skill level, etc.).
- **Color Extraction:** Computer vision analyzes the image and maps it to a reduced color palette suitable for yarn.
- **Grid Generation:** AI generates a stitch grid pattern where each cell maps to a yarn color.
- **Pattern Output:** The final grid pattern is displayed visually and can be exported.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run linter
```
