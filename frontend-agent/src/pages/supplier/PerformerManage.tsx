import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  Button, Card, Drawer, Empty, Form, Input, Modal, Select, Space, Table, Tag, Typography,
} from 'antd';
import {
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined,
  EditOutlined, PlusOutlined, SearchOutlined, WalletOutlined, WarningOutlined,
} from '@ant-design/icons';
import {
  createPerformer, deletePerformer, fetchPerformerDetail, fetchPerformers,
  type Performer, type PerformerDetail, type PerformerTier, type ScheduleStatus,
} from '../../services/supplier';

const { Text } = Typography;

const TIER_OPTIONS: PerformerTier[] = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

const SCHEDULE_META: Record<ScheduleStatus, { label: string; color: string }> = {
  available: { label: '档期空闲', color: 'green' },
  busy: { label: '档期繁忙', color: 'orange' },
};

export default function PerformerManage() {
  const [data, setData] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<Performer | null>(null);
  const [detail, setDetail] = useState<PerformerDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchPerformers().then((list) => { setData(list); setLoading(false); });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () => data.filter((p) => p.name.includes(search) || search === ''),
    [data, search]
  );

  const columns: ColumnsType<Performer> = [
    {
      title: '姓名', dataIndex: 'name', key: 'name',
      render: (name: string) => <Text strong style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: '级别', dataIndex: 'tier', key: 'tier',
      render: (t: PerformerTier) => <Tag color="#7c3aed" style={{ border: 'none', fontWeight: 600 }}>{t}</Tag>,
    },
    {
      title: '档期状态', dataIndex: 'scheduleStatus', key: 'scheduleStatus',
      render: (s: ScheduleStatus) => {
        const m = SCHEDULE_META[s];
        return <Tag color={m.color} style={{ border: 'none', fontWeight: 600 }}>{m.label}</Tag>;
      },
    },
    {
      title: '信誉分', dataIndex: 'creditScore', key: 'creditScore',
      render: (v: number) => (
        <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: v >= 90 ? '#16a34a' : '#111827' }}>
          {v}
        </Text>
      ),
    },
    {
      title: '近 3 月成交', dataIndex: 'deals3m', key: 'deals3m',
      render: (v: number) => <Text style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v} 单</Text>,
    },
    {
      title: '操作', key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => { setCurrent(record); setDetailOpen(true); setDetail(null); fetchPerformerDetail(record.id).then(setDetail); }}>
            查看详情
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `确认删除艺人「${record.name}」？`,
                okText: '删除', okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => deletePerformer(record.id).then(load),
              });
            }}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    await createPerformer({
      name: values.name,
      tier: values.tier,
      contact: values.contact,
      intro: values.intro ?? '',
      scheduleStatus: 'available',
    });
    setSubmitting(false);
    setModalOpen(false);
    form.resetFields();
    load();
  };

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: '16px 24px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Input
            placeholder="搜索艺人姓名..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            onClick={() => setModalOpen(true)}>
            添加艺人
          </Button>
        </div>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 位艺人` }}
          locale={{ emptyText: <Empty description="暂无艺人数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </Card>

      {/* 添加艺人 Modal */}
      <Modal
        title="添加艺人"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleAdd}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="如：王建国" />
          </Form.Item>
          <Form.Item name="tier" label="级别 (Tier)" rules={[{ required: true, message: '请选择级别' }]}
            initialValue="T3">
            <Select options={TIER_OPTIONS.map((t) => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="contact" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
            <Input placeholder="手机号 / 微信" />
          </Form.Item>
          <Form.Item name="intro" label="简介">
            <Input.TextArea rows={3} placeholder="擅长风格 / 适配场景" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 艺人详情抽屉 */}
      <Drawer
        title={current ? `艺人详情 · ${current.name}` : '艺人详情'}
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {current && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small">
              <Space size={24} wrap>
                <div><Text type="secondary" style={{ fontSize: 12 }}>级别</Text><div style={{ fontWeight: 700 }}>{current.tier}</div></div>
                <div><Text type="secondary" style={{ fontSize: 12 }}>信誉分</Text><div style={{ fontWeight: 700 }}>{current.creditScore}</div></div>
                <div><Text type="secondary" style={{ fontSize: 12 }}>近3月成交</Text><div style={{ fontWeight: 700 }}>{current.deals3m} 单</div></div>
              </Space>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>联系方式：</Text>{current.contact}
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>简介：</Text>{current.intro}
              </div>
            </Card>

            <Section title="排期日历" icon={<CalendarOutlined />}>
              {detail ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {detail.schedule.map((s) => (
                    <div key={s.date} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.date}</Text>
                      <Text>{s.plan}</Text>
                    </div>
                  ))}
                </Space>
              ) : <Text type="secondary">加载中...</Text>}
            </Section>

            <Section title="签到记录" icon={<CheckCircleOutlined />}>
              {detail ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {detail.checkins.map((c) => (
                    <div key={c.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.date}</Text>
                      <Tag color={c.status === 'signed' ? 'green' : c.status === 'late' ? 'red' : 'orange'}
                        style={{ border: 'none' }}>{c.status === 'signed' ? '已签到' : c.status === 'late' ? '迟到' : '未签到'}</Tag>
                    </div>
                  ))}
                </Space>
              ) : <Text type="secondary">加载中...</Text>}
            </Section>

            <Section title="结算明细" icon={<WalletOutlined />}>
              {detail ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {detail.settlements.map((s) => (
                    <div key={s.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>{s.month}</Text>
                      <Space>
                        <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>¥{s.amount.toLocaleString()}</Text>
                        <Tag color={s.status === 'settled' ? 'green' : 'orange'} style={{ border: 'none' }}>{s.status === 'settled' ? '已结算' : '待结算'}</Tag>
                      </Space>
                    </div>
                  ))}
                </Space>
              ) : <Text type="secondary">加载中...</Text>}
            </Section>

            <Section title="信誉变动" icon={<WarningOutlined />}>
              {detail ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {detail.creditLogs.map((c) => (
                    <div key={c.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.date}</Text>
                      <Space>
                        <Text style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.score}</Text>
                        <Tag color={c.change >= 0 ? 'green' : 'red'} style={{ border: 'none' }}>{c.change >= 0 ? `+${c.change}` : c.change}</Tag>
                      <Text type="secondary">{c.reason}</Text>
                      </Space>
                    </div>
                  ))}
                </Space>
              ) : <Text type="secondary">加载中...</Text>}
            </Section>
          </Space>
        )}
      </Drawer>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card size="small" title={<Space><span style={{ color: '#7c3aed' }}>{icon}</span>{title}</Space>} />
  );
}
