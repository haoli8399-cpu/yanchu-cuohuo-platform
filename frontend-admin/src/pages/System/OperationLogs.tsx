/**
 * 操作日志页 (P-05, P0)
 *
 * 功能：
 * - 查看所有操作记录：谁/时间/模块/操作/改前/改后
 * - 支持按模块/操作人员/日期筛选
 *
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
import { Button, Tag, Result, Empty, Modal, message } from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { OperationLogItem } from '@/types/operationLog';
import { getOperationLogs, undoOperation } from '@/services/operationLog';

/** 模块中文映射 */
const ModuleLabel: Record<string, string> = {
  sku: 'SKU管理',
  demand: '需求管理',
  order: '订单管理',
  performer: '演员管理',
  settlement: '结算管理',
  price_config: '价格配置',
  company: '活动公司',
  auth: '认证',
  admin: '系统管理',
};

const OperationLogsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<OperationLogItem | null>(null);
  const [undoing, setUndoing] = useState<string | null>(null);

  /** 检查是否在5分钟内可撤销 */
  const canUndo = (log: OperationLogItem): boolean => {
    const elapsed = Date.now() - new Date(log.created_at).getTime();
    return elapsed < 5 * 60 * 1000;
  };

  /** 执行撤销 */
  const handleUndo = async (log: OperationLogItem) => {
    Modal.confirm({
      title: '确认撤销',
      content: `确定要撤销此操作吗？（仅5分钟内的操作可撤销）`,
      okText: '确认撤销',
      cancelText: '取消',
      onOk: async () => {
        setUndoing(log.id);
        try {
          await undoOperation(log.id);
          message.success('操作已撤销');
          actionRef.current?.reload();
        } catch (err) {
          message.error(err instanceof Error ? err.message : '撤销失败');
        } finally {
          setUndoing(null);
        }
      },
    });
  };

  const columns: ProColumns<OperationLogItem>[] = [
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 170,
      fixed: 'left',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作人',
      width: 100,
      search: false,
      render: (_, record) => record.operator?.name || '-',
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 120,
      filters: true,
      valueEnum: Object.fromEntries(
        Object.entries(ModuleLabel).map(([k, v]) => [k, { text: v }]),
      ),
      render: (_, record) => (
        <Tag>{ModuleLabel[record.module] || record.module}</Tag>
      ),
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => {
        type ActionColorMap = Record<string, string>;
        const colorMap: ActionColorMap = {
          create: 'green',
          update: 'blue',
          delete: 'red',
        };
        return (
          <Tag color={colorMap[record.action] || 'default'}>{record.action}</Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
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
              setDetailItem(record);
              setDetailModalOpen(true);
            }}
          >
            详情
          </Button>
          {canUndo(record) && (
            <Button
              type="link"
              size="small"
              icon={<UndoOutlined />}
              loading={undoing === record.id}
              style={{ minHeight: 44, minWidth: 44, color: '#fa8c16' }}
              onClick={() => handleUndo(record)}
            >
              撤销
            </Button>
          )}
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
          title="操作日志加载失败"
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
      <ProTable<OperationLogItem>
        headerTitle="操作日志"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 800 }}
        toolBarRender={() => [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            style={{ minHeight: 44 }}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 20;
            const res = await getOperationLogs({
              page,
              pageSize,
              module: params.module as string | undefined,
              date_from: params.date_from as string | undefined,
              date_to: params.date_to as string | undefined,
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
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无操作日志"
            />
          ),
        }}
      />

      {/* 详情弹窗：展示改前/改后 */}
      <Modal
        title="操作日志详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {detailItem && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['操作时间', new Date(detailItem.created_at).toLocaleString('zh-CN')],
                ['操作人', detailItem.operator?.name || '-'],
                ['操作模块', ModuleLabel[detailItem.module] || detailItem.module],
                ['操作类型', detailItem.action],
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
                  <td style={{ padding: '10px 16px' }}>{value}</td>
                </tr>
              ))}
              {/* 改前数据 */}
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td
                  style={{
                    padding: '10px 16px',
                    fontWeight: 500,
                    color: '#666',
                    verticalAlign: 'top',
                  }}
                >
                  修改前
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <pre
                    style={{
                      margin: 0,
                      padding: 8,
                      background: '#fff7e6',
                      borderRadius: 4,
                      maxHeight: 300,
                      overflow: 'auto',
                      fontSize: 12,
                      border: '1px solid #ffd591',
                    }}
                  >
                    {detailItem.before
                      ? JSON.stringify(detailItem.before, null, 2)
                      : '(无数据)'}
                  </pre>
                </td>
              </tr>
              {/* 改后数据 */}
              <tr>
                <td
                  style={{
                    padding: '10px 16px',
                    fontWeight: 500,
                    color: '#666',
                    verticalAlign: 'top',
                  }}
                >
                  修改后
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <pre
                    style={{
                      margin: 0,
                      padding: 8,
                      background: '#f6ffed',
                      borderRadius: 4,
                      maxHeight: 300,
                      overflow: 'auto',
                      fontSize: 12,
                      border: '1px solid #b7eb8f',
                    }}
                  >
                    {detailItem.after
                      ? JSON.stringify(detailItem.after, null, 2)
                      : '(无数据)'}
                  </pre>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OperationLogsPage;
