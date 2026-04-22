import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { Knex } from 'knex';
import type { Env } from '../config/env.js';
import { createKnex } from '../db/knex-factory.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex;
  }
}

const dbPlugin: FastifyPluginAsync<{ env: Env }> = async (fastify, opts) => {
  const db = createKnex(opts.env);
  fastify.decorate('db', db);
  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
};

export default fp(dbPlugin, { name: 'db' });
