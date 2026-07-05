/**
 * 评价管理列表页
 *
 * 功能：评价只读列表，按SKU筛选
 * 三态处理：loading / empty / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - API-7: 所有 API 调用通过 apiClient
 */
import React, { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  Tag,
  Button,
  Result,
  Empty,
  Rate,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ReviewListItem } from '@/types/review';
import { ReviewStatusLabel, ReviewStatusColor } from '@/types/review';
import { getReviewList } from '@/services/review';
import { getSKUList } from '@/services/sku';

const ReviewManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  // SKU 筛选选项
  const [skuFilters, setSkuFilters] = useState<
    { text: string; value: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSKUList({ page: 1, pageSize: 1000 });
        setSkuFilters(
          (res.data?.items || []).map((sku) => ({
            text: sku.name,
            value: sku.id,
          })),
        );
      } catch {
        // 静默失败
      }
    })();
  }, []);

  const columns: ProColumns<ReviewListItem>[] = [
    {
      title: '评价内容',
      dataIndex: 'text_content',
      width: 280,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '评分',
      dataIndex: 'overall_rating',
      width: 160,
      search: false,
      render: (_, record) => (
        <Rate disabled allowHalf value={record.overall_rating} />
      ),
    },
    {
      title: '关联SKU',
      dataIndex: 'sku_id',
      width: 160,
      filters: skuFilters.length > 0 ? skuFilters : undefined,
      onFilter: true,
      render: (_, record) => record.sku_name || record.sku_id || '-',
    },
    {
      title: '提交公司',
      dataIndex: 'company_name',
      width: 160,
      search: false,
      render: (_, record) =>
        record.from_type === 'company'
          ? record.from_user?.name || '-'
          : record.company_name || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      filters: true,
      valueEnum: {
        pending: { text: '待审核' },
        published: { text: '已发布' },
        hidden: { text: '已隐藏' },
      },
      render: (_, record) => (
        <Tag color={ReviewStatusColor[record.status]}>
          {ReviewStatusLabel[record.status]}
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
  ];

  // 错误状态
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="评价列表加载失败"
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
      <ProTable<ReviewListItem>
        headerTitle="评价管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 1100 }}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getReviewList({
              page,
              pageSize,
              sku_id: params.sku_id as string | undefined,
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
              description="暂无评价记录"
            />
          ),
        }}
      />
    </PageContainer>
  );
};

export default ReviewManagementPage;
