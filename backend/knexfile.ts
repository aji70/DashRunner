import type { Knex } from 'knex';
import { config as loadDotenv } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

loadDotenv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(__dirname, 'src', 'db', 'migrations');
const seedsDirectory = join(__dirname, 'src', 'db', 'seeds');

const config: { development: Knex.Config; production: Knex.Config } = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: process.env.SQLITE_PATH ?? './data/dev.sqlite3',
    },
    useNullAsDefault: true,
    migrations: { directory: migrationsDirectory },
    seeds: { directory: seedsDirectory },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {} : undefined,
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: migrationsDirectory },
    seeds: { directory: seedsDirectory },
  },
};

export default config;
