import z from "zod";

export const transformConfigSchema = z.object({
  w: z.int32().optional(),
  h: z.int32().optional(),
  fmt: z.enum(["preserve", "webp", "avif"]),
  q: z.int32().min(0).max(100).optional(),
  source: z.string(),
});

export type TransformConfig = z.output<typeof transformConfigSchema>;
