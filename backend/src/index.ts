// ============================================================
// 演出撮合平台 · Fastify 入口文件
// 启动 HTTP 服务、注册插件和中间件
// ============================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import { registerErrorHandler } from './middleware/error.js';
import type { JwtPayload } from './types/index.js';
import skuRoutes from './api/skus.js';
import demandRoutes from './api/demands.js';
import orderRoutes from './api/orders.js';
import contractRoutes from './api/contracts.js';
import paymentRoutes from './api/payments.js';

// ---- 扩展 @fastify/jwt 类型 ----
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

// ---- 环境变量 ----
const PORT = Number(process.env.PORT) || 3002;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ---- Fastify 实例 ----
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

// ============================================================
// 插件注册
// ============================================================

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
});

await app.register(fjwt, {
  secret: JWT_SECRET,
  verify: {
    algorithms: ['HS256'],
  },
});

// ============================================================
// 错误处理
// ============================================================
registerErrorHandler(app);

// ============================================================
// 健康检查路由
// ============================================================
app.get('/v1/health', async (_request, reply) => {
  reply.status(200).send({
    code: 0,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'ok',
  });
});

// ============================================================
// 业务路由注册
// ============================================================

await app.register(skuRoutes, { prefix: '/v1/skus' });
await app.register(demandRoutes, { prefix: '/v1/demands' });
await app.register(orderRoutes, { prefix: '/v1/orders' });
await app.register(contractRoutes, { prefix: '/v1/contracts' });
await app.register(paymentRoutes, { prefix: '/v1/payments' });

// ============================================================
// 启动服务器
// ============================================================
async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info('Service started on http://' + HOST + ':' + PORT);
    app.log.info('Health check: http://' + HOST + ':' + PORT + '/v1/health');
  } catch (err) {
    app.log.error(err, 'Service start failed');
    process.exit(1);
  }
}

// ============================================================
// 优雅关闭
// ============================================================
async function shutdown(signal: string): Promise<void> {
  app.log.info('Received ' + signal + ', shutting down...');
  await app.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
