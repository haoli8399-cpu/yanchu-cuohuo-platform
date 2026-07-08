import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Empty, Skeleton, Typography, Tag, Button, Space, Tooltip, Segmented } from 'antd';
import { BulbOutlined, CopyOutlined, ClockCircleOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';

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
  {
    id: 'A', name: '省钱版', price: '¥4,500', tier: 'T4', dur: '45min', ppl: 2,
    margin: '27%', recommend: false,
    reason: '预算有限性价比之选，适合预算<¥5K的客户',
  },
  {
    id: 'B', name: '主推版', price: '¥6,000', tier: 'T3', dur: '60min', ppl: 2,
    margin: '33%', recommend: true,
    reason: 'T3级艺人档期充足（3人可选）·300人年会60min最佳配置·同类均价¥5,800',
  },
  {
    id: 'C', name: '升级版', price: '¥9,000', tier: 'T2', dur: '90min', ppl: 3,
    margin: '39%', recommend: false,
    reason: '高预算客户首选，含互动环节，可升级T1艺人',
  },
];

export default function SalesWarRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const isKanban = location.pathname.includes('/kanban');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const totalItems = QUEUE.high.length + QUEUE.medium.length + QUEUE.low.length;
  const isEmpty = totalItems === 0;

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 240 }}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
          <div style={{ flex: 1 }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
          <div style={{ width: 300 }}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 108px)' }}>
        <Empty
          description="暂无商机需求"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const handleCopyScript = () => {
    navigator.clipboard.writeText('王经理好，上次聊的脱口秀方案，这周您这边方便确认一下吗？如果时间不合适，我们也可以调整。');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 108px)' }}>
      {/* 顶部切换栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 0', marginBottom: 8,
      }}>
        <Segmented
          value={isKanban ? 'kanban' : 'list'}
          onChange={(val) => {
            if (val === 'kanban') navigate('/supplier/kanban');
            else navigate('/supplier/war-room');
          }}
          options={[
            { label: <span><UnorderedListOutlined style={{ marginRight: 4 }} />列表</span>, value: 'list' },
            { label: <span><AppstoreOutlined style={{ marginRight: 4 }} />Kanban</span>, value: 'kanban' },
          ]}
        />
      </div>

      <div style={{ display: 'flex', gap: 0, flex: 1, position: 'relative' }}>
      {/* Left: Queue */}
      <div style={{
        width: 240, flexShrink: 0,
        background: '#fafbfc', borderRight: '1px solid #e5e7eb',
        padding: 16, overflowY: 'auto',
      }}>
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
          ● 高优先级
        </Text>
        {QUEUE.high.map((item) => (
          <Card
            key={item.name}
            size="small"
            hoverable
            style={{ marginBottom: 8, cursor: 'pointer' }}
            onClick={() => setSelected(0)}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <Tag color={item.color} style={{ fontSize: 9 }}>{item.status}</Tag>
          </Card>
        ))}
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', margin: '8px 0 8px' }}>
          ● 中优先级
        </Text>
        {QUEUE.medium.map((item) => (
          <Card key={item.name} size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <Text type="secondary" style={{ fontSize: 10 }}>{item.status}</Text>
          </Card>
        ))}
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', margin: '8px 0 8px' }}>
          ● 低优先级
        </Text>
        {QUEUE.low.map((item) => (
          <Card key={item.name} size="small" hoverable style={{ marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
            <Text type="secondary" style={{ fontSize: 10 }}>{item.status}</Text>
          </Card>
        ))}
      </div>

      {/* Center: Detail */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <Title level={5} style={{ marginBottom: 16, fontSize: 14 }}>XX科技年会 · 需求详情</Title>
        <Card size="small" style={{ marginBottom: 8, background: '#f9fafb' }} styles={{ body: { padding: '8px 16px' } }}>
          <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 8 }}>客户信息</Text>
          <Paragraph style={{ fontSize: 12, marginBottom: 0, lineHeight: 1.6 }}>
            XX科技有限公司 · 王经理<br />过往成交 2 次 · 总金额 ¥15,000
          </Paragraph>
        </Card>
        <Card size="small" style={{ marginBottom: 8, background: '#f9fafb' }} styles={{ body: { padding: '8px 16px' } }}>
          <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 8 }}>活动信息</Text>
          <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
            年会 · 300 人 · <Text style={{ color: '#ef4444', fontWeight: 600 }}>日期未填 ⚠</Text> · 预算 ¥1-2万<br />
            演出类型：脱口秀 <Tag color="green" style={{ fontSize: 10, fontWeight: 600 }}>匹配度 94%</Tag>
          </Paragraph>
        </Card>
        <Card size="small" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }} styles={{ body: { padding: '8px 16px' } }}>
          <Space>
            <BulbOutlined style={{ color: '#7c3aed' }} />
            <Text style={{ color: '#7c3aed', fontSize: 11, fontWeight: 600 }}>AI 解析</Text>
          </Space>
          <Paragraph style={{ color: '#7c3aed', fontSize: 11, margin: '8px 0 0', lineHeight: 1.7 }}>
            演出类型：脱口秀 · 历史同类 3 例 · 均价 ¥5,800<br />
            缺失字段：日期 <span style={{ color: '#ef4444' }}>⚠</span>
          </Paragraph>
        </Card>
      </div>

      {/* Right: AI Plans */}
      <div style={{
        width: 300, flexShrink: 0,
        background: '#fafbfc', borderLeft: '1px solid #e5e7eb',
        padding: 16, overflowY: 'auto',
      }}>
        <Space style={{ marginBottom: 16 }}>
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
            styles={{ body: { padding: 16 } }}
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
              margin: '8px 0',
            }}>
              {plan.price}
            </div>
            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
              {plan.tier} · {plan.dur} · {plan.ppl}人
            </Text>
            <Text style={{ color: '#16a34a', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              毛利率 {plan.margin} {plan.recommend ? '✓' : ''}
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 9, display: 'block', marginBottom: 8, lineHeight: 1.5 }}>
              {plan.reason}
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

      {/* Bottom: Follow-up with AI script copy */}
      <div style={{
        position: 'absolute', bottom: 0, left: 252, right: 312,
        padding: '8px 16px', borderTop: '1px solid #e5e7eb',
        background: '#fff', display: 'flex', alignItems: 'center', gap: 16,
        fontSize: 12,
      }}>
        <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>💬 跟进记录</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            color: '#7c3aed', fontWeight: 600, fontSize: 11, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            🤖 小演建议 · 王经理好，上次聊的脱口秀方案，这周您这边方便确认吗？
          </span>
        </div>
        <Space size={8}>
          <Tooltip title={copied ? '已复制' : '复制话术'}>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyScript}
              style={{ fontSize: 11, color: copied ? '#16a34a' : '#7c3aed', borderColor: '#ddd6fe' }}
            >
              {copied ? '已复制' : '复制话术'}
            </Button>
          </Tooltip>
          <Button size="small" icon={<ClockCircleOutlined />} style={{ fontSize: 11 }}>
            2h 提醒
          </Button>
        </Space>
      </div>
    </div>
    </div>
  );
}
