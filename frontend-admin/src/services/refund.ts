/**
 * 退款处理 API 服务
 *
 * P-16: 退款处理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  RefundItem,
  RefundRequest,
  ProcessRefundRequest,
} from '@/types/refund';

/** 获取退款列表 */
export async function getRefundList(
  page: number,
  pageSize: number,
  status?: string,
): Promise<ApiResponse<PaginatedResponse<RefundItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('pageSize', String(pageSize));
  if (status) query.set('status', status);

  return apiClient.get<PaginatedResponse<RefundItem>>(
    `/refunds?${query.toString()}`,
  );
}

/** 申请退款 */
export async function createRefund(
  data: RefundRequest,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<{ id: string }>('/refunds', data as Record<string, unknown>);
}

/** 处理退款（通过/驳回） */
export async function processRefund(
  id: string,
  data: ProcessRefundRequest,
): Promise<ApiResponse<{ status: string }>> {
  return apiClient.patch<{ status: string }>(
    `/refunds/${id}/process`,
    data as Record<string, unknown>,
  );
}
