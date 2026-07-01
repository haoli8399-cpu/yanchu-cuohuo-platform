/**
 * SKU 类型定义
 * 与 API_CONTRACT.md 严格对齐
 */

/** 演员画像（SKU中包含的演员描述，非锁定阵容） */
export interface ActorProfile {
  /** 演员风格标签（如：脱口秀、即兴喜剧） */
  style: string;
  /** 建议咖位范围 */
  tierRange: string;
  /** 建议人数 */
  count: number;
}

/** 业务线类型 */
export type BusinessLine =
  | 'commercial_show'   // 商演包场
  | 'outdoor_show'      // 外出演出
  | 'show_sponsor'      // 演出赞助
  | 'custom_content'    // 定制内容
  | 'custom_platter';   // 定制拼盘

/** 业务线中文映射 */
export const BusinessLineLabel: Record<BusinessLine, string> = {
  commercial_show: '商演包场',
  outdoor_show: '外出演出',
  show_sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_platter: '定制拼盘',
};

/** SKU 主类型 */
export interface SKU {
  /** SKU唯一标识 */
  id: string;
  /** SKU名称 */
  name: string;
  /** 所属业务线 */
  businessLine: BusinessLine;
  /** 演员画像描述 */
  actorProfile: ActorProfile;
  /** 内部结算价（分） */
  internalPrice: number;
  /** 活动公司价 = 甲方标准价 × 0.7（分） */
  companyPrice: number;
  /** 甲方标准价（分） */
  clientPrice: number;
  /** 演出时长（分钟） */
  duration: number;
  /** 适用场景描述 */
  scenarios: string[];
  /** 样片URL列表 */
  sampleVideos: string[];
  /** 上架状态 */
  status: 'online' | 'offline' | 'draft';
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** SKU 列表查询参数 */
export interface SKUListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  businessLine?: BusinessLine;
  status?: SKU['status'];
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
