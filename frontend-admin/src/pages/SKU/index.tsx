/**
 * SKU 列表页 - SKU方案库管理 (P-22, P0)
 *
 * 三态处理：loading / empty / error
 */
import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Popconfirm, message, Empty, Result } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { SKU } from '@/types/sku';
import { BusinessLineLabel, StatusLabel, StatusColor } from '@/types/sku';
import { getSKUList, deleteSKU, toggleSKUStatus } from '@/services/sku';

/** 价格格式化（分 → 元） */
function formatPrice(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const SKUListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  /** 删除 SKU */
  const handleDelete = async (id: string) => {
    try {
      await deleteSKU(id);
      message.success('SKU已删除');
      actionRef.current?.reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  /** 上架/下架切换 */
  const handleToggleStatus = async (id: string, currentStatus: SKU['status']) => {
    const targetStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionLabel = targetStatus === 'active' ? '上架' : '下架';
    try {
      await toggleSKUStatus(id, targetStatus);
      message.success(`SKU已${actionLabel}`);
      actionRef.current?.reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : `${actionLabel}失败`);
    }
  };

  const columns: ProColumns<SKU>[] = [
    {
      title: 'SKU名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '业务线',
      dataIndex: 'businessLine',
      width: 120,
      filters: true,
      valueEnum: BusinessLineLabel,
    },
    {
      title: '风格标签',
      dataIndex: 'styleTags',
      width: 160,
      search: false,
      render: (_, record) => (
        <Space size={4} wrap>
          {record.styleTags?.map((tag) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '甲方标准价',
      dataIndex: 'basePrice',
      width: 120,
      search: false,
      sorter: true,
      render: (_, record) => formatPrice(record.basePrice),
    },
    {
      title: '活动公司价',
      dataIndex: 'companyPrice',
      width: 120,
      search: false,
      sorter: true,
      render: (_, record) => formatPrice(record.companyPrice),
    },
    {
      title: '时长',
      dataIndex: 'durationMinutes',
      width: 80,
      search: false,
      render: (_, record) => `${record.durationMinutes}min`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      filters: true,
      valueEnum: {
        active: { text: '已上架', status: 'Success' },
        inactive: { text: '已下架', status: 'Default' },
        draft: { text: '草稿', status: 'Warning' },
      },
      render: (_, record) => (
        <Tag color={StatusColor[record.status]}>
          {StatusLabel[record.status]}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 160,
      search: false,
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            style={{ minHeight: 44, minWidth: 44 }}
            onClick={() => {
              window.location.hash = `#/sku/detail/${record.id}`;
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            style={{ minHeight: 44, minWidth: 44 }}
            onClick={() => {
              window.location.hash = `#/sku/detail/${record.id}`;
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            style={{ minHeight: 44, minWidth: 44 }}
            onClick={() => handleToggleStatus(record.id, record.status)}
          >
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确定删除该SKU？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ minHeight: 44, minWidth: 44 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 错误状态
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="SKU列表加载失败"
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
      <ProTable<SKU>
        headerTitle="SKU方案库"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 1400 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              window.location.hash = '#/sku/create';
            }}
            style={{ minHeight: 44 }}
          >
            新增SKU
          </Button>,
        ]}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getSKUList({
              page,
              pageSize,
              keyword: params.name,
              businessLine: params.businessLine as SKU['businessLine'] | undefined,
              status: params.status as SKU['status'] | undefined,
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
              description="暂无SKU方案，点击「新增SKU」创建第一个方案"
            />
          ),
        }}
      />
    </PageContainer>
  );
};

export default SKUListPage;
