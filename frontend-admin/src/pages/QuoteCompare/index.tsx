import React, { useMemo, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag, Space, Tooltip, Input, Typography } from 'antd';
import apiClient from '@/services/apiClient';

const { Text } = Typography;

interface QuoteItemSnapshot {
  tier?: string;
  duration?: number;
  price?: number;
  [key: string]: unknown;
}

interface QuoteVersion {
  id: string;
  opportunity_id: string;
  version: number;
  total_price: number;
  status: string;
  created_at: string;
  ai_generated?: boolean;
  items_snapshot?: QuoteItemSnapshot[] | QuoteItemSnapshot | string | null;
}

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  sent: { color: 'blue', label: '已发送' },
  viewed: { color: 'purple', label: '已查看' },
  confirmed: { color: 'green', label: '已确认' },
  rejected: { color: 'red', label: '已拒绝' },
  expired: { color: 'orange', label: '已过期' },
};

const compareFields: Array<keyof QuoteItemSnapshot> = ['tier', 'duration', 'price'];

function formatMoney(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return `¥${Number(value).toLocaleString()}`;
}

function formatTime(value?: string): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function normalizeSnapshot(snapshot: QuoteVersion['items_snapshot']): QuoteItemSnapshot {
  if (!snapshot) return {};
  const parsed = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
  if (Array.isArray(parsed)) return parsed[0] || {};
  return parsed || {};
}

const QuoteComparePage: React.FC = () => {
  const [opportunityId, setOpportunityId] = useState('');
  const [selectedRows, setSelectedRows] = useState<QuoteVersion[]>([]);

  const diffFields = useMemo(() => {
    if (selectedRows.length !== 2) return new Set<keyof QuoteItemSnapshot>();

    const [first, second] = selectedRows.map((row) => {
      try {
        return normalizeSnapshot(row.items_snapshot);
      } catch {
        return {};
      }
    });

    return new Set(compareFields.filter((field) => first[field] !== second[field]));
  }, [selectedRows]);

  const renderCompareField = (record: QuoteVersion, field: keyof QuoteItemSnapshot) => {
    let snapshot: QuoteItemSnapshot = {};
    try {
      snapshot = normalizeSnapshot(record.items_snapshot);
    } catch {
      snapshot = {};
    }

    const value = field === 'price' ? formatMoney(Number(snapshot[field])) : snapshot[field] ?? '-';
    const highlighted = selectedRows.some((row) => row.id === record.id) && diffFields.has(field);

    return <Text type={highlighted ? 'danger' : undefined}>{String(value)}</Text>;
  };

  const columns: ProColumns<QuoteVersion>[] = [
    {
      title: '版本号',
      dataIndex: 'version',
      width: 120,
      render: (_, record) => (
        <Space size={6}>
          <Text strong>v{record.version}</Text>
          {record.ai_generated && (
            <Tooltip title="AI 生成">
              <span>🤖</span>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '金额',
      dataIndex: 'total_price',
      width: 140,
      render: (_, record) => formatMoney(record.total_price),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => {
        const status = statusMap[record.status] || { color: 'default', label: record.status };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (_, record) => formatTime(record.created_at),
    },
    {
      title: 'tier',
      dataIndex: 'tier',
      width: 100,
      search: false,
      render: (_, record) => renderCompareField(record, 'tier'),
    },
    {
      title: 'duration',
      dataIndex: 'duration',
      width: 120,
      search: false,
      render: (_, record) => renderCompareField(record, 'duration'),
    },
    {
      title: 'price',
      dataIndex: 'price',
      width: 120,
      search: false,
      render: (_, record) => renderCompareField(record, 'price'),
    },
  ];

  return (
    <PageContainer header={{ title: '报价版本', breadcrumb: {} }}>
      <ProTable<QuoteVersion>
        columns={columns}
        rowKey="id"
        search={false}
        params={{ opportunityId }}
        toolBarRender={() => [
          <Input.Search
            key="opportunity"
            allowClear
            placeholder="输入商机 ID 查询报价版本"
            enterButton="查询"
            style={{ width: 360 }}
            onSearch={setOpportunityId}
          />,
        ]}
        rowSelection={{
          selectedRowKeys: selectedRows.map((row) => row.id),
          onChange: (_, rows) => setSelectedRows(rows.slice(-2)),
          getCheckboxProps: (record) => ({
            disabled: selectedRows.length >= 2 && !selectedRows.some((row) => row.id === record.id),
          }),
        }}
        request={async () => {
          if (!opportunityId) return { data: [], success: true };

          const res = await apiClient.get<{ items: QuoteVersion[] }>(`/opportunities/${opportunityId}/quotes`);
          setSelectedRows([]);
          return { data: res.data.items || [], success: true };
        }}
        pagination={false}
      />
    </PageContainer>
  );
};

export default QuoteComparePage;
