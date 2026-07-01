/**
 * 结算管理 类型定义
 * 与 API_CONTRACT.md 2.11 节严格对齐
 *
 * P-19: 结算统计
 */

import type { PerformerTier } from './performer';

/** 结算明细条目 */
export interface SettlementDetailItem {
  demand_id: string;
  demand_title: string;
  amount: number;
  status: 'pending' | 'settled';
  settled_at?: string;
}

/** 结算汇总条目 */
export interface SettlementItem {
  id: string;
  performer: { id: string; name: string; tier: PerformerTier };
  pending_amount: number;
  settled_amount: number;
  total_amount: number;
  details: SettlementDetailItem[];
}

/** 结算汇总响应 */
export interface SettlementListData {
  items: SettlementItem[];
  summary: {
    total_pending: number;
    total_settled: number;
  };
}

/** 标记已结算请求 */
export interface MarkSettledRequest {
  paid_at?: string;
}
