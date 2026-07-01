/**
 * 演员管理列表页 (P-07/P-08, P1)
 *
 * 功能：演员库列表，支持按风格/可用状态/咖位/信誉分筛选
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
import { Button, Tag, Space, message, Empty, Result } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { PerformerListItem, PerformerTier, CreditLevel } from '@/types/performer';
import {
  PerformerTierLabel,
  PerformerTierColor,
  CreditLevelLabel,
  CreditLevelColor,
} from '@/types/performer';
import { getPerformerList } from '@/services/performer';

const PerformerListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  const columns: ProColumns<PerformerListItem>[] = [
    {
      title: '演员名称',
      dataIndex: 'name',
      width: 140,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '风格标签',
      dataIndex: 'style_tags',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {(record.style_tags || []).slice(0, 3).map((tag) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
          {(record.style_tags || []).length > 3 && (
            <Tag>+{(record.style_tags || []).length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '咖位',
      dataIndex: 'tier',
      width: 100,
      filters: true,
      valueEnum: Object.fromEntries(
        (Object.keys(PerformerTierLabel) as PerformerTier[]).map((k) => [
          k,
          { text: PerformerTierLabel[k] },
        ]),
      ),
      render: (_, record) => (
        <Tag color={PerformerTierColor[record.tier]}>
          {PerformerTierLabel[record.tier]}
        </Tag>
      ),
    },
    {
      title: '信誉分',
      dataIndex: 'credit_score',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => (
        <span style={{ fontWeight: 600 }}>{record.credit_score}</span>
      ),
    },
    {
      title: '信誉等级',
      dataIndex: 'credit_level',
      width: 100,
      filters: true,
      valueEnum: Object.fromEntries(
        (Object.keys(CreditLevelLabel) as CreditLevel[]).map((k) => [
          k,
          { text: CreditLevelLabel[k] },
        ]),
      ),
      render: (_, record) => (
        <Tag color={CreditLevelColor[record.credit_level]}>
          {CreditLevelLabel[record.credit_level]}
        </Tag>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: 80,
      search: false,
      sorter: true,
      render: (_, record) => `${record.rating.toFixed(1)}` || '-',
    },
    {
      title: '经验(年)',
      dataIndex: 'experience_years',
      width: 80,
      search: false,
      render: (_, record) => `${record.experience_years}年`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      filters: true,
      valueEnum: {
        active: { text: '活跃', status: 'Success' },
        inactive: { text: '停用', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'green' : 'default'}>
          {record.status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          style={{ minHeight: 44, minWidth: 44 }}
          onClick={() => {
            window.location.hash = `#/performer/${record.id}`;
          }}
        >
          查看详情
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
          title="演员列表加载失败"
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
      <ProTable<PerformerListItem>
        headerTitle="演员库"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            style={{ minHeight: 44 }}
            onClick={() => {
              window.location.hash = '#/performer/create';
            }}
          >
            新增演员
          </Button>,
        ]}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getPerformerList({
              page,
              pageSize,
              keyword: params.name as string,
              tier: params.tier as PerformerTier | undefined,
              credit_level: params.credit_level as CreditLevel | undefined,
              status: params.status as 'active' | 'inactive' | undefined,
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
              description="暂无演员，点击「新增演员」录入第一位演员"
            />
          ),
        }}
      />
    </PageContainer>
  );
};

export default PerformerListPage;
