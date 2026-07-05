// ============================================================
// 通知系统路由处理器
// GET  /v1/notifications      — 当前用户通知列表（分页）
// PATCH /v1/notifications/:id/read — 设为已读
// POST /v1/notifications      — 创建通知（内部服务调用）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
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
  type: z.enum(['demand_status', 'plan_ready', 'assignment_new', 'payment_reminder']).optional(),
  is_read: z.coerce.number().int().min(0).max(1).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const createBodySchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['demand_status', 'plan_ready', 'assignment_new', 'payment_reminder']),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  related_id: z.string().optional(),
});

// ============================================================
// 数据库行类型
// ============================================================

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// 路由注册
// ============================================================

export default async function notificationRoutes(app: FastifyInstance): Promise<void> {
  // GET /v1/notifications - 当前用户通知列表（分页）
  app.get(
    '/',
    {
      preHandler: [authMiddleware, validate({ query: listQuerySchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const q = request.query as z.infer<typeof listQuerySchema>;
      const userId = request.user.sub;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      idx++;
      conditions.push(`n.user_id = $${idx}`);
      params.push(userId);

      if (q.type) {
        idx++;
        conditions.push(`n.type = $${idx}`);
        params.push(q.type);
      }

      if (q.is_read !== undefined) {
        idx++;
        conditions.push(`n.is_read = $${idx}`);
        params.push(q.is_read === 1);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;
      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<NotificationRow>(
          `SELECT n.* FROM notifications n
           ${whereClause}
           ORDER BY n.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM notifications n ${whereClause}`,
          params
        ),
      ]);

      reply.send(
        paginatedResponse(dataResult.rows, Number(countResult.rows[0].total), page, pageSize)
      );
    }
  );

  // PATCH /v1/notifications/:id/read - 设为已读
  app.patch(
    '/:id/read',
    {
      preHandler: [authMiddleware, validate({ params: idParamSchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const userId = request.user.sub;

      const result = await query<Pick<NotificationRow, 'id'>>(
        `UPDATE notifications SET is_read = true
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '通知不存在或无权操作'));
        return;
      }

      reply.send(successResponse({ id }, '已标为已读'));
    }
  );

  // POST /v1/notifications - 创建通知（内部服务调用）
  app.post(
    '/',
    {
      preHandler: [authMiddleware, validate({ body: createBodySchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body = request.body as z.infer<typeof createBodySchema>;

      const result = await query<{ id: string }>(
        `INSERT INTO notifications (user_id, type, title, content, related_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [body.user_id, body.type, body.title, body.content, body.related_id ?? null]
      );

      reply.status(201).send(createdResponse({ id: result.rows[0].id }, '通知已创建'));
    }
  );
}
