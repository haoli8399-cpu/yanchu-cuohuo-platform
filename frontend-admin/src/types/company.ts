/**
 * 活动公司管理 类型定义
 * 与 API_CONTRACT.md 2.14 节严格对齐
 *
 * P-32: 角色权限管理（RBAC）
 * W-03: 企业认证
 */

/** 活动公司认证状态 */
export type CompanyStatus = 'registered' | 'pending_cert' | 'certified';

/** 活动公司状态中文映射 */
export const CompanyStatusLabel: Record<CompanyStatus, string> = {
  registered: '已注册',
  pending_cert: '待认证',
  certified: '已认证',
};

/** 活动公司状态颜色 */
export const CompanyStatusColor: Record<CompanyStatus, string> = {
  registered: 'default',
  pending_cert: 'orange',
  certified: 'green',
};

/** 活动公司列表项（GET /v1/companies 响应 items） */
export interface CompanyListItem {
  id: string;
  short_name: string;
  full_name?: string;
  contact_person: string;
  city: string;
  service_categories: string[];
  status: CompanyStatus;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

/** 活动公司详情（GET /v1/companies/:id 响应） */
export interface CompanyDetail {
  id: string;
  short_name: string;
  full_name?: string;
  contact_person: string;
  phone: string;
  city: string;
  service_categories: string[];
  status: CompanyStatus;
  total_orders: number;
  total_spent: number;
  // 认证信息
  credit_code?: string;
  business_license_url?: string;
  legal_person_name?: string;
  legal_person_id_url?: string;
  bank_name?: string;
  bank_account?: string;
  created_at: string;
}

/** 活动公司列表查询参数 */
export interface CompanyListParams {
  page: number;
  pageSize: number;
  status?: CompanyStatus;
  keyword?: string;
}

/** 审核认证请求 */
export interface VerifyCompanyRequest {
  action: 'approve' | 'reject';
  reason?: string;
}
