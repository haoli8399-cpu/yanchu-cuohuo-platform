import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, Card, Tag, Descriptions, Steps, Typography } from 'antd';
import { getDemandDetail } from '../services/apiClient';

const { Title, Text, Paragraph } = Typography;

const STATUS_STEPS = [
  'pending_ai','ai_generated','pending_operator','operator_adjusted',
  'pending_client_confirm','confirmed','pending_deposit','deposit_received',
  'pending_performer','performer_confirmed','performing','finished',
  'pending_final_payment','final_payment_received','settled'
];

const STATUS_LABELS: Record<string,string> = {
  pending_ai:'AI生成中',ai_generated:'方案已生成',pending_operator:'待运营处理',
  operator_adjusted:'方案已调整',pending_client_confirm:'待您确认',confirmed:'已确认',
  pending_deposit:'待付定金',deposit_received:'定金已收',pending_performer:'匹配演员中',
  performer_confirmed:'演员已确认',performing:'演出中',finished:'已完成',
  pending_final_payment:'待付尾款',final_payment_received:'尾款已收',settled:'已结算',
  cancelled:'已取消'
};

export default function DemandDetail() {
  const { id } = useParams<{ id: string }>();
  const [demand, setDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDemandDetail(id).then(d => setDemand(d)).catch(() => setError('加载失败')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Result status="error" title="加载失败" extra={<Button onClick={() => nav('/demands')}>返回</Button>} />;
  if (!demand) return <Result status="404" title="需求不存在" extra={<Button onClick={() => nav('/demands')}>返回</Button>} />;

  const currentStep = STATUS_STEPS.indexOf(demand.status);
  const planContent = demand.final_plan_content || demand.adjusted_plan_content || demand.ai_plan_content;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Button onClick={() => nav('/demands')} style={{ marginBottom: 16 }}>← 返回列表</Button>

      {/* 基本信息 */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>{demand.title}</Title>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="活动类型">{demand.event_type}</Descriptions.Item>
          <Descriptions.Item label="日期">{demand.event_date}</Descriptions.Item>
          <Descriptions.Item label="城市">{demand.city}</Descriptions.Item>
          <Descriptions.Item label="地址">{demand.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="观众人数">{demand.audience_count || '-'}</Descriptions.Item>
          <Descriptions.Item label="预算">{demand.budget ? `¥${demand.budget.toLocaleString()}` : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 状态时间线 */}
      <Card title="订单状态" style={{ marginBottom: 16 }}>
        <Steps current={currentStep >= 0 ? currentStep : 0} size="small" direction="vertical"
          items={STATUS_STEPS.filter((_, i) => i <= currentStep || i === currentStep + 1).map(s => ({
            title: STATUS_LABELS[s] || s,
            status: demand.status_history?.find((h:any) => h.status === s) ? 'finish' : 'wait',
          }))}
        />
      </Card>

      {/* AI 方案 - W-05 */}
      {planContent && (
        <Card title="AI 演出方案" style={{ marginBottom: 16, borderLeft: '4px solid #7c3aed' }}>
          {(() => { try { const p = typeof planContent === 'string' ? JSON.parse(planContent) : planContent; return (
            <div>
              {p.solution_name && <Title level={5} style={{ color: '#7c3aed' }}>{p.solution_name}</Title>}
              {p.scene_category && <Tag color="purple">{p.scene_category}</Tag>}
              {p.business_line && <Tag>{p.business_line}</Tag>}
              {p.actor_config && (
                <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
                  <Descriptions.Item label="推荐咖位">{p.actor_config.tier_recommendation}</Descriptions.Item>
                  <Descriptions.Item label="演员配置">{p.actor_config.specific_roles?.join('、') || '-'}</Descriptions.Item>
                </Descriptions>
              )}
              {p.price_detail && (
                <div style={{ marginTop: 12, padding: 12, background: '#f9f0ff', borderRadius: 8 }}>
                  <Text strong style={{ fontSize: 18, color: '#7c3aed' }}>
                    ¥{(p.price_detail.total_price || p.price_detail.base_price)?.toLocaleString()}
                  </Text>
                </div>
              )}
              {p.duration_minutes && <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>时长：{p.duration_minutes} 分钟</Text>}
              {p.special_notes && <Paragraph type="secondary" style={{ marginTop: 8 }}>备注：{p.special_notes}</Paragraph>}
            </div>
          )} catch { return <pre style={{ fontSize: 13 }}>{planContent}</pre>; }})()}
        </Card>
      )}

      {/* 阵容 - W-05 */}
      {demand.lineups?.length > 0 && (
        <Card title="演出阵容" style={{ marginBottom: 16 }}>
          {demand.lineups.map((l: any) => (
            <Tag key={l.performer?.id} color="blue">{l.performer?.name} ({l.performer?.tier}) - {l.role}</Tag>
          ))}
        </Card>
      )}

      {/* 付款记录 */}
      {demand.payments?.length > 0 && (
        <Card title="付款记录" style={{ marginBottom: 16 }}>
          {demand.payments.map((p: any, i: number) => (
            <Descriptions key={i} column={3} size="small">
              <Descriptions.Item label="类型">{p.type === 'deposit' ? '定金' : '尾款'}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{p.amount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="时间">{p.received_at ? new Date(p.received_at).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            </Descriptions>
          ))}
        </Card>
      )}
    </div>
  );
}
