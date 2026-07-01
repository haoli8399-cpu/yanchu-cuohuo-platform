/**
 * 活动公司管理列表页 (W-03, P0)
 *
 * 功能：
 * - 活动公司列表，按认证状态筛选
 * - 审核认证（通过/驳回）
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
import {
  Button,
  Tag,
  Space,
  message,
  Modal,
  Input,
  Result,
  Empty,
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { CompanyListItem, CompanyStatus } from '@/types/company';
import {
  CompanyStatusLabel,
  CompanyStatusColor,
} from '@/types/company';
import { getCompanyList, verifyCompany, getCompanyDetail } from '@/services/company';
import type { CompanyDetail } from '@/types/company';

const { TextArea } = Input;

/** 格式化金额 */
function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}

const CompanyListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [error, setError] = useState<Error | null>(null);

  // 审核弹窗
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject'>('approve');
  const [verifyCompanyId, setVerifyCompanyId] = useState<string>('');
  const [verifyCompanyName, setVerifyCompanyName] = useState<string>('');
  const [verifyReason, setVerifyReason] = useState<string>('');
  const [verifying, setVerifying] = useState(false);

  // 详情弹窗
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<CompanyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /** 查看详情 */
  const handleViewDetail = async (id: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getCompanyDetail(id);
      setDetailData(res.data);
    } catch {
      message.error('加载公司详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  /** 执行审核 */
  const handleVerify = async () => {
    if (verifyAction === 'reject' && !verifyReason.trim()) {
      message.warning('驳回时请填写原因');
      return;
    }
    setVerifying(true);
    try {
      await verifyCompany(verifyCompanyId, {
        action: verifyAction,
        reason: verifyAction === 'reject' ? verifyReason : undefined,
      });
      message.success(verifyAction === 'approve' ? '已通过认证' : '已驳回认证');
      setVerifyModalOpen(false);
      actionRef.current?.reload();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setVerifying(false);
    }
  };

  const columns: ProColumns<CompanyListItem>[] = [
    {
      title: '公司简称',
      dataIndex: 'short_name',
      width: 160,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '全称',
      dataIndex: 'full_name',
      width: 200,
      search: false,
      ellipsis: true,
      render: (_, record) => record.full_name || '-',
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      width: 100,
      search: false,
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 90,
      search: false,
    },
    {
      title: '服务类目',
      dataIndex: 'service_categories',
      width: 160,
      search: false,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {(record.service_categories || []).slice(0, 2).map((cat) => (
            <Tag key={cat}>{cat}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '认证状态',
      dataIndex: 'status',
      width: 100,
      filters: true,
      valueEnum: {
        registered: { text: '已注册' },
        pending_cert: { text: '待认证' },
        certified: { text: '已认证' },
      },
      render: (_, record) => (
        <Tag color={CompanyStatusColor[record.status]}>
          {CompanyStatusLabel[record.status]}
        </Tag>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'total_orders',
      width: 80,
      search: false,
      sorter: true,
    },
    {
      title: '累计消费',
      dataIndex: 'total_spent',
      width: 120,
      search: false,
      sorter: true,
      render: (_, record) =>
        record.total_spent ? formatMoney(record.total_spent) : '-',
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      width: 160,
      search: false,
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
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          {record.status === 'pending_cert' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                style={{ minHeight: 44, minWidth: 44, color: '#52c41a' }}
                onClick={() => {
                  setVerifyCompanyId(record.id);
                  setVerifyCompanyName(record.short_name);
                  setVerifyAction('approve');
                  setVerifyReason('');
                  setVerifyModalOpen(true);
                }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                style={{ minHeight: 44, minWidth: 44, color: '#ff4d4f' }}
                onClick={() => {
                  setVerifyCompanyId(record.id);
                  setVerifyCompanyName(record.short_name);
                  setVerifyAction('reject');
                  setVerifyReason('');
                  setVerifyModalOpen(true);
                }}
              >
                驳回
              </Button>
            </>
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
          title="活动公司列表加载失败"
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
      <ProTable<CompanyListItem>
        headerTitle="活动公司管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        scroll={{ x: 1400 }}
        request={async (params) => {
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getCompanyList({
              page,
              pageSize,
              keyword: params.short_name as string,
              status: params.status as CompanyStatus | undefined,
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
              description="暂无活动公司数据"
            />
          ),
        }}
      />

      {/* 审核弹窗 */}
      <Modal
        title={verifyAction === 'approve' ? '通过认证' : '驳回认证'}
        open={verifyModalOpen}
        onCancel={() => setVerifyModalOpen(false)}
        onOk={handleVerify}
        confirmLoading={verifying}
        okText={verifyAction === 'approve' ? '确认通过' : '确认驳回'}
        okButtonProps={{
          danger: verifyAction === 'reject',
        }}
        cancelText="取消"
        destroyOnClose
      >
        <p>
          {verifyAction === 'approve'
            ? `确认通过「${verifyCompanyName}」的企业认证？`
            : `确认驳回「${verifyCompanyName}」的企业认证？`}
        </p>
        {verifyAction === 'reject' && (
          <TextArea
            rows={3}
            placeholder="请填写驳回原因..."
            value={verifyReason}
            onChange={(e) => setVerifyReason(e.target.value)}
          />
        )}
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="活动公司详情"
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
                ['公司简称', detailData.short_name],
                ['公司全称', detailData.full_name || '-'],
                ['联系人', detailData.contact_person],
                ['手机号', detailData.phone || '-'],
                ['城市', detailData.city],
                ['服务类目', (detailData.service_categories || []).join('、') || '-'],
                [
                  '认证状态',
                  <Tag key="s" color={CompanyStatusColor[detailData.status]}>
                    {CompanyStatusLabel[detailData.status]}
                  </Tag>,
                ],
                ['订单数', String(detailData.total_orders)],
                ['累计消费', detailData.total_spent ? formatMoney(detailData.total_spent) : '-'],
                [
                  '注册时间',
                  detailData.created_at
                    ? new Date(detailData.created_at).toLocaleString('zh-CN')
                    : '-',
                ],
                ['统一信用代码', detailData.credit_code || '-'],
                ['法人姓名', detailData.legal_person_name || '-'],
                ['开户行', detailData.bank_name || '-'],
                ['对公账户', detailData.bank_account || '-'],
              ].map(([label, value], i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <td
                    style={{
                      padding: '10px 16px',
                      fontWeight: 500,
                      color: '#666',
                      width: 140,
                      verticalAlign: 'top',
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ padding: '10px 16px' }}>{value as React.ReactNode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无数据
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CompanyListPage;
