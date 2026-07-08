// API 客户端
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (data.code !== 0) {
    if (data.code === 1001 || data.code === 1003) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new ApiError(data.code, data.message);
  }
  return data.data;
}

// 公开API
export const getSkuList = (params: Record<string, string | number>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.append(k, String(v)); });
  return request(`/v1/skus?${qs}`);
};
export const getSkuDetail = (id: string) => request(`/v1/skus/${id}`);

// 认证
export const sendPhoneCode = (phone: string) =>
  request('/v1/auth/phone-code', { method: 'POST', body: JSON.stringify({ phone }) });

export const phoneLogin = (phone: string, code: string, role: string) =>
  request<{ token: string; user: { name: string } }>('/v1/auth/phone', {
    method: 'POST', body: JSON.stringify({ phone, code, role }),
  });

// 需求
export const submitDemand = (body: Record<string, unknown>) =>
  request('/v1/demands', { method: 'POST', body: JSON.stringify(body) });

export const getDemandList = (params: Record<string, string | number>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.append(k, String(v)); });
  return request(`/v1/demands?${qs}`);
};

export const getDemandDetail = (id: string) => request(`/v1/demands/${id}`);

// AI 洞察（小演悬浮组件）
export const getAiInsight = (body: Record<string, unknown>) =>
  request<{ insights: string[] }>('/v1/ai/insight', { method: 'POST', body: JSON.stringify(body) });
