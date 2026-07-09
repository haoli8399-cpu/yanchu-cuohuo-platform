import { useMemo, useState } from 'react';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  RobotOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import DispatchPanel from '../../components/DispatchPanel';

const { RangePicker } = DatePicker;
const { Text } = Typography;

type OrderStatus = 'pending' | 'quoted' | 'confirming' | 'performing' | 'completed' | 'cancelled';

interface SupplierOrder {
  key: string;
  orderNo: string;
  client: string;
  plan: string;
  amount: number;
  status: OrderStatus;
  date: string;
}

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'warning' },
  quoted: { label: '已报价', color: 'processing' },
  confirming: { label: '待确认', color: '#3b82f6' },
  performing: { label: '演出中', color: 'success' },
  completed: { label: '已完成', color: '#16a34a' },
  cancelled: { label: '已取消', color: 'default' },
};

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'quoted', label: '已报价' },
  { value: 'confirming', label: '待确认' },
  { value: 'performing', label: '演出中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const MOCK_ORDERS: SupplierOrder[] = [
  { key: '1', orderNo: 'YL20260701001', client: '星河科技', plan: '脱口秀标准版 60min', amount: 6000, status: 'pending', date: '2026-07-01' },
  { key: '2', orderNo: 'YL20260701002', client: '锦城地产', plan: '魔术喜剧 45min', amount: 3800, status: 'quoted', date: '2026-07-01' },
  { key: '3', orderNo: 'YL20260702003', client: '云启银行', plan: '年会定制套餐', amount: 12000, status: 'confirming', date: '2026-07-02' },
  { key: '4', orderNo: 'YL20260702004', client: '北辰汽车', plan: '即兴喜剧团建 60min', amount: 4500, status: 'performing', date: '2026-07-02' },
  { key: '5', orderNo: 'YL20260703005', client: '万象商业', plan: '漫才双人秀 60min', amount: 8000, status: 'completed', date: '2026-07-03' },
  { key: '6', orderNo: 'YL20260703006', client: '青柠传媒', plan: '亲子喜剧 60min', amount: 5500, status: 'cancelled', date: '2026-07-03' },
  { key: '7', orderNo: 'YL20260704007', client: '鸿远保险', plan: '脱口秀旗舰版 90min', amount: 9000, status: 'quoted', date: '2026-07-04' },
  { key: '8', orderNo: 'YL20260704008', client: '岚山酒店', plan: '路演暖场喜剧', amount: 6800, status: 'pending', date: '2026-07-04' },
  { key: '9', orderNo: 'YL20260705009', client: '合创集团', plan: '商业活动主持 + 脱口秀', amount: 7600, status: 'confirming', date: '2026-07-05' },
  { key: '10', orderNo: 'YL20260705010', client: '悦动体育', plan: '团建即兴工作坊', amount: 5200, status: 'performing', date: '2026-07-05' },
  { key: '11', orderNo: 'YL20260706011', client: '清源医药', plan: '脱口秀低价版 45min', amount: 3800, status: 'completed', date: '2026-07-06' },
  { key: '12', orderNo: 'YL20260706012', client: '南桥文旅', plan: '大型年会喜剧拼盘', amount: 15000, status: 'pending', date: '2026-07-06' },
];

function formatMoney(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`;
}

export default function Orders() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState<{ orderId: string; orderNo: string; plan: string } | null>(null);

  const filteredOrders = useMemo(() => {
    const [start, end] = dateRange || [];
    return MOCK_ORDERS.filter((order) => {
      const text = `${order.orderNo}${order.client}${order.plan}`;
      const keywordMatched = !keyword || text.toLowerCase().includes(keyword.trim().toLowerCase());
      const statusMatched = status === 'all' || order.status === status;
      const date = order.date;
      const afterStart = !start || date >= start.format('YYYY-MM-DD');
      const beforeEnd = !end || date <= end.format('YYYY-MM-DD');
      return keywordMatched && statusMatched && afterStart && beforeEnd;
    });
  }, [keyword, status, dateRange]);

  const kpis = useMemo(() => {
    return [
      { title: '待处理订单', value: MOCK_ORDERS.filter((item) => item.status === 'pending').length, icon: <ClockCircleOutlined />, color: '#f59e0b' },
      { title: '待确认', value: MOCK_ORDERS.filter((item) => item.status === 'confirming').length, icon: <FieldTimeOutlined />, color: '#3b82f6' },
      { title: '演出中', value: MOCK_ORDERS.filter((item) => item.status === 'performing').length, icon: <SyncOutlined />, color: '#16a34a' },
      { title: '已完成', value: MOCK_ORDERS.filter((item) => item.status === 'completed').length, icon: <CheckCircleOutlined />, color: '#16a34a' },
    ];
  }, []);

  const columns: ColumnsType<SupplierOrder> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (value: string) => <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{value}</Text>,
    },
    {
      title: '客户',
      dataIndex: 'client',
      key: 'client',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    { title: '方案', dataIndex: 'plan', key: 'plan' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (value: number) => (
        <Text style={{ color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          {formatMoney(value)}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: OrderStatus) => {
        const meta = STATUS_META[value];
        return <Tag color={meta.color} style={{ border: 'none', fontWeight: 600 }}>{meta.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" style={{ paddingRight: 0 }} onClick={() => { /* TODO: 跳转订单详情 */ }}>
            查看详情
          </Button>
          <Button type="link" style={{ paddingRight: 0 }} icon={<RobotOutlined />}
            onClick={() => { setDispatchOrder({ orderId: record.orderNo, orderNo: record.orderNo, plan: record.plan }); setDispatchOpen(true); }}>
            派单
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f6f7fb', minHeight: 'calc(100vh - 64px)' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {kpis.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card size="small" styles={{ body: { padding: 16 } }}>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={<span style={{ color: item.color }}>{item.icon}</span>}
                valueStyle={{ color: '#111827', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Space size={16} wrap>
          <Input
            allowClear
            placeholder="搜索订单号"
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 260 }}
          />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 160 }}
          />
          <RangePicker
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
            placeholder={['开始日期', '结束日期']}
          />
        </Space>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      <DispatchPanel
        open={dispatchOpen}
        order={dispatchOrder}
        onClose={() => setDispatchOpen(false)}
      />
    </div>
  );
}
