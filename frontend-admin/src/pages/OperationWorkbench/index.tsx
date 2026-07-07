/**
 * 运营个人工作台 (P-01, P1)
 *
 * 卡片模式待处理列表：
 * - 活动公司名称
 * - 预算
 * - 需求类型
 * - 紧急程度
 * - 已等待时长
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理（loading / empty / error）
 * - UX-3: 加载用骨架屏
 * - UX-4: 空状态显示引导文案
 * - UX-5: 错误显示友好提示 + 重试
 * - API-7: 所有 API 调用通过 apiClient
 * - CMP-1: 单文件 ≤ 300 行
 */
import React, { useRef, useState } from 'react';
import { PageContainer, ProList } from '@ant-design/pro-components';
import type { ActionType, ProListMetas } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Tag,
  Space,
  Spin,
  Empty,
  Result,
  Typography,
  Row,
  Col,
  Skeleton,
} from 'antd';
import {
  ClockCircleOutlined,
  FireOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { PendingTask } from '@/types/operation';
import { getPendingTasks } from '@/services/operation';

const { Text, Title } = Typography;

/** 紧急程度配置 */
const urgencyConfig: Record<PendingTask['urgency'], { color: string; label: string; icon: React.ReactNode }> = {
  urgent: { color: 'red', label: '紧急', icon: <FireOutlined /> },
  normal: { color: 'blue', label: '正常', icon: <ClockCircleOutlined /> },
  low: { color: 'default', label: '低优先', icon: <ClockCircleOutlined /> },
};

/** 格式化预算 */
function formatBudget(yuan: number): string {
  if (yuan >= 10000) {
    return `¥${(yuan / 10000).toFixed(1)}万`;
  }
  return `¥${yuan.toLocaleString('zh-CN')}`;
}

/** 格式化等待时长 */
function formatWaiting(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
  }
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return `${days}天${remainHours}小时`;
}

const OperationWorkbenchPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /** 渲染单张任务卡片 */
  const renderTaskCard = (task: PendingTask): React.ReactNode => {
    const urgency = urgencyConfig[task.urgency] || urgencyConfig.normal;
    const isUrgent = task.urgency === 'urgent';

    return (
      <Card
        hoverable
        bordered
        style={{
          borderRadius: 8,
          borderLeft: isUrgent ? '4px solid #ff4d4f' : undefined,
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[12, 8]} align="middle">
          {/* 活动公司名称 */}
          <Col xs={24} sm={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>活动公司</Text>
            <Title level={5} style={{ margin: '4px 0 0', fontSize: 16 }}>
              {task.companyName}
            </Title>
          </Col>

          {/* 预算 */}
          <Col xs={12} sm={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>预算</Text>
            <div>
              <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                {formatBudget(task.budget)}
              </Text>
            </div>
          </Col>

          {/* 需求类型 */}
          <Col xs={12} sm={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>类型</Text>
            <div>
              <Tag color="purple" style={{ marginTop: 4 }}>
                {task.requirementType}
              </Tag>
            </div>
          </Col>

          {/* 紧急程度 */}
          <Col xs={12} sm={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>紧急度</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color={urgency.color} icon={urgency.icon}>
                {urgency.label}
              </Tag>
            </div>
          </Col>

          {/* 已等待时长 */}
          <Col xs={12} sm={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>已等待</Text>
            <div style={{ marginTop: 4 }}>
              <Text
                strong
                style={{
                  color: isUrgent ? '#ff4d4f' : '#faad14',
                  fontSize: 14,
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {formatWaiting(task.waitingMinutes)}
              </Text>
            </div>
          </Col>

          {/* 操作区 */}
          <Col xs={24} sm={2} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="small"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              处理
            </Button>
          </Col>
        </Row>
      </Card>
    );
  };

  // 骨架屏加载
  if (loading && !error) {
    return (
      <PageContainer
        header={{ title: '运营工作台', breadcrumb: {} }}
      >
        <Spin tip="加载待处理任务...">
          <div style={{ padding: 24 }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} style={{ marginBottom: 12 }}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        </Spin>
      </PageContainer>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PageContainer header={{ title: '运营工作台', breadcrumb: {} }}>
        <Result
          status="error"
          title="待处理任务加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={() => {
                setError(null);
                setLoading(true);
                actionRef.current?.reload();
              }}
            >
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{
        title: '运营工作台',
        breadcrumb: {},
        extra: [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            style={{ minHeight: 44 }}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ],
      }}
    >
      <ProList<PendingTask>
        actionRef={actionRef}
        rowKey="id"
        ghost
        itemCardProps={{
          ghost: false,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        showActions="hover"
        metas={{
          title: {
            dataIndex: 'companyName',
          },
          content: {
            render: (_, record) => renderTaskCard(record),
          },
        }}
        request={async (params) => {
          setLoading(true);
          setError(null);
          try {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const res = await getPendingTasks({ page, pageSize });
            return {
              data: res.data.items,
              success: true,
              total: res.data.total,
            };
          } catch (err) {
            setError(err instanceof Error ? err : new Error('加载待处理任务失败'));
            return { data: [], success: false, total: 0 };
          } finally {
            setLoading(false);
          }
        }}
        // 三态：空数据
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  暂无待处理任务
                  <br />
                  <Text type="secondary">新需求提交后将自动出现在此处</Text>
                </span>
              }
            />
          ),
        }}
      />
    </PageContainer>
  );
};

export default OperationWorkbenchPage;
