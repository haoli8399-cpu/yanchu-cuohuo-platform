import { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Input, Select, Typography, Badge, Tooltip,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  StopOutlined, CheckCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

/* ===== Mock Data ===== */
const SKU_DATA = [
  { key: '1', name: '脱口秀标准版 60min', type: '脱口秀', stdPrice: '¥6,000', chPrice: '¥4,200', tier: 'T3', status: 'active' },
  { key: '2', name: '脱口秀旗舰版 90min', type: '脱口秀', stdPrice: '¥9,000', chPrice: '¥6,300', tier: 'T2', status: 'active' },
  { key: '3', name: '脱口秀低价版 45min', type: '脱口秀', stdPrice: '¥3,800', chPrice: '¥2,660', tier: 'T4', status: 'active' },
  { key: '4', name: '即兴喜剧 60min', type: '即兴喜剧', stdPrice: '¥4,500', chPrice: '¥3,150', tier: 'T3', status: 'active' },
  { key: '5', name: '魔术喜剧 45min', type: '魔术喜剧', stdPrice: '¥3,800', chPrice: '¥2,660', tier: 'T4', status: 'active' },
  { key: '6', name: '漫才专场 60min', type: '漫才', stdPrice: '¥8,000', chPrice: '¥5,600', tier: 'T2', status: 'draft' },
  { key: '7', name: '年会定制套餐', type: '脱口秀', stdPrice: '¥12,000', chPrice: '¥8,400', tier: 'T1', status: 'active' },
  { key: '8', name: '亲子喜剧 60min', type: '亲子喜剧', stdPrice: '¥5,500', chPrice: '¥3,850', tier: 'T3', status: 'inactive' },
  { key: '9', name: '喜剧魔术 90min', type: '魔术喜剧', stdPrice: '¥6,500', chPrice: '¥4,550', tier: 'T3', status: 'draft' },
  { key: '10', name: '脱口秀超值版 30min', type: '脱口秀', stdPrice: '¥2,500', chPrice: '¥1,750', tier: 'T5', status: 'inactive' },
];

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '已上架' },
  draft: { color: 'orange', label: '草稿' },
  inactive: { color: 'red', label: '已下架' },
};

const TYPE_OPTIONS = ['全部', '脱口秀', '即兴喜剧', '魔术喜剧', '亲子喜剧', '漫才'];
const STATUS_OPTIONS = ['全部状态', '已上架', '草稿', '已下架'];

export default function SkuManage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部状态');

  const filtered = SKU_DATA.filter((sku) => {
    const matchSearch = sku.name.includes(search) || search === '';
    const matchType = typeFilter === '全部' || sku.type === typeFilter;
    const statusLabel = STATUS_MAP[sku.status].label;
    const matchStatus = statusFilter === '全部状态' || statusLabel === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const columns = [
    {
      title: '方案名称', dataIndex: 'name', key: 'name',
      render: (name: string) => <Text strong style={{ fontSize: 13 }}>{name}</Text>,
    },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
    {
      title: '标准价', dataIndex: 'stdPrice', key: 'stdPrice',
      render: (p: string) => <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 13 }}>{p}</Text>,
    },
    {
      title: '渠道价', dataIndex: 'chPrice', key: 'chPrice',
      render: (p: string) => <Text type="secondary" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{p}</Text>,
    },
    { title: '级别', dataIndex: 'tier', key: 'tier' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => {
        const st = STATUS_MAP[s];
        return <Tag color={st.color} style={{ fontWeight: 600, border: 'none' }}>{st.label}</Tag>;
      },
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: typeof SKU_DATA[0]) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small">
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header + Search */}
      <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
            <Input
              placeholder="搜索方案名称..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={TYPE_OPTIONS.map((o) => ({ value: o, label: o }))}
              style={{ width: 120 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
              style={{ width: 120 }}
            />
          </div>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
            新建方案
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 个方案` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
