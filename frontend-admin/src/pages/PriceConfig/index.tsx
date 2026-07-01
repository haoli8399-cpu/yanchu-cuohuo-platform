/**
 * 价格配置管理页 (P-34, P0)
 *
 * 功能：
 * - 价格配置列表，支持按类型/业务线/咖位筛选
 * - 编辑价格配置
 * - 所有价格修改自动记录操作日志
 *
 * 三态处理：loading / empty / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-5: 错误显示友好提示 + 重试
 * - API-7: 所有 API 调用通过 apiClient
 * - G-2: 注释用中文
 */
import React, { useState, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Tag,
  message,
  Modal,
  Form,
  InputNumber,
  Select,
  Result,
  Spin,
  Empty,
} from 'antd';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import type {
  PriceConfigItem,
  PriceConfigType,
  PriceConfigUpdateRequest,
} from '@/types/priceConfig';
import {
  PriceConfigTypeLabel,
  PriceConfigTypeColor,
  PriceBusinessLineLabel,
} from '@/types/priceConfig';
import { PerformerTierLabel } from '@/types/performer';
import { getPriceConfigList, updatePriceConfig } from '@/services/priceConfig';

/** 格式化金额 */
function formatPrice(val: number): string {
  return `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const PriceConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PriceConfigItem[]>([]);

  // 编辑弹窗
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceConfigItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  /** 加载数据 */
  const loadData = () => {
    setLoading(true);
    setError(null);
    getPriceConfigList()
      .then((res) => setData(res.data.items || []))
      .catch((err) => setError(err instanceof Error ? err : new Error('加载失败')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  /** 打开编辑 */
  const handleEdit = (record: PriceConfigItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setEditModalOpen(true);
  };

  /** 保存编辑 */
  const handleSave = async () => {
    if (!editingItem) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updatePriceConfig(editingItem.id, values as PriceConfigUpdateRequest);
      message.success('价格配置已更新');
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columns: ProColumns<PriceConfigItem>[] = [
    {
      title: '套餐名称',
      dataIndex: 'package_name',
      width: 180,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '价格类型',
      dataIndex: 'config_type',
      width: 140,
      filters: true,
      valueEnum: Object.fromEntries(
        (Object.keys(PriceConfigTypeLabel) as PriceConfigType[]).map((k) => [
          k,
          { text: PriceConfigTypeLabel[k] },
        ]),
      ),
      render: (_, record) => (
        <Tag color={PriceConfigTypeColor[record.config_type]}>
          {PriceConfigTypeLabel[record.config_type]}
        </Tag>
      ),
    },
    {
      title: '业务线',
      dataIndex: 'business_line',
      width: 110,
      filters: true,
      valueEnum: Object.fromEntries(
        (Object.keys(PriceBusinessLineLabel) as Array<keyof typeof PriceBusinessLineLabel>).map(
          (k) => [k, { text: PriceBusinessLineLabel[k] }],
        ),
      ),
      render: (_, record) => (
        <Tag>{PriceBusinessLineLabel[record.business_line]}</Tag>
      ),
    },
    {
      title: '咖位',
      dataIndex: 'tier',
      width: 80,
      search: false,
      render: (_, record) =>
        record.tier ? (
          <Tag>{PerformerTierLabel[record.tier]}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration_minutes',
      width: 90,
      search: false,
    },
    {
      title: '演员数',
      dataIndex: 'performer_count',
      width: 70,
      search: false,
      render: (_, record) => `${record.performer_count}人`,
    },
    {
      title: '基础价',
      dataIndex: 'base_price',
      width: 110,
      search: false,
      sorter: true,
      render: (_, record) => formatPrice(record.base_price),
    },
    {
      title: '活动公司折扣',
      dataIndex: 'agent_discount',
      width: 100,
      search: false,
      render: (_, record) =>
        record.agent_discount ? `${(record.agent_discount * 100).toFixed(0)}%` : '-',
    },
    {
      title: '超时/5min',
      dataIndex: 'extra_fee_per_5min',
      width: 100,
      search: false,
      render: (_, record) =>
        record.extra_fee_per_5min ? formatPrice(record.extra_fee_per_5min) : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 160,
      search: false,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          style={{ minHeight: 44, minWidth: 44 }}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  // 错误
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="价格配置加载失败"
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载价格配置..." />
        </div>
      ) : (
        <ProTable<PriceConfigItem>
          headerTitle="价格配置管理"
          rowKey="id"
          search={{ labelWidth: 100, defaultCollapsed: false }}
          scroll={{ x: 1600 }}
          dataSource={data}
          columns={columns}
          pagination={{ defaultPageSize: 15, showSizeChanger: true }}
          toolBarRender={() => [
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={loadData}
            >
              刷新
            </Button>,
          ]}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无价格配置"
              />
            ),
          }}
        />
      )}

      {/* 编辑弹窗 */}
      <Modal
        title="编辑价格配置"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="package_name" label="套餐名称">
            <InputNumber style={{ width: '100%' }} disabled={false} />
          </Form.Item>
          <Form.Item name="base_price" label="基础价（元）">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入基础价"
            />
          </Form.Item>
          <Form.Item name="agent_discount" label="活动公司折扣率">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={1}
              step={0.01}
              precision={2}
              placeholder="如 0.7 表示7折"
            />
          </Form.Item>
          <Form.Item name="duration_minutes" label="时长（分钟）">
            <InputNumber style={{ width: '100%' }} min={1} max={480} />
          </Form.Item>
          <Form.Item name="performer_count" label="演员数量">
            <InputNumber style={{ width: '100%' }} min={1} max={20} />
          </Form.Item>
          <Form.Item name="extra_fee_per_5min" label="超时费/5分钟（元）">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="每超出5分钟加收"
            />
          </Form.Item>
          <Form.Item name="script_creation_fee" label="剧本创作费（元）">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item name="script_performance_fee" label="剧本演出费（元）">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item name="remote_fee_in_city" label="同城远程费（元）">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item name="remote_fee_out_city" label="跨城远程费（元）">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PriceConfigPage;
