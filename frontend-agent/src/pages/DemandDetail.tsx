import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Spin,
  Result,
  Space,
  Steps,
  Row,
  Col,
  Divider,
  message,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import * as api from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import {
  DEMAND_STATUS_LABELS,
  DEMAND_STATUS_COLORS,
} from '../types';
import type { DemandDetail, SchemePlan, TimelineStep } from '../types';
import type { ApiError } from '../services/apiClient';

type LoadState = 'loading' | 'error' | 'ok';

export default function DemandDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [demand, setDemand] = useState<DemandDetail | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!isLoggedIn) {
      setLoadState('error');
      setErrorMsg('请先登录');
      return;
    }

    let cancelled = false;
    const fetchDetail = async (): Promise<void> => {
      setLoadState('loading');
      try {
        const data = (await api.getDemandDetail(id)) as DemandDetail;
        if (!cancelled) {
          setDemand(data);
          setLoadState('ok');
        }
      } catch (err) {
        if (!cancelled) {
          const e = err as ApiError;
          setLoadState('error');
          setErrorMsg(e.message ?? '加载失败');
        }
      }
    };

    void fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id, isLoggedIn]);

  const handleConfirmPlan = (plan: SchemePlan): void => {
    if (!demand) return;
    Modal.confirm({
      title: '确认方案',
      icon: <ExclamationCircleOutlined />,
      content: `确认选择方案「${plan.name}」吗？确认后将进入订单流程。`,
      okText: '确认选择',
      cancelText: '取消',
      onOk: async () => {
        setConfirming(true);
        try {
          await api.confirmPlan(demand.id, plan.id);
          message.success('方案已确认');
          // 重新加载详情
          const data = (await api.getDemandDetail(demand.id)) as DemandDetail;
          setDemand(data);
        } catch (err) {
          const e = err as ApiError;
          message.error(e.message ?? '确认失败');
        } finally {
          setConfirming(false);
        }
      },
    });
  };

  // 未登录
  if (!isLoggedIn) {
    return (
      <Result
        status="warning"
        title="请先登录"
        subTitle="登录后查看需求详情"
        extra={
          <Button type="primary" onClick={() => navigate('/login')} style={{ height: 44 }}>
            去登录
          </Button>
        }
      />
    );
  }

  // 加载中
  if (loadState === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 加载失败
  if (loadState === 'error') {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={errorMsg}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
            style={{ height: 44 }}
          >
            重试
          </Button>
        }
      />
    );
  }

  if (!demand) {
    return (
      <Result
        status="warning"
        title="需求不存在"
        extra={
          <Button onClick={() => navigate('/demands')} style={{ height: 44 }}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* 返回按钮 */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/demands')}
        style={{ height: 44, marginBottom: 16 }}
      >
        返回历史记录
      </Button>

      {/* 基本信息 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {demand.title}
          </Typography.Title>
          <Space>
            <Tag color={DEMAND_STATUS_COLORS[demand.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
              {DEMAND_STATUS_LABELS[demand.status]}
            </Tag>
            {demand.urgency === 'urgent' && (
              <Tag color="volcano" style={{ fontSize: 14 }}>紧急</Tag>
            )}
            {demand.urgency === 'emergency' && (
              <Tag color="red" style={{ fontSize: 14 }}>特急</Tag>
            )}
          </Space>
        </div>

        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="活动类型">{demand.event_type}</Descriptions.Item>
          <Descriptions.Item label="活动日期">{demand.event_date}</Descriptions.Item>
          <Descriptions.Item label="活动时间">{demand.event_time ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">{demand.city}</Descriptions.Item>
          <Descriptions.Item label="地址">{demand.address}</Descriptions.Item>
          <Descriptions.Item label="预估人数">{demand.audience_count ? `${demand.audience_count}人` : '-'}</Descriptions.Item>
          {demand.budget && (
            <Descriptions.Item label="预算">¥{demand.budget.toLocaleString()}</Descriptions.Item>
          )}
          {demand.venue_name && (
            <Descriptions.Item label="场地名称">{demand.venue_name}</Descriptions.Item>
          )}
          {demand.venue_type && (
            <Descriptions.Item label="场地类型">{demand.venue_type}</Descriptions.Item>
          )}
          {demand.comedy_style && (
            <Descriptions.Item label="风格偏好">{demand.comedy_style}</Descriptions.Item>
          )}
          {demand.duration_minutes && (
            <Descriptions.Item label="演出时长">{demand.duration_minutes}分钟</Descriptions.Item>
          )}
          <Descriptions.Item label="提交时间">
            {new Date(demand.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>

        {demand.special_requirements && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Typography.Text type="secondary" strong>特殊需求：</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginTop: 4 }}>
              {demand.special_requirements}
            </Typography.Paragraph>
          </>
        )}
      </Card>

      {/* W-09: 订单时间线 */}
      {demand.timeline && demand.timeline.length > 0 && (
        <Card title="📋 订单时间线" style={{ marginBottom: 16 }}>
          <Steps
            direction="horizontal"
            size="small"
            current={demand.timeline.findIndex((s) => s.is_current)}
            status={demand.status === 'cancelled' || demand.status === 'refunding' ? 'error' : 'process'}
            items={demand.timeline.map((step: TimelineStep) => ({
              title: (
                <div>
                  <div style={{ fontWeight: step.is_current ? 700 : 400 }}>
                    {step.label}
                  </div>
                  {step.time && (
                    <div style={{ fontSize: 11, color: '#999' }}>
                      {new Date(step.time).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              ),
              description: step.description,
              status: step.is_completed
                ? ('finish' as const)
                : step.is_current
                  ? ('process' as const)
                  : ('wait' as const),
            }))}
            style={{ overflowX: 'auto', padding: '8px 0' }}
          />
        </Card>
      )}

      {/* W-07: 多方案对比 */}
      {demand.plans && demand.plans.length > 0 && (
        <Card title="🎯 方案对比" style={{ marginBottom: 16 }}>
          {demand.plans.length === 1 ? (
            /* 单方案展示 */
            <div style={{ padding: 16 }}>
              <SinglePlanCard plan={demand.plans[0]} />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirmPlan(demand.plans[0])}
                  loading={confirming}
                  style={{ height: 44 }}
                >
                  确认此方案
                </Button>
              </div>
            </div>
          ) : (
            /* 多方案并列对比 */
            <Row gutter={[16, 16]}>
              {demand.plans.map((plan) => (
                <Col key={plan.id} xs={24} md={demand.plans.length === 2 ? 12 : 8}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderColor: '#d9d9d9',
                      transition: 'all 0.3s',
                    }}
                    actions={[
                      <Button
                        key="confirm"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleConfirmPlan(plan)}
                        loading={confirming}
                        style={{ height: 44 }}
                      >
                        选择此方案
                      </Button>,
                    ]}
                  >
                    {plan.cover_url && (
                      <div
                        style={{
                          height: 140,
                          borderRadius: 8,
                          background: `url(${plan.cover_url}) center/cover no-repeat`,
                          marginBottom: 12,
                        }}
                      />
                    )}
                    <Typography.Title level={4} style={{ marginTop: 0 }}>
                      {plan.name}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      基于 SKU：{plan.sku_name}
                    </Typography.Text>

                    <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
                      <Descriptions.Item label="演员人数">{plan.performer_count}人</Descriptions.Item>
                      <Descriptions.Item label="时长">{plan.duration_minutes}分钟</Descriptions.Item>
                      <Descriptions.Item label="演员画像">{plan.performer_profile}</Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginTop: 12 }}>
                      {plan.style_tags.map((tag) => (
                        <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                      ))}
                    </div>

                    {plan.highlights && plan.highlights.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <Typography.Text strong>方案亮点：</Typography.Text>
                        <ul style={{ paddingLeft: 20, margin: '4px 0 0' }}>
                          {plan.highlights.map((h, idx) => (
                            <li key={idx} style={{ fontSize: 13, color: '#666' }}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ textAlign: 'center' }}>
                      <Typography.Text type="secondary" delete>
                        ¥{plan.total_price.toLocaleString()}
                      </Typography.Text>
                      <div>
                        <Typography.Text strong style={{ color: '#ff4d4f', fontSize: 20 }}>
                          ¥{plan.agent_price.toLocaleString()}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {' '}活动公司价
                        </Typography.Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      )}

      {/* 无方案时的说明 */}
      {(!demand.plans || demand.plans.length === 0) && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <ClockCircleOutlined style={{ fontSize: 48 }} />
            <div style={{ marginTop: 12 }}>
              <Typography.Text type="secondary">
                {demand.status === 'pending_ai' || demand.status === 'ai_generated'
                  ? 'AI 正在为您生成方案，请稍候...'
                  : demand.status === 'pending_operator'
                    ? '方案正在由运营审核调整中...'
                    : '暂无可用方案'}
              </Typography.Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/** 单方案卡片 */
function SinglePlanCard({ plan }: { plan: SchemePlan }): React.ReactElement {
  return (
    <div>
      {plan.cover_url && (
        <div
          style={{
            height: 200,
            borderRadius: 8,
            background: `url(${plan.cover_url}) center/cover no-repeat`,
            marginBottom: 16,
          }}
        />
      )}
      <Typography.Title level={4}>{plan.name}</Typography.Title>
      <Typography.Text type="secondary">基于 SKU：{plan.sku_name}</Typography.Text>

      <Descriptions column={{ xs: 1, sm: 3 }} size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label="演员人数">{plan.performer_count}人</Descriptions.Item>
        <Descriptions.Item label="时长">{plan.duration_minutes}分钟</Descriptions.Item>
        <Descriptions.Item label="演员画像">{plan.performer_profile}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 12 }}>
        {plan.style_tags.map((tag) => (
          <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
        ))}
      </div>

      {plan.highlights && plan.highlights.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Typography.Text strong style={{ fontSize: 15 }}>方案亮点：</Typography.Text>
          <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
            {plan.highlights.map((h, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Typography.Text type="secondary" delete>
          ¥{plan.total_price.toLocaleString()}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}> 甲方标准价</Typography.Text>
        <div style={{ marginTop: 4 }}>
          <Typography.Text strong style={{ color: '#ff4d4f', fontSize: 28 }}>
            ¥{plan.agent_price.toLocaleString()}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {' '}活动公司专享价
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
