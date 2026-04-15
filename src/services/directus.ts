import { DirectusSchema } from "@/types/directus";
import { createDirectus, rest, staticToken } from "@directus/sdk";

export const directus = createDirectus<DirectusSchema>(
  process.env.DIRECTUS_URL!,
)
  .with(
    rest({
      onRequest: (options) => ({ ...options, cache: "no-store" }), // Next.js cache bypass
    }),
  )
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!));
