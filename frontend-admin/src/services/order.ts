/**
 * 订单管理 + 排期分配 API 服务
 *
 * P-15: 订单监控 - 状态推进
 * P-12: 排期分配 - 分配+日历
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  AdvanceStatusRequest,
  OrderTimelineItem,
  AssignmentRequest,
  AssignmentItem,
  CalendarEntry,
  AssignmentListParams,
} from '@/types/order';
import type { DemandStatus } from '@/types/demand';

/** 推进订单状态 */
export async function advanceOrderStatus(
  demandId: string,
  data: AdvanceStatusRequest,
): Promise<ApiResponse<{ id: string; status: DemandStatus }>> {
  return apiClient.patch<{ id: string; status: DemandStatus }>(
    `/orders/${demandId}/status`,
    data as Record<string, unknown>,
  );
}

/** 获取订单时间线 */
export async function getOrderTimeline(
  demandId: string,
): Promise<ApiResponse<OrderTimelineItem[]>> {
  return apiClient.get<OrderTimelineItem[]>(`/orders/${demandId}/timeline`);
}

/** 分配演员排期 */
export async function createAssignment(
  data: AssignmentRequest,
): Promise<ApiResponse<{ id: string; status: string }>> {
  return apiClient.post<{ id: string; status: string }>(
    '/assignments',
    data as Record<string, unknown>,
  );
}

/** 获取排期列表 */
export async function getAssignmentList(
  params: AssignmentListParams,
): Promise<ApiResponse<PaginatedResponse<AssignmentItem>>> {
  const query = new URLSearchParams();
  if (params.demand_id) query.set('demand_id', params.demand_id);
  if (params.performer_id) query.set('performer_id', params.performer_id);
  if (params.status) query.set('status', params.status);
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));

  return apiClient.get<PaginatedResponse<AssignmentItem>>(
    `/assignments?${query.toString()}`,
  );
}

/** 获取档期日历 */
export async function getCalendar(
  month: string,
  performerId?: string,
): Promise<ApiResponse<CalendarEntry[]>> {
  const query = new URLSearchParams();
  query.set('month', month);
  if (performerId) query.set('performer_id', performerId);

  return apiClient.get<CalendarEntry[]>(
    `/assignments/calendar?${query.toString()}`,
  );
}
