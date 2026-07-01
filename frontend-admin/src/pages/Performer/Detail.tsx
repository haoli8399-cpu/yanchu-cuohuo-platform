/**
 * 演员详情页 (P-08/P-33/P-10, P1)
 *
 * 功能：
 * - 查看演员详细信息
 * - 咖位调整（手动调整 + 系统建议）
 * - 信誉分查看（详情 + 变动明细）
 * - 编辑演员资料
 *
 * 三态处理：loading / error
 *
 * Code Standards:
 * - UX-2: 三态处理
 * - API-7: 所有 API 调用通过 apiClient
 * - CMP-1: 单文件 ≤ 300 行
 */
import React, { useState, useEffect } from 'react';
import { useParams, history } from '@umijs/max';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Space,
  message,
  Spin,
  Result,
  Descriptions,
  Tag,
  Tabs,
  Modal,
  Input,
  Form,
  Statistic,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  RiseOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type {
  PerformerDetail,
  PerformerTier,
  CreditLevel,
  TierSuggestion,
  TierHistoryItem,
  CreditDetail,
  CreditLogItem,
  CreditDetail as CreditDetailType,
} from '@/types/performer';
import {
  PerformerTierLabel,
  PerformerTierColor,
  CreditLevelLabel,
  CreditLevelColor,
} from '@/types/performer';
import {
  getPerformerDetail,
  adjustPerformerTier,
  getTierHistory,
  getTierSuggestion,
  getCreditDetail,
  getCreditLogs,
} from '@/services/performer';

const { TextArea } = Input;

/** 格式化价格（分 → 元，保留0位小数） */
function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

const PerformerDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const performerId = params.id!;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [performer, setPerformer] = useState<PerformerDetail | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  // 咖位相关
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [tierSuggestion, setTierSuggestion] = useState<TierSuggestion | null>(null);
  const [tierHistory, setTierHistory] = useState<TierHistoryItem[]>([]);
  const [adjustingTier, setAdjustingTier] = useState(false);
  const [tierForm] = Form.useForm();

  // 信誉分相关
  const [creditDetail, setCreditDetail] = useState<CreditDetailType | null>(null);

  /** 加载演员详情 */
  const loadPerformer = () => {
    setLoading(true);
    setError(null);
    getPerformerDetail(performerId)
      .then((res) => setPerformer(res.data))
      .catch((err) => setError(err instanceof Error ? err : new Error('加载失败')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPerformer();
    // 同时加载咖位建议和历史
    getTierSuggestion(performerId)
      .then((res) => setTierSuggestion(res.data))
      .catch((e) => console.error('加载咖位建议失败:', e));
    getTierHistory(performerId)
      .then((res) => setTierHistory(res.data))
      .catch((e) => console.error('加载咖位历史失败:', e));
    getCreditDetail(performerId)
      .then((res) => setCreditDetail(res.data))
      .catch((e) => console.error('加载信誉分明细失败:', e));
  }, [performerId]);

  /** 手动调整咖位 */
  const handleAdjustTier = async () => {
    try {
      const values = await tierForm.validateFields();
      setAdjustingTier(true);
      await adjustPerformerTier(performerId, values.tier, values.reason);
      message.success('咖位已调整');
      setTierModalOpen(false);
      tierForm.resetFields();
      loadPerformer();
      // 重新加载咖位历史
      getTierHistory(performerId)
        .then((res) => setTierHistory(res.data))
        .catch((e) => console.error('加载咖位历史失败:', e));
    } catch (err) {
      message.error(err instanceof Error ? err.message : '调整失败');
    } finally {
      setAdjustingTier(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载演员详情..." />
        </div>
      </PageContainer>
    );
  }

  // 错误
  if (error || !performer) {
    return (
      <PageContainer
        onBack={() => history.push('/performer/list')}
      >
        <Result
          status="error"
          title="演员详情加载失败"
          subTitle={error?.message || '演员不存在'}
          extra={
            <Button
              type="primary"
              style={{ minHeight: 44 }}
              onClick={() => window.location.reload()}
            >
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  /** 信誉分变动表格列 */
  const creditLogColumns: ProColumns<CreditLogItem>[] = [
    {
      title: '变动分值',
      dataIndex: 'change_amount',
      width: 100,
      render: (_, record) => (
        <span style={{ color: record.change_amount >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {record.change_amount >= 0 ? '+' : ''}{record.change_amount}
        </span>
      ),
    },
    { title: '原因', dataIndex: 'reason', width: 300, ellipsis: true },
    {
      title: '关联订单',
      dataIndex: 'related_demand_id',
      width: 160,
      ellipsis: true,
      render: (_, record) => record.related_demand_id || '-',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      valueType: 'dateTime',
    },
  ];

  /** 咖位历史表格列 */
  const tierHistoryColumns: ProColumns<TierHistoryItem>[] = [
    {
      title: '原咖位',
      dataIndex: 'from_tier',
      width: 100,
      render: (_, record) => (
        <Tag color={PerformerTierColor[record.from_tier]}>
          {PerformerTierLabel[record.from_tier]}
        </Tag>
      ),
    },
    {
      title: '新咖位',
      dataIndex: 'to_tier',
      width: 100,
      render: (_, record) => (
        <Tag color={PerformerTierColor[record.to_tier]}>
          {PerformerTierLabel[record.to_tier]}
        </Tag>
      ),
    },
    { title: '调整原因', dataIndex: 'reason', width: 250, ellipsis: true },
    {
      title: '操作人',
      width: 120,
      render: (_, record) => record.operator?.name || '-',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      valueType: 'dateTime',
    },
  ];

  return (
    <PageContainer
      onBack={() => history.push('/performer/list')}
      title={performer.name}
      extra={
        <Button
          icon={<EditOutlined />}
          style={{ minHeight: 44 }}
          onClick={() => {
            window.location.hash = `#/performer/edit/${performerId}`;
          }}
        >
          编辑资料
        </Button>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: -16 }}>
        {/* 基本信息 */}
        <Tabs.TabPane tab="基本信息" key="info">
          <ProCard title="演员信息" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="姓名">{performer.name}</Descriptions.Item>
              <Descriptions.Item label="手机号">{performer.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="咖位">
                <Tag color={PerformerTierColor[performer.tier]}>
                  {PerformerTierLabel[performer.tier]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="信誉分">
                <span style={{ fontWeight: 600 }}>{performer.credit_score}</span>
                <Tag
                  color={CreditLevelColor[performer.credit_level]}
                  style={{ marginLeft: 8 }}
                >
                  {CreditLevelLabel[performer.credit_level]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="评分">{performer.rating?.toFixed(1) || '-'}</Descriptions.Item>
              <Descriptions.Item label="经验">{performer.experience_years}年</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={performer.status === 'active' ? 'green' : 'default'}>
                  {performer.status === 'active' ? '活跃' : '停用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风格标签" span={2}>
                <Space size={[0, 4]} wrap>
                  {(performer.style_tags || []).map((tag) => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="简介" span={2}>
                {performer.introduction || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="亮点" span={2}>
                {performer.highlights || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {performer.created_at
                  ? new Date(performer.created_at).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="咖位更新时间">
                {performer.tier_updated_at
                  ? new Date(performer.tier_updated_at).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </ProCard>

          {/* 签约信息 */}
          {performer.contract && (
            <ProCard title="签约信息" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="签约类型">
                  {performer.contract.type}
                </Descriptions.Item>
                <Descriptions.Item label="排他条款">
                  <Tag color={performer.contract.exclusivity ? 'red' : 'green'}>
                    {performer.contract.exclusivity ? '排他' : '非排他'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="结算费率">
                  {formatRate(performer.contract.settlement_rate)}
                </Descriptions.Item>
              </Descriptions>
            </ProCard>
          )}
        </Tabs.TabPane>

        {/* 咖位管理 */}
        <Tabs.TabPane tab="咖位管理" key="tier">
          <ProCard style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="当前咖位"
                  valueRender={() => (
                    <Tag
                      color={PerformerTierColor[performer.tier]}
                      style={{ fontSize: 18, padding: '4px 12px' }}
                    >
                      {PerformerTierLabel[performer.tier]}
                    </Tag>
                  )}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="系统建议"
                  valueRender={() => (
                    <span style={{ fontSize: 16 }}>
                      {tierSuggestion?.suggested_tier ? (
                        <>
                          <Tag color={PerformerTierColor[tierSuggestion.suggested_tier]}>
                            {PerformerTierLabel[tierSuggestion.suggested_tier]}
                          </Tag>
                          <Tag
                            color={
                              tierSuggestion.direction === 'up'
                                ? 'green'
                                : tierSuggestion.direction === 'down'
                                ? 'red'
                                : 'default'
                            }
                          >
                            {tierSuggestion.direction === 'up'
                              ? '建议升级'
                              : tierSuggestion.direction === 'down'
                              ? '建议降级'
                              : '无变动'}
                          </Tag>
                        </>
                      ) : (
                        '暂无建议'
                      )}
                    </span>
                  )}
                />
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  icon={<RiseOutlined />}
                  style={{ minHeight: 44, marginTop: 8 }}
                  onClick={() => {
                    tierForm.setFieldsValue({ tier: performer.tier });
                    setTierModalOpen(true);
                  }}
                >
                  手动调整咖位
                </Button>
              </Col>
            </Row>
          </ProCard>

          {/* 系统升降级指标 */}
          {tierSuggestion && (
            <ProCard title="升降级参考指标" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="已完成演出" value={tierSuggestion.metrics.completed_shows} suffix="场" />
                </Col>
                <Col span={6}>
                  <Statistic title="当前信誉分" value={tierSuggestion.metrics.credit_score} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="近期均分"
                    value={tierSuggestion.metrics.recent_avg_rating}
                    precision={1}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="近期拒绝次数"
                    value={tierSuggestion.metrics.recent_reject_count}
                    suffix="次"
                    valueStyle={{ color: tierSuggestion.metrics.recent_reject_count > 2 ? '#ff4d4f' : undefined }}
                  />
                </Col>
              </Row>
              {tierSuggestion.reasons.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>分析原因：</div>
                  {tierSuggestion.reasons.map((reason, i) => (
                    <Tag key={i} color="blue" style={{ marginBottom: 4 }}>
                      {reason}
                    </Tag>
                  ))}
                </div>
              )}
            </ProCard>
          )}

          {/* 咖位变动历史 */}
          <ProCard title="咖位变动历史">
            <ProTable<TierHistoryItem>
              rowKey="created_at"
              search={false}
              toolBarRender={false}
              dataSource={tierHistory}
              columns={tierHistoryColumns}
              pagination={false}
              locale={{
                emptyText: '暂无咖位变动记录',
              }}
            />
          </ProCard>
        </Tabs.TabPane>

        {/* 信誉分 */}
        <Tabs.TabPane tab="信誉分" key="credit">
          {creditDetail && (
            <ProCard style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="信誉总分"
                    value={creditDetail.total_score}
                    suffix={
                      <Tag
                        color={CreditLevelColor[creditDetail.level]}
                        style={{ marginLeft: 8 }}
                      >
                        {CreditLevelLabel[creditDetail.level]}
                      </Tag>
                    }
                  />
                </Col>
                {Object.entries(creditDetail.dimensions).map(([key, dim]) => (
                  <Col span={4} key={key}>
                    <Statistic
                      title={
                        {
                          fulfillment: '履约',
                          quality: '质量',
                          activity: '活跃',
                          basics: '基础',
                        }[key] || key
                      }
                      value={dim.score}
                      suffix={`/ ${dim.weight * 100}%`}
                    />
                  </Col>
                ))}
              </Row>
            </ProCard>
          )}

          <ProCard title="变动明细">
            <ProTable<CreditLogItem>
              rowKey="id"
              search={false}
              toolBarRender={false}
              request={async (params) => {
                try {
                  const res = await getCreditLogs(
                    performerId,
                    params.current || 1,
                    params.pageSize || 10,
                  );
                  return {
                    data: res.data.items,
                    success: true,
                    total: res.data.total,
                  };
                } catch {
                  return { data: [], success: false, total: 0 };
                }
              }}
              columns={creditLogColumns}
              pagination={{ defaultPageSize: 10 }}
              locale={{ emptyText: '暂无信誉分变动记录' }}
            />
          </ProCard>
        </Tabs.TabPane>
      </Tabs>

      {/* 咖位调整弹窗 */}
      <Modal
        title="手动调整咖位"
        open={tierModalOpen}
        onCancel={() => setTierModalOpen(false)}
        onOk={handleAdjustTier}
        confirmLoading={adjustingTier}
        okText="确认调整"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={tierForm} layout="vertical">
          <Form.Item
            name="tier"
            label="目标咖位"
            rules={[{ required: true, message: '请选择目标咖位' }]}
          >
            <ProFormSelect
              options={Object.entries(PerformerTierLabel).map(([value, label]) => ({
                label,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请填写调整原因' }]}
          >
            <TextArea
              rows={3}
              placeholder="请填写详细的调整原因..."
            />
          </Form.Item>
        </Form>
        {tierSuggestion && (
          <div style={{ padding: '12px', background: '#f6f8fa', borderRadius: 6 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>系统建议：</div>
            <div>
              当前 {PerformerTierLabel[performer.tier]}，
              {tierSuggestion.direction === 'up'
                ? `建议升级至 ${tierSuggestion.suggested_tier ? PerformerTierLabel[tierSuggestion.suggested_tier] : '—'}`
                : tierSuggestion.direction === 'down'
                ? `建议降级至 ${tierSuggestion.suggested_tier ? PerformerTierLabel[tierSuggestion.suggested_tier] : '—'}`
                : '建议维持当前级别'}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default PerformerDetailPage;
