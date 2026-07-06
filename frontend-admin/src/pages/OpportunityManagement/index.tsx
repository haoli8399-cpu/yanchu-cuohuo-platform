/**
 * 商机管理页 — 商机列表+状态流转
 */

import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, message, Modal, Select, Space } from 'antd';
import apiClient from '@/services/apiClient';

interface Opportunity {
  id: string;
  demand_id: string;
  status: string;
  priority: string;
  lost_reason?: string;
  ai_score?: number;
  created_at: string;
  demand?: { company_name?: string; performance_type?: string; budget?: number; event_date?: string };
}

const statusMap: Record<string, { color: string; label: string }> = {
  new: { color: '#1677ff', label: '新需求' },
  qualified: { color: '#722ed1', label: '已确认' },
  quoted: { color: '#fa8c16', label: '已报价' },
  negotiating: { color: '#eb2f96', label: '谈判中' },
  pending_client: { color: '#faad14', label: '等客户' },
  won: { color: '#52c41a', label: '已成交' },
  lost: { color: '#ff4d4f', label: '已丢单' },
  invalid: { color: '#d9d9d9', label: '无效' },
};

const lostReasons = [
  { value: 'budget_low', label: '预算太低' },
  { value: 'date_unavailable', label: '日期不合适' },
  { value: 'no_response', label: '客户无回应' },
  { value: 'competitor', label: '被竞品抢单' },
  { value: 'mismatch', label: '方案不匹配' },
  { value: 'cancelled', label: '客户取消活动' },
  { value: 'price_high', label: '价格太高' },
  { value: 'not_real', label: '非真实需求' },
];

const OpportunityManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [statusModal, setStatusModal] = useState<{ open: boolean; opp: Opportunity | null; targetStatus: string }>({ open: false, opp: null, targetStatus: '' });
  const [lostReason, setLostReason] = useState<string>('');

  const updateStatus = async () => {
    const { opp, targetStatus } = statusModal;
    if (!opp) return;
    try {
      const body: any = { status: targetStatus };
      if (targetStatus === 'lost') body.lost_reason = lostReason;
      await apiClient.patch(`/opportunities/${opp.id}/status`, body);
      message.success('状态已更新');
      setStatusModal({ open: false, opp: null, targetStatus: '' });
      actionRef.current?.reload();
    } catch {
      message.error('更新失败');
    }
  };

  const showStatusModal = (opp: Opportunity, targetStatus: string) => {
    setStatusModal({ open: true, opp, targetStatus });
    setLostReason('');
  };

  const columns: ProColumns<Opportunity>[] = [
    { title: '客户', dataIndex: ['demand', 'company_name'], ellipsis: true },
    { title: '演出类型', dataIndex: ['demand', 'performance_type'], width: 100 },
    { title: '预算', dataIndex: ['demand', 'budget'], width: 120, render: (_, r) => r.demand?.budget ? `¥${r.demand.budget.toLocaleString()}` : '—' },
    { title: '日期', dataIndex: ['demand', 'event_date'], width: 110 },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (_, r) => <Tag color={statusMap[r.status]?.color}>{statusMap[r.status]?.label}</Tag>,
    },
    {
      title: '优先级', dataIndex: 'priority', width: 80,
      render: (_, r) => (
        <Tag color={r.priority === 'high' ? 'red' : r.priority === 'low' ? 'green' : 'orange'}>
          {r.priority === 'high' ? '高' : r.priority === 'low' ? '低' : '中'}
        </Tag>
      ),
    },
    { title: 'AI评分', dataIndex: 'ai_score', width: 80, render: (_, r) => r.ai_score ? `${r.ai_score}分` : '—' },
    { title: '丢单原因', dataIndex: 'lost_reason', width: 120, ellipsis: true, render: (_, r) => r.lost_reason ? lostReasons.find(lr => lr.value === r.lost_reason)?.label || r.lost_reason : '—' },
    {
      title: '操作', width: 280, fixed: 'right',
      render: (_, r) => (
        <Space>
          {r.status === 'new' && <Button size="small" type="primary" onClick={() => showStatusModal(r, 'qualified')}>确认</Button>}
          {r.status === 'new' && <Button size="small" onClick={() => showStatusModal(r, 'invalid')}>无效</Button>}
          {r.status === 'qualified' && <Button size="small" type="primary" onClick={() => showStatusModal(r, 'quoted')}>已报价</Button>}
          {(r.status === 'quoted' || r.status === 'negotiating') && <Button size="small" onClick={() => showStatusModal(r, 'negotiating')}>谈判</Button>}
          {(r.status === 'quoted' || r.status === 'negotiating' || r.status === 'pending_client') && <Button size="small" type="primary" onClick={() => showStatusModal(r, 'won')}>成交</Button>}
          {!['won', 'lost', 'invalid'].includes(r.status) && <Button size="small" danger onClick={() => showStatusModal(r, 'lost')}>丢单</Button>}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '商机管理', breadcrumb: {} }}>
      <ProTable<Opportunity>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        request={async (params) => {
          const res = await apiClient.get<{ items: Opportunity[]; total: number }>('/opportunities', { body: null, config: { params: { page: params.current, pageSize: params.pageSize } } } as any);
          return { data: res.data.items, success: true, total: res.data.total };
        }}
        pagination={{ defaultPageSize: 20 }}
      />

      <Modal
        open={statusModal.open}
        title={`确认状态变更 — ${statusMap[statusModal.targetStatus]?.label || statusModal.targetStatus}`}
        onOk={updateStatus}
        onCancel={() => setStatusModal({ open: false, opp: null, targetStatus: '' })}
      >
        {statusModal.targetStatus === 'lost' && (
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="请选择丢单原因"
            value={lostReason || undefined}
            onChange={setLostReason}
            options={lostReasons}
          />
        )}
        {statusModal.targetStatus !== 'lost' && <p>确认将商机状态变更为「{statusMap[statusModal.targetStatus]?.label}」？</p>}
      </Modal>
    </PageContainer>
  );
};

export default OpportunityManagementPage;
