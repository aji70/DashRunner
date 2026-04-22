import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import type { Env } from './config/env.js';
import dbPlugin from './plugins/db.js';
import routes from './routes/index.js';
import crypto from 'node:crypto';

function corsOrigin(env: Env): boolean | string | string[] {
  const raw = env.CORS_ORIGIN?.trim();
  if (raw === 'false') return false;
  if (raw === 'true') return true;
  if (!raw) {
    return env.NODE_ENV === 'production' ? false : true;
  }
  return raw.includes(',')
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : raw;
}

export async function buildApp(env: Env) {
  const isDev = env.NODE_ENV === 'development';

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    genReqId: () => crypto.randomUUID(),
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: corsOrigin(env),
    credentials: true,
  });
  await app.register(sensible);
  await app.register(dbPlugin, { env });
  await app.register(routes);

  return app;
}
