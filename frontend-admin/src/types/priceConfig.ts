/**
 * 价格配置 类型定义
 * 与 API_CONTRACT.md 2.13 节严格对齐
 *
 * P-34: 三种价格配置
 */

import type { PerformerTier } from './performer';

/** 价格配置类型 */
export type PriceConfigType =
  | 'performer_settlement'
  | 'agent_quote'
  | 'client_quote';

/** 业务线类型（对齐API） */
export type BusinessLine =
  | 'venue_booking'
  | 'outdoor_show'
  | 'show_sponsor'
  | 'custom_content'
  | 'custom_showcase';

/** 价格配置类型中文映射 */
export const PriceConfigTypeLabel: Record<PriceConfigType, string> = {
  performer_settlement: '演员结算价',
  agent_quote: '活动公司报价（7折）',
  client_quote: '甲方标准价',
};

/** 价格配置类型颜色 */
export const PriceConfigTypeColor: Record<PriceConfigType, string> = {
  performer_settlement: 'blue',
  agent_quote: 'green',
  client_quote: 'orange',
};

/** 业务线中文映射 */
export const PriceBusinessLineLabel: Record<BusinessLine, string> = {
  venue_booking: '场地预订',
  outdoor_show: '外出演出',
  show_sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_showcase: '定制展示',
};

/** 价格配置条目（GET /v1/price-configs 响应 items） */
export interface PriceConfigItem {
  id: string;
  config_type: PriceConfigType;
  business_line: BusinessLine;
  tier?: PerformerTier;
  package_name: string;
  duration_minutes: number;
  performer_count: number;
  base_price: number;
  agent_discount: number;
  extra_fee_per_5min?: number;
  script_creation_fee?: number;
  script_performance_fee?: number;
  remote_fee_in_city?: number;
  remote_fee_out_city?: number;
  updated_at: string;
}

/** 价格配置更新请求 */
export interface PriceConfigUpdateRequest {
  config_type?: PriceConfigType;
  business_line?: BusinessLine;
  tier?: PerformerTier;
  package_name?: string;
  duration_minutes?: number;
  performer_count?: number;
  base_price?: number;
  agent_discount?: number;
  extra_fee_per_5min?: number;
  script_creation_fee?: number;
  script_performance_fee?: number;
  remote_fee_in_city?: number;
  remote_fee_out_city?: number;
}

/** 价格配置查询参数 */
export interface PriceConfigListParams {
  config_type?: PriceConfigType;
  business_line?: BusinessLine;
  tier?: PerformerTier;
}
