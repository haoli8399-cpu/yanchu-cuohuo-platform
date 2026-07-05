// ============================================================================
// 演事 uni-app — API 服务层
// 基础 URL: https://api.yanchu-platform.com/v1
// 开发阶段使用 mock 数据降级
// ============================================================================

import type {
  LoginResult, SKUProduct, SKUDetail, DemandRequest, PlanItem, UnifiedPlan,
  Assignment, CheckinRecord, SettlementRecord, CreditScore,
  ActorOnboarding, ApiResponse, UserInfo
} from '@/types';

// ── 配置 ──
const API_BASE = 'https://api.yanchu-platform.com/v1';
const USE_MOCK = true; // 开发阶段使用 mock

// ── 统一请求封装 ──
// 自动处理：token 注入 → 401 跳登录 → 网络重试 → 统一错误提示
async function request<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: Record<string, unknown>;
    header?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', data, header = {} } = options;
  const token = uni.getStorageSync('token') || '';

  const doFetch = async (): Promise<ApiResponse<T>> => {
    try {
      const res = await uni.request({
        url: `${API_BASE}${endpoint}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...header
        }
      });

      // 401 → 未登录，跳转登录页
      if (res.statusCode === 401) {
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.reLaunch({ url: '/pages/login/index' });
        return { ok: false, error: '登录已过期，请重新登录' };
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return res.data as ApiResponse<T>;
      }
      return {
        ok: false,
        error: `HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`
      };
    } catch (e: any) {
      // 网络错误，尝试重试一次
      if (e.errMsg?.includes('timeout') || e.errMsg?.includes('fail')) {
        try {
          const retryRes = await uni.request({
            url: `${API_BASE}${endpoint}`, method, data,
            header: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
              ...header
            }
          });
          if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
            return retryRes.data as ApiResponse<T>;
          }
          return { ok: false, error: `HTTP ${retryRes.statusCode}` };
        } catch {
          return { ok: false, error: '网络请求失败，请检查网络连接' };
        }
      }
      return { ok: false, error: e.message || '网络请求失败' };
    }
  };

  return doFetch();
}

// ── Mock 数据 ──
const MOCK_SKUS: SKUProduct[] = [
  {
    id: 'sku-001', category: '脱口秀', category_label: '脱口秀拼盘', title: '脱口秀拼盘之夜',
    description: '4-5位脱口秀演员轮番上阵，90分钟爆笑不停。适合企业年会、品牌活动、商场暖场。',
    cover_url: '/static/icons/sku-talk-show.png', min_price: 5000, max_price: 15000,
    duration_minutes: 90, cast_size_min: 4, cast_size_max: 6,
    tags: ['热门', '互动强', '气氛热烈'], city: '成都', venue_options: ['后仰喜剧·万象城剧场', '后仰喜剧·大悦城剧场'],
    status: '上架', rating: 4.8, review_count: 126, created_at: '2026-01-01', updated_at: '2026-06-01'
  },
  {
    id: 'sku-002', category: '即兴喜剧', category_label: '即兴喜剧工作坊', title: '即兴喜剧团建专场',
    description: '即兴喜剧演员现场互动，观众决定剧情走向。适合团队建设、客户答谢活动。',
    cover_url: '/static/icons/sku-improv.png', min_price: 8000, max_price: 20000,
    duration_minutes: 120, cast_size_min: 3, cast_size_max: 5,
    tags: ['互动', '团建', '即兴'], city: '成都', venue_options: ['后仰喜剧·万象城剧场'],
    status: '上架', rating: 4.6, review_count: 89, created_at: '2026-02-01', updated_at: '2026-06-01'
  },
  {
    id: 'sku-003', category: '漫才', category_label: '漫才双人秀', title: '漫才爆笑双人档',
    description: '日式漫才风格，快节奏吐槽与装傻，双人配合引爆全场笑点。',
    cover_url: '/static/icons/sku-manzai.png', min_price: 3000, max_price: 8000,
    duration_minutes: 60, cast_size_min: 2, cast_size_max: 2,
    tags: ['双人', '快节奏', '新鲜'], city: '成都', venue_options: ['后仰喜剧·COSMO剧场'],
    status: '上架', rating: 4.5, review_count: 56, created_at: '2026-03-01', updated_at: '2026-06-01'
  },
  {
    id: 'sku-004', category: '脱口秀', category_label: '脱口秀个人专场', title: '脱口秀个人专场',
    description: '知名脱口秀演员个人专场演出，60分钟精品内容 + 互动环节。适合品牌冠名、VIP答谢。',
    cover_url: '/static/icons/sku-special.png', min_price: 15000, max_price: 50000,
    duration_minutes: 90, cast_size_min: 1, cast_size_max: 2,
    tags: ['专场', '高端', '品牌'], city: '成都', venue_options: ['后仰喜剧·万象城剧场', '后仰喜剧·大悦城剧场', '后仰喜剧·COSMO剧场'],
    status: '上架', rating: 4.9, review_count: 42, created_at: '2026-04-01', updated_at: '2026-06-01'
  },
  {
    id: 'sku-005', category: '新喜剧', category_label: '新喜剧实验室', title: '新喜剧实验场',
    description: 'Sketch + 漫才 + 即兴的混合形式，前卫喜剧内容厂牌定制。',
    cover_url: '/static/icons/sku-sketch.png', min_price: 6000, max_price: 12000,
    duration_minutes: 90, cast_size_min: 3, cast_size_max: 6,
    tags: ['新锐', '实验', '年轻化'], city: '成都', venue_options: ['后仰喜剧·COSMO剧场'],
    status: '上架', rating: 4.4, review_count: 31, created_at: '2026-05-01', updated_at: '2026-06-01'
  }
];

const MOCK_SKU_DETAIL: Record<string, SKUDetail> = {
  'sku-001': {
    ...MOCK_SKUS[0] as SKUDetail,
    price_tiers: [
      { tier_name: '基础版', price: 5000, cast_count: 4, duration: 90, includes: ['4位演员', '90分钟演出', '基础音响'], recommends: ['小型企业活动', '商场暖场'] },
      { tier_name: '标准版', price: 10000, cast_count: 5, duration: 90, includes: ['5位演员', '90分钟演出', '专业音响', '主持人互动'], recommends: ['品牌发布会', '大型年会'] },
      { tier_name: '旗舰版', price: 15000, cast_count: 6, duration: 90, includes: ['6位演员', '90分钟演出', '顶级音响灯光', '定制互动环节', '演出录像'], recommends: ['VIP客户答谢', '品牌冠名专场'] }
    ],
    gallery_urls: [],
    review_summary: { average_score: 4.8, total_count: 126, distribution: [{ score: 5, count: 98 }, { score: 4, count: 22 }, { score: 3, count: 5 }, { score: 2, count: 1 }, { score: 1, count: 0 }] },
    faq: [
      { question: '需要多大场地？', answer: '建议场地面积不小于50平方米，配备基本舞台和观众座位。' },
      { question: '可以指定演员吗？', answer: '下单后可备注偏好演员，我们会尽量安排但不保证具体人选。' },
      { question: '提前多久预约？', answer: '建议至少提前2周预约，热门时段需提前1个月。' }
    ]
  }
};

const MOCK_DEMANDS: DemandRequest[] = [
  {
    id: 'demand-001', sku_id: 'sku-001', sku_title: '脱口秀拼盘之夜', sku_cover_url: '/static/icons/sku-talk-show.png',
    company_id: 'c-001', company_name: '某科技公司', performance_date: '2026-07-15', venue: '后仰喜剧·万象城剧场',
    price_tier: '标准版', estimated_price: 10000, special_requirements: '需要一个关于程序员梗的定制段子',
    status: '已报价', status_label: '已报价', quote_amount: 10000, quote_note: '标准版报价，可安排5位演员',
    created_at: '2026-07-01', updated_at: '2026-07-02'
  },
  {
    id: 'demand-002', sku_id: 'sku-004', sku_title: '脱口秀个人专场', sku_cover_url: '/static/icons/sku-special.png',
    company_id: 'c-001', company_name: '某科技公司', performance_date: '2026-07-20', venue: '后仰喜剧·大悦城剧场',
    price_tier: '基础版', estimated_price: 15000, special_requirements: '品牌冠名，需要现场品牌露出',
    status: '待报价', status_label: '待报价', created_at: '2026-07-01', updated_at: '2026-07-01'
  },
  {
    id: 'demand-003', sku_id: 'sku-002', sku_title: '即兴喜剧团建专场', sku_cover_url: '/static/icons/sku-improv.png',
    company_id: 'c-001', company_name: '某科技公司', performance_date: '2026-06-15', venue: '后仰喜剧·万象城剧场',
    price_tier: '旗舰版', estimated_price: 20000, special_requirements: '',
    status: '已签约', status_label: '已签约', quote_amount: 20000, created_at: '2026-06-01', updated_at: '2026-06-10'
  }
];

const MOCK_DEMAND_DETAIL: Record<string, DemandRequest & { plans: PlanItem[]; plan?: UnifiedPlan }> = {
  'demand-001': {
    ...MOCK_DEMANDS[0],
    plans: [
      {
        name: '脱口秀拼盘标准版',
        price: 10000,
        performers: ['张三', '李四', '王五', '赵六', '钱七'],
        description: '5位脱口秀演员，每人15分钟表演+集体互动环节。含专业音响和主持人。'
      },
      {
        name: '脱口秀拼盘轻量版',
        price: 6000,
        performers: ['张三', '李四', '王五'],
        description: '3位脱口秀演员，每人20分钟表演。适合预算有限的场次。'
      }
    ],
    plan: {
      content: '根据您的活动规模（200人）、预算（¥8000-15000）和场地要求，推荐「脱口秀拼盘标准版」方案。包含5位经验丰富的脱口秀演员，每人15分钟表演，穿插集体互动环节，总时长约90分钟。配备专业音响设备和现场主持人，确保演出效果。',
      performer_names: ['张三', '李四', '王五', '赵六', '钱七'],
      price: 10000
    }
  },
  'demand-002': {
    ...MOCK_DEMANDS[1],
    plans: []
  },
  'demand-003': {
    ...MOCK_DEMANDS[2],
    plans: []
  }
};

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asgn-001', demand_id: 'demand-003', sku_title: '即兴喜剧团建专场', company_name: '某科技公司',
    show_date: '2026-07-15', start_time: '19:30', end_time: '21:30', venue: '后仰喜剧·万象城剧场',
    venue_name: '后仰喜剧·万象城剧场', role_name: '即兴演员', fee: 1500,
    status: '待确认', status_label: '待确认', confirm_deadline: '2026-07-10',
    show_name: '即兴喜剧团建专场', cast_info: '3-5人即兴团队', created_at: '2026-07-01'
  },
  {
    id: 'asgn-002', demand_id: 'demand-001', sku_title: '脱口秀拼盘之夜', company_name: '某科技公司',
    show_date: '2026-07-20', start_time: '20:00', end_time: '21:30', venue: '后仰喜剧·大悦城剧场',
    venue_name: '后仰喜剧·大悦城剧场', role_name: '开场演员', fee: 800,
    status: '已确认', status_label: '已确认', show_name: '脱口秀拼盘之夜', cast_info: '4-6人拼盘',
    created_at: '2026-07-01'
  },
  {
    id: 'asgn-003', demand_id: 'demand-001', sku_title: '脱口秀拼盘之夜', company_name: '某科技公司',
    show_date: '2026-06-28', start_time: '19:30', end_time: '21:00', venue: '后仰喜剧·万象城剧场',
    venue_name: '后仰喜剧·万象城剧场', role_name: '压轴演员', fee: 2000,
    status: '已确认', status_label: '已确认', show_name: '脱口秀拼盘之夜', cast_info: '4-6人拼盘',
    created_at: '2026-06-20'
  }
];

const MOCK_CHECKINS: CheckinRecord[] = [
  { id: 'ck-001', assignment_id: 'asgn-003', show_date: '2026-06-28', venue: '后仰喜剧·万象城剧场',
    checkin_time: '2026-06-28T18:30:00', checkin_location: '成都市锦江区万象城A座3F',
    checkin_photo_url: '', checkout_time: '2026-06-28T21:30:00', status: '已签退', status_label: '已签退' },
  { id: 'ck-002', assignment_id: 'asgn-002', show_date: '2026-07-20', venue: '后仰喜剧·大悦城剧场',
    checkin_time: null, checkin_location: null, checkin_photo_url: null, checkout_time: null,
    status: '未签到', status_label: '未签到' }
];

const MOCK_SETTLEMENTS: SettlementRecord[] = [
  { id: 'stl-001', assignment_id: 'asgn-003', sku_title: '脱口秀拼盘之夜', show_date: '2026-06-28',
    fee: 2000, adjustment: 200, final_amount: 2200, settlement_month: '2026-06',
    status: '已发放', status_label: '已发放', actor_confirm_status: '已确认', settled_at: '2026-06-30', created_at: '2026-06-29' },
  { id: 'stl-002', assignment_id: 'asgn-002', sku_title: '脱口秀拼盘之夜', show_date: '2026-07-20',
    fee: 800, adjustment: 0, final_amount: 800, settlement_month: '2026-07',
    status: '待结算', status_label: '待结算', created_at: '2026-07-01' }
];

const MOCK_CREDIT: CreditScore = {
  actor_id: 'actor-001', total_score: 920, level: '优秀', level_label: '优秀',
  punctuality_score: 95, performance_score: 92, communication_score: 88, professionalism_score: 93,
  history: [
    { id: 'ch-001', date: '2026-06-28', event: '准时到场演出', score_change: 5, reason: '提前30分钟到达现场准备' },
    { id: 'ch-002', date: '2026-06-20', event: '客户好评', score_change: 10, reason: '演出获客户5星评价' },
    { id: 'ch-003', date: '2026-06-15', event: '演出取消', score_change: -5, reason: '因不可抗力演出取消（非演员原因）' },
    { id: 'ch-004', date: '2026-05-30', event: '月度优秀', score_change: 20, reason: '月度表现评分排名前三' }
  ],
  updated_at: '2026-07-01'
};

// ── 认证 API ──
export async function wechatLogin(code: string): Promise<LoginResult> {
  if (USE_MOCK) {
    return {
      ok: true,
      data: {
        access_token: 'mock-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 86400 * 7,
        user: { id: 'user-001', name: '测试用户', phone: '13800138000', role: 'agent', company_name: '某科技公司' }
      }
    };
  }
  return request<LoginResult['data']>('/auth/wechat-miniprogram', { method: 'POST', data: { code } }) as Promise<LoginResult>;
}

// ── 演员入驻 API ──
export async function submitOnboarding(data: ActorOnboarding): Promise<ApiResponse<UserInfo>> {
  if (USE_MOCK) {
    // 模拟入驻成功，返回带 actor_id 的 userInfo
    const savedUser = uni.getStorageSync('userInfo');
    const user: UserInfo = savedUser ? JSON.parse(savedUser) : { id: 'user-001', name: '测试用户', phone: '13800138000', role: 'performer' };
    user.actor_id = 'actor-' + Date.now().toString().slice(-6);
    // 更新本地存储
    uni.setStorageSync('userInfo', JSON.stringify(user));
    return { ok: true, data: user };
  }
  return request<UserInfo>('/actors/onboarding', { method: 'POST', data: data as unknown as Record<string, unknown> });
}

// ── SKU API (C端) ──
export async function getSKUList(params?: {
  category?: string; keyword?: string; page?: number; pageSize?: number;
  priceRange?: string; sortBy?: string;
}): Promise<ApiResponse<SKUProduct[]>> {
  if (USE_MOCK) {
    let list = MOCK_SKUS;
    if (params?.category) list = list.filter(s => s.category === params.category);
    if (params?.keyword) list = list.filter(s => s.title.includes(params.keyword!) || s.description.includes(params.keyword!));
    // 价格筛选
    if (params?.priceRange) {
      const [min, max] = params.priceRange.split('-').map(Number);
      list = list.filter(s => {
        if (max) return s.min_price >= min && s.max_price <= max;
        return s.min_price >= min; // "15000-" 情况
      });
    }
    // 排序
    if (params?.sortBy) {
      const cmp = (a: SKUProduct, b: SKUProduct) => {
        if (params.sortBy === 'price_asc') return a.min_price - b.min_price;
        if (params.sortBy === 'price_desc') return b.min_price - a.min_price;
        if (params.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      };
      list = [...list].sort(cmp);
    }
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const paginated = list.slice(start, start + pageSize);
    return { ok: true, data: paginated, total: list.length };
  }
  return request<SKUProduct[]>('/skus', { method: 'GET', data: params as Record<string, unknown> });
}

export async function getSKUDetail(id: string): Promise<ApiResponse<SKUDetail>> {
  if (USE_MOCK) {
    const detail = MOCK_SKU_DETAIL[id] || { ...MOCK_SKUS.find(s => s.id === id), price_tiers: [], review_summary: { average_score: 0, total_count: 0, distribution: [] }, gallery_urls: [], faq: [] } as unknown as SKUDetail;
    return { ok: true, data: detail };
  }
  return request<SKUDetail>(`/skus/${id}`);
}

// ── 需求 API (C端) ──
export async function submitDemand(data: {
  sku_id: string; performance_date: string; venue: string; price_tier: string;
  special_requirements?: string;
}): Promise<ApiResponse<DemandRequest>> {
  if (USE_MOCK) {
    return { ok: true, data: { id: 'demand-' + Date.now(), ...data, company_id: 'c-001', company_name: '某科技公司',
      sku_title: MOCK_SKUS.find(s => s.id === data.sku_id)?.title || '', sku_cover_url: '',
      estimated_price: 10000, status: '待报价', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      special_requirements: data.special_requirements || ''
    } as DemandRequest };
  }
  return request<DemandRequest>('/demands', { method: 'POST', data });
}

export async function getDemandList(params?: { status?: string }): Promise<ApiResponse<DemandRequest[]>> {
  if (USE_MOCK) {
    let list = MOCK_DEMANDS;
    if (params?.status) list = list.filter(d => d.status === params.status);
    const statusLabels: Record<string, string> = { '待报价': '待报价', '已报价': '已报价', '已确认': '已确认', '已签约': '已签约', '已取消': '已取消' };
    return { ok: true, data: list.map(d => ({ ...d, status_label: statusLabels[d.status] || d.status })), total: list.length };
  }
  return request<DemandRequest[]>('/demands', { method: 'GET', data: params as Record<string, unknown> });
}

export async function updateDemand(id: string, data: {
  performance_date?: string; venue?: string; price_tier?: string;
  special_requirements?: string;
}): Promise<ApiResponse<DemandRequest>> {
  if (USE_MOCK) {
    const idx = MOCK_DEMANDS.findIndex(d => d.id === id);
    if (idx === -1) return { ok: false, error: '需求不存在' };
    MOCK_DEMANDS[idx] = { ...MOCK_DEMANDS[idx], ...data, updated_at: new Date().toISOString() } as DemandRequest;
    return { ok: true, data: MOCK_DEMANDS[idx] };
  }
  return request<DemandRequest>(`/demands/${id}`, { method: 'PUT', data });
}

export async function cancelDemand(id: string): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    const idx = MOCK_DEMANDS.findIndex(d => d.id === id);
    if (idx === -1) return { ok: false, error: '需求不存在' };
    MOCK_DEMANDS[idx].status = '已取消';
    MOCK_DEMANDS[idx].status_label = '已取消';
    MOCK_DEMANDS[idx].updated_at = new Date().toISOString();
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/demands/${id}`, { method: 'DELETE' });
}

// ── 排期/任务 API (B端) ──
export async function getAssignmentList(params?: { status?: string; month?: string }): Promise<ApiResponse<Assignment[]>> {
  if (USE_MOCK) {
    let list = MOCK_ASSIGNMENTS;
    if (params?.status) list = list.filter(a => a.status === params.status);
    return { ok: true, data: list, total: list.length };
  }
  return request<Assignment[]>('/assignments', { method: 'GET', data: params as Record<string, unknown> });
}

export async function getAssignmentDetail(id: string): Promise<ApiResponse<Assignment>> {
  if (USE_MOCK) {
    const detail = MOCK_ASSIGNMENTS.find(a => a.id === id);
    return { ok: !!detail, data: detail, error: detail ? undefined : '未找到排期' };
  }
  return request<Assignment>(`/assignments/${id}`);
}

export async function confirmAssignment(id: string, action: 'confirm' | 'reject', reason?: string): Promise<ApiResponse<Assignment>> {
  if (USE_MOCK) {
    const updated = { ...MOCK_ASSIGNMENTS.find(a => a.id === id)! };
    updated.status = action === 'confirm' ? '已确认' : '已拒绝';
    updated.status_label = action === 'confirm' ? '已确认' : '已拒绝';
    if (reason) updated.reject_reason = reason;
    return { ok: true, data: updated };
  }
  return request<Assignment>(`/assignments/${id}/${action}`, { method: 'PATCH', data: { reason } });
}

// ── 签到 API (B端) ──
export async function getCheckinList(params?: { month?: string }): Promise<ApiResponse<CheckinRecord[]>> {
  if (USE_MOCK) {
    return { ok: true, data: MOCK_CHECKINS, total: MOCK_CHECKINS.length };
  }
  return request<CheckinRecord[]>('/checkins', { method: 'GET', data: params as Record<string, unknown> });
}

export async function doCheckin(data: {
  assignment_id: string; latitude: number; longitude: number;
  location: string; photo_url?: string;
}): Promise<ApiResponse<CheckinRecord>> {
  if (USE_MOCK) {
    return {
      ok: true,
      data: {
        id: 'ck-' + Date.now(), assignment_id: data.assignment_id, show_date: new Date().toISOString().slice(0, 10),
        venue: '', checkin_time: new Date().toISOString(), checkin_location: data.location,
        checkin_photo_url: data.photo_url || '', checkout_time: null, status: '已签到',
        status_label: '已签到', latitude: data.latitude, longitude: data.longitude
      }
    };
  }
  return request<CheckinRecord>('/checkins', { method: 'POST', data });
}

// ── 结算 API (B端) ──
export async function getSettlementList(params?: { month?: string }): Promise<ApiResponse<SettlementRecord[]>> {
  if (USE_MOCK) {
    let list = MOCK_SETTLEMENTS;
    if (params?.month) list = list.filter(s => s.settlement_month === params.month);
    return { ok: true, data: list, total: list.length };
  }
  return request<SettlementRecord[]>('/settlements', { method: 'GET', data: params as Record<string, unknown> });
}

// ── 账号注销 ──
export async function deleteAccount(): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>('/users/account', { method: 'DELETE' });
}

// ── 用户反馈提交 ──
export async function submitFeedback(data: { type: string; content: string; contact?: string }): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>('/users/feedback', { method: 'POST', data: data as Record<string, unknown> });
}

// ── 收藏夹 API ──
const MOCK_FAVORITES = [...MOCK_SKUS];

export async function getFavorites(): Promise<ApiResponse<SKUProduct[]>> {
  if (USE_MOCK) {
    return { ok: true, data: MOCK_FAVORITES, total: MOCK_FAVORITES.length };
  }
  return request<SKUProduct[]>('/users/favorites', { method: 'GET' });
}

export async function removeFavorite(id: string): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    const idx = MOCK_FAVORITES.findIndex(f => f.id === id);
    if (idx >= 0) MOCK_FAVORITES.splice(idx, 1);
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/users/favorites/${id}`, { method: 'DELETE' });
}

// ── 信誉分 API (B端) ──
// ── Admin: 分类管理 API ──
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  if (USE_MOCK) {
    const cats: Category[] = [
      { id: 'cat-01', label: '脱口秀', sort_order: 1 },
      { id: 'cat-02', label: '即兴喜剧', sort_order: 2 },
      { id: 'cat-03', label: '漫才', sort_order: 3 },
      { id: 'cat-04', label: '新喜剧', sort_order: 4 },
    ];
    return { ok: true, data: cats, total: cats.length };
  }
  return request<Category[]>('/admin/categories', { method: 'GET' });
}

export async function createCategory(name: string): Promise<ApiResponse<Category>> {
  if (USE_MOCK) {
    const cat: Category = { id: 'cat-' + Date.now(), label: name, sort_order: 99 };
    return { ok: true, data: cat };
  }
  return request<Category>('/admin/categories', { method: 'POST', data: { label: name } });
}

export async function updateCategory(id: string, name: string): Promise<ApiResponse<Category>> {
  if (USE_MOCK) {
    return { ok: true, data: { id, label: name, sort_order: 1 } };
  }
  return request<Category>(`/admin/categories/${id}`, { method: 'PUT', data: { label: name } });
}

export async function deleteCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/admin/categories/${id}`, { method: 'DELETE' });
}

// ── Admin: SKU 管理 API ──
export async function createSKU(data: Partial<SKUProduct>): Promise<ApiResponse<SKUProduct>> {
  if (USE_MOCK) {
    const sku: SKUProduct = {
      id: 'sku-' + Date.now(), category: data.category || '脱口秀', title: data.title || '',
      description: data.description || '', cover_url: data.cover_url || '',
      min_price: data.min_price || 0, max_price: data.max_price || 0,
      duration_minutes: data.duration_minutes || 60, cast_size_min: data.cast_size_min || 1,
      cast_size_max: data.cast_size_max || 1, tags: data.tags || [], city: data.city || '成都',
      venue_options: [], status: '上架', created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { ok: true, data: sku };
  }
  return request<SKUProduct>('/admin/skus', { method: 'POST', data: data as Record<string, unknown> });
}

export async function updateSKU(id: string, data: Partial<SKUProduct>): Promise<ApiResponse<SKUProduct>> {
  if (USE_MOCK) {
    return { ok: true, data: { id, ...data } as SKUProduct };
  }
  return request<SKUProduct>(`/admin/skus/${id}`, { method: 'PUT', data: data as Record<string, unknown> });
}

export async function deleteSKU(id: string): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/admin/skus/${id}`, { method: 'DELETE' });
}

export async function getCreditScore(): Promise<ApiResponse<CreditScore>> {
  if (USE_MOCK) {
    return { ok: true, data: MOCK_CREDIT };
  }
  return request<CreditScore>('/credit/score');
}

// ── 需求详情 API (C端/活动公司) ──
export async function getDemandDetail(id: string): Promise<ApiResponse<DemandRequest & { plans?: PlanItem[]; plan?: UnifiedPlan }>> {
  if (USE_MOCK) {
    const detail = MOCK_DEMAND_DETAIL[id];
    if (detail) return { ok: true, data: detail };
    return { ok: false, error: '需求不存在' };
  }
  return request<DemandRequest & { plans?: PlanItem[] }>(`/demands/${id}`);
}

// ── 确认方案 API (C端/活动公司) ──
export async function confirmPlan(demandId: string, planIdx?: number): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    const detail = MOCK_DEMAND_DETAIL[demandId];
    if (!detail) return { ok: false, error: '需求不存在' };
    // planIdx 兼容旧模式；新模式不传
    if (planIdx !== undefined && planIdx >= 0 && (detail.plans?.length || 0) > 0) {
      if (planIdx >= (detail.plans?.length || 0)) return { ok: false, error: '方案不存在' };
    }
    detail.status = '待确认';
    detail.status_label = '待确认';
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/demands/${demandId}/confirm-plan`, { method: 'POST', data: planIdx !== undefined ? { plan_idx: planIdx } : {} });
}

// ── 不采纳方案 API (C端/活动公司) ──
export async function rejectPlan(demandId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    const detail = MOCK_DEMAND_DETAIL[demandId];
    if (!detail) return { ok: false, error: '需求不存在' };
    detail.status = '已报价';
    detail.status_label = '已报价';
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/demands/${demandId}/reject-plan`, { method: 'POST', data: { reason: reason || '' } });
}
