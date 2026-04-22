import type { FastifyPluginAsync } from 'fastify';
import healthRoutes from './health.js';
import rootRoutes from './root.js';

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rootRoutes);
  await fastify.register(healthRoutes, { prefix: '/api' });
};

export default routes;
