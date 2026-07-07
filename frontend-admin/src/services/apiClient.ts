/**
 * apiClient - 统一 API 调用封装
 *
 * 职责：
 * 1. Token 自动注入
 * 2. 统一错误处理 / 格式化
 * 3. 请求/响应类型安全
 * 4. 请求重试（可选）
 *
 * 遵守 CODE_STANDARDS:
 * - API-7: 所有 API 调用通过 apiClient
 * - API-8: 禁止直接使用 fetch/axios
 * - G-1:  基础 URL 走环境变量
 */

import { message } from 'antd';

/** API 统一响应格式 (CODE_STANDARDS API-1) */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 请求配置 */
interface RequestConfig extends Omit<RequestInit, 'body'> {
  /** 跳过 token 注入（用于登录等不需要 token 的接口） */
  skipAuth?: boolean;
  /** 超时时间（ms），默认 15000 */
  timeout?: number;
  /** 是否显示错误提示，默认 true */
  showError?: boolean;
}

/** 请求体类型 */
type RequestBody = Record<string, unknown> | FormData | null;

/**
 * 获取存储的 token
 * 优先从 localStorage 读取，后续可扩展为从状态管理器读取
 */
function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

/**
 * 构建完整请求 URL
 * 开发环境走代理 /api → 目标服务器
 * 生产环境走环境变量 API_BASE_URL
 */
function buildURL(path: string): string {
  // 开发环境通过 umi proxy 转发
  if (process.env.NODE_ENV === 'development') {
    return `/api${path}`;
  }
  // 生产环境从环境变量读取
  const baseURL = process.env.API_BASE_URL || '';
  return `${baseURL}${path}`;
}

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 核心请求方法
 */
async function request<T>(
  method: string,
  path: string,
  body?: RequestBody,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const {
    skipAuth = false,
    timeout = 15000,
    showError = true,
    ...fetchConfig
  } = config;

  const url = buildURL(path);

  // 构建 headers
  const headers: Record<string, string> = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Token 注入
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // 构建 fetch 选项
  const fetchOptions: RequestInit = {
    method,
    headers,
    ...fetchConfig,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetchWithTimeout(url, fetchOptions, timeout);

    // 处理 HTTP 状态码异常
    if (!response.ok) {
      if (response.status === 401) {
        // Token 过期，清除并提示重新登录
        localStorage.removeItem('admin_token');
        message.error('登录已过期，请重新登录');
        // 跳转登录页（由路由守卫处理）
        window.location.hash = '#/login';
        throw new Error('未授权，请重新登录');
      }
      if (response.status === 403) {
        message.error('权限不足');
        throw new Error('权限不足');
      }
      if (response.status >= 500) {
        message.error('服务器错误，请稍后重试');
        throw new Error(`服务器错误 (${response.status})`);
      }
    }

    // 解析 JSON 响应
    const json: ApiResponse<T> = await response.json();

    // 业务错误码处理
    if (json.code !== 0) {
      if (showError) {
        message.error(json.message || '操作失败');
      }
      throw new Error(json.message || `请求失败 (code: ${json.code})`);
    }

    return json;
  } catch (error: unknown) {
    // 网络错误 / 超时
    if (error instanceof DOMException && error.name === 'AbortError') {
      message.error('请求超时，请检查网络');
      throw new Error('请求超时');
    }
    // 已是格式化错误则直接抛出
    if (error instanceof Error) {
      throw error;
    }
    message.error('网络异常，请检查网络连接');
    throw new Error('网络异常');
  }
}

/**
 * 对外暴露的 API 方法
 */
const apiClient = {
  get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('GET', path, null, config);
  },

  post<T>(
    path: string,
    body?: RequestBody,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body, config);
  },

  put<T>(
    path: string,
    body?: RequestBody,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return request<T>('PUT', path, body, config);
  },

  patch<T>(
    path: string,
    body?: RequestBody,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return request<T>('PATCH', path, body, config);
  },

  delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path, null, config);
  },
};

export default apiClient;
