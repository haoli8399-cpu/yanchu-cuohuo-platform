// ============ 通用 ============

/** 用户角色 */
export type UserRole = 'client' | 'agent' | 'performer' | 'admin';

/** 业务线 */
export type BusinessLine =
  | 'venue_booking'
  | 'outdoor_show'
  | 'show_sponsor'
  | 'custom_content'
  | 'custom_showcase';

/** 需求状态 */
export type DemandStatus =
  | 'pending_ai'
  | 'ai_generated'
  | 'pending_operator'
  | 'operator_adjusted'
  | 'pending_client_confirm'
  | 'confirmed'
  | 'pending_deposit'
  | 'deposit_received'
  | 'pending_performer'
  | 'performer_confirmed'
  | 'performing'
  | 'finished'
  | 'pending_final_payment'
  | 'final_payment_received'
  | 'settled'
  | 'cancelled'
  | 'refunding';

// ============ API 通用 ============

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============ Auth ============

export interface LoginRequest {
  phone: string;
  code: string;
  role: 'agent';
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
  is_new: boolean;
}

export interface UserInfo {
  id: string;
  role: string;
  name: string;
  avatar_url?: string;
}

export interface SendCodeRequest {
  phone: string;
}

export interface SendCodeResponse {
  expire_seconds: number;
}

// ============ SKU ============

export interface SkuItem {
  id: string;
  name: string;
  business_line: BusinessLine;
  description: string;
  performer_profile: string;
  style_tags: string[];
  applicable_scenes: string[];
  base_price: number;
  agent_price: number;
  duration_minutes: number;
  performers_count: number;
  cover_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface SkuDetail extends SkuItem {
  media_urls: string[];
  updated_at: string;
}

export interface SkuListParams extends PaginationParams {
  business_line?: BusinessLine;
  style?: string;
  min_price?: number;
  max_price?: number;
  status?: 'active' | 'inactive';
  keyword?: string;
}

// ============ 需求 ============

export interface SubmitDemandRequest {
  source: 'sku' | 'requirement' | 'phone';
  sku_id?: string;
  title?: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  city: string;
  address: string;
  audience_count?: number;
  budget?: number;
  duration_minutes?: number;
  comedy_style?: string;
  special_requirements?: string;
  venue_name?: string;
  venue_type?: string;
}

export interface SubmitDemandResponse {
  id: string;
  status: DemandStatus;
}

export interface DemandListItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  city: string;
  budget: number;
  status: DemandStatus;
  urgency: 'normal' | 'urgent' | 'emergency';
  created_at: string;
  client: {
    id: string;
    name: string;
  };
}

export interface DemandListParams extends PaginationParams {
  status?: DemandStatus;
  role?: 'my' | 'all';
}

// ============ 业务线映射 ============

export const BUSINESS_LINE_LABELS: Record<BusinessLine, string> = {
  venue_booking: '商演包场',
  outdoor_show: '户外演出',
  show_sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_showcase: '定制展示',
};

export const DEMAND_STATUS_LABELS: Record<DemandStatus, string> = {
  pending_ai: 'AI生成中',
  ai_generated: 'AI方案已生成',
  pending_operator: '待运营审核',
  operator_adjusted: '运营已调整',
  pending_client_confirm: '待客户确认',
  confirmed: '已确认',
  pending_deposit: '待付定金',
  deposit_received: '定金已收',
  pending_performer: '待演员确认',
  performer_confirmed: '演员已确认',
  performing: '演出中',
  finished: '已完成',
  pending_final_payment: '待付尾款',
  final_payment_received: '尾款已收',
  settled: '已结算',
  cancelled: '已取消',
  refunding: '退款中',
};

export const DEMAND_STATUS_COLORS: Record<DemandStatus, string> = {
  pending_ai: 'processing',
  ai_generated: 'blue',
  pending_operator: 'processing',
  operator_adjusted: 'blue',
  pending_client_confirm: 'warning',
  confirmed: 'blue',
  pending_deposit: 'warning',
  deposit_received: 'blue',
  pending_performer: 'processing',
  performer_confirmed: 'blue',
  performing: 'processing',
  finished: 'success',
  pending_final_payment: 'warning',
  final_payment_received: 'blue',
  settled: 'success',
  cancelled: 'default',
  refunding: 'error',
};

// ============ 需求详情 ============

/** 方案计划 */
export interface SchemePlan {
  id: string;
  name: string;
  sku_name: string;
  performer_count: number;
  duration_minutes: number;
  total_price: number;
  agent_price: number;
  performer_profile: string;
  style_tags: string[];
  highlights: string[];
  cover_url?: string;
}

/** 需求详情 */
export interface DemandDetail {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  city: string;
  address: string;
  audience_count?: number;
  budget?: number;
  duration_minutes?: number;
  comedy_style?: string;
  special_requirements?: string;
  venue_name?: string;
  venue_type?: string;
  status: DemandStatus;
  urgency: 'normal' | 'urgent' | 'emergency';
  created_at: string;
  updated_at: string;
  /** W-07: 多方案对比 */
  plans: SchemePlan[];
  /** W-09: 订单时间线步骤 */
  timeline: TimelineStep[];
  client?: {
    id: string;
    name: string;
  };
}

/** 订单时间线步骤 */
export interface TimelineStep {
  status: DemandStatus;
  label: string;
  time?: string;
  description?: string;
  is_current: boolean;
  is_completed: boolean;
}

/** 消费统计 */
export interface ConsumptionStats {
  total_orders: number;
  total_spent: number;
  completed_orders: number;
  pending_orders: number;
  avg_order_amount: number;
}

/** 邀请链接 */
export interface InviteLink {
  url: string;
  code: string;
  expire_at: string;
}

export const EVENT_TYPE_OPTIONS = [
  { label: '企业年会', value: '企业年会' },
  { label: '客户答谢', value: '客户答谢' },
  { label: '开业庆典', value: '开业庆典' },
  { label: '婚礼庆典', value: '婚礼庆典' },
  { label: '品牌发布', value: '品牌发布' },
  { label: '商业路演', value: '商业路演' },
  { label: '节日活动', value: '节日活动' },
  { label: '其他', value: '其他' },
];
