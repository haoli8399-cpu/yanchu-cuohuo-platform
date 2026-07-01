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
  status: 'online' | 'offline',
): Promise<ApiResponse<SKU>> {
  return apiClient.patch<SKU>(`/skus/${id}/status`, { status });
}
