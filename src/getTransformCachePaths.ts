import path from "node:path";

export function getTransformCachePaths({
  cacheKey,
  cacheDir,
}: {
  cacheKey: string;
  cacheDir: string;
}) {
  const prefixDir = cacheKey.slice(0, 2);
  const baseName = cacheKey.slice(2);
  const dir = path.join(cacheDir, prefixDir);

  return {
    dir,
    bodyPath: path.join(dir, `${baseName}.bin`),
    metaPath: path.join(dir, `${baseName}.json`),
  };
}
