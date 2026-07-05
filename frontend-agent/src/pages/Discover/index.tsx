import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Carousel, Typography } from 'antd';
import { getSkuList } from '@/utils/api';
import type { Sku, ShowType, BusinessType } from '@/types';
import SkuCard from '@/components/SkuCard';

const { Title } = Typography;

/* ─── Design Tokens ─── */
const THEME = {
  brand: '#7c3aed',
  brandLight: '#a78bfa',
  brandBg: '#f5f3ff',
  bgPage: '#f5f5f7',
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
};

/* ─── Style Functions ─── */
const getBannerSlide = (bgColor: string): React.CSSProperties => ({
  height: 480,
  background: bgColor,
  borderRadius: 12,
  overflow: 'hidden',
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
  padding: '0 60px',
});

const getBannerOverlay = (bgColor: string): React.CSSProperties => ({
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: '40%',
  background: `linear-gradient(to top, ${bgColor}dd, transparent)`,
  zIndex: 1,
});

const getBannerDecorCircle = (size: number, right: number, top: number): React.CSSProperties => ({
  position: 'absolute' as const,
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.08)',
  right,
  top,
  zIndex: 0,
});

const getQuickEntryCard = (hovered: boolean): React.CSSProperties => ({
  backgroundColor: THEME.bgCard,
  borderRadius: 12,
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 14,
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  border: `1px solid ${THEME.border}`,
  boxShadow: hovered ? '0 8px 24px rgba(124,58,237,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
  transform: hovered ? 'translateY(-3px)' : 'none',
});

const getQuickEntryIcon = (bgColor: string): React.CSSProperties => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    paddingBottom: 48,
  },
  /* ── Banner Section ── */
  bannerSection: {
    marginBottom: 32,
  },
  bannerContent: {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: 520,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#fff',
    lineHeight: '42px',
    marginBottom: 12,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: '24px',
    marginBottom: 28,
  },
  bannerCta: {
    display: 'inline-flex' as const,
    alignItems: 'center',
    height: 44,
    padding: '0 28px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  bannerCtaPrimary: {
    backgroundColor: '#fff',
    color: THEME.brand,
  },
  bannerCtaGhost: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
  },
  /* ── Quick Entry Section ── */
  quickEntrySection: {
    marginBottom: 40,
  },
  quickEntryLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '22px',
  },
  quickEntryDesc: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: '18px',
    textAlign: 'center' as const,
  },
  /* ── Section Header ── */
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: THEME.textPrimary,
    lineHeight: '30px',
    margin: 0,
  },
  sectionLink: {
    fontSize: 14,
    color: THEME.brand,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  /* ── Sku Card Grid ── */
  skuGrid: {
    marginBottom: 40,
  },
  /* ── Statistics Section ── */
  statsSection: {
    marginTop: 8,
  },
  statCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    border: `1px solid ${THEME.border}`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.brandBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: THEME.brand,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 700,
    color: THEME.brand,
    lineHeight: '42px',
  },
  statLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: '20px',
  },
};

/* ─── Banner Mock Data ─── */
const bannerData = [
  {
    id: '1',
    title: '精选脱口秀专场',
    subtitle: '一线喜剧演员领衔，为企业活动注入欢笑与活力，打造难忘的团建体验',
    bgColor: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)',
    ctaText: '立即查看',
    ctaType: 'primary' as const,
  },
  {
    id: '2',
    title: '即兴喜剧互动体验',
    subtitle: '观众参与，全程高能！最适合年会、发布会和品牌活动的互动演出形式',
    bgColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)',
    ctaText: '了解详情',
    ctaType: 'ghost' as const,
  },
  {
    id: '3',
    title: '定制喜剧内容服务',
    subtitle: '根据企业品牌故事量身定制，让喜剧为您的品牌传播赋能',
    bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    ctaText: '免费咨询',
    ctaType: 'primary' as const,
  },
];

/* ─── Quick Entry Mock Data ─── */
const quickEntries = [
  {
    key: 'skus',
    label: '选方案',
    desc: '浏览海量演出方案',
    path: '/skus',
    iconBg: '#f5f3ff',
    iconColor: THEME.brand,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: 'demand',
    label: '提需求',
    desc: '发布您的活动需求',
    path: '/demands/submit',
    iconBg: '#eff6ff',
    iconColor: '#3b82f6',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    key: 'progress',
    label: '看进度',
    desc: '跟踪需求处理进度',
    path: '/demands',
    iconBg: '#f0fdf4',
    iconColor: '#22c55e',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
];

/* ─── SKU Mock Data (fallback) ─── */
const mockSkuData: Sku[] = [
  {
    id: 'mock-1',
    title: '脱口秀经典专场 - 年度精选',
    showType: 'talkshow' as ShowType,
    coverImage: 'https://picsum.photos/seed/comedy1/400/300',
    description: '汇集当季最受欢迎的脱口秀段子，由资深脱口秀演员倾情演绎，适合企业年会及团建活动。',
    duration: 90,
    price: 28000,
    priceUnit: '场',
    rating: 4.9,
    ratingCount: 156,
    salesCount: 320,
    suitableScene: '企业年会、团建活动、品牌发布会',
    businessType: 'commercial' as BusinessType,
    performers: [
      {
        id: 'p1',
        name: '张大山',
        avatar: 'https://picsum.photos/seed/avatar1/80/80',
        tierLevel: 'T1',
        experience: '10年脱口秀演出经验',
        showCount: 800,
        yearsActive: 10,
      },
    ],
    tags: ['脱口秀', '企业年会', '经典专场'],
  },
  {
    id: 'mock-2',
    title: '即兴喜剧互动秀 - 沉浸体验',
    showType: 'improv' as ShowType,
    coverImage: 'https://picsum.photos/seed/comedy2/400/300',
    description: '根据观众建议即兴创作表演，全程互动，笑声不断。每场演出都是独一无二的体验。',
    duration: 60,
    price: 18000,
    priceUnit: '场',
    rating: 4.8,
    ratingCount: 98,
    salesCount: 210,
    suitableScene: '年会互动、发布会暖场、客户答谢',
    businessType: 'outshow' as BusinessType,
    performers: [
      {
        id: 'p2',
        name: '李可乐',
        avatar: 'https://picsum.photos/seed/avatar2/80/80',
        tierLevel: 'T2',
        experience: '6年即兴喜剧经验',
        showCount: 450,
        yearsActive: 6,
      },
    ],
    tags: ['即兴喜剧', '互动体验', '沉浸式'],
  },
  {
    id: 'mock-3',
    title: '漫才双人组合 - 欢乐搭档',
    showType: 'manzai' as ShowType,
    coverImage: 'https://picsum.photos/seed/comedy3/400/300',
    description: '经典日式漫才表演形式，两位演员默契配合，节奏明快，包袱密集，让全场观众捧腹大笑。',
    duration: 45,
    price: 15000,
    priceUnit: '场',
    rating: 4.7,
    ratingCount: 72,
    salesCount: 168,
    suitableScene: '年会表演、品牌活动、晚会节目',
    businessType: 'commercial' as BusinessType,
    performers: [
      {
        id: 'p3',
        name: '王小明',
        avatar: 'https://picsum.photos/seed/avatar3/80/80',
        tierLevel: 'T2',
        experience: '5年漫才表演经验',
        showCount: 320,
        yearsActive: 5,
      },
      {
        id: 'p4',
        name: '赵大力',
        avatar: 'https://picsum.photos/seed/avatar4/80/80',
        tierLevel: 'T2',
        experience: '5年漫才表演经验',
        showCount: 300,
        yearsActive: 5,
      },
    ],
    tags: ['漫才', '双人组合', '节奏明快'],
  },
  {
    id: 'mock-4',
    title: '新喜剧综合秀 - 创新演绎',
    showType: 'newcomedy' as ShowType,
    coverImage: 'https://picsum.photos/seed/comedy4/400/300',
    description: '融合脱口秀、即兴、 sketch 等多种喜剧形式的创新综合演出，内容新颖，形式多样。',
    duration: 120,
    price: 35000,
    priceUnit: '场',
    rating: 4.9,
    ratingCount: 45,
    salesCount: 89,
    suitableScene: '大型年会、品牌发布会、庆典活动',
    businessType: 'custom_mix' as BusinessType,
    performers: [
      {
        id: 'p5',
        name: '刘欢乐',
        avatar: 'https://picsum.photos/seed/avatar5/80/80',
        tierLevel: 'T1',
        experience: '8年新喜剧创作与表演',
        showCount: 600,
        yearsActive: 8,
      },
    ],
    tags: ['新喜剧', '综合秀', '创新演绎'],
  },
];

/* ─── Statistics Mock Data ─── */
const statsData = [
  {
    key: 'performers',
    number: '860+',
    label: '入驻演员',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    key: 'cases',
    number: '3,200+',
    label: '成功案例',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
  },
  {
    key: 'rating',
    number: '98.5%',
    label: '好评率',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

/* ─── Banner Slide Component ─── */
const BannerSlide: React.FC<{
  item: typeof bannerData[0];
  onCtaClick: () => void;
}> = ({ item, onCtaClick }) => {
  const ctaStyle: React.CSSProperties = {
    ...styles.bannerCta,
    ...(item.ctaType === 'primary' ? styles.bannerCtaPrimary : styles.bannerCtaGhost),
  };

  return (
    <div style={getBannerSlide(item.bgColor)}>
      {/* Decorative circles */}
      <div style={getBannerDecorCircle(240, 60, 40)} />
      <div style={getBannerDecorCircle(160, 200, 200)} />
      <div style={getBannerDecorCircle(100, 340, 80)} />

      {/* Gradient overlay */}
      <div style={getBannerOverlay('#000')} />

      {/* Content */}
      <div style={styles.bannerContent}>
        <div style={styles.bannerTitle}>{item.title}</div>
        <div style={styles.bannerSubtitle}>{item.subtitle}</div>
        <button style={ctaStyle} onClick={onCtaClick}>
          {item.ctaText}
        </button>
      </div>
    </div>
  );
};

/* ─── Discover Component ─── */
const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [skuList, setSkuList] = useState<Sku[]>([]);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

  /* Fetch SKU list with fallback */
  useEffect(() => {
    let cancelled = false;

    async function fetchSkus() {
      try {
        const res = await getSkuList({ page: 1, pageSize: 4 });
        if (!cancelled && res?.items?.length) {
          setSkuList(res.items.slice(0, 4));
        }
      } catch {
        // Use mock data on error
      } finally {
        if (!cancelled) {
          if (skuList.length === 0) {
            setSkuList(mockSkuData);
          }
        }
      }
    }

    fetchSkus();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBannerCta = (_id: string) => {
    navigate('/skus');
  };

  return (
    <div style={styles.page}>
      {/* ── Banner Carousel ── */}
      <div style={styles.bannerSection}>
        <Carousel autoplay autoplaySpeed={5000} dotPosition="bottom">
          {bannerData.map((item) => (
            <BannerSlide key={item.id} item={item} onCtaClick={() => handleBannerCta(item.id)} />
          ))}
        </Carousel>
      </div>

      {/* ── Quick Entry Cards ── */}
      <div style={styles.quickEntrySection}>
        <Row gutter={24}>
          {quickEntries.map((entry) => {
            const isHovered = hoveredEntry === entry.key;
            return (
              <Col span={8} key={entry.key}>
                <div
                  style={getQuickEntryCard(isHovered)}
                  onClick={() => navigate(entry.path)}
                  onMouseEnter={() => setHoveredEntry(entry.key)}
                  onMouseLeave={() => setHoveredEntry(null)}
                >
                  <div style={getQuickEntryIcon(entry.iconBg)}>
                    <span style={{ color: entry.iconColor }}>{entry.icon}</span>
                  </div>
                  <div style={styles.quickEntryLabel}>{entry.label}</div>
                  <div style={styles.quickEntryDesc}>{entry.desc}</div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ── Hot Recommendations ── */}
      <div style={styles.skuGrid}>
        <div style={styles.sectionHeader}>
          <Title level={4} style={styles.sectionTitle}>热门推荐</Title>
          <a style={styles.sectionLink} onClick={() => navigate('/skus')}>查看全部 &rarr;</a>
        </div>
        <Row gutter={20}>
          {skuList.map((sku) => (
            <Col span={6} key={sku.id}>
              <SkuCard sku={sku} />
            </Col>
          ))}
        </Row>
      </div>

      {/* ── Statistics Section ── */}
      <div style={styles.statsSection}>
        <Row gutter={24}>
          {statsData.map((stat) => (
            <Col span={8} key={stat.key}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statNumber}>{stat.number}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Discover;
