import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, Card, Tag, Descriptions, Typography, message } from 'antd';
import { ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { getSkuDetail, submitDemand } from '../services/apiClient';
import { useAuth } from '../services/auth';

const { Title, Paragraph, Text } = Typography;
const LINE_LABELS: Record<string, string> = {
  venue_booking: '商演包场', outdoor_show: '外出演出', show_sponsor: '演出赞助',
  custom_content: '定制内容', custom_showcase: '定制拼盘',
};

export default function SkuDetail() {
  const { id } = useParams<{ id: string }>();
  const [sku, setSku] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const nav = useNavigate();

  useEffect(() => { if (id) getSkuDetail(id).then(d => setSku(d)).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  const handleGetQuote = async () => {
    if (!token) { nav('/login'); return; }
    try {
      await submitDemand({ source: 'sku', sku_id: id, title: sku.name, event_type: '企业年会', event_date: '', city: '', address: '' });
      message.success('已提交，运营将尽快联系您');
      nav('/demands');
    } catch { message.error('提交失败'); }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!sku) return <Result status="error" title="方案不存在" extra={<Button onClick={() => nav('/')}>返回列表</Button>} />;

  const agentPrice = Math.round(sku.base_price * 0.7);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Button onClick={() => nav('/')} style={{ marginBottom: 16 }}>← 返回列表</Button>
      <Card>
        <Tag color="purple" style={{ marginBottom: 12, minHeight: 44 }}>{LINE_LABELS[sku.business_line]}</Tag>
        <Title level={3}>{sku.name}</Title>
        <Paragraph style={{ fontSize: 14, color: '#666' }}>{sku.description}</Paragraph>

        <Descriptions column={2} style={{ marginTop: 16 }}>
          <Descriptions.Item label={<><ClockCircleOutlined /> 时长</>}>{sku.duration_minutes} 分钟</Descriptions.Item>
          <Descriptions.Item label={<><TeamOutlined /> 演员</>}>{sku.performers_count} 名</Descriptions.Item>
          <Descriptions.Item label="风格">{sku.style_tags?.join('、') || '-'}</Descriptions.Item>
          <Descriptions.Item label="适用场景">{sku.applicable_scenes?.join('、') || '-'}</Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, padding: 16, background: '#f9f0ff', borderRadius: 8 }}>
          <Text type="secondary">甲方标准价</Text>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#7c3aed' }}>¥{sku.base_price?.toLocaleString()}</div>
          <Text type="secondary" style={{ fontSize: 13 }}>活动公司渠道价（7折）：</Text>
          <Text strong style={{ fontSize: 20, color: '#52c41a' }}> ¥{agentPrice.toLocaleString()}</Text>
        </div>

        <Button type="primary" size="large" block style={{ marginTop: 24, minHeight: 48, height: 48 }}
          onClick={handleGetQuote}>
          {token ? '获取报价' : '登录后获取报价'}
        </Button>
      </Card>
    </div>
  );
}
