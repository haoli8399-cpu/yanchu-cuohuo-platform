/**
 * 操作日志 类型定义
 * 与 API_CONTRACT.md 2.15 节严格对齐
 *
 * P-05: 操作日志
 */

/** 操作日志条目 */
export interface OperationLogItem {
  id: string;
  operator: { id: string; name: string };
  module: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  created_at: string;
}

/** 操作日志查询参数 */
export interface OperationLogListParams {
  page: number;
  pageSize: number;
  module?: string;
  operator_id?: string;
  date_from?: string;
  date_to?: string;
}
