import type { Knex } from 'knex';

/** mysql2 defaults to IPv6 (::1) for "localhost"; many local servers only listen on IPv4. */
export function mysqlConnection(opts: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}): Knex.MySql2ConnectionConfig {
  const host = opts.host === 'localhost' ? '127.0.0.1' : opts.host;
  const base: Knex.MySql2ConnectionConfig = {
    host,
    port: opts.port,
    user: opts.user,
    password: opts.password,
    database: opts.database,
    ssl: opts.ssl ? {} : undefined,
  };
  if (host === '127.0.0.1') {
    Object.assign(base, { family: 4 as const });
  }
  return base;
}

/** Used by knexfile (production only). Lazily validated so loading the file with NODE_ENV=development does not require DB_*. */
export function mysqlConnectionFromProcessEnv(): Knex.MySql2ConnectionConfig {
  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const database = process.env.DB_NAME?.trim();
  if (!host || !user || !database) {
    throw new Error(
      'Knex production profile requires DB_HOST, DB_USER, and DB_NAME. ' +
        'For a server on this machine use DB_HOST=127.0.0.1 (not "localhost", which often resolves to IPv6 ::1). ' +
        'In Docker Compose set DB_HOST to your MySQL service name.'
    );
  }
  return mysqlConnection({
    host,
    port: Number(process.env.DB_PORT ?? 3306),
    user,
    password: process.env.DB_PASSWORD ?? '',
    database,
    ssl: process.env.DB_SSL === 'true',
  });
}
