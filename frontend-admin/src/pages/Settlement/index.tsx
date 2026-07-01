/**
 * 结算管理页 (P-19, P0)
 *
 * 功能：
 * - 按演员统计待结算/已结算总额
 * - 标记已结算
 * - 按月份筛选
 *
 * 三态处理：loading / empty / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-5: 错误显示友好提示 + 重试
 * - API-7: 所有 API 调用通过 apiClient
 */
import React, { useState, useEffect } from 'react';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Tag,
  message,
  Modal,
  DatePicker,
  Statistic,
  Row,
  Col,
  Result,
  Spin,
  Empty,
} from 'antd';
import {
  ReloadOutlined,
  CheckOutlined,
  DollarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { SettlementItem, SettlementDetailItem } from '@/types/settlement';
import { PerformerTierLabel, PerformerTierColor } from '@/types/performer';
import { getSettlementList, markSettled, exportSettlement } from '@/services/settlement';
import dayjs from 'dayjs';

/** 格式化金额（元） */
function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const SettlementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SettlementItem[]>([]);
  const [summary, setSummary] = useState({ total_pending: 0, total_settled: 0 });
  const [period, setPeriod] = useState<string>(dayjs().format('YYYY-MM'));

  // 标记已结算弹窗
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settlingItem, setSettlingItem] = useState<{
    performerId: string;
    demandId: string;
    amount: number;
    performerName: string;
    demandTitle: string;
  } | null>(null);
  const [settling, setSettling] = useState(false);

  /** 加载结算数据 */
  const loadData = () => {
    setLoading(true);
    setError(null);
    getSettlementList(period)
      .then((res) => {
        setData(res.data.items || []);
        setSummary(res.data.summary || { total_pending: 0, total_settled: 0 });
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('加载失败'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [period]);

  /** 标记已结算 */
  const handleMarkSettled = async () => {
    if (!settlingItem) return;
    setSettling(true);
    try {
      await markSettled(settlingItem.demandId);
      message.success('已标记为已结算');
      setSettleModalOpen(false);
      loadData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSettling(false);
    }
  };

  /** 导出结算明细（P-20） */
  const handleExport = async () => {
    try {
      message.loading({ content: '正在生成导出文件...', key: 'export' });
      const res = await exportSettlement(period);
      if (res.data.download_url) {
        window.open(res.data.download_url, '_blank');
      }
      message.success({ content: '导出成功', key: 'export' });
    } catch (err) {
      message.error({
        content: err instanceof Error ? err.message : '导出失败',
        key: 'export',
      });
    }
  };

  /** 结算明细列 */
  const detailColumns: ProColumns<SettlementDetailItem>[] = [
    { title: '订单', dataIndex: 'demand_title', width: 200, ellipsis: true },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      render: (_, record) => formatMoney(record.amount),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.status === 'settled' ? 'green' : 'orange'}>
          {record.status === 'settled' ? '已结算' : '待结算'}
        </Tag>
      ),
    },
    {
      title: '结算时间',
      dataIndex: 'settled_at',
      width: 160,
      render: (_, record) =>
        record.settled_at
          ? new Date(record.settled_at).toLocaleString('zh-CN')
          : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => {
        if (record.status === 'settled') return null;
        return (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            style={{ minHeight: 44, minWidth: 44, color: '#52c41a' }}
            onClick={() => {
              // 找到所属演员
              const parent = data.find((d) =>
                d.details?.some((det) => det.demand_id === record.demand_id),
              );
              setSettlingItem({
                performerId: parent?.performer?.id || '',
                demandId: record.demand_id,
                amount: record.amount,
                performerName: parent?.performer?.name || '',
                demandTitle: record.demand_title,
              });
              setSettleModalOpen(true);
            }}
          >
            标记已结算
          </Button>
        );
      },
    },
  ];

  // 错误
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="结算数据加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={loadData}
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
      {/* 月度筛选 + 汇总卡片 */}
      <ProCard style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <DatePicker
              picker="month"
              value={dayjs(period)}
              onChange={(date) => {
                if (date) setPeriod(date.format('YYYY-MM'));
              }}
              allowClear={false}
              style={{ minHeight: 44 }}
            />
          </Col>
          <Col flex="auto">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="待结算总额"
                  value={summary.total_pending}
                  prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                  precision={0}
                  formatter={(val) => formatMoney(Number(val))}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已结算总额"
                  value={summary.total_settled}
                  prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
                  precision={0}
                  formatter={(val) => formatMoney(Number(val))}
                />
              </Col>
              <Col span={8}>
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    type="primary"
                    style={{ minHeight: 44, marginTop: 16 }}
                    onClick={handleExport}
                  >
                    导出Excel
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    style={{ minHeight: 44, marginTop: 16 }}
                    onClick={loadData}
                  >
                    刷新
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </ProCard>

      {/* 结算列表（按演员分组，可展开） */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载结算数据..." />
        </div>
      ) : data.length === 0 ? (
        <Empty description="暂无结算数据" />
      ) : (
        data.map((item) => (
          <ProCard
            key={item.performer.id}
            title={
              <span>
                <span style={{ fontWeight: 600, marginRight: 8 }}>
                  {item.performer.name}
                </span>
                <Tag color={PerformerTierColor[item.performer.tier]}>
                  {PerformerTierLabel[item.performer.tier]}
                </Tag>
              </span>
            }
            extra={
              <Row gutter={16}>
                <Col>
                  <Statistic
                    title="待结算"
                    value={item.pending_amount}
                    precision={0}
                    formatter={(val) => formatMoney(Number(val))}
                    valueStyle={{ color: '#faad14', fontSize: 16 }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="已结算"
                    value={item.settled_amount}
                    precision={0}
                    formatter={(val) => formatMoney(Number(val))}
                    valueStyle={{ color: '#52c41a', fontSize: 16 }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="合计"
                    value={item.total_amount}
                    precision={0}
                    formatter={(val) => formatMoney(Number(val))}
                    valueStyle={{ fontSize: 16 }}
                  />
                </Col>
              </Row>
            }
            style={{ marginBottom: 16 }}
            collapsible
            defaultCollapsed
          >
            <ProTable<SettlementDetailItem>
              rowKey="demand_id"
              search={false}
              toolBarRender={false}
              dataSource={item.details || []}
              columns={detailColumns}
              pagination={false}
              locale={{ emptyText: '暂无明细' }}
            />
          </ProCard>
        ))
      )}

      {/* 标记已结算确认弹窗 */}
      <Modal
        title="确认标记已结算"
        open={settleModalOpen}
        onCancel={() => setSettleModalOpen(false)}
        onOk={handleMarkSettled}
        confirmLoading={settling}
        okText="确认结算"
        cancelText="取消"
      >
        {settlingItem && (
          <div>
            <p>
              确认将以下订单标记为「已结算」？
            </p>
            <div style={{ background: '#f6f8fa', padding: 12, borderRadius: 6 }}>
              <div><strong>演员：</strong>{settlingItem.performerName}</div>
              <div><strong>订单：</strong>{settlingItem.demandTitle}</div>
              <div>
                <strong>金额：</strong>
                <span style={{ color: '#1677ff', fontWeight: 600 }}>
                  {formatMoney(settlingItem.amount)}
                </span>
              </div>
            </div>
            <p style={{ marginTop: 12, color: '#999', fontSize: 13 }}>
              结算后，后仰将按此金额向演员打款（线下操作）。
            </p>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default SettlementPage;
