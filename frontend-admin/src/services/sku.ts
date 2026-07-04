/**
 * SKU 相关 API 服务
 */
import apiClient from './apiClient';
import type { SKU, SKUListParams } from '@/types/sku';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';

/** 获取 SKU 分页列表 */
export async function getSKUList(
  params: SKUListParams,
): Promise<ApiResponse<PaginatedResponse<SKU>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.businessLine) query.set('businessLine', params.businessLine);
  if (params.status) query.set('status', params.status);

  return apiClient.get<PaginatedResponse<SKU>>(`/skus?${query.toString()}`);
}

/** 获取 SKU 详情 */
export async function getSKUDetail(
  id: string,
): Promise<ApiResponse<SKU>> {
  return apiClient.get<SKU>(`/skus/${id}`);
}

/** 创建 SKU */
export async function createSKU(
  data: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ApiResponse<SKU>> {
  return apiClient.post<SKU>('/skus', data as Record<string, unknown>);
}

/** 更新 SKU */
export async function updateSKU(
  id: string,
  data: Partial<SKU>,
): Promise<ApiResponse<SKU>> {
  return apiClient.put<SKU>(`/skus/${id}`, data as Record<string, unknown>);
}

/** 删除 SKU */
export async function deleteSKU(
  id: string,
): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/skus/${id}`);
}

/** 上架/下架 SKU */
export async function toggleSKUStatus(
  id: string,
  status: 'active' | 'inactive',
): Promise<ApiResponse<{ id: string; status: string }>> {
  return apiClient.patch<{ id: string; status: string }>(`/skus/${id}/status`, { status });
}

/** 更新基础信息 */
export async function updateBasicInfo(
  id: string,
  data: { name?: string; businessLine?: string; description?: string },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch<{ id: string }>(`/skus/${id}/basic-info`, {
    name: data.name,
    business_line: data.businessLine,
    description: data.description,
  });
}

/** 更新演员画像 */
export async function updatePerformer(
  id: string,
  data: { performerProfile?: string; styleTags?: string[]; performersCount?: number },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch<{ id: string }>(`/skus/${id}/performer`, {
    performer_profile: data.performerProfile,
    style_tags: data.styleTags,
    performers_count: data.performersCount,
  });
}

/** 更新价格（后端自动算 companyPrice + internalPrice） */
export async function updatePricing(
  id: string,
  data: { basePrice: number },
): Promise<ApiResponse<{ id: string; base_price: number; company_price: number; internal_price: number }>> {
  return apiClient.patch<{ id: string; base_price: number; company_price: number; internal_price: number }>(
    `/skus/${id}/pricing`,
    { base_price: data.basePrice },
  );
}

/** 更新素材 */
export async function updateMedia(
  id: string,
  data: { coverUrl?: string; mediaUrls?: string[] },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch<{ id: string }>(`/skus/${id}/media`, {
    cover_url: data.coverUrl,
    media_urls: data.mediaUrls,
  });
}

/** 更新配置 */
export async function updateConfig(
  id: string,
  data: { applicableScenes?: string[]; durationMinutes?: number },
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.patch<{ id: string }>(`/skus/${id}/config`, {
    applicable_scenes: data.applicableScenes,
    duration_minutes: data.durationMinutes,
  });
}
