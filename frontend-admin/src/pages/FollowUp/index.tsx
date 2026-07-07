/**
 * 跟进管理 — 待跟进任务列表 + 跟进记录弹窗
 */
import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, message, Modal, Input, Space, Tooltip, Badge } from 'antd';
import { ClockCircleOutlined, PhoneOutlined, MessageOutlined, MailOutlined } from '@ant-design/icons';
import apiClient from '@/services/apiClient';

interface FollowUp {
  id: string;
  opportunity_id: string;
  operator_id: string;
  operator_name: string;
  action_type: string;
  content: string;
  ai_suggested_script: string;
  outcome: string;
  next_follow_up_at: string;
  created_at: string;
}

interface Opportunity {
  id: string;
  status: string;
  next_action: string;
  demand?: { company_name: string; performance_type: string };
}

const actionIcons: Record<string, React.ReactNode> = {
  call: <PhoneOutlined />,
  wechat: <MessageOutlined />,
  email: <MailOutlined />,
  meeting: <MailOutlined />,
  system: <ClockCircleOutlined />,
};

const FollowUpPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [logModal, setLogModal] = useState<{ open: boolean; oppId: string; logs: FollowUp[] }>({ open: false, oppId: '', logs: [] });
  const [aiScript, setAiScript] = useState('');
  const [scriptModal, setScriptModal] = useState(false);

  const columns: ProColumns<Opportunity>[] = [
    { title: '客户', dataIndex: ['demand', 'company_name'], ellipsis: true },
    { title: '演出类型', dataIndex: ['demand', 'performance_type'], width: 100 },
    { title: '状态', dataIndex: 'status', width: 80,
      render: (_, r) => <Tag color={r.status === 'pending_client' ? 'orange' : r.status === 'quoted' ? 'blue' : r.status === 'negotiating' ? 'purple' : 'default'}>{r.status}</Tag>
    },
    { title: '上次动作', dataIndex: 'next_action', ellipsis: true, width: 200 },
    { title: '跟进记录', key: 'logs', width: 100,
      render: (_, r) => <Button size="small" onClick={() => loadLogs(r.id)}>查看</Button>
    },
    { title: 'AI话术', key: 'ai', width: 100,
      render: (_, r) => <Button size="small" onClick={() => generateScript(r)}>生成</Button>
    },
  ];

  const loadLogs = async (oppId: string) => {
    const res = await apiClient.get<{ items: FollowUp[] }>(`/opportunities/${oppId}/follow-ups`);
    setLogModal({ open: true, oppId, logs: res.data.items });
  };

  const generateScript = async (opp: Opportunity) => {
    try {
      const res = await apiClient.post<{ script: string }>('/ai/generate-follow-up', { body: { opportunity_id: opp.id } } as any);
      setAiScript(res.data.script);
      setScriptModal(true);
    } catch {
      message.error('AI 话术生成失败');
    }
  };

  return (
    <PageContainer header={{ title: '跟进管理', breadcrumb: {} }}>
      <ProTable<Opportunity>
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        request={async (params) => {
          const res = await apiClient.get<{ items: Opportunity[]; total: number }>('/opportunities', { body: null, config: { params: { page: params.current, pageSize: params.pageSize, status: 'quoted,negotiating,pending_client' } } } as any);
          return { data: res.data.items, success: true, total: res.data.total };
        }}
      />

      <Modal title="跟进记录" open={logModal.open} footer={null} onCancel={() => setLogModal({ open: false, oppId: '', logs: [] })} width={600}>
        {logModal.logs.map((log) => (
          <div key={log.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Space>
              <Badge status="processing" />
              <span style={{ color: '#666', fontSize: 12 }}>{log.operator_name}</span>
              <span>{actionIcons[log.action_type] || <ClockCircleOutlined />}</span>
              <span style={{ color: '#999', fontSize: 12 }}>{new Date(log.created_at).toLocaleString()}</span>
            </Space>
            <div style={{ marginTop: 4 }}>{log.content || log.outcome || '—'}</div>
          </div>
        ))}
        {logModal.logs.length === 0 && <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无跟进记录</div>}
      </Modal>

      <Modal title="AI 跟进话术" open={scriptModal} footer={<Button onClick={() => { navigator.clipboard?.writeText(aiScript); message.success('已复制'); }}>复制话术</Button>} onCancel={() => setScriptModal(false)}>
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8 }}>{aiScript}</div>
      </Modal>
    </PageContainer>
  );
};

export default FollowUpPage;
