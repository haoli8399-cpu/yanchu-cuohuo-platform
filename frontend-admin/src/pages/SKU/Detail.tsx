/**
 * SKU 详情/编辑页 (P-22, P0)
 *
 * v2: 折叠面板 + 独立保存
 * 5个模块：基础信息 / 演员配置与定价 / 场地要求 / 节目介绍 / 案例展示
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, history } from '@umijs/max';
import {
  PageContainer,
  ProCard,
} from '@ant-design/pro-components';
import {
  Button,
  Space,
  message,
  Spin,
  Result,
  Descriptions,
  Tag,
  Divider,
  Collapse,
  Input,
  Select,
  InputNumber,
  Table,
  Row,
  Col,
  Form,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { SKU, BusinessLine, TierPricing, CaseItem, VenueRequirement } from '@/types/sku';
import {
  BusinessLineLabel,
  DURATION_OPTIONS,
  SEATING_STYLE_OPTIONS,
  DEFAULT_TIER_PRICING,
  VENUE_TYPE_OPTIONS,
} from '@/types/sku';
import { getSKUDetail, updateSKU } from '@/services/sku';

const { Panel } = Collapse;
const { TextArea } = Input;

// ============ localStorage 扩展字段兜底 ============
const LS_EXT_PREFIX = 'sku_ext_';

function loadExtensions(skuId: string): Partial<SKU> {
  try {
    const raw = localStorage.getItem(LS_EXT_PREFIX + skuId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveExtensions(skuId: string, ext: Partial<SKU>) {
  const existing = loadExtensions(skuId);
  const merged = { ...existing, ...ext };
  localStorage.setItem(LS_EXT_PREFIX + skuId, JSON.stringify(merged));
}

// ============ 工具函数 ============
function formatPrice(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const statusColorMap: Record<string, string> = {
  online: 'green',
  offline: 'default',
  draft: 'orange',
};

const statusLabelMap: Record<string, string> = {
  online: '已上架',
  offline: '已下架',
  draft: '草稿',
};

/** 生成唯一ID */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============ 组件 ============
const SKUDetailPage: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const isCreate = !params.id;

  // 基础状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sku, setSku] = useState<SKU | null>(null);
  const [activePanels, setActivePanels] = useState<string[]>(['basic']);
  const [submittingPanel, setSubmittingPanel] = useState<string | null>(null);

  // ===== 面板1: 基础信息 =====
  const [basicName, setBasicName] = useState('');
  const [basicBusinessLine, setBasicBusinessLine] = useState<BusinessLine>('commercial_show');
  const [basicSortWeight, setBasicSortWeight] = useState<number>(0);

  // ===== 面板2: 演员配置与定价 =====
  const [actorStyle, setActorStyle] = useState('');
  const [actorTierRange, setActorTierRange] = useState('');
  const [actorMinCount, setActorMinCount] = useState<number>(1);
  const [actorMaxCount, setActorMaxCount] = useState<number>(3);
  const [tierPricing, setTierPricing] = useState<TierPricing[]>([...DEFAULT_TIER_PRICING]);
  const [defaultTier, setDefaultTier] = useState<string>('T3');
  const [durationOptions, setDurationOptions] = useState<number[]>([60]);
  const [defaultDuration, setDefaultDuration] = useState<number>(60);

  // ===== 面板3: 场地要求 =====
  const [venueType, setVenueType] = useState<VenueRequirement['type']>('both');
  const [minArea, setMinArea] = useState<number>(50);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [seatingStyles, setSeatingStyles] = useState<string[]>([]);

  // ===== 面板4: 节目介绍 =====
  const [description, setDescription] = useState('');
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // ===== 面板5: 案例展示 =====
  const [cases, setCases] = useState<CaseItem[]>([]);

  // ---------- 加载数据 ----------
  useEffect(() => {
    if (isCreate) return;
    setLoading(true);
    setError(null);

    getSKUDetail(params.id!)
      .then((res) => {
        const s = res.data;
        // 合并 localStorage 扩展
        const ext = loadExtensions(s.id);
        const merged: SKU = { ...s, ...ext };

        setSku(merged);

        // 填充面板1
        setBasicName(merged.name);
        setBasicBusinessLine(merged.businessLine);
        setBasicSortWeight(merged.sortWeight ?? 0);

        // 填充面板2
        setActorStyle(merged.actorProfile?.style || '');
        setActorTierRange(merged.actorProfile?.tierRange || '');
        setActorMinCount(merged.actorProfile?.count || 1);
        setActorMaxCount(merged.actorProfile?.count || 3);

        if (merged.tierPricing && merged.tierPricing.length > 0) {
          setTierPricing(merged.tierPricing);
        }
        setDefaultTier(merged.defaultTier || 'T3');
        setDurationOptions(merged.durationOptions || [merged.duration || 60]);
        setDefaultDuration(merged.defaultDuration || merged.duration || 60);

        // 填充面板3
        if (merged.venueRequirement) {
          setVenueType(merged.venueRequirement.type);
          setMinArea(merged.venueRequirement.minArea);
          setEquipment(merged.venueRequirement.equipment || []);
          setSeatingStyles(merged.venueRequirement.seatingStyles || []);
        }

        // 填充面板4
        setDescription(merged.description || '');
        setCoverImages(merged.coverImages || []);

        // 填充面板5
        setCases(merged.cases || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('加载失败'));
      })
      .finally(() => setLoading(false));
  }, [params.id, isCreate]);

  // ---------- 保存：基础信息 ----------
  const handleSaveBasic = useCallback(async () => {
    if (isCreate) return message.warning('请先创建SKU');
    setSubmittingPanel('basic');
    try {
      const payload: Partial<SKU> = {
        name: basicName,
        businessLine: basicBusinessLine,
        sortWeight: basicSortWeight,
        actorProfile: { style: actorStyle, tierRange: actorTierRange, count: actorMinCount },
      };
      await updateSKU(params.id!, payload);
      saveExtensions(params.id!, payload);
      setSku((prev) => (prev ? { ...prev, ...payload } : prev));
      message.success('基础信息已保存');
    } catch (err: any) {
      saveExtensions(params.id!, { name: basicName, businessLine: basicBusinessLine, sortWeight: basicSortWeight });
      message.warning('后端保存失败，已存本地：' + err.message);
    } finally {
      setSubmittingPanel(null);
    }
  }, [isCreate, params.id, basicName, basicBusinessLine, basicSortWeight, actorStyle, actorTierRange, actorMinCount]);

  // ---------- 保存：演员配置与定价 ----------
  const handleSaveActor = useCallback(async () => {
    if (isCreate) return message.warning('请先创建SKU');
    setSubmittingPanel('actor');
    try {
      const payload: Partial<SKU> = {
        actorProfile: { style: actorStyle, tierRange: actorTierRange, count: actorMinCount },
        tierPricing,
        defaultTier,
        durationOptions,
        defaultDuration,
      };
      await updateSKU(params.id!, payload);
      saveExtensions(params.id!, payload);
      setSku((prev) => (prev ? { ...prev, ...payload } : prev));
      message.success('演员配置已保存');
    } catch (err: any) {
      saveExtensions(params.id!, payload);
      message.warning('后端保存失败，已存本地：' + err.message);
    } finally {
      setSubmittingPanel(null);
    }
  }, [isCreate, params.id, actorStyle, actorTierRange, actorMinCount, tierPricing, defaultTier, durationOptions, defaultDuration]);

  // ---------- 保存：场地要求 ----------
  const handleSaveVenue = useCallback(async () => {
    if (isCreate) return message.warning('请先创建SKU');
    setSubmittingPanel('venue');
    try {
      const payload: Partial<SKU> = {
        venueRequirement: { type: venueType, minArea, equipment, seatingStyles },
      };
      await updateSKU(params.id!, payload);
      saveExtensions(params.id!, payload);
      setSku((prev) => (prev ? { ...prev, ...payload } : prev));
      message.success('场地要求已保存');
    } catch (err: any) {
      saveExtensions(params.id!, payload);
      message.warning('后端保存失败，已存本地：' + err.message);
    } finally {
      setSubmittingPanel(null);
    }
  }, [isCreate, params.id, venueType, minArea, equipment, seatingStyles]);

  // ---------- 保存：节目介绍 ----------
  const handleSaveIntro = useCallback(async () => {
    if (isCreate) return message.warning('请先创建SKU');
    setSubmittingPanel('intro');
    try {
      const payload: Partial<SKU> = { description, coverImages };
      await updateSKU(params.id!, payload);
      saveExtensions(params.id!, payload);
      setSku((prev) => (prev ? { ...prev, ...payload } : prev));
      message.success('节目介绍已保存');
    } catch (err: any) {
      saveExtensions(params.id!, payload);
      message.warning('后端保存失败，已存本地：' + err.message);
    } finally {
      setSubmittingPanel(null);
    }
  }, [isCreate, params.id, description, coverImages]);

  // ---------- 保存：案例展示 ----------
  const handleSaveCases = useCallback(async () => {
    if (isCreate) return message.warning('请先创建SKU');
    setSubmittingPanel('cases');
    try {
      const payload: Partial<SKU> = { cases };
      await updateSKU(params.id!, payload);
      saveExtensions(params.id!, payload);
      setSku((prev) => (prev ? { ...prev, ...payload } : prev));
      message.success('案例展示已保存');
    } catch (err: any) {
      saveExtensions(params.id!, payload);
      message.warning('后端保存失败，已存本地：' + err.message);
    } finally {
      setSubmittingPanel(null);
    }
  }, [isCreate, params.id, cases]);

  // ---------- 返回列表 ----------
  const handleBack = () => history.push('/sku/list');

  // ---------- 级别定价表列定义 ----------
  const tierColumns: ColumnsType<TierPricing> = [
    { title: '级别', dataIndex: 'tier', width: 60 },
    { title: '名称', dataIndex: 'name', width: 70 },
    { title: '描述', dataIndex: 'description', width: 120 },
    { title: '适合场景', dataIndex: 'scenario', width: 140 },
    {
      title: '15分钟单价（元）',
      dataIndex: 'pricePer15Min',
      width: 160,
      render: (_: unknown, record: TierPricing, index: number) => (
        <InputNumber
          min={0}
          precision={0}
          value={record.pricePer15Min / 100}
          onChange={(v) => {
            const next = [...tierPricing];
            next[index] = { ...next[index], pricePer15Min: (v || 0) * 100 };
            setTierPricing(next);
          }}
          style={{ width: '100%' }}
          placeholder="输入单价"
        />
      ),
    },
  ];

  // ---------- 案例列定义 ----------
  const caseColumns: ColumnsType<CaseItem & { _index: number }> = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 140,
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={cases[index]?.title || ''}
          onChange={(e) => {
            const next = [...cases];
            next[index] = { ...next[index], title: e.target.value };
            setCases(next);
          }}
          placeholder="案例标题"
        />
      ),
    },
    {
      title: '活动日期',
      dataIndex: 'date',
      width: 130,
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          type="date"
          value={cases[index]?.date || ''}
          onChange={(e) => {
            const next = [...cases];
            next[index] = { ...next[index], date: e.target.value };
            setCases(next);
          }}
        />
      ),
    },
    {
      title: '参与人数',
      dataIndex: 'participants',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          min={0}
          value={cases[index]?.participants || 0}
          onChange={(v) => {
            const next = [...cases];
            next[index] = { ...next[index], participants: v || 0 };
            setCases(next);
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '演员级别',
      dataIndex: 'actorTier',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <Select
          value={cases[index]?.actorTier || 'T3'}
          onChange={(v) => {
            const next = [...cases];
            next[index] = { ...next[index], actorTier: v };
            setCases(next);
          }}
          style={{ width: '100%' }}
          options={[
            { label: 'T3 资深', value: 'T3' },
            { label: 'T4 成熟', value: 'T4' },
            { label: 'T5 新锐', value: 'T5' },
          ]}
        />
      ),
    },
    {
      title: '好评率',
      dataIndex: 'rating',
      width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          min={0}
          max={100}
          value={cases[index]?.rating || 0}
          onChange={(v) => {
            const next = [...cases];
            next[index] = { ...next[index], rating: v || 0 };
            setCases(next);
          }}
          style={{ width: '100%' }}
          formatter={(v) => `${v}%`}
          parser={(v) => parseInt(v?.replace('%', '') || '0') as any}
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={cases[index]?.description || ''}
          onChange={(e) => {
            const next = [...cases];
            next[index] = { ...next[index], description: e.target.value };
            setCases(next);
          }}
          placeholder="案例描述"
        />
      ),
    },
    {
      title: '操作',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (
        <Popconfirm title="确定删除？" onConfirm={() => setCases((prev) => prev.filter((_, i) => i !== index))}>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  // ---------- 渲染：保存按钮 ----------
  const renderSaveBtn = (panelKey: string, label: string, loading: boolean) => (
    <div style={{ textAlign: 'right', marginTop: 16 }}>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={loading}
        onClick={() => {
          switch (panelKey) {
            case 'basic': handleSaveBasic(); break;
            case 'actor': handleSaveActor(); break;
            case 'venue': handleSaveVenue(); break;
            case 'intro': handleSaveIntro(); break;
            case 'cases': handleSaveCases(); break;
          }
        }}
        style={{ minHeight: 44 }}
        disabled={isCreate}
      >
        {isCreate ? '请先创建SKU' : `保存${label}`}
      </Button>
    </div>
  );

  // ========== 加载中 ==========
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载SKU详情..." />
        </div>
      </PageContainer>
    );
  }

  // ========== 错误 ==========
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

  // ========== 主体 ==========
  return (
    <PageContainer onBack={handleBack} title={isCreate ? '新增SKU' : 'SKU详情'}>
      {/* 状态摘要栏 */}
      {!isCreate && sku && (
        <ProCard style={{ marginBottom: 16 }}>
          <Descriptions column={4} size="small">
            <Descriptions.Item label="SKU名称"><b>{sku.name}</b></Descriptions.Item>
            <Descriptions.Item label="业务线">
              <Tag color="blue">{BusinessLineLabel[sku.businessLine]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[sku.status]}>{statusLabelMap[sku.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="甲方标准价">{formatPrice(sku.clientPrice)}</Descriptions.Item>
          </Descriptions>
        </ProCard>
      )}

      {/* 折叠面板 */}
      <Collapse
        activeKey={activePanels}
        onChange={(keys) => setActivePanels(Array.isArray(keys) ? keys as string[] : [keys as string])}
        style={{ background: '#fff' }}
      >
        {/* ==================== 面板1：基础信息 ==================== */}
        <Panel header="基础信息" key="basic">
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="SKU名称" required>
                  <Input
                    value={basicName}
                    onChange={(e) => setBasicName(e.target.value)}
                    placeholder="如：脱口秀专场 · 60min标准版"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="业务线" required>
                  <Select
                    value={basicBusinessLine}
                    onChange={(v) => setBasicBusinessLine(v)}
                    options={Object.entries(BusinessLineLabel).map(([k, v]) => ({ label: v, value: k }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="排序权重">
                  <InputNumber
                    value={basicSortWeight}
                    onChange={(v) => setBasicSortWeight(v || 0)}
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="数字越大越靠前"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* 只读：已有价格/时间信息 */}
          {sku && (
            <Descriptions column={3} size="small" style={{ marginBottom: 16 }} bordered>
              <Descriptions.Item label="甲方标准价">{formatPrice(sku.clientPrice)}</Descriptions.Item>
              <Descriptions.Item label="活动公司价(7折)">{formatPrice(sku.companyPrice)}</Descriptions.Item>
              <Descriptions.Item label="内部结算价">{formatPrice(sku.internalPrice)}</Descriptions.Item>
              <Descriptions.Item label="演出时长">{sku.duration}分钟</Descriptions.Item>
              <Descriptions.Item label="适用场景" span={2}>{sku.scenarios?.join('、') || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(sku.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
              <Descriptions.Item label="更新时间" span={2}>{new Date(sku.updatedAt).toLocaleString('zh-CN')}</Descriptions.Item>
            </Descriptions>
          )}

          {renderSaveBtn('basic', '基础信息', submittingPanel === 'basic')}
        </Panel>

        {/* ==================== 面板2：演员配置与定价 ==================== */}
        <Panel header="演员配置与定价" key="actor">
          <Divider orientation="left" style={{ marginTop: 0 }}>演员画像</Divider>
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="演员风格">
                  <Input
                    value={actorStyle}
                    onChange={(e) => setActorStyle(e.target.value)}
                    placeholder="如：脱口秀、即兴喜剧"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="建议咖位范围">
                  <Input
                    value={actorTierRange}
                    onChange={(e) => setActorTierRange(e.target.value)}
                    placeholder="如：T2-T4"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="最少人数">
                  <InputNumber
                    value={actorMinCount}
                    onChange={(v) => setActorMinCount(v || 1)}
                    min={1}
                    max={10}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="最多人数">
                  <InputNumber
                    value={actorMaxCount}
                    onChange={(v) => setActorMaxCount(v || 3)}
                    min={1}
                    max={10}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Divider orientation="left">级别定价配置</Divider>
          <Table
            columns={tierColumns}
            dataSource={tierPricing.map((item, i) => ({ ...item, key: item.tier }))}
            pagination={false}
            size="small"
            bordered
            style={{ marginBottom: 16 }}
          />

          <Divider orientation="left">默认配置</Divider>
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="默认推荐级别">
                  <Select
                    value={defaultTier}
                    onChange={(v) => setDefaultTier(v)}
                    options={[
                      { label: 'T3 资深', value: 'T3' },
                      { label: 'T4 成熟', value: 'T4' },
                      { label: 'T5 新锐', value: 'T5' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="可选时长（多选）">
                  <Select
                    mode="multiple"
                    value={durationOptions}
                    onChange={(v) => setDurationOptions(v)}
                    options={DURATION_OPTIONS.map((d) => ({ label: `${d}分钟`, value: d }))}
                    placeholder="选择可选时长"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="默认时长">
                  <Select
                    value={defaultDuration}
                    onChange={(v) => setDefaultDuration(v)}
                    options={DURATION_OPTIONS.map((d) => ({ label: `${d}分钟`, value: d }))}
                    placeholder="选择默认时长"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {renderSaveBtn('actor', '演员配置', submittingPanel === 'actor')}
        </Panel>

        {/* ==================== 面板3：场地要求 ==================== */}
        <Panel header="场地要求" key="venue">
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="场地类型">
                  <Select
                    value={venueType}
                    onChange={(v) => setVenueType(v)}
                    options={VENUE_TYPE_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="最小面积（㎡）">
                  <InputNumber
                    value={minArea}
                    onChange={(v) => setMinArea(v || 0)}
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="如：50"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={16}>
                <Form.Item label="设备清单">
                  <Select
                    mode="tags"
                    value={equipment}
                    onChange={(v) => setEquipment(v)}
                    placeholder="输入设备名称，回车添加（如：音响系统、灯光设备、投影仪）"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={16}>
                <Form.Item label="座位形式（多选）">
                  <Select
                    mode="multiple"
                    value={seatingStyles}
                    onChange={(v) => setSeatingStyles(v)}
                    options={SEATING_STYLE_OPTIONS.map((s) => ({ label: s, value: s }))}
                    placeholder="选择适合的座位形式"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {renderSaveBtn('venue', '场地要求', submittingPanel === 'venue')}
        </Panel>

        {/* ==================== 面板4：节目介绍 ==================== */}
        <Panel header="节目介绍" key="intro">
          <Form layout="vertical">
            <Form.Item label="节目介绍">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="输入节目详细介绍（支持换行）"
                maxLength={2000}
                showCount
              />
            </Form.Item>
          </Form>

          <Divider orientation="left">封面图</Divider>
          <Form layout="vertical">
            <Form.Item label="添加图片URL">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onPressEnter={() => {
                    if (newImageUrl.trim()) {
                      setCoverImages((prev) => [...prev, newImageUrl.trim()]);
                      setNewImageUrl('');
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    if (newImageUrl.trim()) {
                      setCoverImages((prev) => [...prev, newImageUrl.trim()]);
                      setNewImageUrl('');
                    }
                  }}
                >
                  添加
                </Button>
              </Space.Compact>
            </Form.Item>
          </Form>

          {/* 已添加的封面图预览列表 */}
          {coverImages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {coverImages.map((url, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: 120,
                    height: 80,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '1px solid #d9d9d9',
                  }}
                >
                  <img src={url} alt={`封面${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setCoverImages((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: '0 0 0 6px',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {renderSaveBtn('intro', '节目介绍', submittingPanel === 'intro')}
        </Panel>

        {/* ==================== 面板5：案例展示 ==================== */}
        <Panel header="案例展示" key="cases">
          <div style={{ marginBottom: 12 }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                setCases((prev) => [
                  ...prev,
                  {
                    id: uid(),
                    title: '',
                    date: '',
                    participants: 0,
                    actorTier: 'T3',
                    rating: 0,
                    description: '',
                  },
                ])
              }
              block
            >
              新增案例
            </Button>
          </div>

          {cases.length > 0 ? (
            <Table
              columns={caseColumns}
              dataSource={cases.map((item, i) => ({ ...item, _index: i, key: item.id }))}
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              bordered
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>暂无案例，点击上方按钮添加</div>
          )}

          {renderSaveBtn('cases', '案例展示', submittingPanel === 'cases')}
        </Panel>
      </Collapse>

      {/* 底部返回按钮 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button onClick={handleBack} style={{ minHeight: 44 }} icon={<ArrowLeftOutlined />}>
          返回列表
        </Button>
      </div>
    </PageContainer>
  );
};

export default SKUDetailPage;
