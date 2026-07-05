/**
 * 案例管理列表页 (P-23, P1)
 *
 * 功能：案例增删改查，关联SKU
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
  Button,
  Tag,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Slider,
  Result,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { CaseListItem, CaseDetail, CaseUpsertRequest } from '@/types/case';
import { CaseStatusLabel, CaseStatusColor } from '@/types/case';
import {
  getCaseList,
  createCase,
  updateCase,
  deleteCase,
  getCaseDetail,
} from '@/services/case';
import { getSKUList } from '@/services/sku';

const { TextArea } = Input;

const CaseManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  // SKU 列表（用于 Select）
  const [skuOptions, setSkuOptions] = useState<{ label: string; value: string }[]>([]);

  // 编辑弹窗
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // 详情弹窗
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<CaseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /** 加载 SKU 选项 */
  useEffect(() => {
    (async () => {
      try {
        const res = await getSKUList({ page: 1, pageSize: 1000 });
        setSkuOptions(
          (res.data?.items || []).map((sku) => ({
            label: sku.name,
            value: sku.id,
          })),
        );
      } catch {
        // 静默失败，Select 为空也不影响
      }
    })();
  }, []);

  /** 打开新增 */
  const handleCreate = () => {
    setEditMode('create');
    setEditId('');
    form.resetFields();
    form.setFieldsValue({ status: 'draft', rating: 100, participants: 0 });
    setEditModalOpen(true);
  };

  /** 打开编辑 */
  const handleEdit = async (id: string) => {
    try {
      const res = await getCaseDetail(id);
      const d = res.data;
      setEditMode('edit');
      setEditId(id);
      form.setFieldsValue({
        title: d.title,
        sku_id: d.sku_id,
        event_date: d.event_date,
        participants: d.participants,
        actor_tier: d.actor_tier,
        rating: d.rating,
        client_name: d.client_name,
        description: d.description,
        content: d.content,
        status: d.status,
        cover_images: d.cover_images?.join('\n'),
      });
      setEditModalOpen(true);
    } catch {
      message.error('加载案例详情失败');
    }
  };

  /** 查看详情 */
  const handleViewDetail = async (id: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getCaseDetail(id);
      setDetailData(res.data);
    } catch {
      message.error('加载案例详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  /** 提交保存 */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const data: CaseUpsertRequest = {
        title: values.title,
        sku_id: values.sku_id,
        event_date: values.event_date,
        participants: values.participants,
        actor_tier: values.actor_tier,
        rating: values.rating,
        client_name: values.client_name,
        description: values.description,
        content: values.content || '',
        status: values.status,
        cover_images: values.cover_images
          ? values.cover_images.split('\n').filter(Boolean)
          : undefined,
      };

      if (editMode === 'create') {
        await createCase(data);
        message.success('案例创建成功');
      } else {
        await updateCase(editId, data);
        message.success('案例更新成功');
      }

      setEditModalOpen(false);
      actionRef.current?.reload();
    } catch (err) {
      if (err instanceof Error && err.message !== 'VALIDATE_FAILED') {
        message.error(err.message || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  /** 删除案例 */
  const handleDelete = (id: string, title: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除案例「${title}」吗？此操作不可撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCase(id);
          message.success('案例已删除');
          actionRef.current?.reload();
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败');
        }
      },
    });
  };

  const columns: ProColumns<CaseListItem>[] = [
    {
      title: '案例标题',
      dataIndex: 'title',
      width: 180,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '关联SKU',
      dataIndex: 'sku_name',
      width: 160,
      search: false,
      ellipsis: true,
      render: (_, record) => record.sku_name || record.sku_id || '-',
    },
    {
      title: '活动日期',
      dataIndex: 'event_date',
      width: 120,
      search: false,
      sorter: true,
    },
    {
      title: '参与人数',
      dataIndex: 'participants',
      width: 90,
      search: false,
    },
    {
      title: '演员级别',
      dataIndex: 'actor_tier',
      width: 100,
      search: false,
    },
    {
      title: '好评率',
      dataIndex: 'rating',
      width: 90,
      search: false,
      render: (_, record) => (
        <span style={{ color: record.rating >= 95 ? '#52c41a' : '#faad14' }}>
          {record.rating}%
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      filters: true,
      valueEnum: {
        draft: { text: '草稿' },
        published: { text: '已发布' },
      },
      render: (_, record) => (
        <Tag color={CaseStatusColor[record.status]}>
          {CaseStatusLabel[record.status]}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 160,
      search: false,
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            style={{ minHeight: 44, minWidth: 44 }}
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            style={{ minHeight: 44, minWidth: 44 }}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            style={{ minHeight: 44, minWidth: 44 }}
            onClick={() => handleDelete(record.id, record.title)}
          >
            删除
          </Button>
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
          title="案例列表加载失败"
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
      <ProTable<CaseListItem>
        headerTitle="案例管理"
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
            新增案例
          </Button>,
        ]}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getCaseList({
              page,
              pageSize,
              keyword: params.title as string,
              status: params.status as 'draft' | 'published' | undefined,
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
              description="暂无案例，点击「新增案例」开始录入"
            />
          ),
        }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editMode === 'create' ? '新增案例' : '编辑案例'}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="案例标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="案例标题" />
          </Form.Item>
          <Form.Item
            name="sku_id"
            label="关联SKU"
            rules={[{ required: true, message: '请选择SKU' }]}
          >
            <Select
              placeholder="选择SKU"
              showSearch
              optionFilterProp="label"
              options={skuOptions}
            />
          </Form.Item>
          <Space size={16} style={{ width: '100%' }}>
            <Form.Item
              name="event_date"
              label="活动日期"
              rules={[{ required: true, message: '请输入日期' }]}
            >
              <Input placeholder="YYYY-MM-DD" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item
              name="participants"
              label="参与人数"
              rules={[{ required: true, message: '请输入人数' }]}
            >
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item
              name="actor_tier"
              label="演员级别"
              rules={[{ required: true, message: '请输入演员级别' }]}
            >
              <Input placeholder="如：T3/T4" style={{ width: 140 }} />
            </Form.Item>
          </Space>
          <Form.Item
            name="rating"
            label="好评率"
            rules={[{ required: true, message: '请设置好评率' }]}
          >
            <Slider
              min={0}
              max={100}
              marks={{ 0: '0%', 50: '50%', 80: '80%', 95: '95%', 100: '100%' }}
              tooltip={{ formatter: (v) => `${v}%` }}
            />
          </Form.Item>
          <Form.Item
            name="client_name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="客户/活动公司名称" />
          </Form.Item>
          <Form.Item
            name="cover_images"
            label="封面图URL（每行一个）"
          >
            <TextArea rows={2} placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="description"
            label="案例描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="案例描述..." />
          </Form.Item>
          <Form.Item name="content" label="详细内容">
            <TextArea rows={4} placeholder="案例详细内容..." />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true }]}
          >
            <Select
              style={{ width: 120 }}
              options={[
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="案例详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>加载中...</div>
        ) : detailData ? (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['标题', detailData.title],
                  ['关联SKU', detailData.sku_name || detailData.sku_id],
                  ['活动日期', detailData.event_date],
                  ['参与人数', String(detailData.participants)],
                  ['演员级别', detailData.actor_tier],
                  ['好评率', `${detailData.rating}%`],
                  ['客户名称', detailData.client_name || '-'],
                  ['描述', detailData.description || '-'],
                  ['详细内容', detailData.content || '-'],
                  [
                    '状态',
                    <Tag key="s" color={CaseStatusColor[detailData.status]}>
                      {CaseStatusLabel[detailData.status]}
                    </Tag>,
                  ],
                  [
                    '创建时间',
                    new Date(detailData.created_at).toLocaleString('zh-CN'),
                  ],
                  [
                    '封面图',
                    detailData.cover_images?.length
                      ? detailData.cover_images.map((url, i) => (
                          <div key={i}>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              图片 {i + 1}
                            </a>
                          </div>
                        ))
                      : '-',
                  ],
                ].map(([label, value], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td
                      style={{
                        padding: '10px 16px',
                        fontWeight: 500,
                        color: '#666',
                        width: 120,
                        verticalAlign: 'top',
                      }}
                    >
                      {label}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {value as React.ReactNode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </Modal>
    </PageContainer>
  );
};

export default CaseManagementPage;
