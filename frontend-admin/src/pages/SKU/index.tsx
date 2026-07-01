/**
 * SKU 列表页 - SKU方案库管理 (P-22, P0)
 *
 * 三态处理：loading / empty / error
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-3: 加载用骨架屏
 * - UX-4: 空状态显示引导文案
 * - UX-5: 错误显示友好提示 + 重试按钮
 */
import React, { useRef, useState, useCallback } from 'react';
import { PageContainer, ProTable, ModalForm, ProFormText, ProFormSelect, ProFormDigit, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Popconfirm, message, Empty, Result } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { SKU, BusinessLine } from '@/types/sku';
import { BusinessLineLabel } from '@/types/sku';

// 状态标签颜色映射
const statusColorMap: Record<SKU['status'], string> = {
  online: 'green',
  offline: 'default',
  draft: 'orange',
};

const statusLabelMap: Record<SKU['status'], string> = {
  online: '已上架',
  offline: '已下架',
  draft: '草稿',
};

/** 业务线选项 */
const businessLineOptions = Object.entries(BusinessLineLabel).map(
  ([value, label]) => ({ label, value }),
);

/** 模拟数据（待后端API就绪后替换为真实数据） */
const mockData: SKU[] = [
  {
    id: '1',
    name: '脱口秀专场 · 60min标准版',
    businessLine: 'commercial_show',
    actorProfile: { style: '脱口秀', tierRange: 'T2-T4', count: 2 },
    internalPrice: 80000,
    companyPrice: 84000,
    clientPrice: 120000,
    duration: 60,
    scenarios: ['企业年会', '品牌发布会', '商场开业'],
    sampleVideos: [],
    status: 'online',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: '2',
    name: '即兴喜剧互动 · 30min',
    businessLine: 'outdoor_show',
    actorProfile: { style: '即兴喜剧', tierRange: 'T3-T5', count: 3 },
    internalPrice: 60000,
    companyPrice: 63000,
    clientPrice: 90000,
    duration: 30,
    scenarios: ['户外音乐节', '市集活动'],
    sampleVideos: [],
    status: 'online',
    createdAt: '2026-06-28T08:00:00Z',
    updatedAt: '2026-06-28T08:00:00Z',
  },
];

/** 价格格式化（分 → 元） */
function formatPrice(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const SKUListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
      title: '演员风格',
      dataIndex: ['actorProfile', 'style'],
      width: 100,
      search: false,
    },
    {
      title: '建议咖位',
      dataIndex: ['actorProfile', 'tierRange'],
      width: 100,
      search: false,
    },
    {
      title: '甲方标准价',
      dataIndex: 'clientPrice',
      width: 120,
      search: false,
      sorter: true,
      render: (_, record) => formatPrice(record.clientPrice),
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
      dataIndex: 'duration',
      width: 80,
      search: false,
      render: (_, record) => `${record.duration}min`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      filters: true,
      valueEnum: {
        online: { text: '已上架', status: 'Success' },
        offline: { text: '已下架', status: 'Default' },
        draft: { text: '草稿', status: 'Warning' },
      },
      render: (_, record) => (
        <Tag color={statusColorMap[record.status]}>
          {statusLabelMap[record.status]}
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
              // 跳转详情页
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
          <Popconfirm
            title="确定删除该SKU？"
            description="删除后不可恢复"
            onConfirm={async () => {
              message.success('SKU已删除');
              actionRef.current?.reload();
            }}
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
        request={async (params, sort, filter) => {
          setLoading(true);
          setError(null);
          try {
            // TODO: 替换为真实 API 调用 getSKUList()
            // 模拟网络延迟
            await new Promise((resolve) => setTimeout(resolve, 500));
            let data = [...mockData];

            // 模拟筛选
            if (params.businessLine) {
              data = data.filter((item) => item.businessLine === params.businessLine);
            }
            if (params.status) {
              data = data.filter((item) => item.status === params.status);
            }
            if (params.name) {
              data = data.filter((item) =>
                item.name.toLowerCase().includes(params.name.toLowerCase()),
              );
            }

            return {
              data,
              success: true,
              total: data.length,
            };
          } catch (err) {
            setError(err instanceof Error ? err : new Error('加载失败'));
            return { data: [], success: false, total: 0 };
          } finally {
            setLoading(false);
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        // 三态处理：空数据
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
