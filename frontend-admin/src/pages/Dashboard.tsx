import React, { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Row, Col, Card, Statistic, Skeleton, Result, Button, Typography, Space, Tag } from 'antd';
import {
  BarChartOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  FundProjectionScreenOutlined,
  LineChartOutlined,
  ReloadOutlined,
  RiseOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import apiClient from '@/services/apiClient';

const { Text } = Typography;

interface StatusDistributionItem {
  status: string;
  count: number;
}

interface DailyTrendItem {
  date: string;
  count: number;
}

interface DashboardMetrics {
  todayNewDemands: number;
  todayNewOpportunities: number;
  pendingFollowUps: number;
  totalOpportunities: number;
  wonRate: string;
  avgResponseTime: string;
  statusDistribution: StatusDistributionItem[];
  dailyTrend: DailyTrendItem[];
}

const statusLabel: Record<string, string> = {
  new: '新需求',
  qualified: '已确认',
  quoted: '已报价',
  negotiating: '谈判中',
  pending_client: '等客户',
  won: '已成交',
  lost: '已丢单',
  invalid: '无效',
};

const statusColor: Record<string, string> = {
  new: '#1677ff',
  qualified: '#722ed1',
  quoted: '#fa8c16',
  negotiating: '#eb2f96',
  pending_client: '#faad14',
  won: '#52c41a',
  lost: '#ff4d4f',
  invalid: '#8c8c8c',
};

function formatDateLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${month}/${day}`;
}

function StatusBarChart({ data }: { data: StatusDistributionItem[] }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  if (data.length === 0) {
    return <Text type="secondary">暂无商机状态数据</Text>;
  }

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      {data.map((item) => {
        const width = `${Math.max((item.count / max) * 100, 4)}%`;
        const color = statusColor[item.status] || '#1677ff';
        return (
          <div key={item.status}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Space size={8}>
                <Tag color={color}>{statusLabel[item.status] || item.status}</Tag>
              </Space>
              <Text strong>{item.count}</Text>
            </div>
            <div style={{ height: 10, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width, height: '100%', background: color, borderRadius: 6 }} />
            </div>
          </div>
        );
      })}
    </Space>
  );
}

function TrendLineChart({ data }: { data: DailyTrendItem[] }) {
  const points = useMemo(() => {
    const max = Math.max(...data.map((item) => item.count), 1);
    const width = 640;
    const height = 220;
    const paddingX = 32;
    const paddingY = 28;
    const step = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

    return data.map((item, index) => {
      const x = paddingX + step * index;
      const y = height - paddingY - (item.count / max) * (height - paddingY * 2);
      return { ...item, x, y };
    });
  }, [data]);

  if (data.length === 0) {
    return <Text type="secondary">暂无近 7 日趋势数据</Text>;
  }

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox="0 0 640 260" role="img" aria-label="近7日商机趋势" style={{ width: '100%', height: 260 }}>
        <line x1="32" y1="220" x2="608" y2="220" stroke="#f0f0f0" />
        <polyline points={polyline} fill="none" stroke="#1677ff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="5" fill="#1677ff" />
            <text x={point.x} y={point.y - 12} textAnchor="middle" fill="#262626" fontSize="12">
              {point.count}
            </text>
            <text x={point.x} y="244" textAnchor="middle" fill="#8c8c8c" fontSize="12">
              {formatDateLabel(point.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<DashboardMetrics>('/admin/dashboard');
      setMetrics(res.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载总看板数据失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <PageContainer header={{ title: '运营总看板', breadcrumb: {} }}>
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={10}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
        </Row>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer header={{ title: '运营总看板', breadcrumb: {} }}>
        <Result
          status="error"
          title="运营数据加载失败"
          subTitle={error.message}
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchMetrics}>
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
        title: '运营总看板',
        breadcrumb: {},
        extra: [
          <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchMetrics}>
            刷新
          </Button>,
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="今日新增需求"
              value={metrics?.todayNewDemands ?? 0}
              prefix={<FundProjectionScreenOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="今日新增商机"
              value={metrics?.todayNewOpportunities ?? 0}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="待跟进"
              value={metrics?.pendingFollowUps ?? 0}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总商机数"
              value={metrics?.totalOpportunities ?? 0}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="成交率"
              value={metrics?.wonRate ?? '0%'}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={metrics?.avgResponseTime ?? '0.0h'}
              prefix={<FieldTimeOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="商机状态分布">
            <StatusBarChart data={metrics?.statusDistribution ?? []} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                近7日趋势
              </Space>
            }
          >
            <TrendLineChart data={metrics?.dailyTrend ?? []} />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;
