import type { ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://119.28.134.67:3002/v1';

/** 业务错误 */
export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

let token: string | null = null;

/** 设置 token（登录后调用） */
export function setToken(t: string): void {
  token = t;
  localStorage.setItem('auth_token', t);
}

/** 清除 token（登出时调用） */
export function clearToken(): void {
  token = null;
  localStorage.removeItem('auth_token');
}

/** 从 localStorage 恢复 token */
export function loadToken(): string | null {
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  return token;
}

/**
 * 通用请求封装
 * - 自动注入 Bearer Token
 * - 统一错误处理
 * - 返回 data 部分（已解包）
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const currentToken = loadToken();
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const body: ApiResponse<T> = await response.json();

  if (body.code !== 0) {
    throw new ApiError(body.code, body.message || '请求失败');
  }

  return body.data;
}

// ============ 公开 API（无需 token） ============

/** 发送短信验证码 */
export async function sendPhoneCode(phone: string): Promise<{ expire_seconds: number }> {
  return request<{ expire_seconds: number }>('/auth/phone-code', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

/** 获取 SKU 列表 */
export async function getSkuList(params: Record<string, string | number | undefined>): Promise<unknown> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  return request('/skus?' + query.toString());
}

/** 获取 SKU 详情 */
export async function getSkuDetail(id: string): Promise<unknown> {
  return request(`/skus/${id}`);
}

// ============ 需认证 API ============

/** 手机号登录/注册 */
export async function loginByPhone(phone: string, code: string): Promise<unknown> {
  return request('/auth/phone', {
    method: 'POST',
    body: JSON.stringify({ phone, code, role: 'agent' }),
  });
}

/** 提交需求 */
export async function submitDemand(data: unknown): Promise<unknown> {
  return request('/demands', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 获取需求列表 */
export async function getDemandList(params: Record<string, string | number | undefined>): Promise<unknown> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  return request('/demands?' + query.toString());
}

/** 获取需求详情 */
export async function getDemandDetail(id: string): Promise<unknown> {
  return request(`/demands/${id}`);
}

/** 确认方案 */
export async function confirmPlan(demandId: string, planId: string): Promise<unknown> {
  return request(`/demands/${demandId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  });
}

/** 获取消费统计 */
export async function getConsumptionStats(): Promise<unknown> {
  return request('/demands/stats');
}

/** 生成邀请链接 */
export async function generateInviteLink(): Promise<unknown> {
  return request('/invite/generate', {
    method: 'POST',
  });
}
