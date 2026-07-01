/**
 * 需求详情页 (P-04, P-28, P0)
 *
 * 详情展示：客户信息 + AI方案预览 + 运营调整 + 阵容 + 付款 + 时间线
 * 三态处理：loading / error
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-5: 错误显示友好提示 + 重试
 * - CMP-1: 单文件 ≤ 300 行
 */
import React, { useState, useEffect } from 'react';
import { useParams, history } from '@umijs/max';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Result,
  Descriptions,
  Timeline,
  Empty,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  RobotOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { DemandDetail, Lineup, Payment } from '@/types/demand';
import {
  DemandStatusLabel,
  DemandStatusColor,
  UrgencyLabel,
  UrgencyColor,
  SourceLabel,
} from '@/types/demand';
import { getDemandDetail } from '@/services/demand';

const { Text, Paragraph } = Typography;

/** 解析 AI 方案 JSON */
function parseAIPlan(content?: string): Record<string, unknown> | null {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const DemandDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const demandId = params.id!;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [demand, setDemand] = useState<DemandDetail | null>(null);

  const fetchDetail = () => {
    setLoading(true);
    setError(null);
    getDemandDetail(demandId)
      .then((res) => {
        setDemand(res.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('加载需求详情失败'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [demandId]);

  const handleBack = () => {
    history.push('/demand/list');
  };

  const handleGoAIPlan = () => {
    history.push(`/demand/ai-plan/${demandId}`);
  };

  // 加载中
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载需求详情..." />
        </div>
      </PageContainer>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PageContainer onBack={handleBack}>
        <Result
          status="error"
          title="需求详情加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={fetchDetail}
            >
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!demand) return null;

  const aiPlan = parseAIPlan(demand.ai_plan_content);

  // 阵容表格列
  const lineupColumns = [
    { title: '演员', dataIndex: ['performer', 'name'], key: 'name' },
    {
      title: '咖位',
      dataIndex: ['performer', 'tier'],
      key: 'tier',
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: '角色', dataIndex: 'role', key: 'role' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'processing', text: '待确认' },
          confirmed: { color: 'green', text: '已确认' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        const cfg = map[v] || { color: 'default', text: v };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
  ];

  // 付款记录表格列
  const paymentColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => (
        <Tag color={v === 'deposit' ? 'gold' : 'blue'}>
          {v === 'deposit' ? '定金' : '尾款'}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    { title: '方式', dataIndex: 'method', key: 'method' },
    {
      title: '收款时间',
      dataIndex: 'received_at',
      key: 'received_at',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <PageContainer
      onBack={handleBack}
      title={
        <Space>
          <span>{demand.title || '需求详情'}</span>
          <Tag color={DemandStatusColor[demand.status]}>
            {DemandStatusLabel[demand.status]}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            style={{ minHeight: 44 }}
            onClick={handleGoAIPlan}
          >
            AI方案审核
          </Button>
          <Button
            icon={<ReloadOutlined />}
            style={{ minHeight: 44 }}
            onClick={fetchDetail}
          >
            刷新
          </Button>
        </Space>
      }
    >
      {/* 客户信息 + 基本信息 (P-28) */}
      <ProCard title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="活动公司">
            {demand.client?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="来源">
            <Tag>{SourceLabel[demand.source]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="活动类型">
            {demand.event_type}
          </Descriptions.Item>
          <Descriptions.Item label="紧急程度">
            <Tag color={UrgencyColor[demand.urgency]}>
              {UrgencyLabel[demand.urgency]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="活动日期">
            {demand.event_date}
          </Descriptions.Item>
          <Descriptions.Item label="活动时间">
            {demand.event_time || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="城市">{demand.city}</Descriptions.Item>
          <Descriptions.Item label="地址">{demand.address}</Descriptions.Item>
          <Descriptions.Item label="观众人数">
            {demand.audience_count ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="预算">
            {demand.budget ? `¥${demand.budget.toLocaleString()}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="演出时长">
            {demand.duration_minutes
              ? `${demand.duration_minutes}分钟`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="喜剧风格">
            {demand.comedy_style || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="特殊要求" span={2}>
            {demand.special_requirements || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(demand.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(demand.updated_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </ProCard>

      {/* AI 方案预览 */}
      <ProCard
        title={
          <Space>
            <RobotOutlined />
            <span>AI 方案</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Button
            size="small"
            style={{ minHeight: 44 }}
            onClick={handleGoAIPlan}
          >
            查看完整方案
          </Button>
        }
      >
        {aiPlan ? (
          <div
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>
              {JSON.stringify(aiPlan, null, 2)}
            </pre>
          </div>
        ) : demand.ai_plan_content ? (
          <Paragraph
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {demand.ai_plan_content}
          </Paragraph>
        ) : (
          <Empty description="AI 方案尚未生成" />
        )}
      </ProCard>

      {/* 运营调整方案 */}
      {demand.adjusted_plan_content && (
        <ProCard
          title={
            <Space>
              <EditOutlined />
              <span>运营调整方案</span>
              <Tag color="green">已调整</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Paragraph
            style={{
              background: '#f6ffed',
              padding: 16,
              borderRadius: 8,
              whiteSpace: 'pre-wrap',
              border: '1px solid #b7eb8f',
            }}
          >
            {demand.adjusted_plan_content}
          </Paragraph>
          {demand.final_price && (
            <div style={{ marginTop: 8 }}>
              <Text strong>最终报价：</Text>
              <Text style={{ fontSize: 18, color: '#cf1322' }}>
                ¥{demand.final_price.toLocaleString()}
              </Text>
            </div>
          )}
        </ProCard>
      )}

      {/* 阵容 */}
      {demand.lineups && demand.lineups.length > 0 && (
        <ProCard title="演出阵容" style={{ marginBottom: 16 }}>
          <Table<Lineup>
            dataSource={demand.lineups}
            columns={lineupColumns}
            rowKey={(r) => r.performer.id}
            pagination={false}
            size="small"
          />
        </ProCard>
      )}

      {/* 付款记录 */}
      {demand.payments && demand.payments.length > 0 && (
        <ProCard title="付款记录" style={{ marginBottom: 16 }}>
          <Table<Payment>
            dataSource={demand.payments}
            columns={paymentColumns}
            rowKey={(_, idx) => String(idx)}
            pagination={false}
            size="small"
          />
        </ProCard>
      )}

      {/* 状态时间线 */}
      <ProCard title="状态时间线">
        {demand.status_history && demand.status_history.length > 0 ? (
          <Timeline
            items={demand.status_history.map((h) => ({
              color:
                h.status === 'cancelled' || h.status === 'refunding'
                  ? 'red'
                  : 'blue',
              children: (
                <div>
                  <Tag color={DemandStatusColor[h.status]}>
                    {DemandStatusLabel[h.status]}
                  </Tag>
                  <Text style={{ fontSize: 13, marginLeft: 8 }}>
                    {new Date(h.at).toLocaleString('zh-CN')}
                  </Text>
                  {h.operator_id && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      操作人：{h.operator_id}
                    </Text>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无状态记录" />
        )}
      </ProCard>
    </PageContainer>
  );
};

export default DemandDetailPage;
