// ============================================================
// 定价计算 API
// POST /v1/pricing/calculate — 按 SKU + 级别 + 时长 + 人数计算价格
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

/** POST /v1/pricing/calculate 请求体 */
const calculateBodySchema = z.object({
  skuId: z.string().uuid(),
  tier: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  performerCount: z.number().int().positive(),
});

// ============================================================
// 数据库行类型
// ============================================================

/** tier_prices 表行 */
interface TierPriceRow {
  sku_id: string;
  tier: string;
  unit_price: number;
  label: string;
  description: string;
  suitable_for: string;
}

/** skus 表基础行 */
interface SkuBasicRow {
  id: string;
  status: string;
}

// ============================================================
// 价格计算函数
// ============================================================

/**
 * 计算总价
 * totalPrice = unitPrice × (durationMinutes / 15) × performerCount
 * companyPrice = totalPrice × 0.7
 */
function calculatePrices(
  unitPrice: number,
  durationMinutes: number,
  performerCount: number
) {
  const totalPrice = Math.round(unitPrice * (durationMinutes / 15) * performerCount);
  const companyPrice = Math.round(totalPrice * 0.7);

  return { totalPrice, companyPrice };
}

// ============================================================
// 路由注册
// ============================================================

export default async function pricingRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================================
  // POST /v1/pricing/calculate — 计算报价（公开）
  // ==========================================================
  app.post(
    '/calculate',
    {
      preHandler: [validate({ body: calculateBodySchema })],
    },
    async function calculatePrice(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { skuId, tier, durationMinutes, performerCount } =
        request.body as z.infer<typeof calculateBodySchema>;

      // 1. 检查 SKU 是否存在且上架
      const skuResult = await query<SkuBasicRow>(
        'SELECT id, status FROM skus WHERE id = $1',
        [skuId]
      );

      if (skuResult.rows.length === 0) {
        reply.status(404).send(errorResponse(5001, 'SKU不存在'));
        return;
      }

      if (skuResult.rows[0].status !== 'active') {
        reply.status(400).send(errorResponse(5002, '该SKU已下架'));
        return;
      }

      // 2. 查找对应级别的定价
      const tierResult = await query<TierPriceRow>(
        'SELECT sku_id, tier, unit_price, label, description, suitable_for FROM tier_prices WHERE sku_id = $1 AND tier = $2',
        [skuId, tier]
      );

      if (tierResult.rows.length === 0) {
        reply.status(400).send(errorResponse(5003, `未找到该SKU的 ${tier} 级别定价`));
        return;
      }

      const unitPrice = Number(tierResult.rows[0].unit_price);

      // 3. 计算价格
      const { totalPrice, companyPrice } = calculatePrices(
        unitPrice,
        durationMinutes,
        performerCount
      );

      // 4. 返回结果
      reply.status(200).send(
        successResponse({
          totalPrice,
          companyPrice,
          unitPrice,
          breakdown: {
            tier,
            durationMinutes,
            performerCount,
            unitPrice,
          },
        })
      );
    }
  );
}
