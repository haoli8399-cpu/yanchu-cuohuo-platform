/**
 * AI模板管理 API 服务
 *
 * P-24: AI模板管理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  TemplateListItem,
  TemplateDetail,
  TemplateListParams,
  TemplateUpsertRequest,
} from '@/types/template';

/** 获取模板列表 */
export async function getTemplateList(
  params: TemplateListParams,
): Promise<ApiResponse<PaginatedResponse<TemplateListItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.category) query.set('category', params.category);

  return apiClient.get<PaginatedResponse<TemplateListItem>>(
    `/templates?${query.toString()}`,
  );
}

/** 获取模板详情 */
export async function getTemplateDetail(
  id: string,
): Promise<ApiResponse<TemplateDetail>> {
  return apiClient.get<TemplateDetail>(`/templates/${id}`);
}

/** 创建模板 */
export async function createTemplate(
  data: TemplateUpsertRequest,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<{ id: string }>('/templates', data as Record<string, unknown>);
}

/** 更新模板 */
export async function updateTemplate(
  id: string,
  data: Partial<TemplateUpsertRequest>,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.put<{ id: string }>(`/templates/${id}`, data as Record<string, unknown>);
}

/** 删除模板 */
export async function deleteTemplate(
  id: string,
): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/templates/${id}`);
}
