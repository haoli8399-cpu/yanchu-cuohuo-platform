/**
 * 方案编辑器 - 运营调整方案编辑区域
 * 包含方案编辑 + 模板应用 + 提交操作
 */
import React, { useState } from 'react';
import {
  Button,
  Space,
  Typography,
  Input,
  Divider,
  Select,
  InputNumber,
  message,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import type { AdjustmentTemplate, ContractMode } from '@/types/demand';
import { ContractModeLabel } from '@/types/demand';
import { adjustPlan } from '@/services/demand';
import AdjustmentTemplates from './AdjustmentTemplates';

const { Text } = Typography;
const { TextArea } = Input;

export interface PlanEditorProps {
  demandId: string;
  initialContent: string;
  initialPrice?: number;
  initialContractMode?: ContractMode;
  onSubmitted: () => void;
  onCancel: () => void;
}

const PlanEditor: React.FC<PlanEditorProps> = ({
  demandId,
  initialContent,
  initialPrice,
  initialContractMode = 'skip',
  onSubmitted,
  onCancel,
}) => {
  const [editContent, setEditContent] = useState(initialContent);
  const [finalPrice, setFinalPrice] = useState<number | undefined>(initialPrice);
  const [contractMode, setContractMode] = useState<ContractMode>(initialContractMode);
  const [submitting, setSubmitting] = useState(false);

  /** 应用模板 */
  const handleApplyTemplate = (template: AdjustmentTemplate) => {
    setEditContent((prev) => {
      const sep = prev ? '\n\n---\n\n' : '';
      return prev + sep + template.content;
    });
    message.success(`已应用模板「${template.name}」`);
  };

  /** 提交调整方案 */
  const handleSubmit = async () => {
    if (!editContent.trim()) {
      message.warning('请输入方案内容');
      return;
    }
    setSubmitting(true);
    try {
      await adjustPlan(demandId, {
        adjusted_plan_content: editContent.trim(),
        final_price: finalPrice,
        contract_mode: contractMode,
      });
      message.success('方案已调整，已推送给活动公司确认');
      onSubmitted();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '方案提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Text strong>调整方案内容：</Text>
      </div>
      <TextArea
        rows={8}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        placeholder="在此编辑调整后的方案内容..."
        style={{ marginBottom: 12 }}
      />
      <Space style={{ marginBottom: 12 }} wrap>
        <div>
          <Text style={{ marginRight: 8 }}>最终报价（元）：</Text>
          <InputNumber
            value={finalPrice}
            onChange={(v) => setFinalPrice(v ?? undefined)}
            placeholder="如：12000"
            min={0}
            style={{ width: 160 }}
          />
        </div>
        <div>
          <Text style={{ marginRight: 8 }}>签约模式：</Text>
          <Select
            value={contractMode}
            onChange={(v) => setContractMode(v)}
            style={{ width: 140 }}
            options={Object.entries(ContractModeLabel).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
        </div>
      </Space>

      <Divider orientation="left">快捷模板</Divider>
      <AdjustmentTemplates compact onSelect={handleApplyTemplate} />

      <Divider />
      <Space style={{ marginTop: 12 }}>
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={submitting}
          style={{ minHeight: 44 }}
          onClick={handleSubmit}
        >
          提交并推送给活动公司
        </Button>
        <Button style={{ minHeight: 44 }} onClick={onCancel}>
          取消
        </Button>
      </Space>
    </div>
  );
};

export default PlanEditor;
