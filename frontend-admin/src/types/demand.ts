/**
 * 需求管理 类型定义
 * 与 API_CONTRACT.md 2.3 节严格对齐
 *
 * P-04: 需求管理
 * P-27: 超时自动标记
 * P-28: 客户历史卡片
 */

/** 需求状态（与 API_CONTRACT.md DemandStatus 对齐） */
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

/** 需求来源 */
export type DemandSource = 'sku' | 'requirement' | 'phone';

/** 紧急程度 */
export type DemandUrgency = 'normal' | 'urgent' | 'emergency';

/** 签约模式 */
export type ContractMode = 'skip' | 'upload' | 'system';

/** 需求状态中文映射 */
export const DemandStatusLabel: Record<DemandStatus, string> = {
  pending_ai: '待AI生成',
  ai_generated: 'AI已生成',
  pending_operator: '待运营审核',
  operator_adjusted: '运营已调整',
  pending_client_confirm: '待客户确认',
  confirmed: '已确认',
  pending_deposit: '待付定金',
  deposit_received: '定金已收',
  pending_performer: '待演员确认',
  performer_confirmed: '演员已确认',
  performing: '演出中',
  finished: '已结束',
  pending_final_payment: '待付尾款',
  final_payment_received: '尾款已收',
  settled: '已结算',
  cancelled: '已取消',
  refunding: '退款中',
};

/** 需求状态颜色（用于 Tag） */
export const DemandStatusColor: Record<DemandStatus, string> = {
  pending_ai: 'processing',
  ai_generated: 'blue',
  pending_operator: 'orange',
  operator_adjusted: 'geekblue',
  pending_client_confirm: 'purple',
  confirmed: 'cyan',
  pending_deposit: 'gold',
  deposit_received: 'lime',
  pending_performer: 'magenta',
  performer_confirmed: 'green',
  performing: 'volcano',
  finished: 'success',
  pending_final_payment: 'warning',
  final_payment_received: 'success',
  settled: 'default',
  cancelled: 'error',
  refunding: 'red',
};

/** 紧急程度中文映射 */
export const UrgencyLabel: Record<DemandUrgency, string> = {
  normal: '正常',
  urgent: '紧急',
  emergency: '特急',
};

/** 紧急程度颜色 */
export const UrgencyColor: Record<DemandUrgency, string> = {
  normal: 'default',
  urgent: 'orange',
  emergency: 'red',
};

/** 来源中文映射 */
export const SourceLabel: Record<DemandSource, string> = {
  sku: 'SKU选购',
  requirement: '需求提报',
  phone: '电话代客',
};

/** 签约模式中文映射 */
export const ContractModeLabel: Record<ContractMode, string> = {
  skip: '跳过合同',
  upload: '上传PDF',
  system: '电子签',
};

/** 状态历史记录 */
export interface StatusHistory {
  status: DemandStatus;
  at: string;
  operator_id?: string;
}

/** 阵容信息 */
export interface Lineup {
  performer: {
    id: string;
    name: string;
    tier: string;
  };
  role: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

/** 付款记录 */
export interface Payment {
  type: 'deposit' | 'final';
  amount: number;
  method: string;
  received_at: string;
}

/** 客户信息 */
export interface ClientInfo {
  id: string;
  name: string;
}

/** 需求列表项（GET /v1/demands 响应 items） */
export interface DemandListItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  city: string;
  budget: number;
  status: DemandStatus;
  urgency: DemandUrgency;
  created_at: string;
  client: ClientInfo;
}

/** 需求详情（GET /v1/demands/:id 响应） */
export interface DemandDetail {
  id: string;
  client_id: string;
  source: DemandSource;
  sku_id?: string;
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
  ai_plan_content?: string;
  adjusted_plan_content?: string;
  final_plan_content?: string;
  final_price?: number;
  urgency: DemandUrgency;
  contract_mode?: ContractMode;
  status: DemandStatus;
  status_history: StatusHistory[];
  lineups?: Lineup[];
  payments?: Payment[];
  client?: ClientInfo;
  created_at: string;
  updated_at: string;
}

/** 需求列表查询参数 */
export interface DemandListParams {
  page: number;
  pageSize: number;
  status?: DemandStatus;
  role?: 'my' | 'all';
}

/** 运营调整方案请求体 */
export interface AdjustPlanRequest {
  adjusted_plan_content: string;
  final_price?: number;
  contract_mode?: ContractMode;
}

/** 方案调整模板 */
export interface AdjustmentTemplate {
  id: string;
  name: string;
  description: string;
  /** 模板内容（可包含变量占位符如 {{演员数}}、{{价格}}） */
  content: string;
  category: 'price' | 'lineup' | 'contract' | 'general';
  usage_count: number;
  created_at: string;
}
