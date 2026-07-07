/**
 * 案例管理列表页 (P-23, P1)
 *
 * 功能：案例增删改查，草稿→发布，排序
 * 三态处理：loading / empty / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - API-7: 所有 API 调用通过 apiClient
 */
import React, { useRef, useState } from 'react';
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
import type {
  CaseListItem,
  CaseStatus,
  CaseDetail,
  CaseUpsertRequest,
} from '@/types/case';
import { CaseStatusLabel, CaseStatusColor } from '@/types/case';
import {
  getCaseList,
  createCase,
  updateCase,
  deleteCase,
  getCaseDetail,
} from '@/services/case';

const { TextArea } = Input;

const CaseManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

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

  /** 打开新增 */
  const handleCreate = () => {
    setEditMode('create');
    setEditId('');
    form.resetFields();
    form.setFieldsValue({ status: 'draft', sort_order: 0 });
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
        event_type: d.event_type,
        event_date: d.event_date,
        city: d.city,
        cover_url: d.cover_url,
        description: d.description,
        performer_info: d.performer_info,
        client_info: d.client_info,
        sort_order: d.sort_order,
        status: d.status,
        media_urls: d.media_urls?.join('\n'),
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
        event_type: values.event_type,
        event_date: values.event_date,
        city: values.city,
        cover_url: values.cover_url,
        description: values.description,
        performer_info: values.performer_info,
        client_info: values.client_info,
        sort_order: values.sort_order || 0,
        status: values.status,
        media_urls: values.media_urls
          ? values.media_urls.split('\n').filter(Boolean)
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
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '活动类型',
      dataIndex: 'event_type',
      width: 120,
      search: false,
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 100,
      search: false,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      width: 80,
      search: false,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
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
              status: params.status as CaseStatus | undefined,
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
          <Space size={16} style={{ width: '100%' }}>
            <Form.Item
              name="event_type"
              label="活动类型"
              rules={[{ required: true, message: '请输入活动类型' }]}
            >
              <Input placeholder="如：年会、发布会" style={{ width: 180 }} />
            </Form.Item>
            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '请输入城市' }]}
            >
              <Input placeholder="城市" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item
              name="event_date"
              label="活动日期"
              rules={[{ required: true, message: '请输入日期' }]}
            >
              <Input placeholder="YYYY-MM-DD" style={{ width: 160 }} />
            </Form.Item>
          </Space>
          <Form.Item
            name="cover_url"
            label="封面图URL"
            rules={[{ required: true, message: '请输入封面图URL' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="description"
            label="案例描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="案例描述..." />
          </Form.Item>
          <Form.Item name="performer_info" label="演员信息">
            <Input placeholder="参与演员描述" />
          </Form.Item>
          <Form.Item name="client_info" label="客户信息">
            <Input placeholder="客户/活动公司描述" />
          </Form.Item>
          <Form.Item name="media_urls" label="媒体URL（每行一个）">
            <TextArea rows={2} placeholder="https://..." />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="sort_order" label="排序">
              <InputNumber min={0} style={{ width: 120 }} />
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
          </Space>
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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['标题', detailData.title],
                ['活动类型', detailData.event_type],
                ['活动日期', detailData.event_date],
                ['城市', detailData.city],
                ['描述', detailData.description],
                ['演员信息', detailData.performer_info || '-'],
                ['客户信息', detailData.client_info || '-'],
                ['排序', String(detailData.sort_order)],
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
        ) : (
          <Empty />
        )}
      </Modal>
    </PageContainer>
  );
};

export default CaseManagementPage;
