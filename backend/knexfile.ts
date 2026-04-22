import type { Knex } from 'knex';
import { config as loadDotenv } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mysqlConnectionFromProcessEnv } from './src/db/mysql-connection.js';

loadDotenv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(__dirname, 'src', 'db', 'migrations');
const seedsDirectory = join(__dirname, 'src', 'db', 'seeds');

/**
 * Knex CLI picks `development` vs `production` from NODE_ENV (or `--env`).
 * Use SQLite locally: `NODE_ENV=development npm run migrate:*` or the `migrate:*:sqlite` scripts.
 */
export default {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: process.env.SQLITE_PATH ?? './data/dev.sqlite3',
    },
    useNullAsDefault: true,
    migrations: { directory: migrationsDirectory },
    seeds: { directory: seedsDirectory },
  },
  get production(): Knex.Config {
    return {
      client: 'mysql2',
      connection: mysqlConnectionFromProcessEnv(),
      pool: { min: 2, max: 10 },
      migrations: { directory: migrationsDirectory },
      seeds: { directory: seedsDirectory },
    };
  },
};
