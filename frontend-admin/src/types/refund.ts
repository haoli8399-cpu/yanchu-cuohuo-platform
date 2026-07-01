/**
 * 退款处理 类型定义
 *
 * P-16: 退款处理 - 退款申请列表，按阶梯规则计算
 */

/** 退款状态 */
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';

/** 退款状态中文映射 */
export const RefundStatusLabel: Record<RefundStatus, string> = {
  pending: '待处理',
  approved: '已通过',
  rejected: '已驳回',
  completed: '已完成',
};

/** 退款状态颜色 */
export const RefundStatusColor: Record<RefundStatus, string> = {
  pending: 'orange',
  approved: 'blue',
  rejected: 'red',
  completed: 'green',
};

/** 退款列表项 */
export interface RefundItem {
  id: string;
  demand_id: string;
  demand_title: string;
  client_name: string;
  amount: number;
  refund_amount: number;
  reason: string;
  status: RefundStatus;
  created_at: string;
}

/** 退款申请请求 */
export interface RefundRequest {
  demand_id: string;
  amount: number;
  reason: string;
}

/** 处理退款请求 */
export interface ProcessRefundRequest {
  action: 'approve' | 'reject';
  reject_reason?: string;
  refund_amount?: number;
  note?: string;
}

/** 退款阶梯规则 */
export interface RefundRule {
  label: string;
  /** 天数之前 */
  days_before: number;
  /** 退款比例 (0-1) */
  ratio: number;
}

/** 默认退款阶梯规则 */
export const DEFAULT_REFUND_RULES: RefundRule[] = [
  { label: '演出前7天以上', days_before: 7, ratio: 0.9 },
  { label: '演出前3-7天', days_before: 3, ratio: 0.7 },
  { label: '演出前1-3天', days_before: 1, ratio: 0.5 },
  { label: '演出当天', days_before: 0, ratio: 0.3 },
];
