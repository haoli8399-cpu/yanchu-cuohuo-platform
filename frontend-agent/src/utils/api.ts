import axios from 'axios';
import type {
  Sku,
  SkuListParams,
  PaginatedResult,
  Banner,
  Request,
  DemandListParams,
  CompanyUser,
  UserStats,
  NotificationItem,
  NotificationListParams,
  Case,
  Review,
} from '@/types';

/* ============================
   Axios 实例
   ============================ */

const api = axios.create({
  baseURL: '/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ---------- 请求拦截器 ---------- */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------- 响应拦截器 ---------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/* ============================
   SKU 相关 API
   ============================ */

export async function getSkuList(
  params?: SkuListParams,
): Promise<PaginatedResult<Sku>> {
  const { data } = await api.get<PaginatedResult<Sku>>('/skus', { params });
  return data;
}

export async function getSkuDetail(id: string): Promise<Sku> {
  const { data } = await api.get<Sku>(`/skus/${id}`);
  return data;
}

/* ============================
   Banner / 首页
   ============================ */

export async function getBanners(): Promise<Banner[]> {
  const { data } = await api.get<Banner[]>('/banners');
  return data;
}

/* ============================
   需求 (Request / Demand) 相关 API
   ============================ */

export async function createDemand(
  payload: Omit<
    Request,
    | 'id'
    | 'companyId'
    | 'companyName'
    | 'status'
    | 'quotes'
    | 'createdAt'
    | 'updatedAt'
  >,
): Promise<Request> {
  const { data } = await api.post<Request>('/demands', payload);
  return data;
}

export async function getDemandList(
  params?: DemandListParams,
): Promise<PaginatedResult<Request>> {
  const { data } = await api.get<PaginatedResult<Request>>('/demands', {
    params,
  });
  return data;
}

export async function getDemandDetail(id: string): Promise<Request> {
  const { data } = await api.get<Request>(`/demands/${id}`);
  return data;
}

export async function confirmQuote(
  demandId: string,
  quoteId: string,
): Promise<Request> {
  const { data } = await api.post<Request>(
    `/demands/${demandId}/confirm-quote`,
    { quoteId },
  );
  return data;
}

/* ============================
   用户相关 API
   ============================ */

export async function getUserProfile(): Promise<CompanyUser> {
  const { data } = await api.get<CompanyUser>('/user/profile');
  return data;
}

export async function getUserStats(): Promise<UserStats> {
  const { data } = await api.get<UserStats>('/user/stats');
  return data;
}

/* ============================
   通知相关 API
   ============================ */

export async function getNotifications(
  params?: NotificationListParams,
): Promise<PaginatedResult<NotificationItem>> {
  const { data } = await api.get<PaginatedResult<NotificationItem>>(
    '/notifications',
    { params },
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}

/* ============================
   案例 / 评价相关 API
   ============================ */

export async function getCaseDetail(id: string): Promise<Case> {
  const { data } = await api.get<Case>(`/cases/${id}`);
  return data;
}

export async function getReviewDetail(id: string): Promise<Review> {
  const { data } = await api.get<Review>(`/reviews/${id}`);
  return data;
}
