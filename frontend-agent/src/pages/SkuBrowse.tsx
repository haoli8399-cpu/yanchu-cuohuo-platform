import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Empty, Row, Segmented, Space, Spin, Tag, Typography } from 'antd';
import { GiftOutlined, SmileOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

type UserRole = 'client' | 'company' | 'performer';

// 价格分层：与小程序 sku/list 逻辑对齐（活动公司=渠道价×0.7，演员=成本价×0.6，散客=标准价原价）
const roleLabelMap: Record<UserRole, string> = {
  client: '标准价',
  company: '渠道价',
  performer: '成本价',
};

function calcPrice(base: number, role: UserRole) {
  if (role === 'company') return Math.round(base * 0.7);
  if (role === 'performer') return Math.round(base * 0.6);
  return base;
}

type SupplierType = 'self' | 'broker' | 'artist';

interface PlanItem {
  id: string;
  name: string;
  type: string;
  price: number;
  tier: string;
  duration: string;
  people: string;
  supplierType: SupplierType;
  supplier: string;
  icon: 'smile' | 'gift' | 'star';
}

const typeFilters = ['全部', '脱口秀', '即兴喜剧', '魔术', '亲子', '漫才'];
const priceFilters = ['全部', '¥3,000以下', '¥3K-5K', '¥5K-8K', '¥8K以上'];
const tierFilters = ['全部', 'T1', 'T2', 'T3', 'T4', 'T5'];

const plans: PlanItem[] = [
  { id: 'p1', name: '脱口秀标准版', type: '脱口秀', price: 6000, tier: 'T3', duration: '60min', people: '2人', supplierType: 'self', supplier: '自营', icon: 'smile' },
  { id: 'p2', name: '即兴喜剧团建', type: '即兴喜剧', price: 4500, tier: 'T3', duration: '60min', people: '3人', supplierType: 'broker', supplier: '星火经纪', icon: 'star' },
  { id: 'p3', name: '魔术喜剧暖场', type: '魔术', price: 3800, tier: 'T4', duration: '45min', people: '1人', supplierType: 'artist', supplier: '独立艺人', icon: 'gift' },
  { id: 'p4', name: '亲子喜剧互动', type: '亲子', price: 5200, tier: 'T3', duration: '60min', people: '2人', supplierType: 'broker', supplier: '青柠经纪', icon: 'smile' },
  { id: 'p5', name: '漫才双人秀', type: '漫才', price: 8000, tier: 'T2', duration: '60min', people: '2人', supplierType: 'self', supplier: '自营', icon: 'star' },
  { id: 'p6', name: '年会喜剧拼盘', type: '脱口秀', price: 12000, tier: 'T1', duration: '90min', people: '4人', supplierType: 'broker', supplier: '万象经纪', icon: 'gift' },
  { id: 'p7', name: '商业活动主持秀', type: '脱口秀', price: 6800, tier: 'T2', duration: '45min', people: '1人', supplierType: 'artist', supplier: '独立艺人', icon: 'smile' },
  { id: 'p8', name: '小型活动超值版', type: '脱口秀', price: 2800, tier: 'T5', duration: '30min', people: '1人', supplierType: 'self', supplier: '自营', icon: 'star' },
];

function formatMoney(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`;
}

function supplierStyle(type: SupplierType) {
  if (type === 'self') return { background: '#f5f3ff', color: '#7c3aed', label: '自营' };
  return { background: '#f5f5f7', color: '#6b7280', label: type === 'artist' ? '独立艺人' : undefined };
}

function iconNode(icon: PlanItem['icon']) {
  if (icon === 'gift') return <GiftOutlined />;
  if (icon === 'star') return <StarOutlined />;
  return <SmileOutlined />;
}

export default function SkuBrowse() {
  const [type, setType] = useState('全部');
  const [price, setPrice] = useState('全部');
  const [tier, setTier] = useState('全部');
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = (typeof localStorage !== 'undefined' ? localStorage.getItem('user_role') : null) as UserRole | null;
    return saved === 'client' || saved === 'company' || saved === 'performer' ? saved : 'client';
  });

  function handleRoleChange(role: UserRole) {
    setUserRole(role);
    try { localStorage.setItem('user_role', role); } catch { /* ignore */ }
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => plans.filter((plan) => {
    const typeMatched = type === '全部' || plan.type === type;
    const tierMatched = tier === '全部' || plan.tier === tier;
    const priceMatched =
      price === '全部'
      || (price === '¥3,000以下' && plan.price < 3000)
      || (price === '¥3K-5K' && plan.price >= 3000 && plan.price <= 5000)
      || (price === '¥5K-8K' && plan.price > 5000 && plan.price <= 8000)
      || (price === '¥8K以上' && plan.price > 8000);
    return typeMatched && tierMatched && priceMatched;
  }), [type, price, tier]);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7fb', padding: 24, fontFamily: 'Inter, PingFang SC, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>找方案</Title>
            <Text type="secondary">演立方 YANLI · 商演找演立方</Text>
          </div>
          <Segmented
            value={userRole}
            onChange={(val) => handleRoleChange(val as UserRole)}
            options={[
              { label: '散客', value: 'client' },
              { label: '活动公司', value: 'company' },
              { label: '演员', value: 'performer' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 24, alignItems: 'flex-start' }}>
          <Card style={{ width: 200, flexShrink: 0, borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
            <FilterGroup title="演出类型" options={typeFilters} value={type} onChange={setType} />
            <FilterGroup title="价格区间" options={priceFilters} value={price} onChange={setPrice} />
            <FilterGroup title="艺人级别" options={tierFilters} value={tier} onChange={setTier} />
          </Card>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Spin spinning={loading} tip="正在加载方案...">
              {filtered.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {filtered.map((plan) => {
                    const tag = supplierStyle(plan.supplierType);
                    return (
                      <Col xs={24} lg={12} key={plan.id}>
                        <Card hoverable style={{ borderRadius: 8, height: '100%' }} styles={{ body: { padding: 16 } }}>
                          <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{
                              width: 80,
                              height: 80,
                              borderRadius: 8,
                              background: '#f5f3ff',
                              color: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 28,
                              flexShrink: 0,
                            }}>
                              {iconNode(plan.icon)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
                                <Title level={5} style={{ margin: 0, fontSize: 16 }}>{plan.name}</Title>
                                <span style={{
                                  borderRadius: 999,
                                  padding: '2px 8px',
                                  background: tag.background,
                                  color: tag.color,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                }}>
                                  {tag.label || plan.supplier}
                                </span>
                              </Space>
                              <div style={{ marginTop: 8, color: '#7c3aed', fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                                {formatMoney(calcPrice(plan.price, userRole))}
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginLeft: 6, fontFamily: 'Inter, PingFang SC, sans-serif' }}>
                                  {roleLabelMap[userRole]}
                                </span>
                              </div>
                              <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                                <Tag>{plan.tier}</Tag>
                                <Tag>{plan.duration}</Tag>
                                <Tag>{plan.people}</Tag>
                              </Paragraph>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Empty
                  description="没有匹配的方案"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ paddingTop: 80 }}
                >
                  <Button type="primary" onClick={() => { setType('全部'); setPrice('全部'); setTier('全部'); }}>
                    清除筛选
                  </Button>
                </Empty>
              )}
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup(props: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>{props.title}</Text>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {props.options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => props.onChange(item)}
            style={{
              width: '100%',
              height: 32,
              border: 'none',
              borderRadius: 6,
              background: props.value === item ? '#7c3aed' : '#f5f5f7',
              color: props.value === item ? '#fff' : '#6b7280',
              fontWeight: 700,
              textAlign: 'left',
              padding: '0 8px',
              cursor: 'pointer',
            }}
          >
            {item}
          </button>
        ))}
      </Space>
    </div>
  );
}
