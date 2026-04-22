import type { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_req, reply) => {
    return reply.send({ status: 'ok', uptime: process.uptime() });
  });

  fastify.get('/health/ready', async (_req, reply) => {
    try {
      await fastify.db.raw('select 1');
      return reply.send({ status: 'ready', database: 'ok' });
    } catch (err) {
      fastify.log.error({ err }, 'readiness check failed');
      return reply.code(503).send({ status: 'not_ready', database: 'error' });
    }
  });
};

export default healthRoutes;
