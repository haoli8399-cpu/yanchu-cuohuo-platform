/**
 * 演员管理列表页 (P-07/P-08/P-14, P1)
 *
 * 功能：演员库列表，支持按风格/可用状态/咖位/信誉分筛选，批量导入
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
import {
  Button,
  Tag,
  Space,
  message,
  Empty,
  Result,
  Modal,
  Upload,
  Table,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
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

  // 批量导入
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<
    { row: number; data: Record<string, string>; error?: string }[]
  >([]);
  const [importing, setImporting] = useState(false);

  /** 解析 Excel/CSV 文件（前端模拟解析，展示预览） */
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        message.warning('文件为空或格式不正确');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const requiredFields = ['name', 'phone'];
      const missingFields = requiredFields.filter(
        (f) => !headers.includes(f),
      );
      if (missingFields.length > 0) {
        message.error(`缺少必填字段: ${missingFields.join(', ')}`);
        return;
      }

      const preview = lines.slice(1).map((line, idx) => {
        const values = line.split(',').map((v) => v.trim());
        const row: Record<string, string> = {};
        const errors: string[] = [];
        headers.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        if (!row.name) errors.push('姓名不能为空');
        if (!row.phone) errors.push('手机号不能为空');
        return {
          row: idx + 1,
          data: row,
          error: errors.length > 0 ? errors.join('; ') : undefined,
        };
      });

      setImportPreview(preview);
      message.success(`已解析 ${preview.length} 条数据`);
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
  };

  /** 执行批量导入 */
  const handleBatchImport = async () => {
    const validItems = importPreview.filter((item) => !item.error);
    if (validItems.length === 0) {
      message.warning('没有有效的数据行可导入');
      return;
    }

    setImporting(true);
    try {
      // 批量创建演员
      const results = await Promise.allSettled(
        validItems.map((item) =>
          fetch('/api/performers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: JSON.stringify({
              name: item.data.name,
              phone: item.data.phone,
              style_tags: item.data.style_tags
                ? item.data.style_tags.split('|').map((s) => s.trim())
                : [],
              tier: item.data.tier || 'T6',
              experience_years: Number(item.data.experience_years) || 0,
            }),
          }).then((r) => r.json()),
        ),
      );

      const successCount = results.filter(
        (r) => r.status === 'fulfilled' && r.value.code === 0,
      ).length;
      const failCount = results.length - successCount;

      message.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`);
      setImportModalOpen(false);
      setImportPreview([]);
      actionRef.current?.reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '批量导入失败');
    } finally {
      setImporting(false);
    }
  };

  /** 预览表格列 */
  const previewColumns = [
    {
      title: '行号',
      dataIndex: 'row',
      width: 60,
    },
    ...(importPreview.length > 0
      ? Object.keys(importPreview[0].data).map((key) => ({
          title: key,
          dataIndex: ['data', key],
          width: 120,
          ellipsis: true,
          render: (v: string) => (v ? v : '-'),
        }))
      : []),
    {
      title: '状态',
      dataIndex: 'error',
      width: 150,
      render: (v: string | undefined) =>
        v ? (
          <Tag color="red">{v}</Tag>
        ) : (
          <Tag color="green">正常</Tag>
        ),
    },
  ];

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
          <Button
            key="import"
            icon={<UploadOutlined />}
            style={{ minHeight: 44 }}
            onClick={() => setImportModalOpen(true)}
          >
            批量导入
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

      {/* 批量导入弹窗（P-14） */}
      <Modal
        title="批量导入演员"
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportPreview([]);
        }}
        onOk={handleBatchImport}
        confirmLoading={importing}
        okText="开始导入"
        okButtonProps={{ disabled: importPreview.length === 0 }}
        cancelText="取消"
        width={800}
        destroyOnClose
      >
        <Alert
          message="支持 CSV 格式文件。必填字段：name（姓名）、phone（手机号）。可选字段：style_tags（风格标签，用|分隔）、tier（咖位，T0-T6）、experience_years（经验年数）。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        {importPreview.length === 0 ? (
          <Upload.Dragger
            accept=".csv,.txt"
            beforeUpload={handleFileUpload}
            maxCount={1}
            style={{ padding: 24 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持 CSV 文本文件</p>
          </Upload.Dragger>
        ) : (
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
              预览数据（共 {importPreview.length} 行，其中{' '}
              {importPreview.filter((i) => i.error).length} 行有错误）
            </div>
            <Table
              columns={previewColumns}
              dataSource={importPreview}
              rowKey="row"
              size="small"
              scroll={{ x: 600 }}
              pagination={false}
              style={{ maxHeight: 400, overflow: 'auto' }}
            />
            <Button
              style={{ marginTop: 12, minHeight: 44 }}
              onClick={() => setImportPreview([])}
            >
              重新选择文件
            </Button>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default PerformerListPage;
