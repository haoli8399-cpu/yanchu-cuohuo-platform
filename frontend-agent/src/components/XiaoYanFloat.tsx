import { useState, useEffect } from 'react';
import { Card, Typography, Button, Spin } from 'antd';
import { BulbOutlined, CloseOutlined } from '@ant-design/icons';
import { apiClient } from '../services/apiClient';

const { Text } = Typography;

interface Props {
  context_type?: 'opportunity' | 'sku' | 'profit' | 'order';
  opportunity_id?: string;
  sku_id?: string;
  time_range?: 'today' | 'week' | 'month';
}

export default function XiaoYanFloat({ context_type, opportunity_id, sku_id, time_range }: Props) {
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/insight', {
        context_type, opportunity_id, sku_id, time_range,
      });
      const data = (res as any).data || res;
      setInsights(data.insights || []);
      setHasNew(false);
    } catch {
      setInsights(['👋 你好！我是小演，有什么可以帮你？']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    const timer = setInterval(fetchInsights, 60000); // refresh every minute
    return () => clearInterval(timer);
  }, [context_type, opportunity_id]);

  if (!open) {
    return (
      <div
        onClick={() => { setOpen(true); fetchInsights(); }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 48, height: 48, borderRadius: 10,
          background: '#7c3aed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title="小演 AI 助手"
      >
        {hasNew && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 10, height: 10, borderRadius: '50%',
            background: '#ef4444', border: '2px solid #fff',
          }} />
        )}
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>小演</span>
      </div>
    );
  }

  return (
    <Card
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
        width: 320, maxHeight: 420,
        borderRadius: 12, boxShadow: '0 8px 32px rgba(124,58,237,0.2)',
        border: '1px solid #ddd6fe',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: '#7c3aed', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>小演</div>
          <Text strong style={{ color: '#7c3aed', fontSize: 13 }}>小演 AI</Text>
        </div>
        <CloseOutlined
          style={{ color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}
          onClick={() => setOpen(false)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="small" />
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>分析中…</Text>
        </div>
      ) : (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {insights.map((insight, i) => (
            <div
              key={i}
              style={{
                background: '#f5f3ff', borderRadius: 8,
                padding: '10px 14px', marginBottom: 8,
                fontSize: 12, lineHeight: 1.6, color: '#374151',
              }}
            >
              {insight}
            </div>
          ))}
        </div>
      )}

      <Button
        type="text"
        size="small"
        icon={<BulbOutlined />}
        onClick={fetchInsights}
        style={{ marginTop: 8, color: '#7c3aed', fontSize: 11 }}
      >
        刷新洞察
      </Button>
    </Card>
  );
}
