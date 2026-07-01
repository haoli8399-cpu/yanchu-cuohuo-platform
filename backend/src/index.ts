// ============================================================
// 演出撮合平台 · Fastify 入口文件
// 启动 HTTP 服务、注册插件和中间件
// ============================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import { registerErrorHandler } from './middleware/error.js';
import type { JwtPayload } from './types/index.js';

// ---- 环境变量 ----
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// 扩展 Fastify 类型声明（必须在 decorateRequest 之前）
declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload | null;
  }
}

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

/** CORS */
await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
});

/** JWT（验证 Supabase Auth 签发的 Token） */
await app.register(fjwt, {
  secret: JWT_SECRET,
  verify: {
    algorithms: ['HS256'],
  },
});

// JWT 解码后的 payload 注入到 request.user
app.decorateRequest('user', null);

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
// 启动服务器
// ============================================================
async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 服务已启动: http://${HOST}:${PORT}`);
    app.log.info(`📋 健康检查: http://${HOST}:${PORT}/v1/health`);
  } catch (err) {
    app.log.error(err, '服务启动失败');
    process.exit(1);
  }
}

// ============================================================
// 优雅关闭
// ============================================================
async function shutdown(signal: string): Promise<void> {
  app.log.info(`收到 ${signal} 信号，开始优雅关闭...`);
  await app.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// 启动
start();
