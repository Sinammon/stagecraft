import { z } from 'zod';

// Shared validation keeps incomplete provider output out of the practice UI.
export const flashcardsSchema = z.object({
  points: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(90),
        cue: z.string().trim().min(1).max(240),
      }),
    )
    .min(3)
    .max(8)
    .refine(
      (points) => new Set(points.map((p) => p.title.toLowerCase())).size === points.length,
      'Talking points must be distinct.',
    ),
});
