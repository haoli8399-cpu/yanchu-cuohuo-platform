/**
 * 评价管理列表页
 *
 * 功能：评价 CRUD 管理
 * - 列表展示、SKU 筛选
 * - 新增评价（Modal 表单）
 * - 删除评价（二次确认）
 * - 三态处理：loading / empty / error
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
  Modal,
  Form,
  Select,
  Input,
  Space,
  message,
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ReviewListItem } from '@/types/review';
import { ReviewStatusLabel, ReviewStatusColor } from '@/types/review';
import {
  getReviewList,
  createReview,
  deleteReview,
  type CreateReviewRequest,
} from '@/services/review';
import { getSKUList } from '@/services/sku';

const { TextArea } = Input;

const ReviewManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  // SKU 筛选选项
  const [skuFilters, setSkuFilters] = useState<
    { text: string; value: string }[]
  >([]);

  // 新增弹窗
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // SKU 下拉选项（用于新增表单）
  const [skuOptions, setSkuOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSKUList({ page: 1, pageSize: 1000 });
        const items = res.data?.items || [];
        setSkuFilters(
          items.map((sku) => ({
            text: sku.name,
            value: sku.id,
          })),
        );
        setSkuOptions(
          items.map((sku) => ({
            label: sku.name,
            value: sku.id,
          })),
        );
      } catch {
        // 静默失败
      }
    })();
  }, []);

  /** 打开新增弹窗 */
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  /** 提交新增评价 */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const data: CreateReviewRequest = {
        sku_id: values.sku_id,
        overall_rating: values.overall_rating,
        text_content: values.text_content,
        company_name: values.company_name || undefined,
      };

      await createReview(data);
      message.success('评价创建成功');
      setCreateModalOpen(false);
      actionRef.current?.reload();
    } catch (err) {
      if (err instanceof Error && err.message !== 'VALIDATE_FAILED') {
        message.error(err.message || '创建失败');
      }
    } finally {
      setSaving(false);
    }
  };

  /** 删除评价 */
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该评价吗？此操作不可撤销。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteReview(id);
          message.success('评价已删除');
          actionRef.current?.reload();
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败');
        }
      },
    });
  };

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
          danger
          icon={<DeleteOutlined />}
          style={{ minHeight: 44, minWidth: 44 }}
          onClick={() => handleDelete(record.id)}
        >
          删除
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
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            style={{ minHeight: 44 }}
            onClick={handleCreate}
          >
            新增评价
          </Button>,
        ]}
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

      {/* 新增评价弹窗 */}
      <Modal
        title="新增评价"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="确认"
        cancelText="取消"
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="sku_id"
            label="关联SKU"
            rules={[{ required: true, message: '请选择关联SKU' }]}
          >
            <Select
              placeholder="请选择 SKU"
              options={skuOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="overall_rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          <Form.Item
            name="text_content"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea rows={4} placeholder="评价内容" />
          </Form.Item>
          <Form.Item
            name="company_name"
            label="提交公司"
          >
            <Input placeholder="活动公司名称" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ReviewManagementPage;
