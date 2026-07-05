/**
 * AI 方案审核页 (P-04, P0)
 *
 * 展示 AI 生成方案 → 运营调整 → 推送给活动公司确认
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-5: 错误显示友好提示
 * - CMP-1: 单文件 ≤ 300 行
 */
import React, { useState, useEffect } from 'react';
import { useParams, history } from '@umijs/max';
import {
  PageContainer,
  ProCard,
} from '@ant-design/pro-components';
import {
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Result,
  message,
  Alert,
  Steps,
  Descriptions,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  EditOutlined,
  SendOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { DemandDetail, AdjustmentTemplate } from '@/types/demand';
import {
  DemandStatusLabel,
  DemandStatusColor,
  UrgencyLabel,
  UrgencyColor,
  ContractModeLabel,
} from '@/types/demand';
import { getDemandDetail, triggerAIPlan, adjustPlan } from '@/services/demand';
import AdjustmentTemplates from './AdjustmentTemplates';
import DemandInfoCard from './DemandInfoCard';
import PlanEditor from './PlanEditor';

const { Text, Title, Paragraph } = Typography;

const DemandAIPlanPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const demandId = params.id!;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [demand, setDemand] = useState<DemandDetail | null>(null);

  // 编辑模式
  const [editing, setEditing] = useState(false);

  // 操作中
  const [generatingAI, setGeneratingAI] = useState(false);

  /** 加载需求详情 */
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

  /** 触发 AI 生成方案 */
  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const res = await triggerAIPlan(demandId);
      message.success('AI 方案已生成');
      // 更新本地方案内容
      setDemand((prev) =>
        prev
          ? {
              ...prev,
              status: 'ai_generated' as const,
              ai_plan_content: res.data.ai_plan_content,
            }
          : null,
      );
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'AI 方案生成失败');
    } finally {
      setGeneratingAI(false);
    }
  };

  /** 进入编辑模式 */
  const handleStartEdit = () => {
    setEditing(true);
  };

  /** 返回列表 */
  const handleBack = () => {
    history.push('/demand/list');
  };

  /** 尝试解析 AI 方案 JSON */
  const parseAIPlan = (content?: string): Record<string, unknown> | null => {
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
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

  // 步骤条：当前在哪个阶段
  const statusStepMap: Record<string, number> = {
    pending_ai: 0,
    ai_generated: 1,
    pending_operator: 1,
    operator_adjusted: 2,
    pending_client_confirm: 2,
    confirmed: 3,
  };
  const currentStep = statusStepMap[demand.status] ?? 0;

  return (
    <PageContainer
      onBack={handleBack}
      title={
        <Space>
          <span>{demand.title || '需求详情'}</span>
          <Tag color={DemandStatusColor[demand.status]}>
            {DemandStatusLabel[demand.status]}
          </Tag>
          <Tag color={UrgencyColor[demand.urgency]}>
            {UrgencyLabel[demand.urgency]}
          </Tag>
        </Space>
      }
      extra={
        <Space>
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
      {/* 流程步骤 */}
      <ProCard style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          items={[
            { title: 'AI生成方案', icon: <RobotOutlined /> },
            { title: '运营审核调整', icon: <EditOutlined /> },
            { title: '活动公司确认', icon: <SendOutlined /> },
            { title: '进入执行', icon: <CheckCircleOutlined /> },
          ]}
        />
      </ProCard>

      {/* 需求基本信息 */}
      <DemandInfoCard demand={demand} />

      {/* AI 方案 / 当前方案 */}
      <ProCard
        title={
          <Space>
            <RobotOutlined />
            <span>AI 方案</span>
            {demand.status === 'pending_ai' && (
              <Tag color="processing">待生成</Tag>
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            {(demand.status === 'pending_ai' ||
              demand.status === 'ai_generated') && (
              <Button
                type="primary"
                icon={<RobotOutlined />}
                loading={generatingAI}
                style={{ minHeight: 44 }}
                onClick={handleGenerateAI}
              >
                {demand.ai_plan_content ? '重新生成AI方案' : '生成AI方案'}
              </Button>
            )}
          </Space>
        }
      >
        {aiPlan ? (
          <div
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              maxHeight: 400,
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
          <Alert
            message="AI 方案尚未生成"
            description="点击上方「生成AI方案」按钮触发 AI 生成方案。"
            type="info"
            showIcon
          />
        )}
      </ProCard>

      {/* 运营调整方案 */}
      <ProCard
        title={
          <Space>
            <EditOutlined />
            <span>运营调整</span>
            {demand.adjusted_plan_content && (
              <Tag color="green">已调整</Tag>
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            {!editing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{ minHeight: 44 }}
                onClick={handleStartEdit}
              >
                {demand.adjusted_plan_content ? '编辑调整' : '开始调整'}
              </Button>
            )}
          </Space>
        }
      >
        {/* 编辑模式 */}
        {editing ? (
          <PlanEditor
            demandId={demandId}
            initialContent={
              demand.adjusted_plan_content ||
              demand.ai_plan_content ||
              ''
            }
            initialPrice={demand.final_price}
            initialContractMode={demand.contract_mode || 'skip'}
            onSubmitted={() => {
              setEditing(false);
              fetchDetail();
            }}
            onCancel={() => setEditing(false)}
          />
        ) : demand.adjusted_plan_content ? (
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
        ) : (
          <Alert
            message="运营尚未调整方案"
            description="点击「开始调整」按钮编辑方案内容，可选择应用快捷模板。"
            type="info"
            showIcon
          />
        )}
      </ProCard>

      {/* 客户信息 (P-28) */}
      {demand.client && (
        <ProCard title="客户信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="活动公司">
              {demand.client.name}
            </Descriptions.Item>
            <Descriptions.Item label="客户ID">
              {demand.client_id}
            </Descriptions.Item>
          </Descriptions>
        </ProCard>
      )}

      {/* 状态时间线 */}
      {demand.status_history && demand.status_history.length > 0 && (
        <ProCard title="状态时间线">
          <div>
            {demand.status_history.map((h, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom:
                    idx < demand.status_history.length - 1
                      ? '1px solid #f0f0f0'
                      : 'none',
                }}
              >
                <Tag
                  color={DemandStatusColor[h.status]}
                  style={{ flexShrink: 0, marginRight: 12 }}
                >
                  {DemandStatusLabel[h.status]}
                </Tag>
                <div>
                  <Text style={{ fontSize: 13 }}>
                    {new Date(h.at).toLocaleString('zh-CN')}
                  </Text>
                  {h.operator_id && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      操作人：{h.operator_id}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ProCard>
      )}
    </PageContainer>
  );
};

export default DemandAIPlanPage;
