import type { FastifyPluginAsync } from 'fastify';

const rootRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => ({
    name: 'dashrunner-backend',
    version: '1.0.0',
    docs: '/health',
  }));
};

export default rootRoutes;
