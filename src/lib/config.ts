import { z } from "zod";

const ConfigSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  COINGECKO_API_URL: z.string().url().default("https://api.coingecko.com/api/v3"),
  CHECK_INTERVAL_MS: z.coerce.number().default(10_000),
  MAX_ALERTS: z.coerce.number().default(50),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid configuration:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}
