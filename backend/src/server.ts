import { getEnv } from './config/env.js';
import { buildApp } from './app.js';

async function main() {
  const env = getEnv();
  const app = await buildApp(env);

  const close = async (signal: string) => {
    app.log.info({ signal }, 'shutting down');
    try {
      await app.close();
    } finally {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => void close('SIGINT'));
  process.once('SIGTERM', () => void close('SIGTERM'));

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    app.log.info({ host: env.HOST, port: env.PORT, nodeEnv: env.NODE_ENV }, 'server listening');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
