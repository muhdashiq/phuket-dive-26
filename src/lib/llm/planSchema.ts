import { z } from 'zod';

// Zod version of GeneratedPlan, sent to Claude as the structured-output
// format. Kept in its own module so Zod only loads with the Claude client.
export const PlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  kind: z.enum(['dive', 'snorkel', 'land', 'rest']),
  status: z.enum(['good', 'watch', 'poor', 'rest']),
  statusLabel: z.string(),
  timeline: z.array(z.object({ time: z.string(), text: z.string() })),
  diveSites: z.array(z.object({ name: z.string(), note: z.string() })),
  bring: z.array(z.string()),
  checklist: z.array(z.string()),
  tips: z.array(z.string()),
  places: z.array(z.object({ name: z.string(), query: z.string() })),
  estimatedCost: z.string(),
});
