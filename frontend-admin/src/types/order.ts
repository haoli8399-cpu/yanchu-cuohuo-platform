/**
 * 订单管理 类型定义
 * 与 API_CONTRACT.md 2.4-2.5、2.9 节严格对齐
 *
 * P-15: 订单监控
 * P-12: 排期分配
 */

import type { DemandStatus } from './demand';
import type { PerformerTier } from './performer';

/** 订单状态推进请求 */
export interface AdvanceStatusRequest {
  to_status: DemandStatus;
  metadata?: {
    amount?: number;
    method?: string;
    note?: string;
  };
}

/** 订单时间线条目 */
export interface OrderTimelineItem {
  status: DemandStatus;
  label: string;
  at: string;
  operator?: { id: string; name: string };
  note?: string;
}

/** 排期分配请求 */
export interface AssignmentRequest {
  demand_id: string;
  performer_id: string;
  performance_role: string;
  arrival_time: string;
  negotiated_price?: number;
}

/** 排期列表项 */
export interface AssignmentItem {
  id: string;
  demand: { id: string; title: string; event_date: string };
  performer: { id: string; name: string; tier: PerformerTier };
  performance_role: string;
  arrival_time: string;
  checkin_time?: string;
  checkin_location?: Record<string, unknown>;
  negotiated_price?: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  reject_reason?: string;
  confirmed_at?: string;
}

/** 档期日历条目 */
export interface CalendarEntry {
  date: string;
  assignments: {
    id: string;
    performer: { id: string; name: string };
    demand_title: string;
    time_slot: string;
  }[];
}

/** 排期列表查询参数 */
export interface AssignmentListParams {
  demand_id?: string;
  performer_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}
