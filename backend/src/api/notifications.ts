// 通知API
import type { FastifyInstance } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';

export default async function notificationRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authMiddleware, requireRole('admin')] }, async (req, reply) => {
    const { type, status, page, pageSize } = req.query as Record<string,string>;
    const cond: string[] = []; const p: unknown[] = []; let i=1;
    if (type) { cond.push(`type=$${i++}`); p.push(type); }
    if (status) { cond.push(`status=$${i++}`); p.push(status); }
    const w=cond.length?`WHERE ${cond.join(' AND ')}`:'';
    const pg=Math.max(1,Number(page)||1); const ps=Math.min(100,Number(pageSize)||20);
    const [items,count]=await Promise.all([
      query(`SELECT * FROM notifications ${w} ORDER BY sent_at DESC LIMIT $${i++} OFFSET $${i++}`,[...p,ps,(pg-1)*ps]),
      query(`SELECT COUNT(*) FROM notifications ${w}`,p)
    ]);
    return reply.send({code:0,data:{items:items.rows,total:Number(count.rows[0].count),page:pg,pageSize:ps},message:'ok'});
  });
}
