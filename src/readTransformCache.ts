import z from "zod";
import { getTransformCachePaths } from "./getTransformCachePaths";
import fs from "node:fs/promises";

export async function readTransformCache({
  cacheKey,
  cacheDir,
}: {
  cacheKey: string;
  cacheDir: string;
}) {
  const { bodyPath, metaPath } = getTransformCachePaths({ cacheKey, cacheDir });

  try {
    const [body, metaRaw] = await Promise.all([
      fs.readFile(bodyPath),
      fs.readFile(metaPath, "utf8"),
    ]);
    const meta = (() => {
      try {
        const parsed = JSON.parse(metaRaw);
        const result = z
          .object({
            contentType: z.string(),
          })
          .loose()
          .safeParse(parsed);
        return result.success ? result.data : null;
      } catch {
        return null;
      }
    })();
    if (!meta) return null;

    return { body: new Uint8Array(body), contentType: meta.contentType };
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}
