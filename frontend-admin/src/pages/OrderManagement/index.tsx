/**
 * 订单管理列表页 (P-15/P-12/P-16/P-27, P0)
 *
 * 功能：
 * - 所有订单一览，按状态筛选
 * - 推进订单状态
 * - 排期分配入口
 * - 退款处理（P-16）
 * - 超时自动标记（P-27）
 *
 * 三态处理：loading / empty / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-5: 错误显示友好提示 + 重试
 * - API-7: 所有 API 调用通过 apiClient
 */
import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  Button,
  Tag,
  Space,
  message,
  Modal,
  Select,
  InputNumber,
  Input,
  Form,
  Descriptions,
  Empty,
  Result,
  Tabs,
  Badge,
  Tooltip,
} from 'antd';
import {
  ReloadOutlined,
  StepForwardOutlined,
  ScheduleOutlined,
  EyeOutlined,
  HistoryOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { DemandListItem, DemandStatus, DemandDetail } from '@/types/demand';
import {
  DemandStatusLabel,
  DemandStatusColor,
} from '@/types/demand';
import type { OrderTimelineItem } from '@/types/order';
import { advanceOrderStatus, getOrderTimeline } from '@/services/order';
import { getDemandList, getDemandDetail } from '@/services/demand';
import { createRefund } from '@/services/refund';
import { DEFAULT_REFUND_RULES } from '@/types/refund';

const { TextArea } = Input;

/** 订单可推进的目标状态映射 */
const NEXT_STATUS_MAP: Record<string, DemandStatus[]> = {
  pending_deposit: ['deposit_received'],
  deposit_received: ['pending_performer'],
  pending_performer: ['performer_confirmed'],
  performer_confirmed: ['performing'],
  performing: ['finished'],
  finished: ['pending_final_payment'],
  pending_final_payment: ['final_payment_received'],
  final_payment_received: ['settled'],
  pending_client_confirm: ['confirmed'],
  confirmed: ['pending_deposit'],
};

/** 订单状态标签页 */
const STATUS_TABS = [
  { key: '', tab: '全部' },
  { key: 'pending_deposit', tab: '待付定金' },
  { key: 'pending_performer', tab: '待排期' },
  { key: 'performing', tab: '演出中' },
  { key: 'pending_final_payment', tab: '待付尾款' },
  { key: 'settled', tab: '已结算' },
  { key: 'cancelled', tab: '已取消' },
];

const OrderListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState('');

  // 状态推进弹窗
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advancingOrder, setAdvancingOrder] = useState<DemandListItem | null>(null);
  const [advanceTarget, setAdvanceTarget] = useState<DemandStatus | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number | null>(null);
  const [advanceMethod, setAdvanceMethod] = useState<string>('');
  const [advanceNote, setAdvanceNote] = useState<string>('');
  const [advancing, setAdvancing] = useState(false);

  // 时间线弹窗
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineData, setTimelineData] = useState<OrderTimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // 退款弹窗（P-16）
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundingOrder, setRefundingOrder] = useState<DemandListItem | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');
  const [refunding, setRefunding] = useState(false);

  /** 检查订单是否超时（P-27） */
  const isTimeout = (record: DemandListItem): { overdue: boolean; hint: string } => {
    const now = Date.now();
    const created = new Date(record.created_at).getTime();
    const hoursSinceCreate = (now - created) / (1000 * 60 * 60);

    // 超时阈值：各状态超过设定时间
    const timeoutHours: Partial<Record<DemandStatus, number>> = {
      pending_ai: 1,
      ai_generated: 2,
      pending_operator: 4,
      operator_adjusted: 2,
      pending_client_confirm: 24,
      pending_deposit: 48,
      pending_performer: 8,
      pending_final_payment: 48,
    };

    const threshold = timeoutHours[record.status];
    if (threshold && hoursSinceCreate > threshold) {
      return { overdue: true, hint: `已等待 ${Math.round(hoursSinceCreate)} 小时` };
    }
    return { overdue: false, hint: '' };
  };

  /** 推荐退款金额（按阶梯规则） */
  const getSuggestedRefundAmount = (demand: DemandListItem): number => {
    if (!demand.budget) return 0;
    const now = Date.now();
    const eventDate = new Date(demand.event_date).getTime();
    const daysBeforeEvent = (eventDate - now) / (1000 * 60 * 60 * 24);

    for (const rule of DEFAULT_REFUND_RULES) {
      if (daysBeforeEvent >= rule.days_before) {
        return Math.round(demand.budget * rule.ratio);
      }
    }
    return Math.round(demand.budget * 0.3); // 当天
  };

  /** 打开退款弹窗 */
  const handleOpenRefund = (record: DemandListItem) => {
    setRefundingOrder(record);
    setRefundAmount(getSuggestedRefundAmount(record));
    setRefundReason('');
    setRefundModalOpen(true);
  };

  /** 提交退款 */
  const handleSubmitRefund = async () => {
    if (!refundingOrder || refundAmount <= 0) {
      message.warning('请输入退款金额');
      return;
    }
    setRefunding(true);
    try {
      await createRefund({
        demand_id: refundingOrder.id,
        amount: refundAmount,
        reason: refundReason || '运营处理退款',
      });
      message.success('退款申请已提交');
      setRefundModalOpen(false);
      actionRef.current?.reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '退款申请失败');
    } finally {
      setRefunding(false);
    }
  };

  /** 打开时间线 */
  const handleViewTimeline = async (demandId: string) => {
    setTimelineModalOpen(true);
    setTimelineLoading(true);
    try {
      const res = await getOrderTimeline(demandId);
      setTimelineData(res.data);
    } catch {
      message.error('加载时间线失败');
    } finally {
      setTimelineLoading(false);
    }
  };

  /** 打开状态推进弹窗 */
  const handleOpenAdvance = (record: DemandListItem) => {
    const availableNext = NEXT_STATUS_MAP[record.status];
    if (!availableNext || availableNext.length === 0) {
      message.warning('当前状态无法推进');
      return;
    }
    setAdvancingOrder(record);
    setAdvanceTarget(availableNext[0]);
    setAdvanceAmount(null);
    setAdvanceMethod('');
    setAdvanceNote('');
    setAdvanceModalOpen(true);
  };

  /** 执行状态推进 */
  const handleAdvance = async () => {
    if (!advancingOrder || !advanceTarget) return;
    setAdvancing(true);

    const metadata: Record<string, unknown> = {};
    // 定金/尾款登记时，金额必填
    if (
      (advanceTarget === 'deposit_received' || advanceTarget === 'final_payment_received') &&
      advanceAmount
    ) {
      metadata.amount = advanceAmount;
      metadata.method = advanceMethod || '银行转账';
    }
    if (advanceNote) {
      metadata.note = advanceNote;
    }

    try {
      await advanceOrderStatus(advancingOrder.id, {
        to_status: advanceTarget,
        metadata: Object.keys(metadata).length > 0 ? metadata as { amount?: number; method?: string; note?: string } : undefined,
      });
      message.success(`订单状态已推进至「${DemandStatusLabel[advanceTarget]}」`);
      setAdvanceModalOpen(false);
      actionRef.current?.reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '状态推进失败');
    } finally {
      setAdvancing(false);
    }
  };

  const columns: ProColumns<DemandListItem>[] = [
    {
      title: '订单/需求',
      dataIndex: 'title',
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '活动公司',
      width: 120,
      search: false,
      render: (_, record) => record.client?.name || '-',
    },
    {
      title: '活动日期',
      dataIndex: 'event_date',
      width: 110,
      search: false,
      sorter: true,
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 90,
      search: false,
    },
    {
      title: '预算',
      dataIndex: 'budget',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) =>
        record.budget ? `¥${record.budget.toLocaleString()}` : '-',
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      width: 140,
      render: (_, record) => {
        const timeout = isTimeout(record);
        return (
          <Space size={4}>
            <Tag color={DemandStatusColor[record.status]}>
              {DemandStatusLabel[record.status]}
            </Tag>
            {timeout.overdue && (
              <Tooltip title={timeout.hint}>
                <Tag color="red" icon={<ClockCircleOutlined />}>
                  待跟进
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 160,
      search: false,
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      search: false,
      render: (_, record) => {
        const hasNext = (NEXT_STATUS_MAP[record.status]?.length ?? 0) > 0;
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              style={{ minHeight: 44, minWidth: 44 }}
              onClick={() => {
                window.location.hash = `#/demand/detail/${record.id}`;
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              style={{ minHeight: 44, minWidth: 44 }}
              onClick={() => handleViewTimeline(record.id)}
            >
              时间线
            </Button>
            {hasNext && (
              <Button
                type="link"
                size="small"
                icon={<StepForwardOutlined />}
                style={{ minHeight: 44, minWidth: 44, color: '#1677ff' }}
                onClick={() => handleOpenAdvance(record)}
              >
                推进
              </Button>
            )}
            <Button
              type="link"
              size="small"
              icon={<ScheduleOutlined />}
              style={{ minHeight: 44, minWidth: 44, color: '#52c41a' }}
              onClick={() => {
                window.location.hash = `#/orders/assign/${record.id}`;
              }}
            >
              排期
            </Button>
            <Button
              type="link"
              size="small"
              icon={<DollarOutlined />}
              style={{ minHeight: 44, minWidth: 44, color: '#ff4d4f' }}
              onClick={() => handleOpenRefund(record)}
            >
              退款
            </Button>
          </Space>
        );
      },
    },
  ];

  // 错误状态
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="订单列表加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                setError(null);
                actionRef.current?.reload();
              }}
              style={{ minHeight: 44 }}
            >
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 状态标签页快速筛选 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          actionRef.current?.reload();
        }}
        style={{ marginBottom: 16 }}
      >
        {STATUS_TABS.map((tab) => (
          <Tabs.TabPane tab={tab.tab} key={tab.key} />
        ))}
      </Tabs>

      <ProTable<DemandListItem>
        headerTitle="订单管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 1400 }}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getDemandList({
              page,
              pageSize,
              role: 'all',
              status: (activeTab || undefined) as DemandStatus | undefined,
            });
            return {
              data: res.data.items,
              success: true,
              total: res.data.total,
            };
          } catch (err) {
            setError(err instanceof Error ? err : new Error('加载失败'));
            return { data: [], success: false, total: 0 };
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无订单"
            />
          ),
        }}
      />

      {/* 状态推进弹窗 */}
      <Modal
        title="推进订单状态"
        open={advanceModalOpen}
        onCancel={() => setAdvanceModalOpen(false)}
        onOk={handleAdvance}
        confirmLoading={advancing}
        okText="确认推进"
        cancelText="取消"
        destroyOnClose
      >
        {advancingOrder && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="订单">
                {advancingOrder.title}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={DemandStatusColor[advancingOrder.status]}>
                  {DemandStatusLabel[advancingOrder.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="目标状态">
                {advanceTarget ? (
                  <Tag color={DemandStatusColor[advanceTarget]}>
                    {DemandStatusLabel[advanceTarget]}
                  </Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* 推进目标选择 */}
        {advancingOrder && NEXT_STATUS_MAP[advancingOrder.status] && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>目标状态：</div>
            <Select<DemandStatus>
              value={advanceTarget}
              onChange={setAdvanceTarget}
              style={{ width: '100%' }}
              options={NEXT_STATUS_MAP[advancingOrder.status].map((s) => ({
                label: DemandStatusLabel[s],
                value: s,
              }))}
            />
          </div>
        )}

        {/* 收款信息（定金/尾款登记时显示） */}
        {(advanceTarget === 'deposit_received' ||
          advanceTarget === 'final_payment_received') && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>收款金额（元）：</div>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入收款金额"
                min={0}
                precision={2}
                value={advanceAmount}
                onChange={(v) => setAdvanceAmount(v)}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>收款方式：</div>
              <Select
                style={{ width: '100%' }}
                placeholder="选择收款方式"
                value={advanceMethod || undefined}
                onChange={setAdvanceMethod}
                options={[
                  { label: '银行转账', value: '银行转账' },
                  { label: '微信转账', value: '微信转账' },
                  { label: '支付宝', value: '支付宝' },
                ]}
              />
            </div>
          </>
        )}

        {/* 备注 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>备注（可选）：</div>
          <TextArea
            rows={2}
            placeholder="备注信息..."
            value={advanceNote}
            onChange={(e) => setAdvanceNote(e.target.value)}
          />
        </div>
      </Modal>

      {/* 时间线弹窗 */}
      <Modal
        title="订单时间线"
        open={timelineModalOpen}
        onCancel={() => setTimelineModalOpen(false)}
        footer={null}
        width={600}
      >
        {timelineLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : timelineData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无时间线记录
          </div>
        ) : (
          <div>
            {timelineData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  padding: '12px 0',
                  borderBottom: index < timelineData.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div style={{ minWidth: 120, color: '#999', fontSize: 13 }}>
                  {new Date(item.at).toLocaleString('zh-CN')}
                </div>
                <div style={{ flex: 1 }}>
                  <Tag color={DemandStatusColor[item.status]}>
                    {item.label}
                  </Tag>
                  {item.operator && (
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#666' }}>
                      操作人：{item.operator.name}
                    </span>
                  )}
                  {item.note && (
                    <div style={{ marginTop: 4, fontSize: 13, color: '#999' }}>
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderListPage;
