/**
 * 价格格式化 —— 统一输出带单位的价格字符串
 * 输入单位为元（分/厘自动按元处理）
 * 输出格式：
 *   < 1万元 → "5000元"
 *   ≥ 1万元 → "1.0万"
 *   ≥ 1亿元 → "2.5亿"
 */
export function formatPrice(price: number): string {
  if (price >= 10000_0000) {
    return (price / 10000_0000).toFixed(1) + "亿";
  } else if (price >= 10000) {
    return (price / 10000).toFixed(1) + "万";
  } else {
    return price.toFixed(0) + "元";
  }
}
