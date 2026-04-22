import knex, { type Knex } from 'knex';
import type { Env } from '../config/env.js';
import { mysqlConnection } from './mysql-connection.js';

export function createKnex(env: Env): Knex {
  if (env.DB_HOST?.trim()) {
    return knex({
      client: 'mysql2',
      connection: mysqlConnection({
        host: env.DB_HOST!,
        port: env.DB_PORT,
        user: env.DB_USER!,
        password: env.DB_PASSWORD ?? '',
        database: env.DB_NAME!,
        ssl: env.DB_SSL,
      }),
      pool: { min: 2, max: 10 },
    });
  }

  return knex({
    client: 'better-sqlite3',
    connection: { filename: env.SQLITE_PATH },
    useNullAsDefault: true,
  });
}
