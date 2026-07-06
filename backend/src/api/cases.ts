// ============================================================
// 案例管理路由处理器
// GET    /v1/cases      — 案例列表（按SKU筛选）
// GET    /v1/cases/:id  — 案例详情
// POST   /v1/cases      — 创建案例（admin）
// PUT    /v1/cases/:id  — 更新案例（admin）
// DELETE /v1/cases/:id  — 删除案例（admin）
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

const idParamSchema = z.object({ id: z.string().uuid() });

const listQuerySchema = z.object({
  sku_id: z.string().uuid().optional(),
  tier: z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).optional().default(20),
});

const createBodySchema = z.object({
  sku_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  event_date: z.string().min(1),
  audience_count: z.number().int().positive().optional(),
  tier: z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']).optional(),
  rating: z.number().min(0).max(5).optional(),
  cover_images: z.array(z.string()).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  client_name: z.string().max(200).optional(),
});

const updateBodySchema = z.object({
  sku_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200).optional(),
  event_date: z.string().min(1).optional(),
  audience_count: z.number().int().positive().nullable().optional(),
  tier: z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']).nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  cover_images: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  client_name: z.string().max(200).nullable().optional(),
});

// ============================================================
// 数据库行类型
// ============================================================

interface CaseRow {
  id: string;
  sku_id: string | null;
  title: string;
  event_date: string;
  audience_count: number | null;
  tier: string | null;
  rating: number | null;
  cover_images: string[];
  description: string | null;
  content: string | null;
  client_name: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// 辅助：解析 JSON 数组字段
// ============================================================

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val) as string[]; } catch { return []; }
  }
  return [];
}

function formatCase(row: CaseRow) {
  return {
    ...row,
    cover_images: parseJsonArray(row.cover_images),
  };
}

// ============================================================
// 路由注册
// ============================================================

export default async function caseRoutes(app: FastifyInstance): Promise<void> {
  // GET /v1/cases - 案例列表（按SKU筛选）
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
        conditions.push(`c.sku_id = $${idx}`);
        params.push(q.sku_id);
      }
      if (q.tier) {
        idx++;
        conditions.push(`c.tier = $${idx}`);
        params.push(q.tier);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<CaseRow>(
          `SELECT c.* FROM cases c
           ${whereClause}
           ORDER BY c.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM cases c ${whereClause}`,
          params
        ),
      ]);

      const items = dataResult.rows.map(formatCase);

      reply.send(paginatedResponse(items, Number(countResult.rows[0].total), page, pageSize));
    }
  );

  // GET /v1/cases/:id - 案例详情
  app.get(
    '/:id',
    {
      preHandler: [validate({ params: idParamSchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      const result = await query<CaseRow>('SELECT * FROM cases WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '案例不存在'));
        return;
      }

      reply.send(successResponse(formatCase(result.rows[0])));
    }
  );

  // POST /v1/cases - 创建案例（admin）
  app.post(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ body: createBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body = request.body as z.infer<typeof createBodySchema>;
      const operatorId = request.user.sub;

      const result = await query<{ id: string }>(
        `INSERT INTO cases (sku_id, title, event_date, audience_count, tier, rating, cover_images, description, content, client_name, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
         RETURNING id`,
        [
          body.sku_id ?? null,
          body.title,
          body.event_date,
          body.audience_count ?? null,
          body.tier ?? null,
          body.rating ?? null,
          JSON.stringify(body.cover_images ?? []),
          body.description ?? null,
          body.content ?? null,
          body.client_name ?? null,
          operatorId,
        ]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'case', 'create', 'case', $2, $3)`,
        [operatorId, result.rows[0].id, JSON.stringify({ title: body.title })]
      );

      reply.status(201).send(createdResponse({ id: result.rows[0].id }, '案例已创建'));
    }
  );

  // PUT /v1/cases/:id - 更新案例（admin）
  app.put(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: updateBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof updateBodySchema>;
      const operatorId = request.user.sub;

      const existing = await query<CaseRow>('SELECT * FROM cases WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '案例不存在'));
        return;
      }

      const scalarFieldMap: Record<string, string> = {
        sku_id: 'sku_id',
        title: 'title',
        event_date: 'event_date',
        audience_count: 'audience_count',
        tier: 'tier',
        rating: 'rating',
        description: 'description',
        content: 'content',
        client_name: 'client_name',
      };

      const setClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      for (const [key, col] of Object.entries(scalarFieldMap)) {
        if (key in body) {
          idx++;
          setClauses.push(`${col} = $${idx}`);
          params.push(body[key as keyof typeof body] ?? null);
        }
      }

      if (body.cover_images !== undefined) {
        idx++;
        setClauses.push(`cover_images = $${idx}::jsonb`);
        params.push(JSON.stringify(body.cover_images));
      }

      if (setClauses.length === 0) {
        reply.send(successResponse({ id }, '案例已更新'));
        return;
      }

      idx++;
      setClauses.push(`updated_at = NOW()`);
      idx++;
      params.push(id);

      await query(
        `UPDATE cases SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'case', 'update', 'case', $2, $3)`,
        [operatorId, id, JSON.stringify(body)]
      );

      reply.send(successResponse({ id }, '案例已更新'));
    }
  );

  // DELETE /v1/cases/:id - 删除案例（admin）
  app.delete(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const operatorId = request.user.sub;

      const existing = await query<Pick<CaseRow, 'id' | 'title'>>(
        'SELECT id, title FROM cases WHERE id = $1',
        [id]
      );
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '案例不存在'));
        return;
      }

      await query('DELETE FROM cases WHERE id = $1', [id]);

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'case', 'delete', 'case', $2, $3)`,
        [operatorId, id, JSON.stringify({ title: existing.rows[0].title })]
      );

      reply.send(successResponse({ id }, '案例已删除'));
    }
  );
}
