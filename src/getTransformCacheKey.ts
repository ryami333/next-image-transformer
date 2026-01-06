import { createHash } from "node:crypto";

export function getTransformCacheKey({
  canonicalUrl,
}: {
  canonicalUrl: string;
}) {
  return createHash("sha256").update(canonicalUrl).digest("hex");
}
