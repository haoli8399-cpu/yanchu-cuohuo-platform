import { useState } from 'react';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Tabs,
} from 'antd';
import {
  ArrowUpOutlined, ArrowRightOutlined,
  AlertOutlined, BulbOutlined, SoundOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/* ===== Mock Data ===== */
const KPI_DATA = [
  { label: '新增需求', value: 8, trend: '+2', up: true },
  { label: 'AI方案', value: 6, trend: '+1', up: true },
  { label: '报价发送', value: 5, trend: '0', up: false },
  { label: '成交', value: 2, trend: '+1', up: true, accent: 'green' },
  { label: '预计收入', value: '¥18,000', trend: '+¥3,200', up: true, accent: 'purple' },
];

const INSIGHTS = [
  {
    type: 'risk', color: '#f59e0b', icon: <AlertOutlined />,
    badge: '风险预警', title: '报价处理效率下降 30%',
    body: '周三起需求积压，3 个报价待处理，响应时间从 1.2h 延至 4.5h。',
    meta: '建议开启晚间自动报价',
  },
  {
    type: 'churn', color: '#ef4444', icon: <AlertOutlined />,
    badge: '客户流失风险', title: '3 位客户超 48h 未跟进',
    body: 'XX科技年会报价已发 48h 未读 · 成交概率 ↓18%\nXX地产开盘谈判中 72h 无进展',
  },
  {
    type: 'suggest', color: '#3b82f6', icon: <BulbOutlined />,
    badge: '小演建议', title: '优先跟进 XX科技 王经理',
    body: '成交概率 72%，建议电话确认是否收到报价。',
  },
  {
    type: 'retention', color: '#7c3aed', icon: <SoundOutlined />,
    badge: '复购信号', title: '2 位历史客户可能复购',
    body: '3 个月前成交过年会活动的客户，本月出现新需求信号。',
    meta: '· XX保险：李总朋友圈发布年会预告',
  },
];

export default function DailyReport() {
  const [tab, setTab] = useState('all');

  return (
    <div>
      {/* KPI Row */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {KPI_DATA.map((kpi) => (
          <Col span={24 / 5} key={kpi.label}>
            <Card size="small" styles={{ body: { padding: '16px 18px' } }}
              hoverable
            >
              <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {kpi.label}
              </Text>
              <div style={{
                fontSize: 26, fontWeight: 700, letterSpacing: -0.6,
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2,
                color: kpi.accent === 'purple' ? '#7c3aed' : kpi.accent === 'green' ? '#16a34a' : '#1a1a2e',
                margin: '4px 0 2px',
              }}>
                {kpi.value}
              </div>
              <Text style={{
                color: kpi.up ? '#16a34a' : '#9ca3af',
                fontSize: 11, fontWeight: 600,
              }}>
                {kpi.up ? <ArrowUpOutlined /> : <ArrowRightOutlined />} {kpi.trend}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Section: 小演发现 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontSize: 16 }}>小演发现</Title>
          <Text type="secondary" style={{ fontSize: 11 }}>AI 实时监控 · 主动推送风险与机会</Text>
        </div>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: '全部' },
            { key: 'risk', label: '风险' },
            { key: 'suggest', label: '建议' },
            { key: 'retention', label: '复购' },
          ]}
          size="small"
          style={{ marginBottom: 0 }}
        />
      </div>

      <Row gutter={[14, 14]}>
        {/* Left: Insights */}
        <Col xs={24} lg={16}>
          {INSIGHTS.map((item, i) => (
            <Card
              key={i}
              size="small"
              style={{
                marginBottom: 8,
                borderLeft: `3px solid ${item.color}`,
              }}
              hoverable
            >
              <Space style={{ marginBottom: 4 }}>
                <Tag color={item.color} style={{ fontSize: 10, fontWeight: 700, border: 'none' }}>
                  {item.icon} {item.badge}
                </Tag>
              </Space>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{item.title}</div>
              <Paragraph style={{ fontSize: 12, color: '#4B5563', marginBottom: 2, whiteSpace: 'pre-line' }}>
                {item.body}
              </Paragraph>
              {item.meta && (
                <Text type="secondary" style={{ fontSize: 11 }}>{item.meta}</Text>
              )}
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button type="primary" size="small" style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
                    立即处理
                  </Button>
                  <Button size="small">稍后</Button>
                </Space>
              </div>
            </Card>
          ))}
        </Col>

        {/* Right: Won + Lost */}
        <Col xs={24} lg={8}>
          {/* Won Celebration */}
          <div style={{
            background: '#0f0f1a', borderRadius: 16,
            padding: 24, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(124,58,237,0.15)', marginBottom: 10,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa, transparent)',
            }} />
            <Space style={{ marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(22,163,74,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#16a34a', fontSize: 16, fontWeight: 700,
              }}>✓</div>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14 }}>成交</Text>
            </Space>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
              XX 公司年会脱口秀
            </div>
            <Row gutter={[0, 4]} style={{ marginBottom: 16 }}>
              <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>方案 <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>T3 · 60min</span></Text></Col>
              <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>金额 <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>¥6,000</span></Text></Col>
              <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>毛利率 <span style={{ color: '#16a34a', fontWeight: 600 }}>33%</span></Text></Col>
              <Col span={12}><Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>转化 <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>3 天</span></Text></Col>
            </Row>
            <Button type="primary" style={{ background: '#7c3aed', borderColor: '#7c3aed', borderRadius: 4 }}>
              查看完整订单 →
            </Button>
          </div>

          {/* Lost Analysis */}
          <Card size="small">
            <Space style={{ marginBottom: 6 }}>
              <Text strong style={{ fontSize: 12 }}>丢单复盘</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>小演分析</Text>
            </Space>
            <Paragraph style={{ fontSize: 12, color: '#4B5563', marginBottom: 6 }}>
              <Text strong>XX商场开业</Text> · 丢单原因：预算过低
            </Paragraph>
            <div style={{
              padding: '8px 10px', background: '#f9fafb', borderRadius: 4,
              fontSize: 11, color: '#6b7280', borderLeft: '2px solid #f59e0b', lineHeight: 1.6,
            }}>
              同类需求最低成交价 ¥4,800，该客户预算仅 ¥3,000。建议放弃或推荐 T5 经济方案。
            </div>
          </Card>
        </Col>
      </Row>

      {/* Funnel */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 20px', marginTop: 18,
        background: '#f9fafb', borderRadius: 10,
      }}>
        <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>本周漏斗</Text>
        <Space size={4} wrap>
          {[{ label: '需求', n: 8 }, { label: '已确认', n: 6 }, { label: '已报价', n: 5 },
            { label: '谈判', n: 3 }, { label: '成交', n: 2, won: true },
          ].map((s, i) => (
            <span key={s.label}>
              {i > 0 && <Text type="secondary" style={{ fontSize: 8, margin: '0 2px' }}>→</Text>}
              <Tag style={{
                borderRadius: 999, fontSize: 11, fontWeight: 600, border: 'none',
                background: s.won ? '#f0fdf4' : '#f5f3ff',
                color: s.won ? '#16a34a' : '#7c3aed',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>{s.n}</span> {s.label}
              </Tag>
            </span>
          ))}
        </Space>
      </div>
    </div>
  );
}
