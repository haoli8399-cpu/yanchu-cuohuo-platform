/**
 * AI模板管理列表页 (P-24, P1)
 *
 * 功能：AI模板增删改查，分类管理
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
  TemplateListItem,
  TemplateCategory,
  TemplateDetail,
  TemplateUpsertRequest,
} from '@/types/template';
import { TemplateCategoryLabel, TemplateCategoryColor } from '@/types/template';
import {
  getTemplateList,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateDetail,
} from '@/services/template';

const { TextArea } = Input;

const TemplateManagementPage: React.FC = () => {
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
  const [detailData, setDetailData] = useState<TemplateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /** 打开新增 */
  const handleCreate = () => {
    setEditMode('create');
    setEditId('');
    form.resetFields();
    form.setFieldsValue({ category: 'general' });
    setEditModalOpen(true);
  };

  /** 打开编辑 */
  const handleEdit = async (id: string) => {
    try {
      const res = await getTemplateDetail(id);
      const d = res.data;
      setEditMode('edit');
      setEditId(id);
      form.setFieldsValue({
        name: d.name,
        category: d.category,
        description: d.description,
        content: d.content,
      });
      setEditModalOpen(true);
    } catch {
      message.error('加载模板详情失败');
    }
  };

  /** 查看详情 */
  const handleViewDetail = async (id: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getTemplateDetail(id);
      setDetailData(res.data);
    } catch {
      message.error('加载模板详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  /** 提交保存 */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const data: TemplateUpsertRequest = {
        name: values.name,
        category: values.category,
        description: values.description,
        content: values.content,
      };

      if (editMode === 'create') {
        await createTemplate(data);
        message.success('模板创建成功');
      } else {
        await updateTemplate(editId, data);
        message.success('模板更新成功');
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

  /** 删除模板 */
  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板「${name}」吗？此操作不可撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTemplate(id);
          message.success('模板已删除');
          actionRef.current?.reload();
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败');
        }
      },
    });
  };

  const columns: ProColumns<TemplateListItem>[] = [
    {
      title: '模板名称',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      filters: true,
      valueEnum: Object.fromEntries(
        (Object.keys(TemplateCategoryLabel) as TemplateCategory[]).map(
          (k) => [k, { text: TemplateCategoryLabel[k] }],
        ),
      ),
      render: (_, record) => (
        <Tag color={TemplateCategoryColor[record.category]}>
          {TemplateCategoryLabel[record.category]}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 250,
      search: false,
      ellipsis: true,
    },
    {
      title: '使用次数',
      dataIndex: 'usage_count',
      width: 100,
      search: false,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
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
            onClick={() => handleDelete(record.id, record.name)}
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
          title="模板列表加载失败"
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
      <ProTable<TemplateListItem>
        headerTitle="AI模板管理"
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
            新增模板
          </Button>,
        ]}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getTemplateList({
              page,
              pageSize,
              keyword: params.name as string,
              category: params.category as TemplateCategory | undefined,
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
              description="暂无模板，点击「新增模板」开始创建"
            />
          ),
        }}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editMode === 'create' ? '新增AI模板' : '编辑AI模板'}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="模板名称" />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true }]}
          >
            <Select
              options={(
                Object.keys(TemplateCategoryLabel) as TemplateCategory[]
              ).map((k) => ({
                label: TemplateCategoryLabel[k],
                value: k,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input placeholder="模板用途描述" />
          </Form.Item>
          <Form.Item
            name="content"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <TextArea
              rows={8}
              placeholder="AI模板内容，支持Markdown格式...
可使用 {{变量名}} 作为占位符，如：{{演员数}}、{{预算范围}}"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="模板详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>加载中...</div>
        ) : detailData ? (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <tbody>
                {[
                  ['模板名称', detailData.name],
                  [
                    '分类',
                    <Tag
                      key="cat"
                      color={TemplateCategoryColor[detailData.category]}
                    >
                      {TemplateCategoryLabel[detailData.category]}
                    </Tag>,
                  ],
                  ['描述', detailData.description],
                  ['使用次数', String(detailData.usage_count)],
                  [
                    '更新时间',
                    new Date(detailData.updated_at).toLocaleString('zh-CN'),
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
            <div
              style={{
                fontWeight: 500,
                color: '#666',
                marginBottom: 8,
              }}
            >
              模板内容：
            </div>
            <pre
              style={{
                background: '#f6f8fa',
                padding: 16,
                borderRadius: 6,
                maxHeight: 400,
                overflow: 'auto',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                border: '1px solid #e8e8e8',
              }}
            >
              {detailData.content}
            </pre>
            {detailData.variables && detailData.variables.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: '#666',
                    marginBottom: 8,
                  }}
                >
                  模板变量：
                </div>
                <Space wrap>
                  {detailData.variables.map((v) => (
                    <Tag key={v.key} color="blue">
                      {`{{${v.key}}}`}
                      {v.required ? '（必填）' : ''}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        ) : (
          <Empty />
        )}
      </Modal>
    </PageContainer>
  );
};

export default TemplateManagementPage;
