// ============================================================================
// 演事 uni-app — API 服务层
// 基础 URL: https://api.yanchu-platform.com/v1
// 开发阶段使用 mock 数据降级
// ============================================================================

import type {
  LoginResult, SKUProduct, SKUDetail, DemandRequest, PlanItem, UnifiedPlan,
  Assignment, CheckinRecord, SettlementRecord, CreditScore,
  ActorOnboarding, ApiResponse, UserInfo,
  TierInfo, PriceCalcuationResult, SKUExtended,
  Review, ReviewStats, HotKeyword,
  AIPlanOption, AIRecommendResult
} from '@/types';

// ── 配置 ──
const API_BASE = 'http://119.28.134.67:9090/v1';
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
    if (params?.keyword) {
      // 自然语言搜索：按中文词块 / 英文单词分词，要求全部命中（如「年会脱口秀」需同时含年会、脱口秀）
      const kw = String(params.keyword).toLowerCase();
      const tokens = kw.match(/[一-龥]+|[a-z0-9]+/g) || [kw];
      list = list.filter(s => {
        const hay = `${s.title} ${s.description} ${s.category_label || ''} ${(s.tags || []).join(' ')}`.toLowerCase();
        return tokens.every(t => hay.includes(t));
      });
    }
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
    const base = MOCK_SKU_DETAIL[id] || { ...MOCK_SKUS.find(s => s.id === id), price_tiers: [], review_summary: { average_score: 0, total_count: 0, distribution: [] }, gallery_urls: [], faq: [] } as unknown as SKUDetail;
    // 注入扩展字段（演员级别/默认配置）
    const ext = MOCK_SKU_EXTENDED[id] || { tierInfo: MOCK_TIER_INFO, defaultTier: 'T3', durationOptions: [30, 45, 60, 75, 90], defaultDuration: 60, minPerformers: 2, maxPerformers: 4 };
    return { ok: true, data: { ...base, ...ext } as unknown as SKUDetail };
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
// ── 演员级别/定价 Mock ──
const MOCK_TIER_INFO: TierInfo[] = [
  { tier: 'T0', label: '新人演员', description: '初入舞台，活力十足', suitableFor: '适合社区活动/小型暖场', unitPrice: 20000 },
  { tier: 'T1', label: '潜力演员', description: '1年以上舞台经验', suitableFor: '适合小型企业活动', unitPrice: 30000 },
  { tier: 'T2', label: '成熟演员', description: '2年以上舞台经验，台风稳健', suitableFor: '适合中型企业活动', unitPrice: 40000 },
  { tier: 'T3', label: '资深演员', description: '3年以上舞台经验，作品丰富', suitableFor: '适合年会/品牌活动主力', unitPrice: 60000 },
  { tier: 'T4', label: '明星演员', description: '5年以上舞台经验，小有名气', suitableFor: '适合大型年会/品牌冠名', unitPrice: 100000 },
  { tier: 'T5', label: '咖位演员', description: '有综艺/电视演出经验', suitableFor: '适合VIP答谢/高端品牌活动', unitPrice: 160000 },
  { tier: 'T6', label: '顶流演员', description: '知名脱口秀演员，票房号召力强', suitableFor: '适合品牌代言级活动', unitPrice: 250000 },
];

// ── 每个 SKU 的扩展配置（默认级别/时长/人数） ──
const MOCK_SKU_EXTENDED: Record<string, Partial<SKUExtended>> = {
  'sku-001': { tierInfo: MOCK_TIER_INFO, defaultTier: 'T3', durationOptions: [30, 45, 60, 75, 90], defaultDuration: 60, minPerformers: 2, maxPerformers: 6 },
  'sku-002': { tierInfo: MOCK_TIER_INFO, defaultTier: 'T2', durationOptions: [60, 90, 120], defaultDuration: 90, minPerformers: 3, maxPerformers: 5 },
  'sku-003': { tierInfo: MOCK_TIER_INFO, defaultTier: 'T1', durationOptions: [30, 45, 60], defaultDuration: 45, minPerformers: 2, maxPerformers: 2 },
  'sku-004': { tierInfo: MOCK_TIER_INFO, defaultTier: 'T4', durationOptions: [60, 90, 120], defaultDuration: 90, minPerformers: 1, maxPerformers: 2 },
  'sku-005': { tierInfo: MOCK_TIER_INFO, defaultTier: 'T2', durationOptions: [45, 60, 75, 90], defaultDuration: 60, minPerformers: 3, maxPerformers: 6 },
};

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

// ── 评价 API ──
const MOCK_REVIEWS: Record<string, Review[]> = {
  'sku-001': [
    { id: 'rev-001', sku_id: 'sku-001', company_name: '某互联网公司', rating: 5, content: '演出效果超出预期！5位演员各具风格，互动环节特别出彩，年会现场笑声不断。已推荐给其他部门。', created_at: '2026-06-15' },
    { id: 'rev-002', sku_id: 'sku-001', company_name: '某金融企业', rating: 5, content: '相声拼盘形式很适合企业活动，演员专业度高。唯一建议是灯光可以更丰富一些。', created_at: '2026-06-10' },
    { id: 'rev-003', sku_id: 'sku-001', company_name: '某科技公司', rating: 4, content: '整体不错，互动环节设计用心。但第一位演员稍微有点冷场，后面越来越好。', created_at: '2026-05-28' },
    { id: 'rev-004', sku_id: 'sku-001', company_name: '某电商公司', rating: 5, content: '第三次合作了，每次都稳定发挥。主持人控场能力强，演员段子新鲜不生硬。', created_at: '2026-05-20' },
  ],
  'sku-002': [
    { id: 'rev-005', sku_id: 'sku-002', company_name: '某广告公司', rating: 4, content: '即兴喜剧非常适合团建！员工参与感强，大家都在笑。不过120分钟有点长，90分钟可能更好。', created_at: '2026-06-01' },
  ],
  'sku-004': [
    { id: 'rev-006', sku_id: 'sku-004', company_name: '某快消品牌', rating: 5, content: '个人专场质量很高，演员内容扎实，品牌冠名效果也很好。VIP客户反馈极佳。', created_at: '2026-05-15' },
  ],
};

function computeReviewStats(skuId: string): ReviewStats {
  const reviews = MOCK_REVIEWS[skuId] || [];
  if (reviews.length === 0) return { average: 0, total: 0, distribution: [] };
  const total = reviews.length;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
  const dist: Record<number, number> = {};
  reviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
  return {
    average: Math.round(avg * 10) / 10,
    total,
    distribution: [5, 4, 3, 2, 1].map(s => ({ score: s, count: dist[s] || 0 }))
  };
}

export async function getReviews(skuId: string): Promise<ApiResponse<Review[]>> {
  if (USE_MOCK) {
    return { ok: true, data: MOCK_REVIEWS[skuId] || [] };
  }
  return request<Review[]>(`/reviews?sku_id=${skuId}`);
}

export async function getReviewStats(skuId: string): Promise<ApiResponse<ReviewStats>> {
  if (USE_MOCK) {
    return { ok: true, data: computeReviewStats(skuId) };
  }
  return request<ReviewStats>(`/reviews/stats/${skuId}`);
}

export async function submitReview(data: {
  sku_id: string; demand_id: string; rating: number; content: string;
}): Promise<ApiResponse<Review>> {
  if (USE_MOCK) {
    const review: Review = {
      id: 'rev-' + Date.now(),
      sku_id: data.sku_id,
      demand_id: data.demand_id,
      company_name: '某科技公司',
      rating: data.rating,
      content: data.content,
      created_at: new Date().toISOString().slice(0, 10)
    };
    if (!MOCK_REVIEWS[data.sku_id]) MOCK_REVIEWS[data.sku_id] = [];
    MOCK_REVIEWS[data.sku_id].unshift(review);
    return { ok: true, data: review };
  }
  return request<Review>('/reviews', { method: 'POST', data });
}

// ── 热门搜索词 ──
const MOCK_HOT_KEYWORDS: HotKeyword[] = [
  { keyword: '脱口秀', count: 1256 },
  { keyword: '即兴喜剧', count: 832 },
  { keyword: '企业年会', count: 721 },
  { keyword: '团建', count: 568 },
  { keyword: '漫才', count: 432 },
  { keyword: '个人专场', count: 356 },
  { keyword: '品牌活动', count: 289 },
  { keyword: '商场暖场', count: 156 },
];

export async function getHotKeywords(): Promise<ApiResponse<HotKeyword[]>> {
  if (USE_MOCK) {
    return { ok: true, data: MOCK_HOT_KEYWORDS };
  }
  return request<HotKeyword[]>('/search/hot-keywords');
}

// ── 通知 API ──
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  related_id?: string;
  related_type?: string;
  created_at: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001', type: 'demand_status', title: '需求状态更新',
    content: '您的脱口秀拼盘之夜需求已收到方案，请前往查看。', is_read: false,
    related_id: 'demand-001', related_type: 'demand', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-002', type: 'plan_confirmed', title: '方案已确认',
    content: '即兴喜剧团建专场的方案已确认，演出时间2026年7月15日19:30。', is_read: false,
    related_id: 'demand-003', related_type: 'demand', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-003', type: 'assignment_new', title: '新排期待确认',
    content: '您有一个新的排期待确认：脱口秀拼盘之夜，7月20日20:00，扮演开场演员。', is_read: true,
    related_id: 'asgn-002', related_type: 'assignment', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-004', type: 'settlement', title: '结算完成',
    content: '6月份演出结算已发放，¥2200已到账，请查收。', is_read: true,
    related_id: 'stl-001', related_type: 'settlement', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-005', type: 'system', title: '系统通知',
    content: '喜剧工厂小程序已更新至v2.0版本，新增演员级别定价和智能匹配功能。', is_read: true,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export async function getNotificationList(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<NotificationItem[]>> {
  if (USE_MOCK) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const sorted = [...MOCK_NOTIFICATIONS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const start = (page - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);
    return { ok: true, data: paginated, total: sorted.length };
  }
  return request<NotificationItem[]>('/notifications', { method: 'GET', data: params as unknown as Record<string, unknown> });
}

export async function markNotificationRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
  if (USE_MOCK) {
    const item = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (item) item.is_read = true;
    return { ok: true, data: { success: true } };
  }
  return request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
}

// ── 价格计算 API ──
export async function calculatePrice(params: {
  skuId: string; tier: string; durationMinutes: number; performerCount: number;
}): Promise<ApiResponse<PriceCalcuationResult>> {
  if (USE_MOCK) {
    const tierObj = MOCK_TIER_INFO.find(t => t.tier === params.tier);
    if (!tierObj) return { ok: false, error: `不支持的演员级别: ${params.tier}` };

    const unitPrice = tierObj.unitPrice; // 分 / 15分钟
    const segments = Math.max(1, Math.round(params.durationMinutes / 15));
    const totalPrice = unitPrice * segments * params.performerCount;
    const companyPrice = Math.round(totalPrice * 0.85); // 活动公司渠道价 85折

    return {
      ok: true,
      data: {
        totalPrice,
        companyPrice,
        unitPrice,
        breakdown: {
          tier: params.tier,
          durationMinutes: params.durationMinutes,
          performerCount: params.performerCount,
          unitPrice
        }
      }
    };
  }
  return request<PriceCalcuationResult>('/pricing/calculate', { method: 'POST', data: params as unknown as Record<string, unknown> });
}

// ── 案例 API ──
export interface CaseDetail {
  id: string;
  sku_id: string | null;
  title: string;
  event_date: string;
  audience_count: number | null;
  tier: string | null;
  rating: number | null;
  cover_images: string[];
  description: string | null;
  content: string | null;
  client_name: string | null;
  created_at: string;
  updated_at: string;
}

const MOCK_CASES: CaseDetail[] = [
  {
    id: 'case-001', sku_id: 'sku-001', title: '某互联网大厂年会脱口秀之夜',
    event_date: '2026-01-15', audience_count: 300, tier: 'T3', rating: 96,
    cover_images: [],
    description: '为某知名互联网公司年会定制脱口秀拼盘演出，5位风格迥异的脱口秀演员轮番上阵，90分钟笑料不断。演出穿插员工互动环节，现场气氛热烈。客户反馈："这是三年来最受欢迎的年会节目。"',
    content: '<p>为某知名互联网公司年会定制脱口秀拼盘演出，5位风格迥异的脱口秀演员轮番上阵，90分钟笑料不断。演出穿插员工互动环节，现场气氛热烈。客户反馈："这是三年来最受欢迎的年会节目。"</p>',
    client_name: '某互联网大厂', created_at: '2026-06-01', updated_at: '2026-06-01'
  },
  {
    id: 'case-002', sku_id: 'sku-001', title: '金融科技公司品牌答谢活动',
    event_date: '2025-12-20', audience_count: 150, tier: 'T4', rating: 92,
    cover_images: [],
    description: '金融科技公司VIP客户答谢晚宴上的脱口秀演出，选用T4级别明星演员团队，搭配主持人现场互动。客户品牌元素巧妙融入段子，既保证娱乐效果又实现品牌传播。',
    content: '<p>金融科技公司VIP客户答谢晚宴上的脱口秀演出，选用T4级别明星演员团队，搭配主持人现场互动。客户品牌元素巧妙融入段子，既保证娱乐效果又实现品牌传播。</p>',
    client_name: '某金融科技公司', created_at: '2026-06-01', updated_at: '2026-06-01'
  },
  {
    id: 'case-003', sku_id: 'sku-002', title: '知名电商平台团建即兴喜剧工作坊',
    event_date: '2026-03-08', audience_count: 80, tier: 'T2', rating: 88,
    cover_images: [],
    description: '电商平台团队建设活动，选择即兴喜剧工作坊形式。3位即兴演员带领团队参与互动游戏和即兴表演，在欢笑中提升团队协作能力。120分钟的沉浸式体验获得全员好评。',
    content: '<p>电商平台团队建设活动，选择即兴喜剧工作坊形式。3位即兴演员带领团队参与互动游戏和即兴表演，在欢笑中提升团队协作能力。120分钟的沉浸式体验获得全员好评。</p>',
    client_name: '某电商平台', created_at: '2026-06-01', updated_at: '2026-06-01'
  },
  {
    id: 'case-004', sku_id: 'sku-003', title: '创业公司周年庆漫才双人秀',
    event_date: '2026-05-01', audience_count: 60, tier: 'T1', rating: 85,
    cover_images: [],
    description: '小型创业公司周年庆活动，选择漫才双人秀形式。快节奏的日式漫才风格与创业公司的活力氛围高度契合，60分钟的演出紧凑有趣，适合小规模高质量的企业活动。',
    content: '<p>小型创业公司周年庆活动，选择漫才双人秀形式。快节奏的日式漫才风格与创业公司的活力氛围高度契合，60分钟的演出紧凑有趣，适合小规模高质量的企业活动。</p>',
    client_name: '某创业科技公司', created_at: '2026-06-01', updated_at: '2026-06-01'
  },
  {
    id: 'case-005', sku_id: 'sku-004', title: '高端品牌个人专场冠名演出',
    event_date: '2026-04-15', audience_count: 200, tier: 'T5', rating: 98,
    cover_images: [],
    description: '某高端消费品牌冠名的脱口秀个人专场，选用T5咖位演员演出。品牌元素全方位融入舞台设计、互动环节和演员段子中，VIP客户反馈极佳，品牌曝光效果显著。',
    content: '<p>某高端消费品牌冠名的脱口秀个人专场，选用T5咖位演员演出。品牌元素全方位融入舞台设计、互动环节和演员段子中，VIP客户反馈极佳，品牌曝光效果显著。</p>',
    client_name: '某高端消费品牌', created_at: '2026-06-01', updated_at: '2026-06-01'
  },
];

export async function getCaseDetail(id: string): Promise<ApiResponse<CaseDetail>> {
  if (USE_MOCK) {
    const found = MOCK_CASES.find(c => c.id === id);
    if (found) return { ok: true, data: found };
    return { ok: false, error: '案例不存在' };
  }
  return request<CaseDetail>(`/cases/${id}`);
}

export async function getCasesBySKU(skuId: string): Promise<ApiResponse<CaseDetail[]>> {
  if (USE_MOCK) {
    const list = MOCK_CASES.filter(c => c.sku_id === skuId);
    return { ok: true, data: list, total: list.length };
  }
  return request<CaseDetail[]>(`/cases?sku_id=${skuId}`);
}

// ── Phase 2: AI 推荐方案 ──
// 后端返回格式：{ code:0, data:{ budget:{...}, recommended:{...}, upgrade:{...} } }
export interface AIAskConversationItem {
  role: 'user' | 'ai';
  content: string;
}

export type AIAskResponse =
  | { action: 'ask'; field: string; question: string; options: string[] }
  | { action: 'recommend'; plans: AIRecommendResult };

function tierLabel(tier: string): string {
  return MOCK_TIER_INFO.find(x => x.tier === tier)?.label || tier;
}

function toCents(price: unknown): number {
  const n = Number(price || 0);
  if (!Number.isFinite(n)) return 0;
  return n < 100000 ? Math.round(n * 100) : Math.round(n);
}

function normalizeBackendPlan(level: 'budget' | 'recommended' | 'upgrade', raw: any): AIPlanOption {
  const sku = level === 'budget' ? MOCK_SKUS[2] : level === 'upgrade' ? MOCK_SKUS[3] : MOCK_SKUS[0];
  const labels = { budget: '省钱方案', recommended: '主推方案', upgrade: '升级方案' };
  const tier = raw?.tier || (level === 'budget' ? 'T4' : level === 'upgrade' ? 'T2' : 'T3');
  return {
    level,
    level_label: labels[level],
    sku_id: raw?.sku_id || sku.id,
    sku_title: raw?.sku_title || sku.title,
    tier,
    tier_label: raw?.tier_label || tierLabel(tier),
    duration: Number(raw?.duration || 60),
    price: toCents(raw?.price),
    reason: raw?.reason || labels[level],
  };
}

function normalizeRecommendResult(raw: any): AIRecommendResult {
  return {
    budget: normalizeBackendPlan('budget', raw?.budget),
    recommended: normalizeBackendPlan('recommended', raw?.recommended),
    upgrade: normalizeBackendPlan('upgrade', raw?.upgrade),
  };
}

export async function askAI(data: { conversation: AIAskConversationItem[] }): Promise<ApiResponse<AIAskResponse>> {
  try {
    const raw: any = await request('/ai/ask', {
      method: 'POST',
      data: data as unknown as Record<string, unknown>,
    });
    const payload = raw?.action ? raw : raw?.data;
    if (payload?.action === 'ask') {
      return {
        ok: true,
        data: {
          action: 'ask',
          field: String(payload.field || ''),
          question: String(payload.question || '请补充更多信息'),
          options: Array.isArray(payload.options) ? payload.options.map(String) : [],
        },
      };
    }
    if (payload?.action === 'recommend' && payload.plans) {
      return {
        ok: true,
        data: { action: 'recommend', plans: normalizeRecommendResult(payload.plans) },
      };
    }
    return { ok: false, error: raw?.message || raw?.error || 'AI 服务暂不可用，请切换到「选方案提交」Tab' };
  } catch {
    return { ok: false, error: 'AI 服务暂不可用，请切换到「选方案提交」Tab' };
  }
}

export async function recommendPlan(data: {
  performance_type?: string;
  activity_type?: string;
  audience_count?: number;
  budget?: number;
}): Promise<ApiResponse<AIRecommendResult>> {
  if (USE_MOCK) {
    // 开发阶段：返回三档演示方案，保证本地可走通 AI 推荐 → 配置 → 提交 闭环
    return { ok: true, data: buildMockAIRecommend(buildRecommendPrompt(data)) };
  }
  try {
    const raw: any = await request('/ai/recommend-plan', { method: 'POST', data });
    if (raw && raw.code === 0 && raw.data) {
      return { ok: true, data: raw.data as AIRecommendResult };
    }
    return { ok: false, error: raw?.message || raw?.error || 'AI 服务暂不可用，请切换到「选方案提交」Tab' };
  } catch (e) {
    // 网络异常或后端不可达：降级提示
    return { ok: false, error: 'AI 服务暂不可用，请切换到「选方案提交」Tab' };
  }
}

function buildRecommendPrompt(data: {
  performance_type?: string;
  activity_type?: string;
  audience_count?: number;
  budget?: number;
}): string {
  return [
    data.activity_type,
    data.performance_type,
    data.audience_count ? `人数${data.audience_count}` : '',
    data.budget ? `预算${data.budget}` : '',
  ].filter(Boolean).join('，');
}

// 根据 prompt 生成三档 mock 推荐方案（省钱 / 主推 / 升级）
function mockAIPlanPrice(tier: string, duration: number, count: number): number {
  const t = MOCK_TIER_INFO.find(x => x.tier === tier);
  if (!t) return 0;
  const segments = Math.max(1, Math.round(duration / 15));
  return t.unitPrice * segments * count;
}

function buildMockAIRecommend(prompt: string): AIRecommendResult {
  const p = prompt || '';
  // 根据关键词识别场景，决定主推 SKU
  let main = MOCK_SKUS[0]; // 默认：脱口秀拼盘
  if (/漫才/.test(p)) main = MOCK_SKUS[2];
  else if (/即兴/.test(p)) main = MOCK_SKUS[1];
  else if (/个人专场|专场|明星|咖位/.test(p)) main = MOCK_SKUS[3];
  else if (/新喜剧|实验|sketch/i.test(p)) main = MOCK_SKUS[4];

  const tierLabel = (t: string) => MOCK_TIER_INFO.find(x => x.tier === t)?.label || t;

  const budget: AIPlanOption = {
    level: 'budget', level_label: '省钱方案',
    sku_id: MOCK_SKUS[2].id, sku_title: MOCK_SKUS[2].title,
    tier: 'T1', tier_label: tierLabel('T1'), duration: 45,
    price: mockAIPlanPrice('T1', 45, 2),
    reason: '预算优先：双人漫才快节奏爆笑，成本低、效果好，适合暖场或小型活动。'
  };

  const recommended: AIPlanOption = {
    level: 'recommended', level_label: '主推方案',
    sku_id: main.id, sku_title: main.title,
    tier: 'T3', tier_label: tierLabel('T3'), duration: 60,
    price: mockAIPlanPrice('T3', 60, 2),
    reason: `综合你的需求「${p.slice(0, 20)}」推荐：资深演员阵容，性价比最高的标准配置，适合大多数企业活动。`
  };

  const upgrade: AIPlanOption = {
    level: 'upgrade', level_label: '升级方案',
    sku_id: MOCK_SKUS[3].id, sku_title: MOCK_SKUS[3].title,
    tier: 'T4', tier_label: tierLabel('T4'), duration: 90,
    price: mockAIPlanPrice('T4', 90, 1),
    reason: '追求极致效果：明星演员个人专场 + 90 分钟精品内容 + 品牌定制，适合高端客户答谢与品牌冠名。'
  };

  return { budget, recommended, upgrade };
}
