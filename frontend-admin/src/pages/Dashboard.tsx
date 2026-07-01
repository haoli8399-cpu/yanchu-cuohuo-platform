/**
 * 运营总看板 (P-02, P0)
 *
 * 展示供需健康指标：
 * - 演员月接单率
 * - 活动公司月活率
 * - 在线SKU、合作演员、本月订单等概览指标
 *
 * Code Standards:
 * - UX-2: 三态处理（loading / empty / error）
 * - UX-3: 加载用骨架屏
 * - UX-5: 错误显示友好提示 + 重试
 * - API-7: 所有 API 调用通过 apiClient
 */
import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Row, Col, Card, Statistic, Skeleton, Result, Button, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { SupplyDemandMetrics } from '@/types/operation';
import { getSupplyDemandMetrics } from '@/services/operation';

const { Text, Title } = Typography;

/** 变化趋势箭头 */
function TrendIcon({ value }: { value: number }) {
  if (value > 0) {
    return <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />;
  }
  if (value < 0) {
    return <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />;
  }
  return null;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SupplyDemandMetrics | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = () => {
    setLoading(true);
    setError(null);
    getSupplyDemandMetrics()
      .then((res) => {
        setMetrics(res.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('加载指标失败'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // 加载中 - 骨架屏
  if (loading) {
    return (
      <PageContainer
        header={{
          title: '运营总看板',
          breadcrumb: {},
        }}
      >
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card title="供需健康指标" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
            <Col span={12}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PageContainer
        header={{
          title: '运营总看板',
          breadcrumb: {},
        }}
      >
        <Result
          status="error"
          title="运营数据加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={fetchMetrics}
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
        title: '运营总看板',
        breadcrumb: {},
        extra: [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            style={{ minHeight: 44 }}
            onClick={fetchMetrics}
          >
            刷新
          </Button>,
        ],
      }}
    >
      {/* 概览指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线SKU"
              value={metrics?.onlineSKUCount ?? 0}
              prefix={<ShoppingCartOutlined style={{ color: '#1677ff' }} />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="合作演员"
              value={metrics?.activeActorCount ?? 0}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月订单"
              value={metrics?.monthlyOrderCount ?? 0}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={metrics?.monthlyCompletedCount ?? 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      {/* 供需健康指标详情卡片 */}
      <Card
        title={
          <span>
            <RiseOutlined style={{ marginRight: 8 }} />
            供需健康指标
          </span>
        }
        style={{ marginTop: 16 }}
      >
        <Row gutter={[24, 24]}>
          {/* 演员月接单率 */}
          <Col xs={24} lg={12}>
            <Card
              type="inner"
              title="演员月接单率"
              style={{ background: '#fafafa' }}
            >
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Title level={2} style={{ margin: 0, color: '#1677ff' }}>
                  {metrics ? `${metrics.actorMonthlyAcceptRate.toFixed(1)}%` : '--'}
                </Title>
                <div style={{ marginTop: 8 }}>
                  <TrendIcon value={metrics?.actorMonthlyAcceptChange ?? 0} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 14,
                      color:
                        (metrics?.actorMonthlyAcceptChange ?? 0) >= 0
                          ? '#52c41a'
                          : '#ff4d4f',
                    }}
                  >
                    较上月{' '}
                    {(metrics?.actorMonthlyAcceptChange ?? 0) >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(metrics?.actorMonthlyAcceptChange ?? 0).toFixed(1)}%
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* 活动公司月活率 */}
          <Col xs={24} lg={12}>
            <Card
              type="inner"
              title="活动公司月活率"
              style={{ background: '#fafafa' }}
            >
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                  {metrics ? `${metrics.companyMonthlyActiveRate.toFixed(1)}%` : '--'}
                </Title>
                <div style={{ marginTop: 8 }}>
                  <TrendIcon value={metrics?.companyMonthlyActiveChange ?? 0} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 14,
                      color:
                        (metrics?.companyMonthlyActiveChange ?? 0) >= 0
                          ? '#52c41a'
                          : '#ff4d4f',
                    }}
                  >
                    较上月{' '}
                    {(metrics?.companyMonthlyActiveChange ?? 0) >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(metrics?.companyMonthlyActiveChange ?? 0).toFixed(1)}%
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 数据更新时间 */}
      {metrics?.updatedAt && (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Text type="secondary">
            数据更新时间：{new Date(metrics.updatedAt).toLocaleString('zh-CN')}
          </Text>
        </div>
      )}
    </PageContainer>
  );
};

export default DashboardPage;
