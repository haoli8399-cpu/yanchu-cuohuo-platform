/**
 * 方案调整模板管理 (P-03, P1)
 *
 * 预存常用调整内容，一键应用
 * 分类：价格调整 / 阵容调整 / 合同调整 / 通用
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - UX-5: 友好错误提示
 * - CMP-1: 单文件 ≤ 300 行
 */
import React, { useState } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Modal,
  Select,
  message,
  Popconfirm,
  Empty,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { AdjustmentTemplate } from '@/types/demand';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

/** 模板分类配置 */
const categoryConfig: Record<
  AdjustmentTemplate['category'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  price: { label: '价格调整', color: 'blue', icon: <DollarOutlined /> },
  lineup: { label: '阵容调整', color: 'green', icon: <TeamOutlined /> },
  contract: { label: '合同调整', color: 'orange', icon: <FileTextOutlined /> },
  general: { label: '通用', color: 'default', icon: <AppstoreOutlined /> },
};

/** 预设模板数据 */
const PRESET_TEMPLATES: AdjustmentTemplate[] = [
  {
    id: 'tpl-1',
    name: '加配MC主持人',
    description: '为方案增加一名MC主持人（T3级别），负责控场和串场',
    content:
      '【阵容调整】\n增加 1 名 MC 主持人（T3 级别），负责全场节奏把控和互动衔接。\n出场费参考 T3 标准演出费 + 主持补贴 ¥500。',
    category: 'lineup',
    usage_count: 23,
    created_at: '2026-06-15T10:00:00Z',
  },
  {
    id: 'tpl-2',
    name: '升级为领衔演员',
    description: '将常规演员升级为 T2 领衔演员，提升演出质量',
    content:
      '【阵容调整】\n将 {{演员位置}} 从 {{原咖位}} 升级为 T2 领衔演员。\n演出费用从 {{原价格}} 调整为 T2 标准演出费。\n提示：T2 演员需运营确认档期。',
    category: 'lineup',
    usage_count: 15,
    created_at: '2026-06-16T14:30:00Z',
  },
  {
    id: 'tpl-3',
    name: '周末档期加价',
    description: '周末占用档期加价，按周末价计算',
    content:
      '【价格调整】\n该活动日期为周末（占用档期），费用调整为周末档价格。\n原报价 {{原价格}} → 周末价 {{周末价格}}（上浮约 30%）。',
    category: 'price',
    usage_count: 18,
    created_at: '2026-06-17T09:15:00Z',
  },
  {
    id: 'tpl-4',
    name: '远程附加费',
    description: '绕城外/成都市外演出增加远程附加费',
    content:
      '【价格调整】\n活动地点 {{地点}} 属于 {{区域}}，需增加远程附加费：\n- 绕城外大成都内：+¥500/人\n- 成都市外：+¥1,000/人/天\n本次共 {{人数}} 人，附加费合计 {{附加费总额}}。',
    category: 'price',
    usage_count: 12,
    created_at: '2026-06-18T11:00:00Z',
  },
  {
    id: 'tpl-5',
    name: '增加定制段子',
    description: '为方案增加品牌定制脱口秀内容创作',
    content:
      '【内容调整】\n增加品牌定制段子创作：{{分钟数}} 分钟，¥3,000/分钟。\n默认修改次数 ≤ 3 次。\n包含视频素材授权（品牌方可用于抖音/小红书/公众号）。',
    category: 'general',
    usage_count: 8,
    created_at: '2026-06-19T16:45:00Z',
  },
  {
    id: 'tpl-6',
    name: '跳过合同模式',
    description: '小额订单跳过合同流程，直接确认',
    content:
      '【合同调整】\n本需求金额较小（{{金额}}），建议选择「跳过合同」模式。\n双方口头/微信确认即可，不需上传或签署正式合同。\n注意：请确认客户同意此模式。',
    category: 'contract',
    usage_count: 31,
    created_at: '2026-06-20T08:30:00Z',
  },
  {
    id: 'tpl-7',
    name: '上传PDF合同',
    description: '要求活动公司上传盖章PDF合同',
    content:
      '【合同调整】\n请选择「上传PDF」合同模式。\n活动公司需上传盖章版合同 PDF，运营审核后归档。\n合同模板可在系统下载。',
    category: 'contract',
    usage_count: 20,
    created_at: '2026-06-21T13:00:00Z',
  },
  {
    id: 'tpl-8',
    name: '增加赞助权益',
    description: '追加品牌赞助权益项',
    content:
      '【内容调整】\n增加品牌赞助权益：\n{{权益列表}}\n品牌方需自行制作物料（话筒贴/展架等）。',
    category: 'general',
    usage_count: 6,
    created_at: '2026-06-22T10:20:00Z',
  },
];

export interface AdjustmentTemplatesProps {
  /** 选中模板后的回调，传入模板内容 */
  onSelect?: (template: AdjustmentTemplate) => void;
  /** 是否显示为紧凑模式（嵌入详情页用） */
  compact?: boolean;
}

const AdjustmentTemplates: React.FC<AdjustmentTemplatesProps> = ({
  onSelect,
  compact = false,
}) => {
  const [templates, setTemplates] =
    useState<AdjustmentTemplate[]>(PRESET_TEMPLATES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<
    AdjustmentTemplate['category'] | 'all'
  >('all');

  // 新增模板表单
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] =
    useState<AdjustmentTemplate['category']>('general');
  const [newContent, setNewContent] = useState('');

  /** 删除模板 */
  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    message.success('模板已删除');
  };

  /** 一键复制模板内容 */
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success('模板内容已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动复制');
    }
  };

  /** 应用模板 */
  const handleApply = (template: AdjustmentTemplate) => {
    if (onSelect) {
      onSelect(template);
      message.success(`已应用模板「${template.name}」`);
    }
  };

  /** 新增模板 */
  const handleAddTemplate = () => {
    if (!newName.trim() || !newContent.trim()) {
      message.warning('请填写模板名称和内容');
      return;
    }

    const newTemplate: AdjustmentTemplate = {
      id: `tpl-${Date.now()}`,
      name: newName.trim(),
      description: newName.trim(),
      content: newContent.trim(),
      category: newCategory,
      usage_count: 0,
      created_at: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setNewName('');
    setNewContent('');
    setNewCategory('general');
    setShowAddModal(false);
    message.success('模板创建成功');
  };

  // 过滤模板
  const filtered = templates.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchKeyword =
      !searchKeyword ||
      t.name.includes(searchKeyword) ||
      t.content.includes(searchKeyword);
    return matchCategory && matchKeyword;
  });

  return (
    <div>
      {/* 搜索和筛选栏 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="搜索模板名称或内容"
          allowClear
          style={{ width: 240 }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Select
          value={filterCategory}
          onChange={(v) => setFilterCategory(v)}
          style={{ width: 140 }}
          options={[
            { value: 'all', label: '全部分类' },
            ...Object.entries(categoryConfig).map(([key, cfg]) => ({
              value: key,
              label: cfg.label,
            })),
          ]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ minHeight: 44 }}
          onClick={() => setShowAddModal(true)}
        >
          新建模板
        </Button>
      </Space>

      {/* 模板卡片列表 */}
      {filtered.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            searchKeyword ? '未找到匹配的模板' : '暂无调整模板，点击「新建模板」创建'
          }
        >
          {!searchKeyword && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
            >
              新建模板
            </Button>
          )}
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((tpl) => {
            const cat = categoryConfig[tpl.category];
            return (
              <Col xs={24} sm={12} lg={compact ? 12 : 8} key={tpl.id}>
                <Card
                  hoverable
                  styles={{
                    body: { padding: 16 },
                  }}
                  actions={[
                    <Tooltip title="复制内容" key="copy">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        style={{ minHeight: 44, minWidth: 44 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(tpl.content);
                        }}
                      />
                    </Tooltip>,
                    onSelect && (
                      <Tooltip title="一键应用" key="apply">
                        <Button
                          type="text"
                          icon={<CheckCircleOutlined />}
                          style={{
                            minHeight: 44,
                            minWidth: 44,
                            color: '#1677ff',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(tpl);
                          }}
                        />
                      </Tooltip>
                    ),
                    <Popconfirm
                      key="delete"
                      title="确定删除此模板？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(tpl.id);
                      }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Tooltip title="删除模板">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          style={{ minHeight: 44, minWidth: 44 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    </Popconfirm>,
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Tag
                          color={cat.color}
                          icon={cat.icon}
                          style={{ marginRight: 0 }}
                        >
                          {cat.label}
                        </Tag>
                        <Text strong>{tpl.name}</Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 3, expandable: false }}
                          style={{
                            marginBottom: 8,
                            whiteSpace: 'pre-wrap',
                            fontSize: 13,
                            color: '#666',
                            background: '#fafafa',
                            padding: 8,
                            borderRadius: 4,
                          }}
                        >
                          {tpl.content}
                        </Paragraph>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          已使用 {tpl.usage_count} 次
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* 新增模板弹窗 */}
      <Modal
        title="新建调整模板"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onOk={handleAddTemplate}
        okText="创建"
        cancelText="取消"
        width={560}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              模板名称
            </Text>
            <Input
              placeholder="如：周末档期加价"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              分类
            </Text>
            <Select
              value={newCategory}
              onChange={(v) => setNewCategory(v)}
              style={{ width: '100%' }}
              options={Object.entries(categoryConfig).map(([key, cfg]) => ({
                value: key,
                label: (
                  <Space>
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </Space>
                ),
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
              placeholder="输入模板内容，如：&#10;【价格调整】&#10;活动日期为周末，费用按周末档价格计算。"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdjustmentTemplates;
