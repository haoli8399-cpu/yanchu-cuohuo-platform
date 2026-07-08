import { useState, useCallback } from 'react';
import { Card, Typography, Badge } from 'antd';
import { DollarOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

/* ===== 类型 ===== */
type OppStatus = 'new' | 'qualified' | 'quoted' | 'negotiating' | 'won' | 'lost';

interface OppCard {
  id: string;
  name: string;
  customer: string;
  amount: number;
  priority: 'high' | 'medium' | 'low';
  status: OppStatus;
}

/* ===== 列定义 ===== */
const COLUMNS: { key: OppStatus; label: string; color: string; bg: string }[] = [
  { key: 'new', label: '新商机', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'qualified', label: '已确认', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'quoted', label: '已报价', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'negotiating', label: '谈判中', color: '#ec4899', bg: '#fdf2f8' },
  { key: 'won', label: '已成交', color: '#16a34a', bg: '#f0fdf4' },
];

const LOST_BG = '#f9fafb';

/* ===== Mock 数据 ===== */
const MOCK_OPPS: OppCard[] = [
  { id: '1', name: 'XX科技年会', customer: 'XX科技有限公司', amount: 6000, priority: 'high', status: 'new' },
  { id: '2', name: 'XX地产开盘', customer: 'XX地产集团', amount: 9000, priority: 'high', status: 'new' },
  { id: '3', name: '某银行答谢', customer: '某商业银行', amount: 4500, priority: 'medium', status: 'qualified' },
  { id: '4', name: 'XX保险年会', customer: 'XX保险公司', amount: 12000, priority: 'medium', status: 'qualified' },
  { id: '5', name: 'XX地产开业', customer: 'XX地产集团', amount: 8000, priority: 'medium', status: 'quoted' },
  { id: '6', name: '某科技峰会', customer: '某科技园区', amount: 15000, priority: 'high', status: 'quoted' },
  { id: '7', name: 'XX银行开业', customer: 'XX银行分行', amount: 5500, priority: 'low', status: 'negotiating' },
  { id: '8', name: '某品牌发布会', customer: '某消费品牌', amount: 20000, priority: 'high', status: 'negotiating' },
  { id: '9', name: 'XX社区活动', customer: '某街道办', amount: 3000, priority: 'low', status: 'won' },
  { id: '10', name: '某学校校庆', customer: '某重点中学', amount: 7500, priority: 'medium', status: 'won' },
  { id: '11', name: '某公司团建', customer: '某互联网公司', amount: 4000, priority: 'low', status: 'lost' },
];

/* ===== 优先级标签 ===== */
function PriorityTag({ p }: { p: OppCard['priority'] }) {
  const map: Record<string, { color: string; icon: string }> = {
    high: { color: '#ef4444', icon: '🔴' },
    medium: { color: '#f59e0b', icon: '🟡' },
    low: { color: '#6b7280', icon: '⚪' },
  };
  const m = map[p]!;
  return (
    <span style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>
      {m.icon} {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
    </span>
  );
}

/* ===== 金额格式化 ===== */
function fmt(n: number) {
  return n >= 10000 ? `¥${(n / 10000).toFixed(1)}万` : `¥${n.toLocaleString()}`;
}

export default function SalesKanban() {
  const [opps, setOpps] = useState<OppCard[]>(MOCK_OPPS);
  const [dragId, setDragId] = useState<string | null>(null);

  // 按列分组（won 列放 won；lost 单独一列）
  const grouped: Record<string, OppCard[]> = {};
  COLUMNS.forEach(col => { grouped[col.key] = []; });
  grouped['lost'] = [];
  opps.forEach(o => {
    const arr = grouped[o.status];
    if (arr) arr.push(o);
  });

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, status: OppStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    setOpps(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
    setDragId(null);
    // TODO: 接真实接口 PATCH /v1/opportunities/:id/status { to_status: status }
  }, []);

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 140px)', overflowX: 'auto', paddingBottom: 8 }}>
      {COLUMNS.map(col => (
        <div
          key={col.key}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, col.key)}
          style={{
            flex: '1 0 220px',
            minWidth: 220,
            maxWidth: 300,
            background: col.key === 'won' ? '#f0fdf4' : '#f5f5f7',
            borderRadius: 10,
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'background 0.2s',
          }}
        >
          {/* 列头 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            padding: '0 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: col.color, flexShrink: 0,
              }} />
              <Text strong style={{ fontSize: 13, color: '#1f2937' }}>{col.label}</Text>
            </div>
            <Badge
              count={grouped[col.key]?.length ?? 0}
              style={{ backgroundColor: col.color }}
              overflowCount={99}
            />
          </div>

          {/* 卡片列表 */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(grouped[col.key] ?? []).map(opp => (
              <Card
                key={opp.id}
                size="small"
                draggable
                onDragStart={e => handleDragStart(e, opp.id)}
                onDragEnd={() => setDragId(null)}
                hoverable
                style={{
                  cursor: 'grab',
                  borderRadius: 8,
                  border: opp.id === dragId
                    ? `2px dashed ${col.color}`
                    : `1px solid ${col.key === 'won' ? '#bbf7d0' : '#e5e7eb'}`,
                  background: opp.id === dragId ? '#fff' : '#fff',
                  opacity: opp.id === dragId ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
                styles={{ body: { padding: '8px 16px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13, lineHeight: 1.4, flex: 1 }}>{opp.name}</Text>
                  <PriorityTag p={opp.priority} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                  <UserOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
                  <Text type="secondary" style={{ fontSize: 11 }}>{opp.customer}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarOutlined style={{ fontSize: 10, color: '#7c3aed' }} />
                  <Text style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: col.key === 'won' ? '#16a34a' : '#7c3aed',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {fmt(opp.amount)}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Lost 列 */}
      <div
        style={{
          flex: '1 0 220px',
          minWidth: 220,
          maxWidth: 300,
          background: LOST_BG,
          borderRadius: 10,
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          padding: '0 8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#9ca3af', flexShrink: 0,
            }} />
            <Text strong style={{ fontSize: 13, color: '#6b7280' }}>已流失</Text>
          </div>
          <Badge
            count={grouped['lost'].length}
            style={{ backgroundColor: '#9ca3af' }}
            overflowCount={99}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {grouped['lost'].map(opp => (
            <Card
              key={opp.id}
              size="small"
              hoverable
              style={{
                cursor: 'default',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                opacity: 0.75,
              }}
              styles={{ body: { padding: '8px 16px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, lineHeight: 1.4, flex: 1, color: '#6b7280', textDecoration: 'line-through' }}>
                  {opp.name}
                </Text>
                <PriorityTag p={opp.priority} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                <UserOutlined style={{ fontSize: 10, color: '#d1d5db' }} />
                <Text type="secondary" style={{ fontSize: 11 }}>{opp.customer}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
                <Text style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#9ca3af',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {fmt(opp.amount)}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
