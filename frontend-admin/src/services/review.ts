/**
 * 评价管理 API 服务
 *
 * P-12: 评价管理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type { ReviewListItem, ReviewListParams } from '@/types/review';

/** 获取评价列表 */
export async function getReviewList(
  params: ReviewListParams,
): Promise<ApiResponse<PaginatedResponse<ReviewListItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.performer_id) query.set('performer_id', params.performer_id);
  if (params.demand_id) query.set('demand_id', params.demand_id);
  if (params.sku_id) query.set('sku_id', params.sku_id);

  return apiClient.get<PaginatedResponse<ReviewListItem>>(
    `/reviews?${query.toString()}`,
  );
}
