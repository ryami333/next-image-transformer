import { createImageUrlCodec } from "./createImageUrlCodec";

export const createImageUrlBuilder = (
  ...args: Parameters<typeof createImageUrlCodec>
) => {
  const imageUrlCodec = createImageUrlCodec(...args);

  return imageUrlCodec.encode;
};
