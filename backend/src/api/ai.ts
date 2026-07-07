/**
 * AI 端点 — 商机评分 / 方案推荐 / 跟进话术
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { scoreOpportunity, recommendPlan, generateFollowUp } from '../services/ai/deepseek.js';

const scoreBody = z.object({
  opportunity_id: z.string().uuid(),
});

const recommendBody = z.object({
  performance_type: z.string().optional(),
  activity_type: z.string().optional(),
  audience_count: z.number().optional(),
  budget: z.number().optional(),
  opportunity_id: z.string().uuid().optional(),
});

const followUpBody = z.object({
  opportunity_id: z.string().uuid(),
  last_contact_at: z.string().optional(),
  context: z.string().optional(),
});

export default async function aiRoutes(app: FastifyInstance) {
  // POST /v1/ai/score-opportunity — AI 商机评分
  app.post('/ai/score-opportunity', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = scoreBody.parse(req.body);

    // 获取商机和关联需求信息
    const opp = await query(
      `SELECT o.*, d.company_name, d.performance_type, d.activity_type, d.audience_count, d.budget, d.city, d.description
       FROM opportunities o LEFT JOIN demands d ON o.demand_id = d.id WHERE o.id = $1`,
      [body.opportunity_id]
    );

    if (opp.rows.length === 0) {
      return reply.status(404).send(errorResponse(9901, '商机不存在'));
    }

    const d = opp.rows[0];
    try {
      const result = await scoreOpportunity({
        activityType: d.activity_type,
        performanceType: d.performance_type,
        audienceCount: d.audience_count,
        budget: d.budget,
        city: d.city,
        description: d.description,
      });

      // 更新商机 AI 评分
      await query(
        'UPDATE opportunities SET ai_score = $1, priority = $2, updated_at = now() WHERE id = $3',
        [result.score, result.priority, body.opportunity_id]
      );

      return reply.send(successResponse(result, 'AI 评分完成'));
    } catch (err: any) {
      return reply.send(successResponse({
        score: 50, priority: 'medium', reasoning: 'AI 服务暂时不可用',
        riskTags: [],
      }, '使用默认评分'));
    }
  });

  // POST /v1/ai/recommend-plan — AI 推荐方案（三档）
  app.post('/ai/recommend-plan', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = recommendBody.parse(req.body);
    try {
      const result = await recommendPlan({
        performanceType: body.performance_type,
        activityType: body.activity_type,
        audienceCount: body.audience_count,
        budget: body.budget,
      });
      return reply.send(successResponse(result, '方案推荐完成'));
    } catch {
      return reply.send(successResponse({
        budget: { tier: 'T4', duration: 45, price: 4800, reason: '省钱版' },
        recommended: { tier: 'T3', duration: 60, price: 6000, reason: '主推版' },
        upgrade: { tier: 'T2', duration: 90, price: 9000, reason: '升级版' },
      }, '使用默认方案'));
    }
  });

  // POST /v1/ai/generate-follow-up — AI 生成跟进话术
  app.post('/ai/generate-follow-up', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = followUpBody.parse(req.body);

    const opp = await query(
      `SELECT o.*, d.company_name, d.performance_type
       FROM opportunities o LEFT JOIN demands d ON o.demand_id = d.id WHERE o.id = $1`,
      [body.opportunity_id]
    );

    if (opp.rows.length === 0) {
      return reply.status(404).send(errorResponse(9901, '商机不存在'));
    }

    const d = opp.rows[0];
    try {
      const result = await generateFollowUp({
        companyName: d.company_name,
        performanceType: d.performance_type,
        lastContactAt: body.last_contact_at,
        status: d.status,
      });
      return reply.send(successResponse(result, '话术生成完成'));
    } catch {
      return reply.send(successResponse({
        script: '您好，关于之前的演出方案，想了解您的想法和进展。如有需要调整的地方请随时联系我。',
        suggestedAction: 'wechat',
      }, '使用默认话术'));
    }
  });
}
