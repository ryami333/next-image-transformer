import { env } from "./env";
import { notNullish } from "./notNullish";
import z from "zod";

const transformConfigSchema = z.object({
  w: z.int32().optional(),
  h: z.int32().optional(),
  fmt: z.enum(["preserve", "webp", "avif"]),
  q: z.int32().min(0).max(100).optional(),
  source: z.string(),
});

const stringToInt = z.codec(z.string().regex(z.regexes.integer), z.int(), {
  decode: (str) => Number.parseInt(str, 10),
  encode: (num) => num.toString(),
});

export const searchParamsToTransformConfig = z.codec(
  z.instanceof(URLSearchParams),
  transformConfigSchema,
  {
    encode: (input) => {
      const searchParams = new URLSearchParams();
      if (notNullish(input.w)) searchParams.set("w", String(input.w));
      if (notNullish(input.h)) searchParams.set("h", String(input.h));
      if (input.fmt !== "preserve") searchParams.set("fmt", input.fmt);
      if (notNullish(input.q)) searchParams.set("q", String(input.q));
      searchParams.set("source", input.source);

      return searchParams;
    },
    decode: (input) => {
      return {
        w: notNullish(input.get("w"))
          ? stringToInt.decode(input.get("w") ?? "")
          : undefined,
        h: notNullish(input.get("h"))
          ? stringToInt.decode(input.get("h") ?? "")
          : undefined,
        fmt: notNullish(input.get("fmt"))
          ? z.enum(["preserve", "webp", "avif"]).parse(input.get("fmt"))
          : "preserve",
        q: notNullish(input.get("q"))
          ? stringToInt.decode(input.get("q") ?? "")
          : undefined,
        source: z.string().parse(input.get("source")),
      };
    },
  },
);

export const urlStringToTransformConfig = z.codec(
  z.url(),
  transformConfigSchema,
  {
    encode: (input) => {
      const searchParams = searchParamsToTransformConfig.encode(input);
      const url = new URL("/api/image", env.NEXT_PUBLIC_SELF_URL);
      url.search = searchParams.toString();

      return url.toString();
    },
    decode: (input) => {
      const url = new URL(input);
      const config = searchParamsToTransformConfig.decode(url.searchParams);

      return config;
    },
  },
);

export type TransformConfig = z.output<typeof transformConfigSchema>;
