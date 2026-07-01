/**
 * 运营工作台 Dashboard (P-02, P0)
 *
 * 展示核心运营指标卡片
 */
import React from 'react';
import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Card } from 'antd';
import {
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Statistic } = StatisticCard;

const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: '运营工作台',
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '在线SKU',
              value: 12,
              icon: <ShoppingCartOutlined style={{ color: '#1677ff', fontSize: 24 }} />,
              suffix: '个',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '合作演员',
              value: 48,
              icon: <TeamOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
              suffix: '人',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '本月订单',
              value: 156,
              icon: <DollarOutlined style={{ color: '#faad14', fontSize: 24 }} />,
              suffix: '笔',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '已完成',
              value: 142,
              icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
              suffix: '笔',
            }}
          />
        </Col>
      </Row>

      <Card title="供需健康指标" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <StatisticCard
              statistic={{
                title: '演员月接单率',
                value: '82.5%',
                description: '较上月 ↑ 3.2%',
              }}
              chart={
                <div style={{ height: 100, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  图表区域（待ECharts集成）
                </div>
              }
            />
          </Col>
          <Col span={12}>
            <StatisticCard
              statistic={{
                title: '活动公司月活率',
                value: '67.8%',
                description: '较上月 ↑ 1.5%',
              }}
              chart={
                <div style={{ height: 100, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  图表区域（待ECharts集成）
                </div>
              }
            />
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default DashboardPage;
