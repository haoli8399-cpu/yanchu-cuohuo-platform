/**
 * 评价管理 API 服务
 *
 * P-12: 评价管理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type { ReviewListItem, ReviewListParams } from '@/types/review';

/** 新增评价请求体 */
export interface CreateReviewRequest {
  sku_id: string;
  overall_rating: number;
  text_content: string;
  company_name?: string;
}

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

/** 新增评价 */
export async function createReview(
  data: CreateReviewRequest,
): Promise<ApiResponse<ReviewListItem>> {
  return apiClient.post<ReviewListItem>('/reviews', data as unknown as Record<string, unknown>);
}

/** 删除评价 */
export async function deleteReview(
  id: string,
): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/reviews/${id}`);
}
