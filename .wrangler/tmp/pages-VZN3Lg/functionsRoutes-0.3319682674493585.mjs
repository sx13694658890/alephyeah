import { onRequestGet as __api_address_generate__country__ts_onRequestGet } from "/Users/sxl/cloudflare/alephyeah/functions/api/address-generate/[country].ts"
import { onRequestOptions as __api_address_generate__country__ts_onRequestOptions } from "/Users/sxl/cloudflare/alephyeah/functions/api/address-generate/[country].ts"
import { onRequestGet as __api_apple_id_shared_ts_onRequestGet } from "/Users/sxl/cloudflare/alephyeah/functions/api/apple-id-shared.ts"
import { onRequestOptions as __api_apple_id_shared_ts_onRequestOptions } from "/Users/sxl/cloudflare/alephyeah/functions/api/apple-id-shared.ts"

export const routes = [
    {
      routePath: "/api/address-generate/:country",
      mountPath: "/api/address-generate",
      method: "GET",
      middlewares: [],
      modules: [__api_address_generate__country__ts_onRequestGet],
    },
  {
      routePath: "/api/address-generate/:country",
      mountPath: "/api/address-generate",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_address_generate__country__ts_onRequestOptions],
    },
  {
      routePath: "/api/apple-id-shared",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_apple_id_shared_ts_onRequestGet],
    },
  {
      routePath: "/api/apple-id-shared",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_apple_id_shared_ts_onRequestOptions],
    },
  ]