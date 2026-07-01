// 运营工具API
import type { FastifyInstance } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse } from '../utils/response.js';

export default async function adminRoutes(app: FastifyInstance) {
  app.get('/dashboard', { preHandler: [authMiddleware, requireRole('admin')] }, async (_req, reply) => {
    const [[demands],[assignments],[settlements],[revenue],[performers],[companies]] = await Promise.all(
      ['SELECT COUNT(*) FROM demands WHERE status NOT IN ($1,$2,$3)', // pending
       'SELECT COUNT(*) FROM assignments WHERE status=$1',
       'SELECT COUNT(*) FROM settlements WHERE status=$1',
       'SELECT COALESCE(SUM(amount),0) FROM payment_records WHERE received_at>=date_trunc($1,NOW())',
       'SELECT COUNT(*) FROM performers WHERE status=$1',
       'SELECT COUNT(*) FROM company_profiles WHERE status=$1'
      ].map((sql,i) => query(sql, [
        ...(i===0?['finished','cancelled','settled']:[]),
        ...(i===1?['pending']:[]),
        ...(i===2?['pending']:[]),
        ...(i===3?['month']:[]),
        ...(i===4?['active']:[]),
        ...(i===5?['certified']:[])
      ]))
    );
    return reply.send(successResponse({
      pending_demands: Number(demands.rows[0].count),
      pending_assignments: Number(assignments.rows[0].count),
      pending_settlements: Number(settlements.rows[0].count),
      monthly_revenue: Number(revenue.rows[0].coalesce),
      active_performers: Number(performers.rows[0].count),
      active_companies: Number(companies.rows[0].count),
    }));
  });

  app.get('/operation-logs', { preHandler: [authMiddleware, requireRole('admin')] }, async (req, reply) => {
    const { module, operator_id, page, pageSize } = req.query as Record<string,string>;
    const cond: string[] = []; const p: unknown[] = []; let i=1;
    if (module) { cond.push(`module=$${i++}`); p.push(module); }
    if (operator_id) { cond.push(`operator_id=$${i++}`); p.push(operator_id); }
    const w=cond.length?`WHERE ${cond.join(' AND ')}`:'';
    const pg=Math.max(1,Number(page)||1); const ps=Math.min(100,Number(pageSize)||20);
    const [items,count]=await Promise.all([
      query(`SELECT o.*, u.name as operator_name FROM operation_logs o LEFT JOIN users u ON o.operator_id=u.id ${w} ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i++}`,[...p,ps,(pg-1)*ps]),
      query(`SELECT COUNT(*) FROM operation_logs ${w}`,p)
    ]);
    return reply.send({code:0,data:{items:items.rows,total:Number(count.rows[0].count),page:pg,pageSize:ps},message:'ok'});
  });

  app.get('/search', { preHandler: [authMiddleware] }, async (req, reply) => {
    const q = (req.query as Record<string,string>).q || '';
    const like = `%${q}%`;
    const [performers,skus,demands,companies] = await Promise.all([
      query('SELECT id,name,tier FROM performers WHERE name ILIKE $1 OR style_tags::text ILIKE $1 LIMIT 20',[like]),
      query('SELECT id,name,business_line FROM skus WHERE name ILIKE $1 LIMIT 20',[like]),
      query('SELECT id,title,city,status FROM demands WHERE title ILIKE $1 LIMIT 20',[like]),
      query('SELECT id,short_name,city FROM company_profiles WHERE short_name ILIKE $1 OR full_name ILIKE $1 LIMIT 20',[like])
    ]);
    return reply.send(successResponse({performers:performers.rows,skus:skus.rows,demands:demands.rows,companies:companies.rows}));
  });
}
