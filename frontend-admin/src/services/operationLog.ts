/**
 * 操作日志 API 服务
 *
 * P-05: 操作日志
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  OperationLogItem,
  OperationLogListParams,
} from '@/types/operationLog';

/** 获取操作日志列表 */
export async function getOperationLogs(
  params: OperationLogListParams,
): Promise<ApiResponse<PaginatedResponse<OperationLogItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.module) query.set('module', params.module);
  if (params.operator_id) query.set('operator_id', params.operator_id);
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);

  return apiClient.get<PaginatedResponse<OperationLogItem>>(
    `/admin/operation-logs?${query.toString()}`,
  );
}

/** 撤销操作（P-06: 5分钟内） */
export async function undoOperation(
  logId: string,
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>(
    `/admin/operation-logs/${logId}/undo`,
  );
}
