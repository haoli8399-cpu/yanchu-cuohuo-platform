/**
 * 案例管理 API 服务
 *
 * P-23: 案例管理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  CaseListItem,
  CaseDetail,
  CaseListParams,
  CaseUpsertRequest,
} from '@/types/case';

/** 获取案例列表 */
export async function getCaseList(
  params: CaseListParams,
): Promise<ApiResponse<PaginatedResponse<CaseListItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.status) query.set('status', params.status);
  if (params.sku_id) query.set('sku_id', params.sku_id);

  return apiClient.get<PaginatedResponse<CaseListItem>>(
    `/cases?${query.toString()}`,
  );
}

/** 获取案例详情 */
export async function getCaseDetail(
  id: string,
): Promise<ApiResponse<CaseDetail>> {
  return apiClient.get<CaseDetail>(`/cases/${id}`);
}

/** 创建案例 */
export async function createCase(
  data: CaseUpsertRequest,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<{ id: string }>('/cases', data as unknown as Record<string, unknown>);
}

/** 更新案例 */
export async function updateCase(
  id: string,
  data: Partial<CaseUpsertRequest>,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.put<{ id: string }>(`/cases/${id}`, data as unknown as Record<string, unknown>);
}

/** 删除案例 */
export async function deleteCase(
  id: string,
): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/cases/${id}`);
}
