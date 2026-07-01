/**
 * 结算管理 API 服务
 *
 * P-19: 结算统计
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type {
  SettlementListData,
  MarkSettledRequest,
} from '@/types/settlement';

/** 获取结算汇总 */
export async function getSettlementList(
  period?: string,
  performerId?: string,
): Promise<ApiResponse<SettlementListData>> {
  const query = new URLSearchParams();
  if (period) query.set('period', period);
  if (performerId) query.set('performer_id', performerId);

  return apiClient.get<SettlementListData>(
    `/settlements?${query.toString()}`,
  );
}

/** 标记已结算 */
export async function markSettled(
  settlementId: string,
  data?: MarkSettledRequest,
): Promise<ApiResponse<null>> {
  return apiClient.patch<null>(
    `/settlements/${settlementId}/mark-settled`,
    (data as Record<string, unknown>) || {},
  );
}
