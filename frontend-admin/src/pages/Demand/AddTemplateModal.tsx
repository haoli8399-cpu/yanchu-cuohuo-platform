/**
 * 新增/编辑调整模板弹窗
 */
import React, { useState } from 'react';
import { Modal, Input, Select, Typography } from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { AdjustmentTemplate } from '@/types/demand';

const { Text } = Typography;
const { TextArea } = Input;

const categoryConfig = {
  price: { label: '价格调整', icon: <DollarOutlined /> },
  lineup: { label: '阵容调整', icon: <TeamOutlined /> },
  contract: { label: '合同调整', icon: <FileTextOutlined /> },
  general: { label: '通用', icon: <AppstoreOutlined /> },
};

export interface AddTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (template: Omit<AdjustmentTemplate, 'id' | 'usage_count' | 'created_at'>) => void;
}

const AddTemplateModal: React.FC<AddTemplateModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AdjustmentTemplate['category']>('general');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !content.trim()) return;
    onSubmit({ name: name.trim(), description: name.trim(), content: content.trim(), category });
    setName('');
    setContent('');
    setCategory('general');
    onCancel();
  };

  const isInvalid = !name.trim() || !content.trim();

  return (
    <Modal
      title="新建调整模板"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="创建"
      cancelText="取消"
      okButtonProps={{ disabled: isInvalid }}
      width={560}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>模板名称</Text>
          <Input
            placeholder="如：周末档期加价"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>分类</Text>
          <Select
            value={category}
            onChange={(v) => setCategory(v)}
            style={{ width: '100%' }}
            options={Object.entries(categoryConfig).map(([key, cfg]) => ({
              value: key,
              label: <span>{cfg.icon} {cfg.label}</span>,
            }))}
          />
        </div>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            模板内容
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              可使用 {'{{变量名}}'} 作为占位符
            </Text>
          </Text>
          <TextArea
            rows={6}
            placeholder="输入模板内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddTemplateModal;
