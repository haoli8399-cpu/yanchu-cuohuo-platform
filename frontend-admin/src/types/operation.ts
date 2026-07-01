/**
 * 运营工作台 & 总看板 类型定义
 *
 * P-01: 运营个人工作台 - 待处理列表
 * P-02: 运营总看板 - 供需健康指标
 */

/** 待处理任务类型 */
export type TaskUrgency = 'urgent' | 'normal' | 'low';

/** P-01 待处理任务 */
export interface PendingTask {
  /** 任务ID */
  id: string;
  /** 活动公司名称 */
  companyName: string;
  /** 预算（元） */
  budget: number;
  /** 需求类型 */
  requirementType: string;
  /** 紧急程度 */
  urgency: TaskUrgency;
  /** 已等待时长（分钟） */
  waitingMinutes: number;
  /** 提交时间 */
  submittedAt: string;
  /** 状态 */
  status: 'pending' | 'processing';
}

/** P-02 供需健康指标 */
export interface SupplyDemandMetrics {
  /** 演员月接单率（百分比） */
  actorMonthlyAcceptRate: number;
  /** 演员月接单率较上月变化（百分点） */
  actorMonthlyAcceptChange: number;
  /** 活动公司月活率（百分比） */
  companyMonthlyActiveRate: number;
  /** 活动公司月活率较上月变化（百分点） */
  companyMonthlyActiveChange: number;
  /** 在线SKU数量 */
  onlineSKUCount: number;
  /** 合作演员数量 */
  activeActorCount: number;
  /** 本月订单数 */
  monthlyOrderCount: number;
  /** 本月已完成订单数 */
  monthlyCompletedCount: number;
  /** 数据更新时间 */
  updatedAt: string;
}

/** 运营工作台待处理列表查询参数 */
export interface PendingTaskListParams {
  page: number;
  pageSize: number;
  urgency?: TaskUrgency;
}
