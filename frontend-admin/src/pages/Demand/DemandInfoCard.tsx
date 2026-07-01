/**
 * 需求基本信息卡片（P-28 客户信息 + 历史订单）
 * 在 Detail 和 AIPlan 页面共用
 */
import React, { useState, useEffect } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Descriptions, Tag, Table, Empty, Spin, Button } from 'antd';
import { HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import type { DemandDetail } from '@/types/demand';
import { UrgencyLabel, UrgencyColor, SourceLabel, DemandStatusLabel, DemandStatusColor } from '@/types/demand';
import { getCompanyHistoryOrders } from '@/services/company';

const { Item } = Descriptions;

export interface DemandInfoCardProps {
  demand: DemandDetail;
}

const DemandInfoCard: React.FC<DemandInfoCardProps> = ({ demand }) => {
  // 客户历史订单（P-28）
  const [historyOrders, setHistoryOrders] = useState<{
    id: string;
    title: string;
    event_date: string;
    amount: number;
    status: string;
    performer_name?: string;
  }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const loadHistory = () => {
    if (!demand.client_id) return;
    setHistoryLoading(true);
    setHistoryError(false);
    getCompanyHistoryOrders(demand.client_id, 1, 10)
      .then((res) => {
        // 过滤掉当前需求
        setHistoryOrders(
          (res.data.items || []).filter((o) => o.id !== demand.id),
        );
      })
      .catch(() => setHistoryError(true))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [demand.client_id, demand.id]);

  const historyColumns = [
    { title: '订单标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    { title: '日期', dataIndex: 'event_date', key: 'date', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => (
        <Tag
          color={
            (DemandStatusColor as Record<string, string>)[v] || 'default'
          }
        >
          {(DemandStatusLabel as Record<string, string>)[v] || v}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <ProCard title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Item label="活动公司">{demand.client?.name || '-'}</Item>
          <Item label="来源">
            <Tag>{SourceLabel[demand.source]}</Tag>
          </Item>
          <Item label="活动类型">{demand.event_type}</Item>
          <Item label="紧急程度">
            <Tag color={UrgencyColor[demand.urgency]}>
              {UrgencyLabel[demand.urgency]}
            </Tag>
          </Item>
          <Item label="活动日期">{demand.event_date}</Item>
          <Item label="活动时间">{demand.event_time || '-'}</Item>
          <Item label="城市">{demand.city}</Item>
          <Item label="地址">{demand.address}</Item>
          <Item label="观众人数">{demand.audience_count ?? '-'}</Item>
          <Item label="预算">
            {demand.budget ? `¥${demand.budget.toLocaleString()}` : '-'}
          </Item>
          <Item label="演出时长">
            {demand.duration_minutes ? `${demand.duration_minutes}分钟` : '-'}
          </Item>
          <Item label="喜剧风格">{demand.comedy_style || '-'}</Item>
          <Item label="特殊要求" span={2}>
            {demand.special_requirements || '-'}
          </Item>
        </Descriptions>
      </ProCard>

      {/* 客户历史订单卡片（P-28） */}
      <ProCard
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8 }} />
            客户历史订单
            {demand.client?.name && (
              <Tag style={{ marginLeft: 8 }}>{demand.client.name}</Tag>
            )}
          </span>
        }
        style={{ marginBottom: 16 }}
        extra={
          historyError ? (
            <Button
              size="small"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={loadHistory}
            >
              重试
            </Button>
          ) : null
        }
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="small" /> 加载历史订单...
          </div>
        ) : historyError ? (
          <div style={{ color: '#ff4d4f', textAlign: 'center', padding: 16 }}>
            加载失败，请重试
          </div>
        ) : historyOrders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="该客户暂无其他历史订单"
          />
        ) : (
          <Table
            columns={historyColumns}
            dataSource={historyOrders}
            rowKey="id"
            size="small"
            pagination={false}
            onRow={(record) => ({
              style: { cursor: 'pointer' },
              onClick: () => {
                window.location.hash = `#/demand/detail/${record.id}`;
              },
            })}
          />
        )}
      </ProCard>
    </>
  );
};

export default DemandInfoCard;
