/**
 * 评价管理 类型定义
 *
 * 与 API_CONTRACT.md 2.12 节对齐
 */

/** 评价状态 */
export type ReviewStatus = 'pending' | 'published' | 'hidden';

/** 评价状态中文映射 */
export const ReviewStatusLabel: Record<ReviewStatus, string> = {
  pending: '待审核',
  published: '已发布',
  hidden: '已隐藏',
};

/** 评价状态颜色 */
export const ReviewStatusColor: Record<ReviewStatus, string> = {
  pending: 'orange',
  published: 'green',
  hidden: 'default',
};

/** 评价列表项 */
export interface ReviewListItem {
  id: string;
  from_type: 'company' | 'performer';
  from_user: {
    id: string;
    name: string;
  };
  overall_rating: number;
  text_content: string;
  status: ReviewStatus;
  sku_name?: string;
  sku_id?: string;
  company_name?: string;
  demand_id?: string;
  created_at: string;
}

/** 评价列表查询参数 */
export interface ReviewListParams {
  page: number;
  pageSize: number;
  performer_id?: string;
  demand_id?: string;
  sku_id?: string;
}
