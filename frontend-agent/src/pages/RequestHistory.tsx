import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Space, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getDemandList } from '../services/apiClient';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_ai: { color: 'blue', label: 'AI生成中' },
  ai_generated: { color: 'cyan', label: '方案已生成' },
  pending_operator: { color: 'orange', label: '待运营处理' },
  operator_adjusted: { color: 'gold', label: '方案待确认' },
  pending_client_confirm: { color: 'purple', label: '待您确认' },
  confirmed: { color: 'green', label: '已确认' },
  pending_deposit: { color: 'orange', label: '待付定金' },
  deposit_received: { color: 'blue', label: '定金已收' },
  pending_performer: { color: 'cyan', label: '匹配演员中' },
  performer_confirmed: { color: 'green', label: '演员已确认' },
  performing: { color: 'magenta', label: '演出中' },
  finished: { color: 'green', label: '已完成' },
  cancelled: { color: 'red', label: '已取消' },
};

export default function RequestHistory() {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await getDemandList({ pageSize: 50 });
      setDemands(data.items || []);
    } catch { setError('加载失败'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (error) return <Result status="error" title="加载失败" extra={<Button onClick={load}>重试</Button>} />;

  const columns = [
    { title: '需求标题', dataIndex: 'title', key: 'title', render: (t: string) => <strong>{t}</strong> },
    { title: '活动类型', dataIndex: 'event_type', key: 'type' },
    { title: '日期', dataIndex: 'event_date', key: 'date' },
    { title: '城市', dataIndex: 'city', key: 'city' },
    { title: '预算', dataIndex: 'budget', key: 'budget', render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => {
        const m = STATUS_MAP[s];
        return m ? <Tag color={m.color}>{m.label}</Tag> : <Tag>{s}</Tag>;
      }
    },
    { title: '提交时间', dataIndex: 'created_at', key: 'created', render: (t: string) => t ? new Date(t).toLocaleString('zh-CN') : '-' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>历史记录</Title>
        <Button type="primary" onClick={() => nav('/')} style={{ minHeight: 44 }}>浏览方案</Button>
      </div>
      <Table columns={columns} dataSource={demands} rowKey="id" loading={loading} locale={{ emptyText: '暂无需求记录' }}
        pagination={{ pageSize: 20 }} size="middle" />
    </div>
  );
}
