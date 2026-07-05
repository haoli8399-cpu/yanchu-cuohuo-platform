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

/** 级别定价条目 */
export interface TierPricing {
  tier: string;
  name: string;
  description: string;
  scenario: string;
  pricePer15Min: number; // 15分钟单价（分）
}

/** 场地要求 */
export interface VenueRequirement {
  type: 'indoor' | 'outdoor' | 'both';
  minArea: number;        // 最小面积（㎡）
  equipment: string[];    // 设备清单
  seatingStyles: string[]; // 座位形式
}

/** 案例展示条目 */
export interface CaseItem {
  id: string;
  title: string;
  date: string;           // 活动日期 YYYY-MM-DD
  participants: number;   // 参与人数
  actorTier: string;      // 演员级别
  rating: number;         // 好评率 0-100
  description: string;
}

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

  // === 扩展字段（前端先落地，后端后续支持） ===

  /** 排序权重 */
  sortWeight?: number;
  /** 级别定价配置 */
  tierPricing?: TierPricing[];
  /** 默认推荐级别 */
  defaultTier?: string;
  /** 可选时长（分钟） */
  durationOptions?: number[];
  /** 默认时长（分钟） */
  defaultDuration?: number;
  /** 场地要求 */
  venueRequirement?: VenueRequirement;
  /** 节目介绍（富文本） */
  description?: string;
  /** 封面图URL列表 */
  coverImages?: string[];
  /** 案例展示 */
  cases?: CaseItem[];
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

/** 可选时长预设值 */
export const DURATION_OPTIONS = [30, 45, 60, 75, 90];

/** 座位形式预设值 */
export const SEATING_STYLE_OPTIONS = ['剧场式', '圆桌式', '开放式', '站立式'];

/** 场地类型映射 */
export const VenueTypeLabel: Record<string, string> = {
  indoor: '室内',
  outdoor: '室外',
  both: '均可',
};

/** 级别定价默认行 */
export const DEFAULT_TIER_PRICING: TierPricing[] = [
  { tier: 'T3', name: '资深', description: '3年以上经验', scenario: '中型企业活动', pricePer15Min: 0 },
  { tier: 'T4', name: '成熟', description: '1-3年经验', scenario: '普通商业活动', pricePer15Min: 0 },
  { tier: 'T5', name: '新锐', description: '1年以下', scenario: '小型活动', pricePer15Min: 0 },
];

/** 默认推荐级别选项 */
export const DEFAULT_TIER_OPTIONS = ['T3', 'T4', 'T5'];

/** 场地类型选项 */
export const VENUE_TYPE_OPTIONS = [
  { label: '室内', value: 'indoor' },
  { label: '室外', value: 'outdoor' },
  { label: '均可', value: 'both' },
];
