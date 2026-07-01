/**
 * 演员管理 API 服务
 *
 * P-07/P-08: 演员库/演员管理 - CRUD
 * P-33: 演员咖位管理
 * P-10: 演员信誉分管理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  PerformerListItem,
  PerformerDetail,
  PerformerListParams,
  PerformerTier,
  TierHistoryItem,
  TierSuggestion,
  CreditDetail,
  CreditLogItem,
} from '@/types/performer';

/** 获取演员列表 */
export async function getPerformerList(
  params: PerformerListParams,
): Promise<ApiResponse<PaginatedResponse<PerformerListItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.tier) query.set('tier', params.tier);
  if (params.credit_level) query.set('credit_level', params.credit_level);
  if (params.style) query.set('style', params.style);
  if (params.status) query.set('status', params.status);
  if (params.keyword) query.set('keyword', params.keyword);

  return apiClient.get<PaginatedResponse<PerformerListItem>>(
    `/performers?${query.toString()}`,
  );
}

/** 获取演员详情 */
export async function getPerformerDetail(
  id: string,
): Promise<ApiResponse<PerformerDetail>> {
  return apiClient.get<PerformerDetail>(`/performers/${id}`);
}

/** 新增演员 */
export async function createPerformer(
  data: Record<string, unknown>,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<{ id: string }>('/performers', data);
}

/** 编辑演员资料 */
export async function updatePerformer(
  id: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.put<{ id: string }>(`/performers/${id}`, data);
}

/** 获取咖位变动历史 */
export async function getTierHistory(
  performerId: string,
): Promise<ApiResponse<TierHistoryItem[]>> {
  return apiClient.get<TierHistoryItem[]>(`/performers/${performerId}/tier-history`);
}

/** 手动调整咖位 */
export async function adjustPerformerTier(
  performerId: string,
  tier: PerformerTier,
  reason: string,
): Promise<ApiResponse<{ tier: PerformerTier }>> {
  return apiClient.put<{ tier: PerformerTier }>(
    `/performers/${performerId}/tier`,
    { tier, reason },
  );
}

/** 获取系统升降级建议 */
export async function getTierSuggestion(
  performerId: string,
): Promise<ApiResponse<TierSuggestion>> {
  return apiClient.get<TierSuggestion>(
    `/performers/${performerId}/tier-suggestion`,
  );
}

/** 获取信誉分详情 */
export async function getCreditDetail(
  performerId: string,
): Promise<ApiResponse<CreditDetail>> {
  return apiClient.get<CreditDetail>(`/performers/${performerId}/credit`);
}

/** 获取信誉分变动明细 */
export async function getCreditLogs(
  performerId: string,
  page: number,
  pageSize: number,
): Promise<ApiResponse<PaginatedResponse<CreditLogItem>>> {
  return apiClient.get<PaginatedResponse<CreditLogItem>>(
    `/performers/${performerId}/credit-logs?page=${page}&pageSize=${pageSize}`,
  );
}
