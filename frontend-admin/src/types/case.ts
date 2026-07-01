/**
 * 案例管理 类型定义
 *
 * P-23: 案例管理 - 增编案例，草稿→发布，排序
 */

/** 案例状态 */
export type CaseStatus = 'draft' | 'published';

/** 案例状态中文映射 */
export const CaseStatusLabel: Record<CaseStatus, string> = {
  draft: '草稿',
  published: '已发布',
};

/** 案例状态颜色 */
export const CaseStatusColor: Record<CaseStatus, string> = {
  draft: 'default',
  published: 'green',
};

/** 案例列表项 */
export interface CaseListItem {
  id: string;
  title: string;
  event_type: string;
  city: string;
  cover_url: string;
  sort_order: number;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

/** 案例详情 */
export interface CaseDetail {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  city: string;
  cover_url: string;
  media_urls: string[];
  description: string;
  performer_info: string;
  client_info: string;
  sort_order: number;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

/** 案例列表查询参数 */
export interface CaseListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: CaseStatus;
}

/** 创建/更新案例请求 */
export interface CaseUpsertRequest {
  title: string;
  event_type: string;
  event_date: string;
  city: string;
  cover_url: string;
  media_urls?: string[];
  description: string;
  performer_info?: string;
  client_info?: string;
  sort_order?: number;
  status: CaseStatus;
}
