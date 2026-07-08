// 经纪公司增强 — 前端数据服务层
// 当前为 mock 数据源；真实后端 API 就绪后，将 USE_MOCK 置为 false 即可走真实接口。
// 真实端点（对齐 ARCHITECTURE #/v1/supplier）：
//   GET  /v1/supplier/performers
//   POST /v1/supplier/performers
//   GET  /v1/supplier/stats/calendar
//   GET  /v1/supplier/stats/checkins-today
//   GET  /v1/supplier/stats/settlements
//   GET  /v1/supplier/stats/credit
//   POST /v1/supplier/dispatch/candidates
//   POST /v1/supplier/dispatch/confirm

import { request } from './apiClient';

const USE_MOCK = true;

export type PerformerTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
export type ScheduleStatus = 'available' | 'busy';
export type CheckinStatus = 'signed' | 'unsigned' | 'late';

export interface Performer {
  id: string;
  name: string;
  tier: PerformerTier;
  scheduleStatus: ScheduleStatus;
  creditScore: number;
  deals3m: number; // 近 3 月成交数
  contact: string;
  intro: string;
}

export interface CalendarEvent {
  id: string;
  performerId: string;
  name: string;
  date: string; // YYYY-MM-DD
  color: string;
}

export interface CheckinRecord {
  performerId: string;
  name: string;
  status: CheckinStatus;
}

export interface SettlementSummary {
  pendingTotal: number;
  settledTotal: number;
  perPerformer: { performerId: string; name: string; pending: number; settled: number }[];
}

export interface CreditSummary {
  avg: number;
  min: number;
  minName: string;
  trend: { month: string; avg: number }[];
}

export interface DispatchCandidate {
  performerId: string;
  name: string;
  tier: PerformerTier;
  creditScore: number;
  matchScore: number; // 0-100 匹配度
  reason: string;
}

export interface PerformerDetail {
  schedule: { date: string; plan: string }[];
  checkins: { date: string; status: CheckinStatus }[];
  settlements: { month: string; amount: number; status: 'pending' | 'settled' }[];
  creditLogs: { date: string; score: number; change: number; reason: string }[];
}

/* ============ Mock 数据 ============ */
const PERFORMER_COLORS: Record<string, string> = {
  p1: '#7c3aed',
  p2: '#16a34a',
  p3: '#3b82f6',
  p4: '#f59e0b',
  p5: '#ec4899',
  p6: '#06b6d4',
  p7: '#8b5cf6',
};

export const MOCK_PERFORMERS: Performer[] = [
  { id: 'p1', name: '王建国', tier: 'T2', scheduleStatus: 'available', creditScore: 94, deals3m: 18, contact: '138****0001', intro: '资深脱口秀演员，擅长企业年会暖场' },
  { id: 'p2', name: '李雪琴', tier: 'T1', scheduleStatus: 'busy', creditScore: 97, deals3m: 24, contact: '138****0002', intro: '头部脱口秀，大型演出经验丰富' },
  { id: 'p3', name: '张博洋', tier: 'T3', scheduleStatus: 'available', creditScore: 88, deals3m: 12, contact: '138****0003', intro: '即兴喜剧主力，团建场适配' },
  { id: 'p4', name: '杨笠', tier: 'T2', scheduleStatus: 'available', creditScore: 91, deals3m: 15, contact: '138****0004', intro: '观点犀利，品牌活动首选' },
  { id: 'p5', name: '呼兰', tier: 'T1', scheduleStatus: 'busy', creditScore: 95, deals3m: 20, contact: '138****0005', intro: '逻辑流脱口秀，高端场次首选' },
  { id: 'p6', name: '庞博', tier: 'T3', scheduleStatus: 'available', creditScore: 89, deals3m: 14, contact: '138****0006', intro: '亲和力强，亲子/商业活动适配' },
  { id: 'p7', name: '鸟鸟', tier: 'T4', scheduleStatus: 'busy', creditScore: 86, deals3m: 9, contact: '138****0007', intro: '文艺清新风格，文艺品牌适配' },
];

function buildCalendar(): CalendarEvent[] {
  const base = '2026-07-';
  const map: Record<string, string[]> = {
    p1: ['03', '09', '15', '22'],
    p2: ['02', '08', '18', '25'],
    p3: ['05', '11', '19'],
    p4: ['04', '13', '21', '28'],
    p5: ['06', '12', '20'],
    p6: ['07', '14', '24', '30'],
    p7: ['10', '16', '26'],
  };
  const events: CalendarEvent[] = [];
  Object.entries(map).forEach(([pid, days]) => {
    const p = MOCK_PERFORMERS.find((x) => x.id === pid)!;
    days.forEach((d, i) =>
      events.push({
        id: `${pid}-${d}`,
        performerId: pid,
        name: p.name,
        date: `${base}${d}`,
        color: PERFORMER_COLORS[pid],
      })
    );
  });
  return events;
}
const MOCK_CALENDAR = buildCalendar();

const MOCK_CHECKINS_TODAY: CheckinRecord[] = [
  { performerId: 'p1', name: '王建国', status: 'signed' },
  { performerId: 'p2', name: '李雪琴', status: 'unsigned' },
  { performerId: 'p4', name: '杨笠', status: 'late' },
  { performerId: 'p6', name: '庞博', status: 'signed' },
];

const MOCK_SETTLEMENTS: SettlementSummary = {
  pendingTotal: 38600,
  settledTotal: 124500,
  perPerformer: MOCK_PERFORMERS.map((p, i) => ({
    performerId: p.id,
    name: p.name,
    pending: (i % 2 === 0 ? 5400 : 3200) + i * 200,
    settled: (i % 2 === 0 ? 18900 : 15600) + i * 500,
  })),
};

const MOCK_CREDIT: CreditSummary = {
  avg: 91,
  min: 86,
  minName: '鸟鸟',
  trend: [
    { month: '3月', avg: 87 },
    { month: '4月', avg: 88 },
    { month: '5月', avg: 90 },
    { month: '6月', avg: 91 },
    { month: '7月', avg: 91 },
  ],
};

function buildDetail(id: string): PerformerDetail {
  const seed = id.charCodeAt(1);
  const plans = ['脱口秀标准版 60min', '即兴喜剧团建 60min', '年会定制套餐', '漫才双人秀 60min'];
  return {
    schedule: [3, 9, 15, 22].map((d) => ({ date: `2026-07-${d}`, plan: plans[(seed + d) % plans.length] })),
    checkins: [1, 8, 15, 22].map((d, i) => ({
      date: `2026-07-${d}`,
      status: (['signed', 'unsigned', 'late', 'signed'] as CheckinStatus[])[(seed + i) % 4],
    })),
    settlements: ['2026-04', '2026-05', '2026-06'].map((m, i) => ({
      month: m,
      amount: 4000 + (seed + i) * 300,
      status: i === 2 ? 'pending' : 'settled',
    })),
    creditLogs: [10, 20, 30].map((d, i) => ({
      date: `2026-06-${d}`,
      score: 85 + i * 2 + (seed % 3),
      change: i % 2 === 0 ? 1 : -1,
      reason: i % 2 === 0 ? '准时签到 +1' : '迟到 -1',
    })),
  };
}

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/* ============ 接口函数 ============ */
export async function fetchPerformers(): Promise<Performer[]> {
  if (USE_MOCK) return delay(MOCK_PERFORMERS);
  return request<Performer[]>('/v1/supplier/performers');
}

export async function createPerformer(payload: Omit<Performer, 'id' | 'deals3m' | 'creditScore' | 'scheduleStatus'>): Promise<Performer> {
  if (USE_MOCK) {
    const np: Performer = {
      ...payload,
      id: `p${Date.now()}`,
      deals3m: 0,
      creditScore: 90,
      scheduleStatus: 'available',
    };
    MOCK_PERFORMERS.unshift(np);
    return delay(np);
  }
  return request<Performer>('/v1/supplier/performers', { method: 'POST', body: JSON.stringify(payload) });
}

export async function deletePerformer(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_PERFORMERS.findIndex((p) => p.id === id);
    if (idx >= 0) MOCK_PERFORMERS.splice(idx, 1);
    return delay(undefined);
  }
  return request<void>(`/v1/supplier/performers/${id}`, { method: 'DELETE' });
}

export async function fetchCalendar(): Promise<CalendarEvent[]> {
  if (USE_MOCK) return delay(MOCK_CALENDAR);
  return request<CalendarEvent[]>('/v1/supplier/stats/calendar');
}

export async function fetchCheckinsToday(): Promise<CheckinRecord[]> {
  if (USE_MOCK) return delay(MOCK_CHECKINS_TODAY);
  return request<CheckinRecord[]>('/v1/supplier/stats/checkins-today');
}

export async function fetchSettlements(): Promise<SettlementSummary> {
  if (USE_MOCK) return delay(MOCK_SETTLEMENTS);
  return request<SettlementSummary>('/v1/supplier/stats/settlements');
}

export async function fetchCredit(): Promise<CreditSummary> {
  if (USE_MOCK) return delay(MOCK_CREDIT);
  return request<CreditSummary>('/v1/supplier/stats/credit');
}

export async function fetchPerformerDetail(id: string): Promise<PerformerDetail> {
  if (USE_MOCK) return delay(buildDetail(id));
  return request<PerformerDetail>(`/v1/supplier/performers/${id}/detail`);
}

export async function fetchDispatchCandidates(orderId: string): Promise<DispatchCandidate[]> {
  // 真实端点接收 orderId，自动过滤档期冲突艺人并按匹配度降序返回
  if (USE_MOCK) {
    const candidates = MOCK_PERFORMERS
      .filter((p) => p.scheduleStatus === 'available')
      .map((p) => {
        const tierWeight = (7 - Number(p.tier.slice(1))) * 6; // T1 最高
        const creditWeight = p.creditScore - 80;
        const matchScore = Math.min(98, Math.max(60, tierWeight + creditWeight + 30));
        return {
          performerId: p.id,
          name: p.name,
          tier: p.tier,
          creditScore: p.creditScore,
          matchScore,
          reason: `级别 ${p.tier} · 信誉 ${p.creditScore} · 档期空闲`,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    return delay(candidates);
  }
  return request<DispatchCandidate[]>('/v1/supplier/dispatch/candidates', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function confirmDispatch(orderId: string, performerIds: string[]): Promise<{ ok: true }> {
  if (USE_MOCK) return delay({ ok: true as const });
  return request<{ ok: true }>('/v1/supplier/dispatch/confirm', {
    method: 'POST',
    body: JSON.stringify({ orderId, performerIds }),
  });
}

export const PERFORMER_COLOR_MAP = PERFORMER_COLORS;
