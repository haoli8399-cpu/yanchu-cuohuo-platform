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
import performerRoutes from './api/performers.js';
import priceConfigRoutes from './api/price-configs.js';
import settlementRoutes from './api/settlements.js';
import assignmentRoutes from './api/assignments.js';
import reviewRoutes from './api/reviews.js';
import companyRoutes from './api/companies.js';
import companyVerificationRoutes from './api/company-verification.js';
import adminRoutes from './api/admin.js';
import notificationRoutes from './api/notifications.js';
import authRoutes from './api/auth.js';
import caseRoutes from './api/cases.js';
import aiTemplateRoutes from './api/ai-templates.js';
import opportunityRoutes from './api/opportunities.js';
import quoteRoutes from './api/quotes.js';
import followUpRoutes from './api/follow-ups.js';
import aiRoutes from './api/ai.js';
import pricingRoutes from './api/pricing.js';
import aiFeedbackRoutes from './api/ai-feedback.js';

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
await app.register(performerRoutes, { prefix: '/v1/performers' });
await app.register(priceConfigRoutes, { prefix: '/v1/price-configs' });
await app.register(settlementRoutes, { prefix: '/v1/settlements' });
await app.register(assignmentRoutes, { prefix: '/v1/assignments' });
await app.register(authRoutes, { prefix: '/v1/auth' });
await app.register(reviewRoutes, { prefix: '/v1/reviews' });
await app.register(companyVerificationRoutes, { prefix: '/v1/companies' });
await app.register(companyRoutes, { prefix: '/v1/companies' });
await app.register(adminRoutes, { prefix: '/v1/admin' });
await app.register(notificationRoutes, { prefix: '/v1/notifications' });
await app.register(caseRoutes, { prefix: '/v1/cases' });
await app.register(aiTemplateRoutes, { prefix: '/v1/ai-templates' });
await app.register(pricingRoutes, { prefix: '/v1/pricing' });
await app.register(opportunityRoutes, { prefix: '/v1' });
await app.register(quoteRoutes, { prefix: '/v1' });
await app.register(followUpRoutes, { prefix: '/v1' });
await app.register(aiRoutes, { prefix: '/v1' });
await app.register(aiFeedbackRoutes, { prefix: '/v1' });

// ============================================================
// 已注册路由列表（PRD V3.3.2 12.3）
// ============================================================
// GET    /v1/health
// GET    /v1/skus
// GET    /v1/skus/:id
// POST   /v1/skus
// PUT    /v1/skus/:id
// PATCH  /v1/skus/:id/status
// POST   /v1/demands
// GET    /v1/demands
// GET    /v1/demands/:id
// PUT    /v1/demands/:id
// PATCH  /v1/demands/:id/withdraw
// POST   /v1/demands/:id/ai-plan
// POST   /v1/demands/:id/alternatives
// GET    /v1/demands/:id/alternatives
// PATCH  /v1/demands/:id/alternatives/:alt_id/select
// GET    /v1/demands/:id/export
// PATCH  /v1/demands/:id/history
// PATCH  /v1/orders/:demand_id/status
// GET    /v1/orders/:demand_id/timeline
// POST   /v1/orders/:demand_id/refund
// PUT    /v1/contracts/:demand_id
// GET    /v1/contracts/:demand_id
// POST   /v1/payments
// GET    /v1/payments
// GET    /v1/performers
// GET    /v1/performers/:id
// POST   /v1/performers
// PUT    /v1/performers/:id
// GET    /v1/performers/:id/tier-history
// PUT    /v1/performers/:id/tier
// GET    /v1/performers/:id/tier-suggestion
// GET    /v1/performers/:id/credit
// GET    /v1/performers/:id/credit-logs
// POST   /v1/performers/import
// GET    /v1/price-configs
// PUT    /v1/price-configs/:id
// GET    /v1/settlements
// PATCH  /v1/settlements/:id/mark-settled
// GET    /v1/settlements/export
// POST   /v1/assignments
// GET    /v1/assignments
// PATCH  /v1/assignments/:id/respond
// POST   /v1/assignments/:id/checkin
// GET    /v1/assignments/calendar
// POST   /v1/auth/phone-code
// POST   /v1/auth/phone
// POST   /v1/auth/wechat-miniprogram
// POST   /v1/auth/wechat-web
// GET    /v1/reviews
// POST   /v1/reviews
// DELETE /v1/reviews/:id
// GET    /v1/reviews/stats/:sku_id
// POST   /v1/companies/verify
// GET    /v1/companies/verification-status
// PATCH  /v1/companies/:id/approve
// PATCH  /v1/companies/:id/reject
// GET    /v1/companies
// GET    /v1/companies/:id
// POST   /v1/companies/:id/certify
// PATCH  /v1/companies/:id/verify
// GET    /v1/companies/:id/stats
// GET    /v1/admin/dashboard
// GET    /v1/admin/operation-logs
// GET    /v1/admin/search
// POST   /v1/admin/undo
// POST   /v1/admin/mark-timeout
// GET    /v1/notifications
// PATCH  /v1/notifications/:id/read
// POST   /v1/notifications
// GET    /v1/cases
// GET    /v1/cases/:id
// POST   /v1/cases
// PUT    /v1/cases/:id
// DELETE /v1/cases/:id
// GET    /v1/ai-templates
// GET    /v1/ai-templates/:id
// POST   /v1/ai-templates
// PUT    /v1/ai-templates/:id
// DELETE /v1/ai-templates/:id
// POST   /v1/pricing/calculate
// GET    /v1/opportunities
// GET    /v1/opportunities/:id
// POST   /v1/opportunities
// PATCH  /v1/opportunities/:id/status
// POST   /v1/quotes
// GET    /v1/opportunities/:id/quotes
// PATCH  /v1/quotes/:id/status
// GET    /v1/quotes/:id
// POST   /v1/follow-ups
// GET    /v1/opportunities/:id/follow-ups
// POST   /v1/ai/score-opportunity
// POST   /v1/ai/recommend-plan
// POST   /v1/ai/generate-follow-up
// POST   /v1/ai/feedback

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
