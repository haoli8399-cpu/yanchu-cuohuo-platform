/**
 * 运营工作台 & 总看板 API 服务
 *
 * P-01: 运营个人工作台 - 待处理列表
 * P-02: 运营总看板 - 供需健康指标
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  PendingTask,
  PendingTaskListParams,
  SupplyDemandMetrics,
} from '@/types/operation';

/** P-01: 获取待处理任务列表（运营个人工作台） */
export async function getPendingTasks(
  params: PendingTaskListParams,
): Promise<ApiResponse<PaginatedResponse<PendingTask>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.urgency) query.set('urgency', params.urgency);

  return apiClient.get<PaginatedResponse<PendingTask>>(
    `/operations/pending-tasks?${query.toString()}`,
  );
}

/** P-02: 获取供需健康指标（运营总看板） */
export async function getSupplyDemandMetrics(): Promise<
  ApiResponse<SupplyDemandMetrics>
> {
  return apiClient.get<SupplyDemandMetrics>('/operations/metrics');
}
