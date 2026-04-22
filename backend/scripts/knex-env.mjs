#!/usr/bin/env node
/**
 * Runs Knex CLI with `--env production` only when DB_HOST is set (MySQL).
 * If NODE_ENV=production but DB_* are missing (SQLite-only preview images), uses development/SQLite.
 *
 * Override: KNEX_ENV=production|development
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error('Usage: knex-env.mjs <knex arguments>');
  console.error('Example: knex-env.mjs migrate:rollback');
  process.exit(1);
}

function resolveKnexEnv() {
  const explicit = process.env.KNEX_ENV?.trim().toLowerCase();
  if (explicit === 'production' || explicit === 'development') return explicit;
  return process.env.DB_HOST?.trim() ? 'production' : 'development';
}

const knexEnv = resolveKnexEnv();

const require = createRequire(join(root, 'package.json'));

function resolveTsxCli() {
  const pkgJsonPath = require.resolve('tsx/package.json');
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const bin = typeof pkg.bin === 'string' ? pkg.bin.replace(/^\.\//, '') : Object.values(pkg.bin)[0]?.replace(/^\.\//, '');
  if (!bin) throw new Error('Could not resolve tsx bin from package.json');
  return join(dirname(pkgJsonPath), bin);
}

const tsxCli = resolveTsxCli();
const knexCli = join(dirname(require.resolve('knex/package.json')), 'bin', 'cli.js');
const knexfile = join(root, 'knexfile.ts');

const env = { ...process.env };
delete env.npm_config_production;

const status = spawnSync(process.execPath, [tsxCli, knexCli, '--knexfile', knexfile, '--env', knexEnv, ...argv], {
  cwd: root,
  stdio: 'inherit',
  env,
}).status;

process.exit(status ?? 1);
