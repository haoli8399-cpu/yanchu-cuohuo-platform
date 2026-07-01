/**
 * 活动公司管理 API 服务
 *
 * W-03: 企业认证
 * P-32: 角色权限管理
 */
import apiClient from './apiClient';
import type { ApiResponse } from './apiClient';
import type { PaginatedResponse } from '@/types/sku';
import type {
  CompanyListItem,
  CompanyDetail,
  CompanyListParams,
  VerifyCompanyRequest,
  CompanyStatus,
} from '@/types/company';

/** 获取活动公司列表 */
export async function getCompanyList(
  params: CompanyListParams,
): Promise<ApiResponse<PaginatedResponse<CompanyListItem>>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.status) query.set('status', params.status);
  if (params.keyword) query.set('keyword', params.keyword);

  return apiClient.get<PaginatedResponse<CompanyListItem>>(
    `/companies?${query.toString()}`,
  );
}

/** 获取活动公司详情 */
export async function getCompanyDetail(
  id: string,
): Promise<ApiResponse<CompanyDetail>> {
  return apiClient.get<CompanyDetail>(`/companies/${id}`);
}

/** 审核认证（通过/驳回） */
export async function verifyCompany(
  companyId: string,
  data: VerifyCompanyRequest,
): Promise<ApiResponse<{ status: CompanyStatus }>> {
  return apiClient.patch<{ status: CompanyStatus }>(
    `/companies/${companyId}/verify`,
    data as Record<string, unknown>,
  );
}
