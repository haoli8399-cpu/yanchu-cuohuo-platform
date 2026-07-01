// 结算统计API
import type { FastifyInstance } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export default async function settlementRoutes(app: FastifyInstance) {
  // 结算汇总
  app.get('/', { preHandler: [authMiddleware, requireRole('admin', 'finance')] },
    async (req, reply) => {
      const { period, performer_id } = req.query as Record<string, string>;

      let where = "WHERE 1=1";
      const params: unknown[] = [];
      let i = 1;
      if (period) { where += ` AND s.period = $${i++}`; params.push(period); }
      if (performer_id) { where += ` AND s.performer_id = $${i++}`; params.push(performer_id); }

      const result = await query(
        `SELECT p.id as performer_id, p.name as performer_name, p.tier,
                SUM(s.amount) as total_amount,
                COUNT(*) as total_count,
                SUM(CASE WHEN s.status='pending' THEN s.amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN s.status='settled' THEN s.amount ELSE 0 END) as settled_amount
         FROM settlements s
         JOIN performers p ON s.performer_id = p.id
         ${where}
         GROUP BY p.id, p.name, p.tier
         ORDER BY total_amount DESC`,
        params
      );

      let totalPending = 0, totalSettled = 0;
      for (const r of result.rows) { totalPending += Number(r.pending_amount); totalSettled += Number(r.settled_amount); }

      return reply.send(successResponse({
        items: result.rows,
        summary: { total_pending: totalPending, total_settled: totalSettled }
      }));
    });

  // 标记已结算
  app.patch('/:id/mark-settled', { preHandler: [authMiddleware, requireRole('admin', 'finance')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const paid_at = (req.body as Record<string,string>)?.paid_at || new Date().toISOString();

      const old = await query('SELECT * FROM settlements WHERE id = $1', [id]);
      if (old.rows.length === 0) return reply.status(404).send(errorResponse(7001, '结算记录不存在'));

      await query(
        `UPDATE settlements SET status='settled', settled_at=NOW(), paid_at=$1 WHERE id=$2`,
        [paid_at, id]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'settlement', 'mark_settled', 'settlement', $2, $3)`,
        [req.user?.sub, id, JSON.stringify({ paid_at })]
      );

      return reply.send(successResponse({ id, status: 'settled' }, '已标记为已结算'));
    });
}
