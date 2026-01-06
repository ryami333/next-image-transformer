import z from "zod";
import { transformConfigSchema } from "./transformConfigSchema";
import { searchParamsToTransformConfigCodec } from "./searchParamsToTransformConfigCodec";

export const createImageUrlBuilder = ({
  apiRouteUrl,
}: {
  apiRouteUrl: string;
}) => {
  return z.codec(z.url(), transformConfigSchema, {
    encode: (input) => {
      const searchParams = searchParamsToTransformConfigCodec.encode(input);
      const url = new URL(apiRouteUrl);
      url.search = searchParams.toString();

      return url.toString();
    },
    decode: (input) => {
      const url = new URL(input);
      const config = searchParamsToTransformConfigCodec.decode(
        url.searchParams,
      );

      return config;
    },
  });
};
