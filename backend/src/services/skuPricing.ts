// ============================================================
// SKU 定价计算服务
// 对齐 TASK.md Phase 1 / FREEZE.md 2.2-2.3
// ============================================================

/**
 * 根据甲方标准价（base_price）计算联动价格
 *
 * - company_price = base_price × 0.7（活动公司 7 折渠道价）
 * - internal_price = base_price × 0.67（内部结算价）
 *
 * 所有价格以「分」为单位，结果四舍五入取整。
 */
export function calcPrices(basePrice: number): {
  company_price: number;
  internal_price: number;
} {
  return {
    company_price: Math.round(basePrice * 0.7),
    internal_price: Math.round(basePrice * 0.67),
  };
}
