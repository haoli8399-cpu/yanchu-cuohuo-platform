import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  message,
} from 'antd';
import type { ShowType, BusinessType } from '@/types';

const { Text } = Typography;
const { TextArea } = Input;

/* ─── Design Tokens ─── */
const THEME = {
  brand: '#7c3aed',
  brandHover: '#6d28d9',
  brandLight: '#a78bfa',
  brandBg: '#f5f3ff',
  brandSubtle: '#ede9fe',
  bgPage: '#f5f5f7',
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  divider: '#f0f0f2',
  success: '#22c55e',
  error: '#ef4444',
};

/* ─── Label Maps ─── */
const ShowTypeLabels: Record<ShowType, string> = {
  talkshow: '脱口秀',
  improv: '即兴喜剧',
  manzai: '漫才',
  newcomedy: '新喜剧',
  magic: '魔术喜剧',
  family: '亲子喜剧',
};

const BusinessTypeLabels: Record<BusinessType, string> = {
  commercial: '商演包场',
  outshow: '外出演出',
  sponsor: '演出赞助',
  custom_content: '定制内容',
  custom_mix: '定制拼盘',
};

/* ─── Select Options ─── */
const showTypeOptions = Object.entries(ShowTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const businessTypeOptions = Object.entries(BusinessTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

const durationOptions = [
  { value: '30', label: '30分钟' },
  { value: '60', label: '60分钟' },
  { value: '90', label: '90分钟' },
  { value: '120', label: '120分钟' },
  { value: 'custom', label: '自定义' },
];

const budgetOptions = [
  { value: 'below5k', label: '5000以下' },
  { value: '5k-10k', label: '5000-10000' },
  { value: '10k-20k', label: '10000-20000' },
  { value: '20k-30k', label: '20000-30000' },
  { value: '30k-50k', label: '30000-50000' },
  { value: 'above50k', label: '50000以上' },
];

/* ─── Mock SKU Data ─── */
const mockSku = {
  id: 'sku-001',
  title: '脱口秀商演精品套餐',
  showType: 'talkshow' as ShowType,
  coverImage: 'https://placehold.co/200x120/7c3aed/ffffff?text=SKU',
  basePrice: 15000,
  defaultConfig: {
    performerLevel: 'A卡',
    duration: '90分钟',
    performerCount: '3人',
  },
};

/* ─── Style Objects ─── */
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  breadcrumb: {
    marginBottom: 16,
  },
  breadcrumbLink: {
    color: THEME.textSecondary,
  },
  formLayout: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    marginBottom: 16,
  },
  cardBody: {
    padding: '24px',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: THEME.brand,
  },
  formItem: {
    marginBottom: 20,
  },
  stickySidebar: {
    position: 'sticky' as const,
    top: 88,
  },
  skuCard: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    marginBottom: 16,
  },
  skuCardBody: {
    padding: 16,
  },
  skuHeader: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
  },
  skuCover: {
    width: 80,
    height: 56,
    borderRadius: 8,
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  skuInfo: {
    flex: 1,
    minWidth: 0,
  },
  skuTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '20px',
    marginBottom: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  skuPrice: {
    fontSize: 16,
    fontWeight: 700,
    color: THEME.brand,
  },
  skuPriceUnit: {
    fontSize: 12,
    fontWeight: 400,
    color: THEME.textTertiary,
  },
  configSection: {
    backgroundColor: THEME.bgPage,
    borderRadius: 8,
    padding: '12px 16px',
  },
  configTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  configRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    lineHeight: '22px',
  },
  configLabel: {
    color: THEME.textTertiary,
  },
  configValue: {
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  priceCard: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
  },
  priceCardBody: {
    padding: '20px 16px',
  },
  priceTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: THEME.textPrimary,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  priceRowLabel: {
    color: THEME.textSecondary,
  },
  priceRowValue: {
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  priceRowAdjustment: {
    color: THEME.brand,
    fontWeight: 500,
  },
  priceDivider: {
    height: 1,
    backgroundColor: THEME.divider,
    margin: '16px 0',
  },
  priceTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceTotalLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  priceTotalValue: {
    fontSize: 24,
    fontWeight: 700,
    color: THEME.error,
  },
  priceTotalSymbol: {
    fontSize: 14,
    fontWeight: 500,
  },
  priceNote: {
    fontSize: 12,
    color: THEME.textTertiary,
    textAlign: 'center' as const,
    marginTop: 4,
  },
  actionBar: {
    position: 'sticky' as const,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderTop: `1px solid ${THEME.border}`,
    padding: '16px 24px',
    borderRadius: 12,
    marginTop: 8,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
  },
  submitBtn: {
    height: 44,
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 8,
    paddingLeft: 32,
    paddingRight: 32,
  },
  draftBtn: {
    height: 44,
    fontSize: 15,
    fontWeight: 500,
    borderRadius: 8,
    paddingLeft: 24,
    paddingRight: 24,
  },
};

/* ─── Component ─── */
const SubmitRequest: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const skuId = searchParams.get('skuId');
  const hasSku = !!skuId;

  // Mock estimated price
  const basePrice = hasSku ? mockSku.basePrice : 0;
  const adjustments = hasSku ? 3000 : 0;
  const estimatedTotal = basePrice + adjustments;

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items: Array<{ title: React.ReactNode }> = [
      {
        title: <Link to="/" style={styles.breadcrumbLink}>首页</Link>,
      },
      {
        title: <Link to="/skus" style={styles.breadcrumbLink}>演出方案</Link>,
      },
    ];
    if (hasSku) {
      items.push({
        title: <Link to={`/skus/${skuId}`} style={styles.breadcrumbLink}>{mockSku.title}</Link>,
      });
    }
    items.push({ title: '提交需求' });
    return items;
  }, [skuId, hasSku]);

  const handleSaveDraft = () => {
    message.success('草稿已保存');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      console.log('Form values:', values);
      // Mock submit delay
      setTimeout(() => {
        setSubmitting(false);
        message.success('需求提交成功！');
        navigate('/demands');
      }, 1200);
    } catch {
      // Validation failed
    }
  };

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Two Column Layout */}
      <Row gutter={24}>
        {/* Left Column - Form */}
        <Col xs={24} lg={14}>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              showType: hasSku ? mockSku.showType : undefined,
            }}
          >
            {/* ── 演出信息 Card ── */}
            <Card style={styles.card} styles={{ body: styles.cardBody }}>
              <div style={styles.sectionTitle}>
                <span style={styles.sectionIcon} />
                演出信息
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="showType"
                    label="演出类型"
                    rules={[{ required: true, message: '请选择演出类型' }]}
                    style={styles.formItem}
                  >
                    <Select
                      placeholder="请选择演出类型"
                      options={showTypeOptions}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="businessType"
                    label="业务类型"
                    rules={[{ required: true, message: '请选择业务类型' }]}
                    style={styles.formItem}
                  >
                    <Select
                      placeholder="请选择业务类型"
                      options={businessTypeOptions}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="theme"
                label="演出主题"
                rules={[{ required: true, message: '请输入演出主题' }]}
                style={styles.formItem}
              >
                <Input placeholder="请输入演出主题或名称" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="expectedDate"
                    label="演出日期"
                    rules={[{ required: true, message: '请选择演出日期' }]}
                    style={styles.formItem}
                  >
                    <DatePicker
                      placeholder="请选择日期"
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="location"
                    label="演出地点"
                    rules={[{ required: true, message: '请输入演出地点' }]}
                    style={styles.formItem}
                  >
                    <Input placeholder="请输入场地地址" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ── 需求详情 Card ── */}
            <Card style={styles.card} styles={{ body: styles.cardBody }}>
              <div style={styles.sectionTitle}>
                <span style={styles.sectionIcon} />
                需求详情
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="duration"
                    label="演出时长"
                    rules={[{ required: true, message: '请选择演出时长' }]}
                    style={styles.formItem}
                  >
                    <Select
                      placeholder="请选择演出时长"
                      options={durationOptions}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="budget"
                    label="预算范围"
                    rules={[{ required: true, message: '请选择预算范围' }]}
                    style={styles.formItem}
                  >
                    <Select
                      placeholder="请选择预算范围"
                      options={budgetOptions}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="audienceCount"
                label="观众人数"
                rules={[{ required: true, message: '请输入观众人数' }]}
                style={styles.formItem}
              >
                <InputNumber
                  placeholder="请输入预计观众人数"
                  size="large"
                  min={1}
                  max={100000}
                  style={{ width: '100%' }}
                  addonAfter="人"
                />
              </Form.Item>

              <Form.Item
                name="specialRequirements"
                label="特殊要求"
                style={styles.formItem}
              >
                <TextArea
                  placeholder="请描述您的特殊要求，如演出风格、互动环节等"
                  maxLength={500}
                  showCount
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>
            </Card>

            {/* ── 联系信息 Card ── */}
            <Card style={styles.card} styles={{ body: styles.cardBody }}>
              <div style={styles.sectionTitle}>
                <span style={styles.sectionIcon} />
                联系信息
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="contactName"
                    label="联系人"
                    rules={[{ required: true, message: '请输入联系人姓名' }]}
                    style={styles.formItem}
                  >
                    <Input placeholder="请输入联系人姓名" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="contactPhone"
                    label="联系电话"
                    rules={[
                      { required: true, message: '请输入联系电话' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
                    ]}
                    style={styles.formItem}
                  >
                    <Input placeholder="请输入联系电话" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="remark"
                label="备注"
                style={styles.formItem}
              >
                <TextArea
                  placeholder="其他需要补充的信息"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </Card>

            {/* ── Bottom Action Bar ── */}
            <div style={styles.actionBar}>
              <Button
                style={styles.draftBtn}
                onClick={handleSaveDraft}
              >
                保存草稿
              </Button>
              <Button
                type="primary"
                size="large"
                loading={submitting}
                onClick={handleSubmit}
                style={{
                  ...styles.submitBtn,
                  backgroundColor: THEME.brand,
                  borderColor: THEME.brand,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = THEME.brandHover;
                  (e.target as HTMLButtonElement).style.borderColor = THEME.brandHover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = THEME.brand;
                  (e.target as HTMLButtonElement).style.borderColor = THEME.brand;
                }}
              >
                提交需求
              </Button>
            </div>
          </Form>
        </Col>

        {/* Right Column - Summary Sidebar */}
        <Col xs={24} lg={10}>
          <div style={styles.stickySidebar}>
            {/* ── 关联方案 Card ── */}
            {hasSku && (
              <Card style={styles.skuCard} styles={{ body: styles.skuCardBody }}>
                <div style={styles.skuHeader}>
                  <img
                    src={mockSku.coverImage}
                    alt={mockSku.title}
                    style={styles.skuCover}
                  />
                  <div style={styles.skuInfo}>
                    <div style={styles.skuTitle}>{mockSku.title}</div>
                    <div style={styles.skuPrice}>
                      ¥{mockSku.basePrice.toLocaleString()}
                      <span style={styles.skuPriceUnit}> / 场</span>
                    </div>
                  </div>
                </div>
                <Tag color="purple" style={{ marginBottom: 12 }}>
                  {ShowTypeLabels[mockSku.showType]}
                </Tag>

                <div style={styles.configSection}>
                  <div style={styles.configTitle}>默认配置</div>
                  <div style={styles.configRow}>
                    <span style={styles.configLabel}>演员级别</span>
                    <span style={styles.configValue}>{mockSku.defaultConfig.performerLevel}</span>
                  </div>
                  <div style={styles.configRow}>
                    <span style={styles.configLabel}>演出时长</span>
                    <span style={styles.configValue}>{mockSku.defaultConfig.duration}</span>
                  </div>
                  <div style={styles.configRow}>
                    <span style={styles.configLabel}>演员人数</span>
                    <span style={styles.configValue}>{mockSku.defaultConfig.performerCount}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* ── 实时报价 Card ── */}
            <Card style={styles.priceCard} styles={{ body: styles.priceCardBody }}>
              <div style={styles.priceTitle}>
                <span style={styles.sectionIcon} />
                实时报价
              </div>

              {hasSku ? (
                <>
                  <div style={styles.priceRow}>
                    <span style={styles.priceRowLabel}>基础价格</span>
                    <span style={styles.priceRowValue}>
                      ¥{basePrice.toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.priceRow}>
                    <span style={styles.priceRowLabel}>演员级别变更</span>
                    <span style={styles.priceRowAdjustment}>
                      +¥2,000
                    </span>
                  </div>
                  <div style={styles.priceRow}>
                    <span style={styles.priceRowLabel}>时长调整</span>
                    <span style={styles.priceRowAdjustment}>
                      +¥1,000
                    </span>
                  </div>

                  <Divider style={styles.priceDivider} />

                  <div style={styles.priceTotalRow}>
                    <span style={styles.priceTotalLabel}>预估总价</span>
                    <span style={styles.priceTotalValue}>
                      <span style={styles.priceTotalSymbol}>¥</span>
                      {estimatedTotal.toLocaleString()}
                    </span>
                  </div>

                  <div style={styles.priceNote}>
                    最终价格以确认为准
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">
                    关联演出方案后可查看实时报价
                  </Text>
                </div>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SubmitRequest;
