/**
 * 需求管理 API 服务
 *
 * P-04: 需求管理 - CRUD + AI方案 + 运营调整
 * API 端点: /v1/demands
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  DemandListItem,
  DemandDetail,
  DemandListParams,
  AdjustPlanRequest,
} from '@/types/demand';

/** 获取需求列表 */
export async function getDemandList(
  params: DemandListParams,
): Promise<ApiResponse<PaginatedResponse<DemandListItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.status) query.set('status', params.status);
  if (params.role) query.set('role', params.role);

  return apiClient.get<PaginatedResponse<DemandListItem>>(
    `/demands?${query.toString()}`,
  );
}

/** 获取需求详情 */
export async function getDemandDetail(
  id: string,
): Promise<ApiResponse<DemandDetail>> {
  return apiClient.get<DemandDetail>(`/demands/${id}`);
}

/** 触发 AI 生成方案 */
export async function triggerAIPlan(
  demandId: string,
): Promise<ApiResponse<{ id: string; status: string; ai_plan_content: string }>> {
  return apiClient.post(`/demands/${demandId}/ai-plan`);
}

/** 运营调整方案 */
export async function adjustPlan(
  demandId: string,
  data: AdjustPlanRequest,
): Promise<ApiResponse<{ id: string; status: string }>> {
  return apiClient.put(`/demands/${demandId}/adjust-plan`, data as Record<string, unknown>);
}
