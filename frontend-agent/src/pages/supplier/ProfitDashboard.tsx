import { Card, Row, Col, Typography, Table, Tag, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

/* ===== Mock Data ===== */
const STATS = [
  { label: '总收入', value: '¥58,000', trend: 12.5, up: true, prefix: '' },
  { label: '总成本', value: '¥36,000', trend: 8.3, up: false, prefix: '' },
  { label: '总利润', value: '¥22,000', trend: 20.1, up: true, prefix: '' },
  { label: '毛利率', value: '37.9%', trend: 2.4, up: true, prefix: '' },
];

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月'];
const PROFIT_DATA = [8, 10, 12, 15, 18, 22];
const MAX_PROFIT = Math.max(...PROFIT_DATA);

const RANKING = [
  { key: '1', rank: 1, sku: '脱口秀旗舰版 90min', stdPrice: '¥9,000', cost: '¥5,400', profit: '¥3,600', margin: '40%' },
  { key: '2', rank: 2, sku: '脱口秀标准版 60min', stdPrice: '¥6,000', cost: '¥3,800', profit: '¥2,200', margin: '36.7%' },
  { key: '3', rank: 3, sku: '漫才专场 60min', stdPrice: '¥8,000', cost: '¥5,200', profit: '¥2,800', margin: '35%' },
  { key: '4', rank: 4, sku: '即兴喜剧 60min', stdPrice: '¥4,500', cost: '¥3,000', profit: '¥1,500', margin: '33.3%' },
  { key: '5', rank: 5, sku: '魔术喜剧 45min', stdPrice: '¥3,800', cost: '¥2,600', profit: '¥1,200', margin: '31.6%' },
];

const RANK_COLUMNS = [
  {
    title: '排名', dataIndex: 'rank', key: 'rank', width: 60,
    render: (r: number) => <Text strong style={{ fontSize: 14, color: r <= 3 ? '#7c3aed' : '#6b7280' }}>{r}</Text>,
  },
  { title: 'SKU 方案', dataIndex: 'sku', key: 'sku', render: (s: string) => <Text strong>{s}</Text> },
  {
    title: '标准价', dataIndex: 'stdPrice', key: 'stdPrice',
    render: (p: string) => <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{p}</Text>,
  },
  {
    title: '成本', dataIndex: 'cost', key: 'cost',
    render: (p: string) => <Text type="secondary" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{p}</Text>,
  },
  {
    title: '毛利润', dataIndex: 'profit', key: 'profit',
    render: (p: string) => <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>{p}</Text>,
  },
  {
    title: '毛利率', dataIndex: 'margin', key: 'margin',
    render: (m: string) => <Tag color="green" style={{ fontWeight: 600, border: 'none' }}>{m}</Tag>,
  },
];

export default function ProfitDashboard() {
  return (
    <div>
      {/* KPI Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {STATS.map((s) => (
          <Col span={6} key={s.label}>
            <Card hoverable size="small" styles={{ body: { padding: '18px 20px' } }}>
              <Statistic
                title={<Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</Text>}
                value={s.value}
                valueStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}
                suffix={
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.up ? '#16a34a' : '#ef4444', marginLeft: 8 }}>
                    {s.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {s.trend}%
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Monthly Trend Chart */}
      <Card
        title={<Text strong style={{ fontSize: 15 }}>月度利润趋势</Text>}
        size="small"
        style={{ marginBottom: 20 }}
        styles={{ body: { padding: '20px 24px 16px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 150, padding: '0 8px' }}>
          {MONTHS.map((month, i) => {
            const h = (PROFIT_DATA[i] / MAX_PROFIT) * 120;
            const isLatest = i === MONTHS.length - 1;
            return (
              <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Text style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, fontWeight: 600, color: isLatest ? '#7c3aed' : '#6b7280',
                  marginBottom: 2,
                }}>
                  ¥{PROFIT_DATA[i]}K
                </Text>
                <div
                  title={`${month}: ¥${PROFIT_DATA[i]}K`}
                  style={{
                    width: '100%', maxWidth: 48,
                    height: h,
                    background: isLatest ? '#7c3aed' : '#c4b5fd',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s, background 0.3s',
                    cursor: 'pointer',
                    minHeight: 4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#7c3aed'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isLatest ? '#7c3aed' : '#c4b5fd'; }}
                />
                <Text type="secondary" style={{ fontSize: 10, marginTop: 6 }}>{month}</Text>
              </div>
            );
          })}
        </div>
      </Card>

      {/* SKU Profit Ranking */}
      <Card
        title={<Text strong style={{ fontSize: 15 }}>SKU 利润排行</Text>}
        size="small"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={RANKING}
          columns={RANK_COLUMNS}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
