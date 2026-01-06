import z from "zod";
import { transformConfigSchema } from "./transformConfigSchema";
import { notNullish } from "./notNullish";
import { stringToIntCodec } from "./stringToIntCodec";

export const searchParamsToTransformConfigCodec = z.codec(
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
          ? stringToIntCodec.decode(input.get("w") ?? "")
          : undefined,
        h: notNullish(input.get("h"))
          ? stringToIntCodec.decode(input.get("h") ?? "")
          : undefined,
        fmt: notNullish(input.get("fmt"))
          ? z.enum(["preserve", "webp", "avif"]).parse(input.get("fmt"))
          : "preserve",
        q: notNullish(input.get("q"))
          ? stringToIntCodec.decode(input.get("q") ?? "")
          : undefined,
        source: z.string().parse(input.get("source")),
      };
    },
  },
);
