import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Tag, Rate } from 'antd';

/* ─── Design Tokens ─── */
const THEME = {
  brand: '#7c3aed',
  brandHover: '#6d28d9',
  brandLight: '#a78bfa',
  brandBg: '#f5f3ff',
  bgPage: '#f5f5f7',
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  divider: '#f0f0f2',
  starFilled: '#f59e0b',
};

/* ─── Mock Data ─── */
const caseData = {
  id: 'case-001',
  title: '2024某科技公司年会脱口秀之夜',
  date: '2024-12-28',
  location: '北京朝阳区某酒店宴会厅',
  showType: '脱口秀',
  eventType: '商演包场',
  audienceCount: '500人',
  duration: '90分钟',
  performers: '王小明(T1) + 李大鹏(T2)',
  description: [
    '某知名科技公司在年底举办了一场盛大的年会活动，邀请了500余名员工参加。客户希望在年会中融入脱口秀表演环节，为员工带来轻松愉快的氛围，缓解一年的工作压力。',
    '根据客户需求，我们推荐了都市脱口秀之夜方案，邀请了两位资深脱口秀演员王小明和李大鹏联袂出演。两位演员根据科技公司的文化特点和行业热梗，定制了专属的脱口秀内容，现场反响热烈。',
    '演出持续90分钟，演员们的精彩表演让全场笑声不断。活动结束后，客户方给予了高度评价，表示这是近年来公司年会中最受欢迎的环节之一。',
  ],
  review: {
    name: '李经理',
    avatar: 'L',
    rating: 5,
    text: '非常满意！演员们的表演非常精彩，内容也很贴合我们公司的文化。员工们都反馈这是今年年会最好玩的环节，明年还会继续合作！',
  },
  photos: [
    'https://picsum.photos/seed/case1/400/300',
    'https://picsum.photos/seed/case2/400/300',
    'https://picsum.photos/seed/case3/400/300',
    'https://picsum.photos/seed/case4/400/300',
    'https://picsum.photos/seed/case5/400/300',
    'https://picsum.photos/seed/case6/400/300',
  ],
  relatedCases: [
    {
      id: 'case-002',
      title: '2024某互联网公司产品发布会',
      date: '2024-11-15',
      cover: 'https://picsum.photos/seed/related1/300/200',
    },
    {
      id: 'case-003',
      title: '某金融机构客户答谢晚宴',
      date: '2024-10-20',
      cover: 'https://picsum.photos/seed/related2/300/200',
    },
    {
      id: 'case-004',
      title: '某高校迎新晚会即兴喜剧专场',
      date: '2024-09-10',
      cover: 'https://picsum.photos/seed/related3/300/200',
    },
  ],
};

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 960,
    margin: '0 auto',
  },
  breadcrumb: {
    fontSize: 14,
    color: THEME.textTertiary,
    marginBottom: 20,
    lineHeight: '20px',
  },
  breadcrumbLink: {
    color: THEME.textSecondary,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  breadcrumbLinkHover: {
    color: THEME.brand,
  },
  breadcrumbSep: {
    margin: '0 8px',
    color: THEME.textTertiary,
  },
  breadcrumbCurrent: {
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  coverWrapper: {
    width: '100%',
    maxHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 400,
    objectFit: 'cover' as const,
    display: 'block',
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: THEME.textPrimary,
    lineHeight: '34px',
    margin: '0 0 12px 0',
  },
  titleMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: '20px',
  },
  section: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    border: `1px solid ${THEME.border}`,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '24px',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${THEME.divider}`,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px 32px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: THEME.textTertiary,
    whiteSpace: 'nowrap' as const,
    minWidth: 72,
  },
  infoValue: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  descriptionParagraph: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: '24px',
    marginBottom: 12,
  },
  descriptionLast: {
    marginBottom: 0,
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  photoWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  photo: {
    width: '100%',
    height: 0,
    paddingBottom: '66.67%',
    objectFit: 'cover' as const,
    display: 'block',
    transition: 'transform 0.3s ease',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    transition: 'transform 0.3s ease',
  },
  reviewCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 18,
    flexShrink: 0,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: 600,
    color: THEME.textPrimary,
  },
  reviewRating: {
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: '22px',
  },
  ctaSection: {
    textAlign: 'center' as const,
    padding: '32px 0',
  },
  ctaBtn: {
    height: 48,
    padding: '0 40px',
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 8,
  },
  relatedSection: {
    marginBottom: 16,
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  relatedCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    border: `1px solid ${THEME.border}`,
  },
  relatedCoverWrapper: {
    width: '100%',
    paddingTop: '66.67%',
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: '#f0f0f2',
  },
  relatedCoverImg: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'transform 0.3s ease',
  },
  relatedBody: {
    padding: 12,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: THEME.textPrimary,
    lineHeight: '20px',
    marginBottom: 6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  relatedDate: {
    fontSize: 12,
    color: THEME.textTertiary,
    lineHeight: '16px',
  },
};

/* ─── Info Items ─── */
const infoItems = [
  { label: '活动类型', value: caseData.eventType },
  { label: '活动日期', value: caseData.date },
  { label: '活动地点', value: caseData.location },
  { label: '参与人数', value: caseData.audienceCount },
  { label: '演出时长', value: caseData.duration },
  { label: '演员阵容', value: caseData.performers },
];

/* ─── Component ─── */
const CaseDetail: React.FC = () => {
  useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hoveredBreadcrumb, setHoveredBreadcrumb] = useState(false);
  const [hoveredRelatedCards, setHoveredRelatedCards] = useState<Record<string, boolean>>({});
  const [hoveredPhotos, setHoveredPhotos] = useState<Record<number, boolean>>({});

  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link
          to="/"
          style={{
            ...styles.breadcrumbLink,
            ...(hoveredBreadcrumb ? styles.breadcrumbLinkHover : {}),
          }}
          onMouseEnter={() => setHoveredBreadcrumb(true)}
          onMouseLeave={() => setHoveredBreadcrumb(false)}
        >
          首页
        </Link>
        <span style={styles.breadcrumbSep}>/</span>
        <span style={styles.breadcrumbCurrent}>案例详情</span>
      </div>

      {/* Cover Image */}
      <div style={styles.coverWrapper}>
        <img
          src="https://picsum.photos/seed/casecover/960/400"
          alt={caseData.title}
          style={styles.coverImage}
        />
      </div>

      {/* Title Section */}
      <div style={styles.titleSection}>
        <h1 style={styles.title}>{caseData.title}</h1>
        <div style={styles.titleMeta}>
          <span style={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {caseData.date}
          </span>
          <span style={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {caseData.location}
          </span>
          <Tag color="purple">{caseData.showType}</Tag>
        </div>
      </div>

      {/* Event Info Card */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>活动信息</div>
        <div style={styles.infoGrid}>
          {infoItems.map((item, index) => (
            <div key={index} style={styles.infoItem}>
              <span style={styles.infoLabel}>{item.label}</span>
              <span style={styles.infoValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description Card */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>活动详情</div>
        {caseData.description.map((para, index) => (
          <p
            key={index}
            style={{
              ...styles.descriptionParagraph,
              ...(index === caseData.description.length - 1 ? styles.descriptionLast : {}),
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Photos Gallery */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>活动照片</div>
        <div style={styles.photoGrid}>
          {caseData.photos.map((photo, index) => {
            const isHovered = hoveredPhotos[index] || false;
            return (
              <div
                key={index}
                style={styles.photoWrapper}
                onMouseEnter={() => setHoveredPhotos((prev) => ({ ...prev, [index]: true }))}
                onMouseLeave={() => setHoveredPhotos((prev) => ({ ...prev, [index]: false }))}
              >
                <div style={styles.photo}>
                  <img
                    src={photo}
                    alt={`活动照片 ${index + 1}`}
                    style={{
                      ...styles.photoImg,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Review */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>客户评价</div>
        <div style={styles.reviewCard}>
          <div style={styles.reviewAvatar}>{caseData.review.avatar}</div>
          <div style={styles.reviewContent}>
            <div style={styles.reviewHeader}>
              <span style={styles.reviewName}>{caseData.review.name}</span>
              <Rate disabled defaultValue={caseData.review.rating} style={{ fontSize: 14 }} />
            </div>
            <p style={styles.reviewText}>{caseData.review.text}</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div style={styles.ctaSection}>
        <Button
          type="primary"
          size="large"
          style={styles.ctaBtn}
          onClick={() => navigate('/skus')}
        >
          查看同类型方案
        </Button>
      </div>

      {/* Related Cases */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>相关案例</div>
        <div style={styles.relatedGrid}>
          {caseData.relatedCases.map((related) => {
            const isHovered = hoveredRelatedCards[related.id] || false;
            return (
              <div
                key={related.id}
                style={{
                  ...styles.relatedCard,
                  boxShadow: isHovered
                    ? '0 8px 24px rgba(0,0,0,0.1)'
                    : '0 1px 2px rgba(0,0,0,0.04)',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                }}
                onClick={() => navigate(`/cases/${related.id}`)}
                onMouseEnter={() => setHoveredRelatedCards((prev) => ({ ...prev, [related.id]: true }))}
                onMouseLeave={() => setHoveredRelatedCards((prev) => ({ ...prev, [related.id]: false }))}
              >
                <div style={styles.relatedCoverWrapper}>
                  <img
                    src={related.cover}
                    alt={related.title}
                    style={styles.relatedCoverImg}
                  />
                </div>
                <div style={styles.relatedBody}>
                  <div style={styles.relatedTitle}>{related.title}</div>
                  <div style={styles.relatedDate}>{related.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
