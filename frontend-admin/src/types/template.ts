/**
 * AI模板管理 类型定义
 *
 * P-24: AI模板管理 - 通用模板，SKU未覆盖时使用
 */

/** 模板分类 */
export type TemplateCategory = 'general' | 'pricing' | 'lineup' | 'contract';

/** 模板分类中文映射 */
export const TemplateCategoryLabel: Record<TemplateCategory, string> = {
  general: '通用',
  pricing: '定价',
  lineup: '阵容',
  contract: '合同',
};

/** 模板分类颜色 */
export const TemplateCategoryColor: Record<TemplateCategory, string> = {
  general: 'blue',
  pricing: 'orange',
  lineup: 'green',
  contract: 'purple',
};

/** 模板列表项 */
export interface TemplateListItem {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/** 模板详情 */
export interface TemplateDetail {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;
  variables: TemplateVariable[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/** 模板变量 */
export interface TemplateVariable {
  key: string;
  label: string;
  default_value: string;
  required: boolean;
}

/** 模板列表查询参数 */
export interface TemplateListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  category?: TemplateCategory;
}

/** 创建/更新模板请求 */
export interface TemplateUpsertRequest {
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;
  variables?: TemplateVariable[];
}
