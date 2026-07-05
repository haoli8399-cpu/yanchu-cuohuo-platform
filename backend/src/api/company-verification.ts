// ============================================================
// 企业认证路由处理器
// POST  /v1/companies/verify              — 提交认证申请
// GET   /v1/companies/verification-status — 查询认证状态
// PATCH /v1/companies/:id/approve         — 审核通过（admin）
// PATCH /v1/companies/:id/reject          — 审核驳回（admin）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import {
  successResponse,
  errorResponse,
} from '../utils/response.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

const idParamSchema = z.object({ id: z.string().uuid() });

const verifySubmitSchema = z.object({
  business_license: z.string().min(1),
  contact_name: z.string().min(1).max(50),
  contact_phone: z.string().min(1).max(20),
});

const approveBodySchema = z.object({
  reason: z.string().optional(),
});

const rejectBodySchema = z.object({
  reason: z.string().min(1),
});

// ============================================================
// 数据库行类型
// ============================================================

interface VerificationRow {
  id: string;
  company_id: string;
  business_license: string;
  contact_name: string;
  contact_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// 路由注册
// ============================================================

export default async function companyVerificationRoutes(app: FastifyInstance): Promise<void> {
  // POST /v1/companies/verify - 提交认证申请
  app.post(
    '/verify',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent'),
        validate({ body: verifySubmitSchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body = request.body as z.infer<typeof verifySubmitSchema>;
      const companyId = request.user.sub;

      // 检查是否已有待审核或已通过的申请
      const existing = await query<Pick<VerificationRow, 'id' | 'status'>>(
        `SELECT id, status FROM company_verifications
         WHERE company_id = $1 AND status IN ('pending', 'approved')
         ORDER BY created_at DESC LIMIT 1`,
        [companyId]
      );

      if (existing.rows.length > 0) {
        const s = existing.rows[0].status;
        if (s === 'pending') {
          reply.status(409).send(errorResponse(8001, '已有认证申请正在审核中'));
          return;
        }
        if (s === 'approved') {
          reply.status(409).send(errorResponse(8001, '企业已通过认证'));
          return;
        }
      }

      const result = await query<{ id: string }>(
        `INSERT INTO company_verifications (company_id, business_license, contact_name, contact_phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [companyId, body.business_license, body.contact_name, body.contact_phone]
      );

      reply.send(successResponse({ id: result.rows[0].id, status: 'pending' }, '认证申请已提交'));
    }
  );

  // GET /v1/companies/verification-status - 查询认证状态
  app.get(
    '/verification-status',
    {
      preHandler: [authMiddleware, requireRole('agent')],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const companyId = request.user.sub;

      const result = await query<VerificationRow>(
        `SELECT * FROM company_verifications
         WHERE company_id = $1
         ORDER BY created_at DESC LIMIT 1`,
        [companyId]
      );

      if (result.rows.length === 0) {
        reply.send(successResponse({ has_record: false, status: null }));
        return;
      }

      reply.send(successResponse({ has_record: true, ...result.rows[0] }));
    }
  );

  // PATCH /v1/companies/:id/approve - 审核通过（admin）
  app.patch(
    '/:id/approve',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: approveBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof approveBodySchema>;
      const operatorId = request.user.sub;

      const existing = await query<Pick<VerificationRow, 'id' | 'company_id' | 'status'>>(
        'SELECT id, company_id, status FROM company_verifications WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '认证记录不存在'));
        return;
      }

      const rec = existing.rows[0];
      if (rec.status === 'approved') {
        reply.status(409).send(errorResponse(8001, '该认证已通过'));
        return;
      }

      await query(
        `UPDATE company_verifications
         SET status = 'approved', verified_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [id]
      );

      // 同步更新 company_profiles 状态为 certified
      await query(
        `UPDATE company_profiles SET status = 'certified' WHERE id = $1`,
        [rec.company_id]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'company_verification', 'approve', 'company_verification', $2, $3)`,
        [operatorId, id, JSON.stringify({ reason: body.reason })]
      );

      reply.send(successResponse({ id, status: 'approved' }, '认证已通过'));
    }
  );

  // PATCH /v1/companies/:id/reject - 审核驳回（admin）
  app.patch(
    '/:id/reject',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: rejectBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof rejectBodySchema>;
      const operatorId = request.user.sub;

      const existing = await query<Pick<VerificationRow, 'id' | 'company_id' | 'status'>>(
        'SELECT id, company_id, status FROM company_verifications WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '认证记录不存在'));
        return;
      }

      const rec = existing.rows[0];
      if (rec.status === 'approved') {
        reply.status(409).send(errorResponse(8001, '该认证已通过，无法驳回'));
        return;
      }

      await query(
        `UPDATE company_verifications
         SET status = 'rejected', reject_reason = $2, updated_at = NOW()
         WHERE id = $1`,
        [id, body.reason]
      );

      // 同步更新 company_profiles 状态
      await query(
        `UPDATE company_profiles SET status = 'registered' WHERE id = $1`,
        [rec.company_id]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'company_verification', 'reject', 'company_verification', $2, $3)`,
        [operatorId, id, JSON.stringify({ reason: body.reason })]
      );

      reply.send(successResponse({ id, status: 'rejected', reason: body.reason }, '认证已驳回'));
    }
  );
}
