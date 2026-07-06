/**
 * 销售作战台 — AI辅助商演成交工作台
 *
 * Phase 1 核心页面，四栏布局：
 * ┌──────────────────────────────────────────┐
 * │ 今日待处理3｜待跟进8｜高意向2｜即将过期4    │
 * ├──────────┬──────────────┬────────────────┤
 * │ 商机队列  │ 需求详情      │ AI方案/报价     │
 * │ 🔴 高优   │ 客户信息      │ 省钱版 T4 ¥4,800│
 * │ 🟡 中优   │ 活动信息      │ 主推版 T3 ¥6,000│
 * │ 🟢 低优   │ AI解析结果    │ 升级版 T2 ¥9,000│
 * │          │ 缺失字段      │ 毛利测算 ¥2,000 │
 * ├──────────┴──────────────┴────────────────┤
 * │ 跟进记录｜AI跟进话术｜下一步提醒            │
 * └──────────────────────────────────────────┘
 */

import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import {
  Card, Row, Col, Statistic, Tag, Button, Space, Spin, Empty,
  Typography, List, Descriptions, Badge, Tooltip, message, Modal,
} from 'antd';
import {
  FireOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ReloadOutlined, LikeOutlined,
  DislikeOutlined, SendOutlined, RobotOutlined,
} from '@ant-design/icons';
import apiClient from '@/services/apiClient';

const { Text, Title, Paragraph } = Typography;

// ═══════════ 类型定义 ═══════════

interface Opportunity {
  id: string;
  demand_id: string;
  status: 'new' | 'qualified' | 'quoted' | 'negotiating' | 'pending_client' | 'won' | 'lost' | 'invalid';
  priority: 'high' | 'medium' | 'low';
  lost_reason?: string;
  ai_score?: number;
  next_action?: string;
  next_action_at?: string;
  created_at: string;
  demand?: {
    id: string;
    company_name?: string;
    activity_type?: string;
    performance_type?: string;
    audience_count?: number;
    budget?: number;
    event_date?: string;
    city?: string;
    description?: string;
  };
}

interface Quote {
  id: string;
  opportunity_id: string;
  version: number;
  total_price: number;
  channel_price: number;
  cost_price: number;
  margin: number;
  status: string;
  ai_generated: boolean;
  items_snapshot?: any[];
  created_at: string;
}

interface FollowUp {
  id: string;
  opportunity_id: string;
  action_type: string;
  content: string;
  ai_suggested_script?: string;
  outcome?: string;
  created_at: string;
}

interface Stats {
  newCount: number;
  followUpCount: number;
  highIntentCount: number;
  expiringCount: number;
}

// ═══════════ 样式常量 ═══════════

const statusConfig: Record<string, { color: string; label: string }> = {
  new: { color: '#1677ff', label: '新需求' },
  qualified: { color: '#722ed1', label: '已确认' },
  quoted: { color: '#fa8c16', label: '已报价' },
  negotiating: { color: '#eb2f96', label: '谈判中' },
  pending_client: { color: '#faad14', label: '等客户' },
  won: { color: '#52c41a', label: '已成交' },
  lost: { color: '#ff4d4f', label: '已丢单' },
  invalid: { color: '#d9d9d9', label: '无效' },
};

const priorityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  high: { color: '#ff4d4f', icon: <FireOutlined /> },
  medium: { color: '#faad14', icon: <ClockCircleOutlined /> },
  low: { color: '#52c41a', icon: <CheckCircleOutlined /> },
};

// ═══════════ 组件 ═══════════

const SalesWarRoom: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState<Stats>({ newCount: 0, followUpCount: 0, highIntentCount: 0, expiringCount: 0 });
  const [loading, setLoading] = useState(false);
  const [followScript, setFollowScript] = useState('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; quoteId: string; oppId: string }>({ open: false, quoteId: '', oppId: '' });

  // 加载商机列表
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ items: Opportunity[]; total: number }>('/opportunities?page=1&pageSize=50');
      setOpportunities(res.data.items || []);
      setStats({
        newCount: res.data.items?.filter(o => o.status === 'new').length || 0,
        followUpCount: res.data.items?.filter(o => ['negotiating', 'pending_client'].includes(o.status)).length || 0,
        highIntentCount: res.data.items?.filter(o => o.status === 'quoted' && o.priority === 'high').length || 0,
        expiringCount: 0, // 后续从quotes表计算
      });
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  // 加载商机详情
  const loadOppDetail = async (opp: Opportunity) => {
    setSelectedOpp(opp);
    try {
      const [qRes, fRes] = await Promise.all([
        apiClient.get<{ items: Quote[] }>(`/opportunities/${opp.id}/quotes`),
        apiClient.get<{ items: FollowUp[] }>(`/opportunities/${opp.id}/follow-ups`),
      ]);
      setQuotes(qRes.data.items || []);
      setFollowUps(fRes.data.items || []);
    } catch {
      setQuotes([]);
      setFollowUps([]);
    }
  };

  // 更新商机状态
  const updateStatus = async (opp: Opportunity, newStatus: string, lostReason?: string) => {
    try {
      await apiClient.patch(`/opportunities/${opp.id}/status`, { status: newStatus, lost_reason: lostReason });
      message.success('状态已更新');
      loadOpportunities();
      if (selectedOpp?.id === opp.id) loadOppDetail(opp);
    } catch {
      message.error('更新失败');
    }
  };

  // AI生成跟进话术
  const generateFollowScript = async () => {
    if (!selectedOpp) return;
    setScriptLoading(true);
    try {
      const res = await apiClient.post<{ script: string }>('/ai/generate-follow-up', {
        opportunity_id: selectedOpp.id,
        last_contact_at: followUps[0]?.created_at,
      });
      setFollowScript(res.data.script || '暂无建议');
    } catch {
      setFollowScript('生成失败，请重试');
    } finally {
      setScriptLoading(false);
    }
  };

  // AI反馈
  const submitFeedback = async (quoteId: string, oppId: string, action: 'accept' | 'reject', reason?: string) => {
    try {
      await apiClient.post('/ai/feedback', {
        opportunity_id: oppId,
        quote_id: quoteId,
        feedback_type: 'plan_recommendation',
        feedback_action: action,
        reject_reason: reason,
      });
      message.success('反馈已记录');
    } catch {
      message.error('反馈失败');
    }
  };

  useEffect(() => { loadOpportunities(); }, []);

  // ═══════════ 渲染 ═══════════

  return (
    <PageContainer header={{ title: '销售作战台', breadcrumb: {} }}>
      {/* 顶栏：数据总览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="今日待处理" value={stats.newCount} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="待跟进" value={stats.followUpCount} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="高意向" value={stats.highIntentCount} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="即将过期报价" value={stats.expiringCount} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
      </Row>

      {/* 主区域：三栏 */}
      <Row gutter={16}>
        {/* 左栏：商机队列 */}
        <Col span={6}>
          <Card title="商机队列" size="small" extra={<Button size="small" icon={<ReloadOutlined />} onClick={loadOpportunities} />}
            style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}>
            <Spin spinning={loading}>
              <List
                dataSource={opportunities}
                renderItem={(opp) => {
                  const st = statusConfig[opp.status] || statusConfig.new;
                  const pr = priorityConfig[opp.priority] || priorityConfig.medium;
                  const isActive = selectedOpp?.id === opp.id;
                  return (
                    <Card
                      key={opp.id}
                      size="small"
                      hoverable
                      style={{
                        marginBottom: 8,
                        borderLeft: `3px solid ${st.color}`,
                        background: isActive ? '#f0f5ff' : undefined,
                      }}
                      onClick={() => loadOppDetail(opp)}
                    >
                      <Space direction="vertical" size={2}>
                        <Tag color={st.color}>{st.label}</Tag>
                        {pr.icon}
                        <Text strong ellipsis>{opp.demand?.company_name || '未知公司'}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {opp.demand?.performance_type || '—'} · {opp.ai_score ? `AI评分 ${opp.ai_score}` : ''}
                        </Text>
                      </Space>
                    </Card>
                  );
                }}
                locale={{ emptyText: <Empty description="暂无商机" /> }}
              />
            </Spin>
          </Card>
        </Col>

        {/* 中栏：需求详情 */}
        <Col span={10}>
          <Card title="需求详情" size="small" style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}>
            {selectedOpp ? (
              <>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="客户">{selectedOpp.demand?.company_name || '—'}</Descriptions.Item>
                  <Descriptions.Item label="活动类型">{selectedOpp.demand?.activity_type || '—'}</Descriptions.Item>
                  <Descriptions.Item label="演出类型">{selectedOpp.demand?.performance_type || '—'}</Descriptions.Item>
                  <Descriptions.Item label="人数">{selectedOpp.demand?.audience_count || '—'}</Descriptions.Item>
                  <Descriptions.Item label="预算">{selectedOpp.demand?.budget ? `¥${selectedOpp.demand.budget.toLocaleString()}` : '—'}</Descriptions.Item>
                  <Descriptions.Item label="日期">{selectedOpp.demand?.event_date || '—'}</Descriptions.Item>
                  <Descriptions.Item label="城市" span={2}>{selectedOpp.demand?.city || '—'}</Descriptions.Item>
                  <Descriptions.Item label="需求描述" span={2}>{selectedOpp.demand?.description || '—'}</Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 12 }}>
                  <Text strong>商机状态：</Text>
                  <Tag color={statusConfig[selectedOpp.status]?.color}>{statusConfig[selectedOpp.status]?.label}</Tag>
                  <Badge status={selectedOpp.priority === 'high' ? 'error' : 'processing'} text={selectedOpp.priority === 'high' ? '高优先' : '普通'} />

                  <div style={{ marginTop: 8 }}>
                    <Space wrap>
                      {selectedOpp.status === 'new' && (
                        <Button size="small" type="primary" onClick={() => updateStatus(selectedOpp, 'qualified')}>确认有效</Button>
                      )}
                      {selectedOpp.status === 'qualified' && (
                        <Button size="small" type="primary" onClick={() => updateStatus(selectedOpp, 'quoted')}>已报价</Button>
                      )}
                      {(selectedOpp.status === 'quoted' || selectedOpp.status === 'negotiating') && (
                        <>
                          <Button size="small" onClick={() => updateStatus(selectedOpp, 'negotiating')}>进入谈判</Button>
                          <Button size="small" type="primary" onClick={() => updateStatus(selectedOpp, 'won')}>成交</Button>
                        </>
                      )}
                      <Button size="small" danger onClick={() => {
                        Modal.confirm({
                          title: '丢单原因',
                          content: (
                            <select id="lost-reason-select" style={{ width: '100%', padding: 8 }}>
                              <option value="">请选择</option>
                              <option value="budget_low">预算太低</option>
                              <option value="date_unavailable">日期不合适</option>
                              <option value="no_response">客户无回应</option>
                              <option value="competitor">被竞品抢单</option>
                              <option value="mismatch">方案不匹配</option>
                              <option value="cancelled">客户取消活动</option>
                              <option value="price_high">价格太高</option>
                              <option value="not_real">非真实需求</option>
                            </select>
                          ),
                          onOk: () => {
                            const sel = document.getElementById('lost-reason-select') as HTMLSelectElement;
                            return updateStatus(selectedOpp, 'lost', sel?.value || 'unknown');
                          },
                        });
                      }}>丢单</Button>
                    </Space>
                  </div>
                </div>
              </>
            ) : (
              <Empty description="选择左侧商机查看详情" />
            )}
          </Card>
        </Col>

        {/* 右栏：AI方案/报价 */}
        <Col span={8}>
          <Card
            title={<><RobotOutlined /> AI方案推荐</>}
            size="small"
            style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}
          >
            {quotes.length > 0 ? quotes.slice(-1).map((quote) => (
              <div key={quote.id}>
                <Card size="small" style={{ marginBottom: 8, borderLeft: '3px solid #1677ff' }}>
                  <Text strong>主推版 (v{quote.version})</Text>
                  <div style={{ fontSize: 24, color: '#1677ff', fontWeight: 700 }}>¥{quote.total_price?.toLocaleString()}</div>
                  <Text type="secondary">渠道价 ¥{quote.channel_price?.toLocaleString()} · 毛利 ¥{quote.margin?.toLocaleString()}</Text>
                </Card>

                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Button size="small" type="primary" icon={<LikeOutlined />}
                      onClick={() => submitFeedback(quote.id, selectedOpp!.id, 'accept')}>
                      采纳
                    </Button>
                    <Button size="small" icon={<DislikeOutlined />}
                      onClick={() => setFeedbackModal({ open: true, quoteId: quote.id, oppId: selectedOpp!.id })}>
                      不采纳
                    </Button>
                    <Button size="small" icon={<SendOutlined />}>发送方案</Button>
                  </Space>
                </div>
              </div>
            )) : (
              <Empty description={selectedOpp ? '暂无AI推荐方案' : '选择商机后显示AI推荐'} />
            )}
          </Card>
        </Col>
      </Row>

      {/* 底栏：跟进记录 */}
      <Card title="跟进记录" size="small" style={{ marginTop: 16 }}
        extra={
          selectedOpp && (
            <Button size="small" icon={<RobotOutlined />} loading={scriptLoading} onClick={generateFollowScript}>
              AI生成跟进话术
            </Button>
          )
        }
      >
        {followScript && (
          <Card size="small" type="inner" style={{ marginBottom: 8, background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Text strong>🤖 AI建议：</Text>
            <Paragraph style={{ marginTop: 4 }}>{followScript}</Paragraph>
          </Card>
        )}
        {followUps.length > 0 ? (
          <List
            size="small"
            dataSource={followUps}
            renderItem={(fu) => (
              <List.Item>
                <Space>
                  <Tag>{fu.action_type}</Tag>
                  <Text>{fu.content || '—'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{new Date(fu.created_at).toLocaleString('zh-CN')}</Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无跟进记录" />
        )}
      </Card>

      {/* 反馈Modal */}
      <Modal
        open={feedbackModal.open}
        title="不采纳原因"
        onCancel={() => setFeedbackModal({ open: false, quoteId: '', oppId: '' })}
        footer={[
          <Button key="cancel" onClick={() => setFeedbackModal({ open: false, quoteId: '', oppId: '' })}>取消</Button>,
          ...['不适合', '价格偏差', '艺人不合适', '其他'].map((reason) => (
            <Button key={reason} type="primary" danger
              onClick={() => {
                submitFeedback(feedbackModal.quoteId, feedbackModal.oppId, 'reject', reason);
                setFeedbackModal({ open: false, quoteId: '', oppId: '' });
              }}>
              {reason}
            </Button>
          )),
        ]}
      >
        <p>请选择不采纳的原因（将用于改进 AI 推荐）：</p>
      </Modal>
    </PageContainer>
  );
};

export default SalesWarRoom;
