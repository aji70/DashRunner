import knex, { type Knex } from 'knex';
import type { Env } from '../config/env.js';

export function createKnex(env: Env): Knex {
  if (env.NODE_ENV === 'production') {
    return knex({
      client: 'mysql2',
      connection: {
        host: env.DB_HOST!,
        port: env.DB_PORT,
        user: env.DB_USER!,
        password: env.DB_PASSWORD ?? '',
        database: env.DB_NAME!,
        ssl: env.DB_SSL ? {} : undefined,
      },
      pool: { min: 2, max: 10 },
    });
  }

  return knex({
    client: 'better-sqlite3',
    connection: { filename: env.SQLITE_PATH },
    useNullAsDefault: true,
  });
}
