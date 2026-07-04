/**
 * SKU 类型定义
 * 对齐后端 API_CONTRACT.md 2.2 节
 */

/** 业务线类型（对齐后端 BusinessLine） */
export type BusinessLine =
  | 'venue_booking'      // 商演包场
  | 'outdoor_show'       // 外出演出
  | 'show_sponsor'       // 演出赞助
  | 'custom_content'     // 定制内容
  | 'custom_showcase';   // 定制专场

/** 业务线中文映射 */
export const BusinessLineLabel: Record<BusinessLine, string> = {
  venue_booking: '商演包场',
  outdoor_show: '外出演出',
  show_sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_showcase: '定制专场',
};

/** SKU 状态 */
export type SKUStatus = 'active' | 'inactive' | 'draft';

/** SKU 状态中文映射 */
export const StatusLabel: Record<SKUStatus, string> = {
  active: '已上架',
  inactive: '已下架',
  draft: '草稿',
};

/** SKU 状态色彩映射 */
export const StatusColor: Record<SKUStatus, string> = {
  active: 'green',
  inactive: 'default',
  draft: 'orange',
};

/** SKU 主类型（对齐后端 snake_case，前端 camelCase） */
export interface SKU {
  id: string;
  name: string;
  businessLine: BusinessLine;
  description: string;
  performerProfile: string;        // 演员画像描述文本
  styleTags: string[];             // 风格标签数组
  applicableScenarios: string[];   // 适用场景数组
  basePrice: number;               // 甲方标准价（分）
  companyPrice: number;            // 活动公司价（分）×0.7，后端计算
  internalPrice: number;           // 内部结算价（分）×0.67，后端计算
  durationMinutes: number;         // 演出时长
  performersCount: number;         // 建议演员数
  coverUrl: string;                // 封面图
  mediaUrls: string[];             // 样片视频
  status: SKUStatus;
  createdAt: string;
  updatedAt: string;
}

/** SKU 列表查询参数 */
export interface SKUListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  businessLine?: BusinessLine;
  status?: 'active' | 'inactive';
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
