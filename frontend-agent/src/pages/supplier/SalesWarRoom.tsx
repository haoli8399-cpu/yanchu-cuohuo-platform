import { useState } from 'react';
import { Card, Typography, Tag, Button, Space } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

/* ===== Mock Data ===== */
const QUEUE = {
  high: [
    { name: 'XX科技年会', status: '超时 2h', color: 'red' },
    { name: 'XX地产开盘', status: '超时 6h', color: 'orange' },
  ],
  medium: [
    { name: '某银行答谢', status: '待分配' },
    { name: 'XX保险年会', status: '报价中' },
    { name: 'XX地产开业', status: '即将过期' },
  ],
  low: [
    { name: 'XX银行开业', status: '已报价' },
  ],
};

const PLANS = [
  { id: 'A', name: '省钱版', price: '¥4,500', tier: 'T4', dur: '45min', ppl: 2, margin: '27%', recommend: false },
  { id: 'B', name: '主推版', price: '¥6,000', tier: 'T3', dur: '60min', ppl: 2, margin: '33%', recommend: true },
  { id: 'C', name: '升级版', price: '¥9,000', tier: 'T2', dur: '90min', ppl: 3, margin: '39%', recommend: false },
];

export default function SalesWarRoom() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 108px)' }}>
      {/* Left: Queue */}
      <div style={{
        width: 240, flexShrink: 0,
        background: '#fafbfc', borderRight: '1px solid #e5e7eb',
        padding: 12, overflowY: 'auto',
      }}>
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
          ● 高优先级
        </Text>
        {QUEUE.high.map((item) => (
          <Card
            key={item.name}
            size="small"
            hoverable
            style={{ marginBottom: 4, cursor: 'pointer' }}
            onClick={() => setSelected(0)}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <Tag color={item.color} style={{ fontSize: 9, marginTop: 2 }}>{item.status}</Tag>
          </Card>
        ))}
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', margin: '8px 0 6px' }}>
          ● 中优先级
        </Text>
        {QUEUE.medium.map((item) => (
          <Card key={item.name} size="small" hoverable style={{ marginBottom: 4, cursor: 'pointer' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <Text type="secondary" style={{ fontSize: 10 }}>{item.status}</Text>
          </Card>
        ))}
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', margin: '8px 0 6px' }}>
          ● 低优先级
        </Text>
        {QUEUE.low.map((item) => (
          <Card key={item.name} size="small" hoverable style={{ marginBottom: 4, cursor: 'pointer' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <Text type="secondary" style={{ fontSize: 10 }}>{item.status}</Text>
          </Card>
        ))}
      </div>

      {/* Center: Detail */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        <Title level={5} style={{ marginBottom: 14, fontSize: 14 }}>XX科技年会 · 需求详情</Title>
        <Card size="small" style={{ marginBottom: 8, background: '#f9fafb' }} styles={{ body: { padding: '10px 14px' } }}>
          <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>客户信息</Text>
          <Paragraph style={{ fontSize: 12, marginBottom: 0, lineHeight: 1.6 }}>
            XX科技有限公司 · 王经理<br />过往成交 2 次 · 总金额 ¥15,000
          </Paragraph>
        </Card>
        <Card size="small" style={{ marginBottom: 8, background: '#f9fafb' }} styles={{ body: { padding: '10px 14px' } }}>
          <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 4 }}>活动信息</Text>
          <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
            年会 · 300 人 · 10月20日 · 预算 ¥1-2万<br />
            演出类型：脱口秀 <Tag color="green" style={{ fontSize: 10, fontWeight: 600 }}>匹配度 94%</Tag>
          </Paragraph>
        </Card>
        <Card size="small" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }} styles={{ body: { padding: '10px 14px' } }}>
          <Space>
            <BulbOutlined style={{ color: '#7c3aed' }} />
            <Text style={{ color: '#7c3aed', fontSize: 11, fontWeight: 600 }}>AI 解析</Text>
          </Space>
          <Paragraph style={{ color: '#7c3aed', fontSize: 11, margin: '4px 0 0', lineHeight: 1.7 }}>
            演出类型：脱口秀 · 历史同类 3 例 · 均价 ¥5,800<br />
            缺失字段：日期 <span style={{ color: '#ef4444' }}>⚠</span>
          </Paragraph>
        </Card>
      </div>

      {/* Right: AI Plans */}
      <div style={{
        width: 300, flexShrink: 0,
        background: '#fafbfc', borderLeft: '1px solid #e5e7eb',
        padding: 12, overflowY: 'auto',
      }}>
        <Space style={{ marginBottom: 14 }}>
          <div style={{ width: 22, height: 22, background: '#7c3aed', borderRadius: 4 }} />
          <Text strong style={{ color: '#7c3aed', fontSize: 13 }}>小演推荐</Text>
        </Space>
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            size="small"
            hoverable
            style={{
              marginBottom: 8,
              border: plan.recommend ? '1px solid #ddd6fe' : '1px solid #e5e7eb',
              background: plan.recommend ? '#f5f3ff' : '#fff',
            }}
            styles={{ body: { padding: 12 } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 12 }}>方案 {plan.id} · {plan.name}</Text>
              {plan.recommend && (
                <Tag color="#7c3aed" style={{ fontSize: 9, fontWeight: 700, border: 'none' }}>推荐</Tag>
              )}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18, fontWeight: 700, color: '#7c3aed',
              margin: '4px 0',
            }}>
              {plan.price}
            </div>
            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
              {plan.tier} · {plan.dur} · {plan.ppl}人
            </Text>
            <Text style={{ color: '#16a34a', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              毛利率 {plan.margin} {plan.recommend ? '✓' : ''}
            </Text>
            <Button
              type="primary"
              size="small"
              block
              style={{ background: '#7c3aed', borderColor: '#7c3aed', fontSize: 10, fontWeight: 700, height: 28 }}
            >
              采用此方案
            </Button>
          </Card>
        ))}
      </div>

      {/* Bottom: Follow-up */}
      <div style={{
        position: 'absolute', bottom: 0, left: 252, right: 312,
        padding: '8px 16px', borderTop: '1px solid #e5e7eb',
        background: '#fff', fontSize: 12, color: '#6b7280',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <span>💬 跟进记录</span>
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>◇ 小演建议 · 王经理好，上次聊的脱口秀方案...</span>
        <span>⏰ 2h 提醒</span>
      </div>
    </div>
  );
}
