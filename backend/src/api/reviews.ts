// ============================================================
// 评价系统路由处理器
// GET  /v1/reviews             — 评价列表（按SKU筛选）
// POST /v1/reviews             — 提交评价（活动公司，需有已完成订单）
// GET  /v1/reviews/stats/:sku_id — 某SKU的评价统计（平均分/总数）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  normalizePagination,
  createdResponse,
} from '../utils/response.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

const skuIdParamSchema = z.object({ sku_id: z.string().uuid() });

const listQuerySchema = z.object({
  sku_id: z.string().uuid().optional(),
  demand_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const createBodySchema = z.object({
  sku_id: z.string().uuid(),
  demand_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1),
});

// ============================================================
// 数据库行类型
// ============================================================

interface ReviewRow {
  id: string;
  sku_id: string;
  demand_id: string;
  company_id: string;
  rating: number;
  content: string;
  created_at: string;
}

// ============================================================
// 路由注册
// ============================================================

export default async function reviewRoutes(app: FastifyInstance): Promise<void> {
  // GET /v1/reviews - 评价列表（按SKU筛选）
  app.get(
    '/',
    {
      preHandler: [validate({ query: listQuerySchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const q = request.query as z.infer<typeof listQuerySchema>;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      if (q.sku_id) {
        idx++;
        conditions.push(`r.sku_id = $${idx}`);
        params.push(q.sku_id);
      }
      if (q.demand_id) {
        idx++;
        conditions.push(`r.demand_id = $${idx}`);
        params.push(q.demand_id);
      }
      if (q.company_id) {
        idx++;
        conditions.push(`r.company_id = $${idx}`);
        params.push(q.company_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<ReviewRow>(
          `SELECT r.* FROM reviews r
           ${whereClause}
           ORDER BY r.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM reviews r ${whereClause}`,
          params
        ),
      ]);

      reply.send(
        paginatedResponse(dataResult.rows, Number(countResult.rows[0].total), page, pageSize)
      );
    }
  );

  // POST /v1/reviews - 提交评价（活动公司，需有已完成订单）
  app.post(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent'),
        validate({ body: createBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body = request.body as z.infer<typeof createBodySchema>;
      const companyId = request.user.sub;

      // 验证该活动公司是否有已完成订单关联此需求
      const orderCheck = await query<{ id: string }>(
        `SELECT d.id FROM demands d
         WHERE d.id = $1 AND d.client_id = $2 AND d.status IN ('finished', 'settled', 'final_payment_received')`,
        [body.demand_id, companyId]
      );

      if (orderCheck.rows.length === 0) {
        reply.status(403).send(errorResponse(1005, '无权评价：没有与该需求关联的已完成订单'));
        return;
      }

      // 防止重复评价
      const dupCheck = await query<{ id: string }>(
        'SELECT id FROM reviews WHERE demand_id = $1 AND company_id = $2',
        [body.demand_id, companyId]
      );

      if (dupCheck.rows.length > 0) {
        reply.status(409).send(errorResponse(8001, '该订单已评价'));
        return;
      }

      const result = await query<{ id: string }>(
        `INSERT INTO reviews (sku_id, demand_id, company_id, rating, content)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [body.sku_id, body.demand_id, companyId, body.rating, body.content]
      );

      reply.status(201).send(createdResponse({ id: result.rows[0].id }, '评价已提交'));
    }
  );

  // GET /v1/reviews/stats/:sku_id - 某SKU的评价统计
  app.get(
    '/stats/:sku_id',
    {
      preHandler: [validate({ params: skuIdParamSchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { sku_id } = request.params as z.infer<typeof skuIdParamSchema>;

      const result = await query<{ avg_rating: string; total_count: string }>(
        `SELECT
           COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
           COUNT(*)::text AS total_count
         FROM reviews r
         WHERE r.sku_id = $1`,
        [sku_id]
      );

      const stats = {
        sku_id,
        avg_rating: Number(result.rows[0].avg_rating),
        total_count: Number(result.rows[0].total_count),
      };

      reply.send(successResponse(stats));
    }
  );
}
