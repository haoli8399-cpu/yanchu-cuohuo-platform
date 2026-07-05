import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Row, Col, Card, Button, Divider, Tag } from 'antd';
import { HeartOutlined, HeartFilled, MessageOutlined, RightOutlined } from '@ant-design/icons';
import type { Sku, Performer, TierLevel } from '@/types';
import { ShowTypeLabels, BusinessTypeLabels } from '@/types';

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
  price: '#dc2626',
  starFilled: '#f59e0b',
  starEmpty: '#e5e7eb',
  success: '#22c55e',
  gold: '#d97706',
  silver: '#6b7280',
  bronze: '#b45309',
} as const;

/* ─── Tier Level Colors ─── */
const tierColors: Record<TierLevel, { bg: string; text: string }> = {
  T0: { bg: '#fef3c7', text: '#92400e' },
  T1: { bg: '#f3f4f6', text: '#374151' },
  T2: { bg: '#fed7aa', text: '#9a3412' },
  T3: { bg: '#e0e7ff', text: '#3730a3' },
  T4: { bg: '#d1fae5', text: '#065f46' },
  T5: { bg: '#fce7f3', text: '#9d174d' },
  T6: { bg: '#f1f5f9', text: '#475569' },
};

/* ─── Mock Images ─── */
const mockImages = [
  'https://picsum.photos/seed/detail-main/800/450',
  'https://picsum.photos/seed/detail-angle2/800/450',
  'https://picsum.photos/seed/detail-angle3/800/450',
  'https://picsum.photos/seed/detail-angle4/800/450',
];

/* ─── Mock Performers ─── */
const mockPerformers: Performer[] = [
  {
    id: 'p-001',
    name: '张大帅',
    avatar: 'https://picsum.photos/seed/avatar-zhang/96/96',
    tierLevel: 'T0',
    experience: '8年脱口秀表演经验，曾参加《脱口秀大会》录制，全国巡演超过200场',
    showCount: 520,
    yearsActive: 8,
  },
  {
    id: 'p-002',
    name: '李小乐',
    avatar: 'https://picsum.photos/seed/avatar-li/96/96',
    tierLevel: 'T1',
    experience: '5年即兴喜剧经验，擅长Audience Play和Long Form，年均演出80+场',
    showCount: 340,
    yearsActive: 5,
  },
  {
    id: 'p-003',
    name: '王小 funny',
    avatar: 'https://picsum.photos/seed/avatar-wang/96/96',
    tierLevel: 'T2',
    experience: '3年漫才表演经验，风格清新幽默，多次获得新锐喜剧人奖项',
    showCount: 180,
    yearsActive: 3,
  },
];

/* ─── Mock Cases ─── */
const mockCases = [
  {
    id: 'case-001',
    image: 'https://picsum.photos/seed/case-tech/400/240',
    name: '某科技公司2025年会',
    date: '2025-12-20',
  },
  {
    id: 'case-002',
    image: 'https://picsum.photos/seed/case-brand/400/240',
    name: '知名品牌新品发布会',
    date: '2025-11-15',
  },
  {
    id: 'case-003',
    image: 'https://picsum.photos/seed/case-mall/400/240',
    name: '万达广场周年庆',
    date: '2025-10-01',
  },
];

/* ─── Mock Reviews ─── */
const mockReviews = [
  {
    id: 'r-001',
    avatar: 'https://picsum.photos/seed/reviewer1/64/64',
    name: '张经理',
    date: '2025-12-25',
    rating: 5,
    text: '演员非常有实力，现场气氛热烈，同事们都说这是参加过最有趣的年会。段子很贴合我们互联网公司的文化，全程笑点密集，强烈推荐！',
  },
  {
    id: 'r-002',
    avatar: 'https://picsum.photos/seed/reviewer2/64/64',
    name: '李总',
    date: '2025-11-30',
    rating: 5,
    text: '表演很专业，互动环节设计得很好，现场观众参与度极高。价格合理，物超所值。下次活动还会继续选择这个方案。',
  },
  {
    id: 'r-003',
    avatar: 'https://picsum.photos/seed/reviewer3/64/64',
    name: '王主管',
    date: '2025-10-18',
    rating: 4,
    text: '整体效果不错，演员准时到场，表演质量高。唯一的建议是希望能根据客户行业多提供一些定制化的段子参考。',
  },
];

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: THEME.bgPage,
    minHeight: 'calc(100vh - 112px)',
  },
  /* Breadcrumb */
  breadcrumb: {
    marginBottom: 20,
  },
  /* Section Card */
  sectionCard: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: THEME.textPrimary,
    margin: 0,
    lineHeight: '26px',
  },
  /* Image Gallery */
  mainImageWrapper: {
    width: '100%',
    height: 480,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f2',
    position: 'relative' as const,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  thumbnailRow: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    flexShrink: 0,
    transition: 'border-color 0.2s ease',
    opacity: 0.6,
  },
  thumbnailActive: {
    border: `2px solid ${THEME.brand}`,
    opacity: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  /* Title & Tags */
  titleRow: {
    marginTop: 20,
    marginBottom: 8,
  },
  skuTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: 0,
    lineHeight: '36px',
  },
  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap' as const,
  },
  /* Rating Row */
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    padding: '12px 16px',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
  },
  ratingStars: {
    color: THEME.starFilled,
    fontSize: 18,
    display: 'flex',
    gap: 2,
  },
  ratingScore: {
    fontSize: 20,
    fontWeight: 700,
    color: THEME.textPrimary,
  },
  ratingCount: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  salesCount: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginLeft: 'auto',
  },
  /* Performer List */
  performerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 0',
    borderBottom: `1px solid ${THEME.divider}`,
  },
  performerItemLast: {
    borderBottom: 'none',
  },
  performerAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  performerInfo: {
    flex: 1,
    minWidth: 0,
  },
  performerName: {
    fontSize: 15,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '22px',
  },
  performerNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '18px',
  },
  performerExp: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
    lineHeight: '18px',
  },
  /* Description */
  description: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: '24px',
    whiteSpace: 'pre-line' as const,
  },
  descriptionParagraph: {
    marginBottom: 16,
  },
  /* Service Details Grid */
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px 32px',
    marginTop: 20,
  },
  serviceItem: {
    display: 'flex',
    gap: 8,
  },
  serviceLabel: {
    fontSize: 14,
    color: THEME.textTertiary,
    flexShrink: 0,
    lineHeight: '22px',
  },
  serviceValue: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: 500,
    lineHeight: '22px',
  },
  /* Case Cards */
  caseCard: {
    borderRadius: 8,
    overflow: 'hidden',
    border: `1px solid ${THEME.border}`,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease',
  },
  caseImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover' as const,
    display: 'block',
  },
  caseInfo: {
    padding: '12px',
  },
  caseName: {
    fontSize: 14,
    fontWeight: 500,
    color: THEME.textPrimary,
    lineHeight: '20px',
    marginBottom: 4,
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  caseDate: {
    fontSize: 12,
    color: THEME.textTertiary,
    lineHeight: '18px',
    marginBottom: 8,
  },
  caseLink: {
    fontSize: 13,
    color: THEME.brand,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  /* Review Items */
  reviewItem: {
    padding: '16px 0',
    borderBottom: `1px solid ${THEME.divider}`,
  },
  reviewItemLast: {
    borderBottom: 'none',
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: 500,
    color: THEME.textPrimary,
    lineHeight: '20px',
  },
  reviewDate: {
    fontSize: 12,
    color: THEME.textTertiary,
    lineHeight: '18px',
  },
  reviewStars: {
    fontSize: 13,
    color: THEME.starFilled,
  },
  reviewText: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: '22px',
  },
  /* Overall Rating */
  overallRating: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 0',
    borderBottom: `1px solid ${THEME.divider}`,
    marginBottom: 4,
  },
  overallScore: {
    fontSize: 36,
    fontWeight: 700,
    color: THEME.textPrimary,
    lineHeight: '42px',
  },
  overallMax: {
    fontSize: 16,
    color: THEME.textTertiary,
    lineHeight: '42px',
  },
  overallStars: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  overallStarRow: {
    fontSize: 18,
    color: THEME.starFilled,
    display: 'flex',
    gap: 2,
  },
  overallCount: {
    fontSize: 13,
    color: THEME.textTertiary,
  },
  /* Right Sidebar - Price Card */
  priceCard: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    position: 'sticky' as const,
    top: 80,
  },
  priceCardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    margin: 0,
    lineHeight: '24px',
  },
  priceDisplay: {
    marginTop: 16,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: 700,
    color: THEME.price,
    lineHeight: '36px',
  },
  priceSuffix: {
    fontSize: 14,
    color: THEME.textTertiary,
    marginLeft: 4,
  },
  configRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: 14,
  },
  configLabel: {
    color: THEME.textSecondary,
  },
  configValue: {
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  quoteBtn: {
    width: '100%',
    height: 48,
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 10,
    marginTop: 20,
  },
  consultBtn: {
    width: '100%',
    height: 44,
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 10,
    marginTop: 12,
  },
  favLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    fontSize: 14,
    color: THEME.textSecondary,
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'color 0.2s',
  },
};

/* ─── Rating Stars Helper ─── */
function StarDisplay({ rating, size }: { rating: number; size?: number }) {
  const fontSize = size || 14;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span style={{ fontSize, display: 'flex', gap: 2 }}>
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`} style={{ color: THEME.starFilled }}>&#9733;</span>
      ))}
      {hasHalf && <span style={{ color: THEME.starFilled }}>&#9733;</span>}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} style={{ color: THEME.starEmpty }}>&#9733;</span>
      ))}
    </span>
  );
}

/* ─── SkuDetail Component ─── */
const SkuDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  /* ─── Mock SKU Data (would be fetched by id in production) ─── */
  const sku: Sku = {
    id: id || 'sku-001',
    title: '都市脱口秀之夜',
    showType: 'talkshow',
    coverImage: mockImages[0],
    description:
      '都市脱口秀之夜是一场精心策划的高端脱口秀演出，汇聚了城市中最受欢迎的脱口秀演员阵容。演出内容涵盖职场百态、都市情感、生活趣事等热门话题，每个段子都经过反复打磨，确保最佳的喜剧效果。\n\n演出采用精心编排的节目单，由主持人串联全场，每位演员表演8-12分钟的精选段子。整场演出时长约90分钟，包含暖场互动、正式演出和返场三个环节。我们可根据客户需求进行内容定制，融入企业文化、行业梗等专属元素。\n\n无论是企业年会、商演包场还是私人派对，都市脱口秀之夜都能为您的活动注入满满的欢乐能量，让每一位到场嘉宾都留下难忘的美好回忆。',
    duration: 90,
    price: 12800,
    priceUnit: '场',
    rating: 4.8,
    ratingCount: 156,
    salesCount: 32,
    suitableScene: '企业年会、商演包场、私人聚会',
    businessType: 'commercial',
    performers: mockPerformers,
    tags: ['热门推荐', '年会首选', '好评如潮', '可定制'],
  };

  /* ─── Handlers ─── */
  const handleGetQuote = () => {
    navigate(`/demands/submit?skuId=${sku.id}`);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  /* ─── Render ─── */
  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Breadcrumb
          items={[
            { title: <a onClick={() => navigate('/')}>首页</a> },
            { title: <a onClick={() => navigate('/skus')}>演出方案</a> },
            { title: sku.title },
          ]}
        />
      </div>

      {/* Main Content - Two Columns */}
      <Row gutter={24}>
        {/* ─── Left Column (14 cols) ─── */}
        <Col span={14}>
          {/* Image Gallery */}
          <div style={styles.mainImageWrapper}>
            <img
              style={styles.mainImage}
              src={mockImages[selectedImage]}
              alt={sku.title}
            />
          </div>
          <div style={styles.thumbnailRow}>
            {mockImages.map((img, index) => (
              <div
                key={index}
                style={{
                  ...styles.thumbnail,
                  ...(selectedImage === index ? styles.thumbnailActive : {}),
                }}
                onClick={() => setSelectedImage(index)}
              >
                <img style={styles.thumbnailImage} src={img} alt={`缩略图 ${index + 1}`} />
              </div>
            ))}
          </div>

          {/* Title & Tags */}
          <div style={styles.titleRow}>
            <h1 style={styles.skuTitle}>{sku.title}</h1>
            <div style={styles.tagsRow}>
              <Tag color="purple">{ShowTypeLabels[sku.showType]}</Tag>
              <Tag color="blue">{BusinessTypeLabels[sku.businessType]}</Tag>
              {sku.tags.map((tag, idx) => (
                <Tag key={idx} style={{ borderRadius: 4 }}>{tag}</Tag>
              ))}
            </div>
          </div>

          {/* Rating Row */}
          <div style={styles.ratingRow}>
            <StarDisplay rating={sku.rating} size={18} />
            <span style={styles.ratingScore}>{sku.rating}</span>
            <span style={styles.ratingCount}>({sku.ratingCount}条评价)</span>
            <span style={styles.salesCount}>月销 {sku.salesCount} 场</span>
          </div>

          {/* 演出阵容 Section */}
          <Card
            title={<span style={styles.sectionTitle}>演出阵容</span>}
            style={styles.sectionCard}
            styles={{ body: { padding: '4px 24px 16px' } }}
          >
            {sku.performers.map((performer, index) => {
              const tierColor = tierColors[performer.tierLevel];
              const isLast = index === sku.performers.length - 1;
              return (
                <div
                  key={performer.id}
                  style={{
                    ...styles.performerItem,
                    ...(isLast ? styles.performerItemLast : {}),
                  }}
                >
                  <img
                    style={styles.performerAvatar}
                    src={performer.avatar}
                    alt={performer.name}
                  />
                  <div style={styles.performerInfo}>
                    <div style={styles.performerNameRow}>
                      <span style={styles.performerName}>{performer.name}</span>
                      <span
                        style={{
                          ...styles.tierBadge,
                          backgroundColor: tierColor.bg,
                          color: tierColor.text,
                        }}
                      >
                        {performer.tierLevel}
                      </span>
                    </div>
                    <div style={styles.performerExp}>{performer.experience}</div>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* 节目介绍 Section */}
          <Card
            title={<span style={styles.sectionTitle}>节目介绍</span>}
            style={styles.sectionCard}
            styles={{ body: { padding: '20px 24px 24px' } }}
          >
            <div style={styles.description}>
              {sku.description.split('\n\n').map((para, idx) => (
                <p key={idx} style={styles.descriptionParagraph}>{para}</p>
              ))}
            </div>

            {/* Service Details */}
            <div style={styles.serviceGrid}>
              <div style={styles.serviceItem}>
                <span style={styles.serviceLabel}>演出时长</span>
                <span style={styles.serviceValue}>{sku.duration}分钟</span>
              </div>
              <div style={styles.serviceItem}>
                <span style={styles.serviceLabel}>适合人数</span>
                <span style={styles.serviceValue}>50-500人</span>
              </div>
              <div style={styles.serviceItem}>
                <span style={styles.serviceLabel}>演出语言</span>
                <span style={styles.serviceValue}>中文普通话</span>
              </div>
              <div style={styles.serviceItem}>
                <span style={styles.serviceLabel}>场地要求</span>
                <span style={styles.serviceValue}>舞台+音响+灯光</span>
              </div>
              <div style={styles.serviceItem}>
                <span style={styles.serviceLabel}>演员人数</span>
                <span style={styles.serviceValue}>1-3人</span>
              </div>
              <div style={styles.serviceItem}>
                <span style={styles.serviceLabel}>适合场景</span>
                <span style={styles.serviceValue}>{sku.suitableScene}</span>
              </div>
            </div>
          </Card>

          {/* 案例展示 Section */}
          <Card
            title={<span style={styles.sectionTitle}>案例展示</span>}
            style={styles.sectionCard}
            styles={{ body: { padding: '20px 24px 24px' } }}
          >
            <Row gutter={16}>
              {mockCases.map((caseItem) => (
                <Col key={caseItem.id} span={8}>
                  <div style={styles.caseCard}>
                    <img style={styles.caseImage} src={caseItem.image} alt={caseItem.name} />
                    <div style={styles.caseInfo}>
                      <div style={styles.caseName}>{caseItem.name}</div>
                      <div style={styles.caseDate}>{caseItem.date}</div>
                      <span style={styles.caseLink}>
                        查看详情 <RightOutlined style={{ fontSize: 11 }} />
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 评价展示 Section */}
          <Card
            title={<span style={styles.sectionTitle}>评价展示</span>}
            style={styles.sectionCard}
            styles={{ body: { padding: '4px 24px 16px' } }}
          >
            {/* Overall Rating */}
            <div style={styles.overallRating}>
              <span style={styles.overallScore}>{sku.rating}</span>
              <span style={styles.overallMax}>/5.0</span>
              <div style={styles.overallStars}>
                <div style={styles.overallStarRow}>
                  <StarDisplay rating={sku.rating} size={18} />
                </div>
                <span style={styles.overallCount}>{sku.ratingCount} 条评价</span>
              </div>
            </div>

            {/* Review List */}
            {mockReviews.map((review, index) => {
              const isLast = index === mockReviews.length - 1;
              return (
                <div
                  key={review.id}
                  style={{
                    ...styles.reviewItem,
                    ...(isLast ? styles.reviewItemLast : {}),
                  }}
                >
                  <div style={styles.reviewHeader}>
                    <img
                      style={styles.reviewAvatar}
                      src={review.avatar}
                      alt={review.name}
                    />
                    <div style={styles.reviewMeta}>
                      <div style={styles.reviewName}>{review.name}</div>
                      <div style={styles.reviewDate}>{review.date}</div>
                    </div>
                    <div style={styles.reviewStars}>
                      <StarDisplay rating={review.rating} size={13} />
                    </div>
                  </div>
                  <div style={styles.reviewText}>{review.text}</div>
                </div>
              );
            })}
          </Card>
        </Col>

        {/* ─── Right Sidebar (10 cols) ─── */}
        <Col span={10}>
          {/* Price Card - Sticky */}
          <Card
            title={<span style={styles.priceCardTitle}>方案报价</span>}
            style={styles.priceCard}
            styles={{ body: { padding: '20px 24px 24px' } }}
          >
            {/* Price Display */}
            <div style={styles.priceDisplay}>
              <span style={styles.priceAmount}>
                &yen;{sku.price.toLocaleString()}
              </span>
              <span style={styles.priceSuffix}>/ 起</span>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Default Config */}
            <div style={styles.configRow}>
              <span style={styles.configLabel}>演员级别</span>
              <span style={styles.configValue}>T1及以上</span>
            </div>
            <div style={styles.configRow}>
              <span style={styles.configLabel}>时长</span>
              <span style={styles.configValue}>{sku.duration}分钟</span>
            </div>
            <div style={styles.configRow}>
              <span style={styles.configLabel}>人数</span>
              <span style={styles.configValue}>1-3人</span>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Action Buttons */}
            <Button
              type="primary"
              size="large"
              style={{
                ...styles.quoteBtn,
                backgroundColor: THEME.brand,
                borderColor: THEME.brand,
              }}
              onClick={handleGetQuote}
            >
              获取报价
            </Button>
            <Button
              size="large"
              style={styles.consultBtn}
              icon={<MessageOutlined />}
              onClick={() => {
                // placeholder action
              }}
            >
              在线咨询
            </Button>

            {/* Favorite Link */}
            <div
              style={{
                ...styles.favLink,
                color: isFavorited ? THEME.price : THEME.textSecondary,
              }}
              onClick={handleToggleFavorite}
            >
              {isFavorited ? <HeartFilled /> : <HeartOutlined />}
              <span>{isFavorited ? '已收藏' : '收藏方案'}</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SkuDetail;
