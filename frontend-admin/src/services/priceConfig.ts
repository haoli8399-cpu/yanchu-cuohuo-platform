/**
 * 价格配置 API 服务
 *
 * P-34: 三种价格配置
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  PriceConfigItem,
  PriceConfigUpdateRequest,
  PriceConfigListParams,
} from '@/types/priceConfig';

/** 获取价格配置列表 */
export async function getPriceConfigList(
  params?: PriceConfigListParams,
): Promise<ApiResponse<{ items: PriceConfigItem[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.config_type) query.set('config_type', params.config_type);
  if (params?.business_line) query.set('business_line', params.business_line);
  if (params?.tier) query.set('tier', params.tier);

  return apiClient.get<{ items: PriceConfigItem[]; total: number }>(
    `/price-configs?${query.toString()}`,
  );
}

/** 更新价格配置 */
export async function updatePriceConfig(
  id: string,
  data: PriceConfigUpdateRequest,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.put<{ id: string }>(
    `/price-configs/${id}`,
    data as Record<string, unknown>,
  );
}
