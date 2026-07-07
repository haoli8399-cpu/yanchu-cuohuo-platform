import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Select, Spin, Empty, Result, Button, Typography } from 'antd';
import { ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getSkuList } from '../services/apiClient';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const LINE_LABELS: Record<string, string> = {
  venue_booking: '商演包场', outdoor_show: '外出演出', show_sponsor: '演出赞助',
  custom_content: '定制内容', custom_showcase: '定制拼盘',
};

export default function SkuList() {
  const [skus, setSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [line, setLine] = useState('');
  const nav = useNavigate();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, string | number> = { pageSize: 50 };
      if (line) params.business_line = line;
      const data = await getSkuList(params) as { items?: any[] };
      setSkus(data.items || []);
    } catch { setError('加载失败'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [line]);

  if (error) return <Result status="error" title="加载失败" extra={<Button onClick={load}>重试</Button>} />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>演出方案库</Title>
        <Text type="secondary">选择标准化演出方案，快速获取报价</Text>
        <div style={{ marginTop: 16 }}>
          <Select placeholder="按业务线筛选" style={{ width: 200 }} allowClear value={line || undefined} onChange={v => setLine(v || '')}>
            {Object.entries(LINE_LABELS).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}
          </Select>
        </div>
      </div>

      <Spin spinning={loading}>
        {skus.length === 0 && !loading ? (
          <Empty description="暂无方案" />
        ) : (
          <Row gutter={[16, 16]}>
            {skus.map(sku => (
              <Col key={sku.id} xs={24} sm={12} lg={8}>
                <Card hoverable onClick={() => nav(`/skus/${sku.id}`)} style={{ borderRadius: 12, minHeight: 44 }}>
                  <Tag color="purple" style={{ marginBottom: 8 }}>{LINE_LABELS[sku.business_line] || sku.business_line}</Tag>
                  <Title level={5} style={{ marginBottom: 8 }}>{sku.name}</Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 12, fontSize: 13 }}>
                    {sku.description}
                  </Paragraph>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#666' }}>
                    <span><ClockCircleOutlined /> {sku.duration_minutes}分钟</span>
                    <span><TeamOutlined /> {sku.performers_count}名演员</span>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 18, color: '#7c3aed' }}>¥{sku.base_price?.toLocaleString()}</Text>
                    <Tag>{sku.style_tags?.[0]}</Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
