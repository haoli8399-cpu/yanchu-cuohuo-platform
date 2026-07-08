import { useEffect, useState } from 'react';
import {
  Alert, Button, Checkbox, Drawer, Empty, List, Progress, Space, Tag, Typography,
} from 'antd';
import { RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  confirmDispatch, fetchDispatchCandidates, type DispatchCandidate,
} from '../services/supplier';

const { Text } = Typography;

interface DispatchOrder {
  orderId: string;
  orderNo: string;
  plan: string;
}

interface Props {
  open: boolean;
  order: DispatchOrder | null;
  onClose: () => void;
}

export default function DispatchPanel({ open, order, onClose }: Props) {
  const [candidates, setCandidates] = useState<DispatchCandidate[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open && order) {
      setLoading(true);
      setSelected([]);
      setDone(false);
      fetchDispatchCandidates(order.orderId)
        .then((list) => { setCandidates(list); setLoading(false); });
    }
  }, [open, order]);

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleConfirm = async () => {
    if (!order || selected.length === 0) return;
    setSubmitting(true);
    await confirmDispatch(order.orderId, selected);
    setSubmitting(false);
    setDone(true);
  };

  return (
    <Drawer
      title={<Space><RobotOutlined style={{ color: '#7c3aed' }} />AI 派单面板</Space>}
      width={460}
      open={open}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">已选 {selected.length} 位艺人</Text>
          <Button type="primary" disabled={selected.length === 0 || done}
            loading={submitting}
            icon={<ThunderboltOutlined />}
            style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            onClick={handleConfirm}>
            {done ? '已派单' : '确认派单'}
          </Button>
        </div>
      }
    >
      {order && (
        <div style={{ marginBottom: 16, padding: 12, background: '#faf9ff', borderRadius: 8, border: '1px solid #f0eefb' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>订单号</Text>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{order.orderNo}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>方案</Text>
          <div style={{ fontWeight: 600 }}>{order.plan}</div>
        </div>
      )}

      {done && <Alert type="success" showIcon message="派单成功，已通知对应艺人" style={{ marginBottom: 16 }} />}

      {loading ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="匹配中..." />
      ) : (
        <List
          dataSource={candidates}
          locale={{ emptyText: <Empty description="无可用艺人（档期均冲突）" /> }}
          renderItem={(c) => (
            <List.Item
              style={{ padding: '12px 0', borderBottom: '1px solid #f5f5f7' }}
              actions={[
                <Checkbox key="check" checked={selected.includes(c.performerId)}
                  onChange={(e) => toggle(c.performerId, e.target.checked)} />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {c.name.slice(0, 1)}
                  </div>
                }
                title={
                  <Space>
                    <Text strong>{c.name}</Text>
                    <Tag color="#7c3aed" style={{ border: 'none' }}>{c.tier}</Tag>
                    <Tag style={{ border: 'none', color: '#16a34a' }}>信誉 {c.creditScore}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{c.reason}</div>
                    <Progress
                      percent={c.matchScore}
                      size="small"
                      strokeColor="#7c3aed"
                      format={(p) => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>匹配 {p}%</span>}
                    />
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
