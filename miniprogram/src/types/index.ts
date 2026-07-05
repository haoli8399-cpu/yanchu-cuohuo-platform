// ============================================================================
// 演事 uni-app — 类型定义
// ============================================================================

// ── 演员入驻申请 ──
export interface ActorOnboarding {
  stage_name: string;
  performance_types: string[];
  bio: string;
  contact: string;
}

// ── 用户/认证 ──
export interface UserInfo {
  id: string;
  name: string;
  phone: string | null;
  role: 'agent' | 'performer' | 'admin';
  actor_id?: string | null;
  avatar_url?: string | null;
  company_id?: string | null;
  company_name?: string | null;
}

export interface LoginResult {
  ok: boolean;
  data?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: UserInfo;
  };
  error?: string;
}

// ── SKU/演出产品 ──
export interface SKUProduct {
  id: string;
  category: string;           // '脱口秀' | '即兴喜剧' | '漫才' | '新喜剧' | '话剧' | '音乐剧' | '沉浸式' | '其他'
  category_label?: string;
  title: string;
  description: string;
  cover_url: string;
  min_price: number;
  max_price: number;
  duration_minutes: number;
  cast_size_min: number;
  cast_size_max: number;
  tags: string[];
  city: string | null;
  venue_options: string[];
  status: string;             // '上架' | '下架'
  rating?: number;            // 综合评分
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SKUDetail extends SKUProduct {
  price_tiers: PriceTier[];
  review_summary: ReviewSummary;
  gallery_urls: string[];
  faq: FAQ[];
}

export interface PriceTier {
  tier_name: string;          // '基础版' | '标准版' | '旗舰版'
  price: number;
  cast_count: number;
  duration: number;
  includes: string[];
  recommends: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ReviewSummary {
  average_score: number;
  total_count: number;
  distribution: { score: number; count: number }[];
}

// ── AI方案项（旧：招投标多报价，保留兼容） ──
export interface PlanItem {
  name: string;
  price: number;
  performers?: string[];
  description?: string;
}

// ── 统一 AI 方案（新模式：运营/AI 生成单一方案） ──
export interface UnifiedPlan {
  content: string;
  performer_names: string[];
  price: number;
}

// ── 通用状态标签 ──
export type RequestStatus = 'pending' | 'quoted' | 'confirmed' | 'signed' | 'cancelled'

export type AssignmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'

export const StatusLabels: Record<string, string> = {
  pending: '待确认',
  pending_quote: '待报价',
  quoted: '已报价',
  confirmed: '已确认',
  signed: '已签约',
  cancelled: '已取消',
  rejected: '已拒绝',
  completed: '已完成',
  transferred: '已打款',
  settled: '已结算',
}

// ── 需求 ──
export interface DemandRequest {
  id: string;
  sku_id: string;
  sku_title: string;
  sku_cover_url: string;
  company_id: string;
  company_name: string;
  performance_date: string;
  venue: string;
  price_tier: string;
  estimated_price: number;
  special_requirements: string;
  status: string;             // '待报价' | '已报价' | '待确认' | '已确认' | '已签约' | '已取消'
  status_label?: string;
  quote_amount?: number;
  quote_note?: string;
  plans?: PlanItem[];           // 旧：多报价（保留兼容）
  plan?: UnifiedPlan;          // 新：统一 AI 方案
  created_at: string;
  updated_at: string;
}

// ── 排期/任务 ──
export interface Assignment {
  id: string;
  demand_id: string;
  sku_title: string;
  company_name: string;
  show_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  venue_name?: string;
  role_name: string;          // 演员在演出中的角色
  fee: number;
  status: string;             // '待确认' | '已确认' | '已拒绝' | '已取消'
  status_label?: string;
  confirm_deadline?: string;
  reject_reason?: string;
  show_name?: string;
  cast_info?: string;
  cast_list?: { id: string; name: string; role_name: string }[];
  feedback?: { content: string; created_at: string };
  created_at: string;
}

// ── 签到 ──
export interface CheckinRecord {
  id: string;
  assignment_id: string;
  show_date: string;
  venue: string;
  checkin_time: string | null;
  checkin_location: string | null;
  checkin_photo_url: string | null;
  checkout_time: string | null;
  status: '未签到' | '已签到' | '已签退';
  status_label?: string;
  latitude?: number;
  longitude?: number;
}

// ── 结算 ──
export interface SettlementRecord {
  id: string;
  assignment_id: string;
  sku_title: string;
  show_date: string;
  fee: number;
  adjustment: number;
  final_amount: number;
  settlement_month: string;   // YYYY-MM
  status: string;             // '待结算' | '已结算' | '已发放'
  status_label?: string;
  actor_confirm_status?: string;
  settled_at?: string;
  created_at: string;
}

// ── 信誉分 ──
export interface CreditScore {
  actor_id: string;
  total_score: number;        // 0-1000
  level: string;              // '优秀' | '良好' | '一般' | '较差'
  level_label?: string;
  punctuality_score: number;
  performance_score: number;
  communication_score: number;
  professionalism_score: number;
  history: CreditHistory[];
  updated_at: string;
}

export interface CreditHistory {
  id: string;
  date: string;
  event: string;
  score_change: number;
  reason: string;
}

// ── 分类 ──
export interface Category {
  id: string;
  label: string;
  sort_order: number;
}

// ── API 通用响应 ──
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  total?: number;
  summary?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  page_size: number;
}

// ========== SKU 详情页扩展类型 ==========

/** 演员级别说明 */
export interface TierInfo {
  tier: string;        // "T3"
  label: string;       // "资深演员"
  description: string; // "3年以上舞台经验"
  suitableFor: string; // "适合中型企业活动/年会"
  unitPrice: number;   // 15分钟单价（分）
}

/** 场地要求 */
export interface VenueRequirement {
  type: string;         // "室内"
  minArea: string;      // "50㎡"
  equipment: string[];  // ["无线麦克风×2", "基础舞台灯光"]
  seatingOptions: string[]; // ["剧场式", "圆桌式", "开放式"]
}

/** 同类案例 */
export interface CaseStudy {
  id: string;
  title: string;
  coverImage?: string;
  eventDate: string;
  audienceCount: number;
  tier: string;
  rating: number;       // 好评率 0-100
  description?: string;
}

/** SKU 扩展信息 */
export interface SKUExtended extends SKUProduct {
  tierInfo: TierInfo[];          // 可选级别列表+定价
  defaultTier: string;           // 默认推荐级别
  durationOptions: number[];     // 可选时长 [30,45,60,75,90]
  defaultDuration: number;       // 默认推荐时长
  minPerformers: number;         // 最少人数
  maxPerformers: number;         // 最多人数
  venueRequirement: VenueRequirement;
  caseStudies: CaseStudy[];
  programIntro: string;          // 节目介绍（富文本）
  coverImages: string[];         // 多张封面图
}

/** 价格计算请求 */
export interface PriceCalcuationRequest {
  skuId: string;
  tier: string;
  durationMinutes: number;
  performerCount: number;
}

// ── 评价 ──
export interface Review {
  id: string;
  sku_id: string;
  demand_id?: string;
  company_name?: string;
  rating: number;          // 1-5
  content: string;
  created_at: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { score: number; count: number }[];
}

// ── 热门搜索词 ──
export interface HotKeyword {
  keyword: string;
  count: number;
}

/** 价格计算结果 */
export interface PriceCalcuationResult {
  totalPrice: number;           // 甲方标准价（分）
  companyPrice: number;         // 活动公司渠道价（分）
  unitPrice: number;            // 所选级别15分钟单价（分）
  breakdown: {
    tier: string;
    durationMinutes: number;
    performerCount: number;
    unitPrice: number;
  };
}
