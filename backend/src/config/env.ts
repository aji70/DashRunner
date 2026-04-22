import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().int().positive().default(3001),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    /** SQLite database file when DB_HOST is not set (any NODE_ENV, including production). */
    SQLITE_PATH: z.string().default('./data/dev.sqlite3'),
    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_SSL: z.coerce.boolean().default(false),
    /** Comma-separated origins, or `true` / `false` (strings). Omit in dev → permissive reflect; set for prod. */
    CORS_ORIGIN: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const mysql = Boolean(data.DB_HOST?.trim());
    if (!mysql) return;
    const required: Array<[keyof typeof data, unknown]> = [
      ['DB_USER', data.DB_USER],
      ['DB_NAME', data.DB_NAME],
    ];
    for (const [key, val] of required) {
      if (val === undefined || val === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `Required when DB_HOST is set (MySQL)`,
        });
      }
    }
  });

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  cached = parsed.data;
  return cached;
}
