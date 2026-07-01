/**
 * 需求列表页 (P-04, P0)
 *
 * 按状态筛选（ProTable 列筛选）
 * 三态处理：loading / empty / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-3: 加载用骨架屏
 * - UX-4: 空状态显示引导文案
 * - UX-5: 错误显示友好提示 + 重试按钮
 * - API-7: 所有 API 调用通过 apiClient
 * - G-4: 不提交 console.log / debugger
 */
import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Empty, Result, message } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import type { DemandListItem, DemandStatus } from '@/types/demand';
import {
  DemandStatusLabel,
  DemandStatusColor,
  UrgencyLabel,
  UrgencyColor,
  SourceLabel,
} from '@/types/demand';
import { getDemandList } from '@/services/demand';

/** 预算格式化 */
function formatBudget(value: number): string {
  if (!value || value === 0) return '-';
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`;
  }
  return `¥${value.toLocaleString('zh-CN')}`;
}

const DemandListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  /** 查看详情 */
  const handleViewDetail = (id: string) => {
    history.push(`/demand/detail/${id}`);
  };

  const columns: ProColumns<DemandListItem>[] = [
    {
      title: '需求标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '活动公司',
      dataIndex: ['client', 'name'],
      width: 150,
      search: false,
    },
    {
      title: '活动类型',
      dataIndex: 'event_type',
      width: 120,
      search: false,
    },
    {
      title: '活动日期',
      dataIndex: 'event_date',
      width: 120,
      search: false,
      sorter: true,
      valueType: 'date',
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 100,
      search: false,
    },
    {
      title: '预算',
      dataIndex: 'budget',
      width: 110,
      search: false,
      sorter: true,
      render: (_, record) => formatBudget(record.budget),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      filters: true,
      valueEnum: Object.fromEntries(
        Object.entries(DemandStatusLabel).map(([key, label]) => [
          key,
          { text: label },
        ]),
      ) as Record<string, { text: string }>,
      render: (_, record) => (
        <Tag color={DemandStatusColor[record.status]}>
          {DemandStatusLabel[record.status]}
        </Tag>
      ),
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      width: 80,
      filters: true,
      valueEnum: {
        normal: { text: '正常', status: 'Default' },
        urgent: { text: '紧急', status: 'Warning' },
        emergency: { text: '特急', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={UrgencyColor[record.urgency]}>
          {UrgencyLabel[record.urgency]}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      width: 160,
      search: false,
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          style={{ minHeight: 44, minWidth: 44 }}
          onClick={() => handleViewDetail(record.id)}
        >
          详情
        </Button>
      ),
    },
  ];

  // 错误状态
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="需求列表加载失败"
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
      <ProTable<DemandListItem>
        headerTitle="需求管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 1300 }}
        request={async (params, sort) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 20;
            const res = await getDemandList({
              page,
              pageSize,
              status: params.status as DemandStatus | undefined,
              role: 'all',
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
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        // 三态处理：空数据
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无需求记录"
            />
          ),
        }}
      />
    </PageContainer>
  );
};

export default DemandListPage;
