/**
 * 演员管理 类型定义
 * 与 API_CONTRACT.md 2.6-2.8 节严格对齐
 *
 * P-07: 演员库
 * P-08: 演员管理
 * P-33: 演员咖位管理
 * P-10: 演员信誉分管理
 */

/** 演员咖位 */
export type PerformerTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

/** 信誉等级 */
export type CreditLevel = 'S' | 'A' | 'B' | 'C' | 'D';

/** 咖位中文映射 */
export const PerformerTierLabel: Record<PerformerTier, string> = {
  T0: 'T0 · 顶流',
  T1: 'T1 · 一线',
  T2: 'T2',
  T3: 'T3',
  T4: 'T4',
  T5: 'T5',
  T6: 'T6 · 新人',
};

/** 咖位颜色 */
export const PerformerTierColor: Record<PerformerTier, string> = {
  T0: 'red',
  T1: 'volcano',
  T2: 'orange',
  T3: 'gold',
  T4: 'lime',
  T5: 'green',
  T6: 'cyan',
};

/** 信誉等级中文映射 */
export const CreditLevelLabel: Record<CreditLevel, string> = {
  S: 'S · 卓越',
  A: 'A · 优秀',
  B: 'B · 良好',
  C: 'C · 一般',
  D: 'D · 较差',
};

/** 信誉等级颜色 */
export const CreditLevelColor: Record<CreditLevel, string> = {
  S: 'purple',
  A: 'green',
  B: 'blue',
  C: 'orange',
  D: 'red',
};

/** 演员列表项（GET /v1/performers 响应 items） */
export interface PerformerListItem {
  id: string;
  name: string;
  avatar_url: string;
  style_tags: string[];
  tier: PerformerTier;
  credit_score: number;
  credit_level: CreditLevel;
  rating: number;
  experience_years: number;
  status: 'active' | 'inactive';
}

/** 演员详情（GET /v1/performers/:id 响应） */
export interface PerformerDetail {
  id: string;
  name: string;
  phone: string;
  avatar_url: string;
  cover_url: string;
  style_tags: string[];
  introduction: string;
  highlights: string;
  media_urls: string[];
  social_links: Record<string, string>;
  experience_years: number;
  tier: PerformerTier;
  tier_updated_at: string;
  credit_score: number;
  credit_level: CreditLevel;
  rating: number;
  status: 'active' | 'inactive';
  contract?: {
    type: string;
    exclusivity: boolean;
    settlement_rate: number;
  };
  created_at: string;
}

/** 咖位变动历史 */
export interface TierHistoryItem {
  from_tier: PerformerTier;
  to_tier: PerformerTier;
  reason: string;
  operator: { id: string; name: string };
  created_at: string;
}

/** 系统升降级建议 */
export interface TierSuggestion {
  current_tier: PerformerTier;
  suggested_tier?: PerformerTier;
  direction: 'up' | 'down' | 'none';
  reasons: string[];
  metrics: {
    completed_shows: number;
    credit_score: number;
    recent_avg_rating: number;
    recent_reject_count: number;
  };
}

/** 信誉分详情 */
export interface CreditDetail {
  total_score: number;
  level: CreditLevel;
  dimensions: {
    fulfillment: { score: number; weight: number };
    quality: { score: number; weight: number };
    activity: { score: number; weight: number };
    basics: { score: number; weight: number };
  };
}

/** 信誉分变动明细 */
export interface CreditLogItem {
  id: string;
  change_amount: number;
  reason: string;
  related_demand_id?: string;
  created_at: string;
}

/** 演员列表查询参数 */
export interface PerformerListParams {
  page: number;
  pageSize: number;
  tier?: PerformerTier;
  credit_level?: CreditLevel;
  style?: string;
  status?: 'active' | 'inactive';
  keyword?: string;
}
