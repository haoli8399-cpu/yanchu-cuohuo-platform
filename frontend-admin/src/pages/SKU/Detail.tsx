/**
 * SKU 详情/编辑页 (P-22, P0)
 *
 * 支持新建和编辑模式
 * 编辑模式：折叠面板 + 6个独立模块，每个面板独立保存
 * 三态处理：loading / empty / error
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, history } from '@umijs/max';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
  ProFormGroup,
} from '@ant-design/pro-components';
import {
  Collapse,
  Form, Input, Select, Tag, Button,
  message, Spin, Result, Descriptions, Divider,
  Space, InputNumber,
} from 'antd';
import {
  SaveOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { SKU, BusinessLine, SKUStatus } from '@/types/sku';
import { BusinessLineLabel, StatusLabel, StatusColor } from '@/types/sku';
import {
  getSKUDetail, createSKU, updateSKU,
  updateBasicInfo, updatePerformer, updatePricing,
  updateMedia, updateConfig, toggleSKUStatus,
} from '@/services/sku';

/** 格式化价格（分 → 元） */
const formatPrice = (cents: number): string =>
  `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** 业务线 Select 选项 */
const businessLineOptions: SelectProps['options'] = Object.entries(BusinessLineLabel).map(
  ([value, label]) => ({ label, value }),
);

/** 风格标签预设 */
const PRESET_STYLES = ['脱口秀', '即兴喜剧', '漫才', 'Sketch', '魔术喜剧', '相声', '默剧'];

const SKUDetailPage: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const location = useLocation();
  const isCreate = !params.id;

  // 全局状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sku, setSku] = useState<SKU | null>(null);

  // 各面板独立保存状态
  const [savingPanel, setSavingPanel] = useState<string | null>(null);

  // 价格联动展示
  const [pricingDisplay, setPricingDisplay] = useState<{
    companyPrice: number;
    internalPrice: number;
  } | null>(null);

  // 折叠面板展开状态
  const [activeKeys, setActiveKeys] = useState<string[]>([
    'basic', 'performer', 'pricing', 'media', 'config', 'status',
  ]);

  // 演员画像 - 风格标签输入
  const [styleInput, setStyleInput] = useState('');

  // 加载 SKU 详情
  const loadSKU = useCallback(async () => {
    if (!params.id || isCreate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSKUDetail(params.id);
      setSku(res.data);
      // 重置定价展示
      setPricingDisplay(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setLoading(false);
    }
  }, [params.id, isCreate]);

  useEffect(() => {
    loadSKU();
  }, [loadSKU]);

  /** 返回列表 */
  const handleBack = () => history.push('/sku/list');

  /** 通用保存处理 */
  const handleSave = async (
    panelKey: string,
    values: Record<string, unknown>,
    apiFn: (id: string, data: Record<string, unknown>) => Promise<{
      data: Record<string, unknown>;
    }>,
  ) => {
    if (!params.id) return;
    setSavingPanel(panelKey);
    try {
      await apiFn(params.id, values);
      message.success('✅ 保存成功');
      // 刷新数据
      await loadSKU();
    } catch (err) {
      message.error('保存失败，请重试');
    } finally {
      setSavingPanel(null);
    }
  };

  /** 价格保存 - 特殊处理输入输出 */
  const handlePriceSave = async (values: Record<string, unknown>) => {
    if (!params.id) return;
    setSavingPanel('pricing');
    try {
      const basePriceYuan = Number(values.basePrice) || 0;
      const basePriceCents = Math.round(basePriceYuan * 100);
      const res = await updatePricing(params.id, { basePrice: basePriceCents });
      setPricingDisplay({
        companyPrice: res.data.company_price,
        internalPrice: res.data.internal_price,
      });
      message.success('✅ 价格已更新');
      await loadSKU();
    } catch (err) {
      message.error('保存失败，请重试');
    } finally {
      setSavingPanel(null);
    }
  };

  /** 创建 SKU */
  const handleCreate = async (values: Record<string, unknown>) => {
    const basePriceYuan = Number(values.basePrice) || 0;
    const basePriceCents = Math.round(basePriceYuan * 100);

    const payload: Omit<SKU, 'id' | 'createdAt' | 'updatedAt'> = {
      name: String(values.name || ''),
      businessLine: values.businessLine as BusinessLine,
      description: String(values.description || ''),
      performerProfile: String(values.performerProfile || ''),
      styleTags: (values.styleTags as string[]) || [],
      applicableScenarios: String(values.scenarios || '')
        .split(/[、,;，；]/)
        .map((s) => s.trim())
        .filter(Boolean),
      basePrice: basePriceCents,
      companyPrice: 0, // 后端会算
      internalPrice: 0, // 后端会算
      durationMinutes: Number(values.durationMinutes) || 60,
      performersCount: Number(values.performersCount) || 1,
      coverUrl: '',
      mediaUrls: [],
      status: 'draft' as SKUStatus,
    };

    try {
      await createSKU(payload);
      message.success('✅ SKU创建成功');
      history.push('/sku/list');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '创建失败，请重试');
    }
  };

  // =====================================================
  // 加载中
  // =====================================================
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载SKU详情..." />
        </div>
      </PageContainer>
    );
  }

  // =====================================================
  // 错误状态
  // =====================================================
  if (error) {
    return (
      <PageContainer onBack={handleBack}>
        <Result
          status="error"
          title="SKU详情加载失败"
          subTitle={error.message}
          extra={
            <Button type="primary" style={{ minHeight: 44 }} onClick={() => window.location.reload()}>
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  // =====================================================
  // 新建模式：全量 ProForm
  // =====================================================
  if (isCreate) {
    return (
      <PageContainer onBack={handleBack} title="新增SKU">
        <ProCard title="填写SKU信息">
          <ProForm onFinish={handleCreate}>
            <ProFormGroup>
              <ProFormText
                name="name"
                label="SKU名称"
                placeholder="如：脱口秀专场 · 60min标准版"
                rules={[{ required: true, message: '请输入SKU名称' }]}
                width="md"
              />
              <ProFormSelect
                name="businessLine"
                label="业务线"
                placeholder="选择业务线"
                options={businessLineOptions}
                rules={[{ required: true, message: '请选择业务线' }]}
                width="md"
              />
            </ProFormGroup>
            <ProFormTextArea
              name="description"
              label="描述"
              placeholder="SKU描述信息"
              width="xl"
            />
            <Divider orientation="left">演员画像</Divider>
            <ProFormGroup>
              <ProFormTextArea
                name="performerProfile"
                label="演员画像描述"
                placeholder="描述演员特征、风格等"
                rules={[{ required: true, message: '请输入演员画像' }]}
                width="md"
              />
              <ProFormDigit
                name="performersCount"
                label="建议人数"
                placeholder="如：2"
                min={1}
                max={10}
                rules={[{ required: true, message: '请输入建议人数' }]}
                width="sm"
              />
            </ProFormGroup>
            <Divider orientation="left">价格配置（元）</Divider>
            <ProFormGroup>
              <ProFormDigit
                name="basePrice"
                label="甲方标准价"
                placeholder="如：10000"
                min={0}
                fieldProps={{ precision: 2 }}
                rules={[{ required: true, message: '请输入甲方标准价' }]}
                width="sm"
              />
            </ProFormGroup>
            <Divider orientation="left">其他</Divider>
            <ProFormGroup>
              <ProFormDigit
                name="durationMinutes"
                label="演出时长（分钟）"
                placeholder="如：60"
                min={1}
                max={480}
                rules={[{ required: true, message: '请输入演出时长' }]}
                width="sm"
              />
            </ProFormGroup>
            <ProFormTextArea
              name="scenarios"
              label="适用场景"
              placeholder="如：企业年会、品牌发布会、商场开业（用中文顿号分隔）"
              width="xl"
            />
          </ProForm>
        </ProCard>
      </PageContainer>
    );
  }

  // =====================================================
  // 编辑模式：折叠面板
  // =====================================================
  const displayedPrices = pricingDisplay || {
    companyPrice: sku?.companyPrice || 0,
    internalPrice: sku?.internalPrice || 0,
  };

  return (
    <PageContainer
      onBack={handleBack}
      title={`SKU: ${sku?.name || ''}`}
      extra={
        <Tag color={StatusColor[sku?.status || 'draft']}>
          {StatusLabel[sku?.status || 'draft']}
        </Tag>
      }
    >
      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        items={[
          // ==================================================
          // 面板 1: 基础信息
          // ==================================================
          {
            key: 'basic',
            label: '① 基础信息',
            children: (
              <Form
                layout="vertical"
                onFinish={(values) =>
                  handleSave('basic', values, (id, data) =>
                    updateBasicInfo(id, data as Parameters<typeof updateBasicInfo>[1]),
                  )
                }
                initialValues={{
                  name: sku?.name,
                  businessLine: sku?.businessLine,
                  description: sku?.description,
                }}
              >
                <Form.Item name="name" label="SKU名称" rules={[{ required: true, message: '请输入SKU名称' }]}>
                  <Input placeholder="如：脱口秀专场 · 60min标准版" />
                </Form.Item>
                <Form.Item name="businessLine" label="业务线" rules={[{ required: true, message: '请选择业务线' }]}>
                  <Select options={businessLineOptions} placeholder="选择业务线" />
                </Form.Item>
                <Form.Item name="description" label="描述">
                  <Input.TextArea rows={3} placeholder="SKU描述信息" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingPanel === 'basic'}
                  icon={<SaveOutlined />}
                >
                  保存基础信息
                </Button>
              </Form>
            ),
          },

          // ==================================================
          // 面板 2: 演员画像
          // ==================================================
          {
            key: 'performer',
            label: '② 演员画像',
            children: (
              <Form
                layout="vertical"
                onFinish={(values) =>
                  handleSave('performer', values, (id, data) => {
                    const tags = (values.styleTags as string[]) || [];
                    return updatePerformer(id, {
                      performerProfile: data.performerProfile as string,
                      styleTags: tags,
                      performersCount: data.performersCount as number,
                    });
                  })
                }
                initialValues={{
                  performerProfile: sku?.performerProfile,
                  styleTags: sku?.styleTags,
                  performersCount: sku?.performersCount,
                }}
              >
                <Form.Item name="performerProfile" label="演员画像描述">
                  <Input.TextArea rows={3} placeholder="描述演员特征、风格要求等" />
                </Form.Item>
                <Form.Item name="styleTags" label="风格标签">
                  <Select
                    mode="tags"
                    placeholder="输入或选择风格标签"
                    options={PRESET_STYLES.map((s) => ({ label: s, value: s }))}
                  />
                </Form.Item>
                <Form.Item name="performersCount" label="建议人数" rules={[{ required: true, message: '请输入建议人数' }]}>
                  <InputNumber min={1} max={10} style={{ width: 120 }} placeholder="如：2" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingPanel === 'performer'}
                  icon={<SaveOutlined />}
                >
                  保存演员画像
                </Button>
              </Form>
            ),
          },

          // ==================================================
          // 面板 3: 价格配置
          // ==================================================
          {
            key: 'pricing',
            label: '③ 价格配置',
            children: (
              <div>
                <Form
                  layout="vertical"
                  onFinish={handlePriceSave}
                  initialValues={{
                    basePrice: sku?.basePrice ? sku.basePrice / 100 : 0,
                  }}
                >
                  <Form.Item
                    name="basePrice"
                    label="甲方标准价（元）"
                    rules={[{ required: true, message: '请输入甲方标准价' }]}
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      prefix="¥"
                      style={{ width: 240 }}
                      placeholder="如：10000"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={savingPanel === 'pricing'}
                    icon={<SaveOutlined />}
                  >
                    保存价格
                  </Button>
                </Form>

                <Divider />

                <Descriptions column={1} size="small" title="价格联动">
                  <Descriptions.Item label="甲方标准价">
                    <strong>{formatPrice(sku?.basePrice || 0)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="→ 活动公司价（×0.7）">
                    <Tag color="blue">{formatPrice(displayedPrices.companyPrice)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="→ 内部结算价（×0.67）">
                    <Tag color="green">{formatPrice(displayedPrices.internalPrice)}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
          },

          // ==================================================
          // 面板 4: 内容素材
          // ==================================================
          {
            key: 'media',
            label: '④ 内容素材',
            children: (
              <Form
                layout="vertical"
                onFinish={(values) =>
                  handleSave('media', values, (id, data) =>
                    updateMedia(id, {
                      coverUrl: data.coverUrl as string,
                      mediaUrls: data.mediaUrls as string[],
                    }),
                  )
                }
                initialValues={{
                  coverUrl: sku?.coverUrl,
                  mediaUrls: sku?.mediaUrls,
                }}
              >
                <Form.Item name="coverUrl" label="封面图URL">
                  <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item name="mediaUrls" label="样片视频URL">
                  <Select
                    mode="tags"
                    placeholder="输入视频URL，回车添加"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingPanel === 'media'}
                  icon={<SaveOutlined />}
                >
                  保存素材
                </Button>
              </Form>
            ),
          },

          // ==================================================
          // 面板 5: 适用配置
          // ==================================================
          {
            key: 'config',
            label: '⑤ 适用配置',
            children: (
              <Form
                layout="vertical"
                onFinish={(values) =>
                  handleSave('config', values, (id, data) =>
                    updateConfig(id, {
                      applicableScenes: data.applicableScenes as string[],
                      durationMinutes: data.durationMinutes as number,
                    }),
                  )
                }
                initialValues={{
                  applicableScenes: sku?.applicableScenarios,
                  durationMinutes: sku?.durationMinutes,
                }}
              >
                <Form.Item name="applicableScenes" label="适用场景">
                  <Select
                    mode="tags"
                    placeholder="输入适用场景，回车添加"
                  />
                </Form.Item>
                <Form.Item name="durationMinutes" label="演出时长（分钟）" rules={[{ required: true, message: '请输入演出时长' }]}>
                  <InputNumber min={1} max={480} style={{ width: 120 }} placeholder="如：60" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingPanel === 'config'}
                  icon={<SaveOutlined />}
                >
                  保存配置
                </Button>
              </Form>
            ),
          },

          // ==================================================
          // 面板 6: 状态管理
          // ==================================================
          {
            key: 'status',
            label: '⑥ 状态管理',
            children: (
              <div>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="当前状态">
                    <Tag color={StatusColor[sku?.status || 'draft']}>
                      {StatusLabel[sku?.status || 'draft']}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {sku?.createdAt ? new Date(sku.createdAt).toLocaleString('zh-CN') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {sku?.updatedAt ? new Date(sku.updatedAt).toLocaleString('zh-CN') : '-'}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Space>
                  {sku?.status === 'active' ? (
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      loading={savingPanel === 'status'}
                      onClick={async () => {
                        if (!params.id) return;
                        setSavingPanel('status');
                        try {
                          await toggleSKUStatus(params.id, 'inactive');
                          message.success('✅ 已下架');
                          await loadSKU();
                        } catch {
                          message.error('操作失败');
                        } finally {
                          setSavingPanel(null);
                        }
                      }}
                    >
                      下架
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={savingPanel === 'status'}
                      onClick={async () => {
                        if (!params.id) return;
                        setSavingPanel('status');
                        try {
                          await toggleSKUStatus(params.id, 'active');
                          message.success('✅ 已上架');
                          await loadSKU();
                        } catch {
                          message.error('操作失败');
                        } finally {
                          setSavingPanel(null);
                        }
                      }}
                    >
                      上架
                    </Button>
                  )}
                </Space>
              </div>
            ),
          },
        ]}
      />

      {/* 底部：删除按钮 */}
      {!isCreate && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button danger onClick={() => message.info('删除功能请到列表页操作')}>
            删除此SKU
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default SKUDetailPage;
