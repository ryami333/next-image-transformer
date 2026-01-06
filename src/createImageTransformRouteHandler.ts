import path from "node:path";
import { createImageUrlBuilder } from "./createImageUrlBuilder";
import { getTransformCacheKey } from "./getTransformCacheKey";
import { readTransformCache } from "./readTransformCache";
import sharp, { type Sharp } from "sharp";
import { pipe } from "fp-ts/function";
import { writeTransformCache } from "./writeTransformCache";

export const createImageTransformRouteHandler = ({
  apiRouteUrl,
  cacheDir = path.join(process.cwd(), ".transform-cache"),
  cacheControl = "public, max-age=31536000, immutable",
}: {
  apiRouteUrl: string;
  cacheDir: string;
  cacheControl: string;
}) => {
  const urlStringToTransformConfig = createImageUrlBuilder({ apiRouteUrl });

  return async function handler(req: Request): Promise<Response> {
    const { data: transformConfig, error } =
      urlStringToTransformConfig.safeDecode(req.url);

    if (error) {
      return new Response("Bad Request", { status: 400 });
    }

    // Canonical (re-encoded) URL so cache hits even if the original request
    // contains superfluous/unknown query params.
    const canonicalUrl = urlStringToTransformConfig.encode(
      // encode() accepts the decoded transform config shape; we only call this
      // after decoding has succeeded.
      transformConfig,
    );

    const quality = transformConfig.q ?? 100;

    const cacheKey = getTransformCacheKey({ canonicalUrl });
    const cached = await readTransformCache({ cacheKey, cacheDir });
    if (cached) {
      return new Response(cached.body, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": cacheControl,
        },
      });
    }

    const upstream = await fetch(transformConfig.source);
    if (!upstream.ok)
      return new Response("Upstream fetch failed", { status: 502 });

    const input = sharp(Buffer.from(await upstream.arrayBuffer()));

    const image = pipe(
      input,
      /**
       * auto-orient: read's the image's EXIF data and rotates it to the correct
       * orientation.
       */
      (image: Sharp) => image.rotate(),

      /**
       * Resize
       */
      (image: Sharp) =>
        transformConfig.w || transformConfig.h
          ? image.resize({
              width: transformConfig.w,
              height: transformConfig.h,
              fit: "inside",
              withoutEnlargement: true,
            })
          : image,

      /**
       * Change format
       */
      (image: Sharp) => {
        switch (transformConfig.fmt) {
          case "preserve":
            return image;
          case "avif":
            return image.avif({ quality });
          case "webp":
            return image.webp({ quality });
          default: {
            throw new Error(`Unreachable case: ${transformConfig.fmt}`);
          }
        }
      },
    );

    const out = await image.toBuffer();
    const body = new Uint8Array(out);

    const contentType = (() => {
      switch (transformConfig.fmt) {
        case "preserve": {
          return (
            upstream.headers.get("content-type") ?? "application/octet-stream"
          );
        }
        case "avif": {
          return "image/avif";
        }
        case "webp": {
          return "image/webp";
        }
      }
    })();

    await writeTransformCache({
      cacheKey,
      body: out,
      meta: { contentType },
      cacheDir,
    });

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  };
};
