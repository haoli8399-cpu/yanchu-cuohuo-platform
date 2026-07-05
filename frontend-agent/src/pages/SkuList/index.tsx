import React, { useState, useMemo } from 'react';
import { Input, Select, Pagination, Empty, Row, Col, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Sku } from '@/types';
import { BusinessTypeLabels } from '@/types';
import SkuCard from '@/components/SkuCard';

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
} as const;

/* ─── Category Tab Items ─── */
const categoryItems = [
  { key: 'all', label: '全部' },
  { key: 'talkshow', label: '脱口秀' },
  { key: 'improv', label: '即兴喜剧' },
  { key: 'manzai', label: '漫才' },
  { key: 'newcomedy', label: '新喜剧' },
  { key: 'magic', label: '魔术喜剧' },
  { key: 'family', label: '亲子喜剧' },
];

/* ─── Business Type Options ─── */
const businessTypeOptions = [
  { value: 'all', label: '全部' },
  { value: 'commercial', label: BusinessTypeLabels.commercial },
  { value: 'outshow', label: BusinessTypeLabels.outshow },
  { value: 'sponsor', label: BusinessTypeLabels.sponsor },
  { value: 'custom_content', label: BusinessTypeLabels.custom_content },
  { value: 'custom_mix', label: BusinessTypeLabels.custom_mix },
];

/* ─── Sort Options ─── */
const sortOptions = [
  { value: 'default', label: '综合排序' },
  { value: 'price_asc', label: '价格升序' },
  { value: 'price_desc', label: '价格降序' },
  { value: 'rating', label: '评分最高' },
];

/* ─── Mock SKU Data ─── */
const mockSkus: Sku[] = [
  {
    id: 'sku-001',
    title: '都市脱口秀之夜',
    showType: 'talkshow',
    coverImage: 'https://picsum.photos/seed/talkshow-night/400/225',
    description: '汇聚城市中最受欢迎的脱口秀演员，带来一晚爆笑体验。精心策划的段子涵盖职场、生活、情感等热门话题，适合各类商务活动及私人聚会。',
    duration: 90,
    price: 12800,
    priceUnit: '场',
    rating: 4.8,
    ratingCount: 156,
    salesCount: 32,
    suitableScene: '企业年会、商演包场、私人聚会',
    businessType: 'commercial',
    performers: [],
    tags: ['热门推荐', '年会首选', '好评如潮'],
  },
  {
    id: 'sku-002',
    title: '即兴喜剧派对',
    showType: 'improv',
    coverImage: 'https://picsum.photos/seed/improv-party/400/225',
    description: '全场互动的即兴喜剧表演，演员根据观众建议即兴创作。没有剧本、没有排练，每一场都是独一无二的神级现场。',
    duration: 60,
    price: 8800,
    priceUnit: '场',
    rating: 4.6,
    ratingCount: 89,
    salesCount: 21,
    suitableScene: '团建活动、公司派对、朋友聚会',
    businessType: 'outshow',
    performers: [],
    tags: ['全场互动', '即兴创作', '团建必备'],
  },
  {
    id: 'sku-003',
    title: '企业年会脱口秀专场',
    showType: 'talkshow',
    coverImage: 'https://picsum.photos/seed/corporate-show/400/225',
    description: '专为年会场景定制的脱口秀演出，可根据企业文化、行业特点量身打造专属段子。让年会不再尴尬，笑声不断。',
    duration: 120,
    price: 18800,
    priceUnit: '场',
    rating: 4.9,
    ratingCount: 203,
    salesCount: 58,
    suitableScene: '企业年会、年终盛典、庆典活动',
    businessType: 'commercial',
    performers: [],
    tags: ['年会定制', '行业专属', '五星好评'],
  },
  {
    id: 'sku-004',
    title: '漫才双人秀',
    showType: 'manzai',
    coverImage: 'https://picsum.photos/seed/manzai-duo/400/225',
    description: '源自日本的经典漫才表演，两位演员默契配合，节奏明快的对话加上夸张的肢体表演，带来纯粹的双人喜剧盛宴。',
    duration: 60,
    price: 6800,
    priceUnit: '场',
    rating: 4.5,
    ratingCount: 67,
    salesCount: 15,
    suitableScene: '文化活动、商业演出、品牌发布',
    businessType: 'outshow',
    performers: [],
    tags: ['经典漫才', '双人搭档', '日式幽默'],
  },
  {
    id: 'sku-005',
    title: '亲子魔术喜剧嘉年华',
    showType: 'magic',
    coverImage: 'https://picsum.photos/seed/family-magic/400/225',
    description: '专为家庭观众打造的魔术喜剧盛宴，融合经典魔术、幽默表演和亲子互动环节。让孩子和大人一起享受欢笑与惊喜。',
    duration: 90,
    price: 15600,
    priceUnit: '场',
    rating: 4.7,
    ratingCount: 112,
    salesCount: 28,
    suitableScene: '亲子活动、商场活动、节日庆典',
    businessType: 'commercial',
    performers: [],
    tags: ['亲子互动', '魔术惊喜', '合家欢'],
  },
  {
    id: 'sku-006',
    title: '新喜剧混合场',
    showType: 'newcomedy',
    coverImage: 'https://picsum.photos/seed/new-comedy/400/225',
    description: '打破传统喜剧框架的新喜剧表演，融合素描喜剧、音乐喜剧、肢体喜剧等多种形式。前卫、创新、让人耳目一新。',
    duration: 90,
    price: 10800,
    priceUnit: '场',
    rating: 4.4,
    ratingCount: 45,
    salesCount: 12,
    suitableScene: '文化展演、品牌活动、创意派对',
    businessType: 'custom_content',
    performers: [],
    tags: ['创新形式', '多元融合', '年轻潮流'],
  },
  {
    id: 'sku-007',
    title: '脱口秀开放麦',
    showType: 'talkshow',
    coverImage: 'https://picsum.photos/seed/openmic-talk/400/225',
    description: '轻松随性的开放麦形式脱口秀，多位演员轮番上场，每段5-8分钟。适合作为活动的暖场环节，气氛活跃又不抢主角。',
    duration: 60,
    price: 5800,
    priceUnit: '场',
    rating: 4.3,
    ratingCount: 78,
    salesCount: 42,
    suitableScene: '暖场表演、酒吧活动、小型聚会',
    businessType: 'outshow',
    performers: [],
    tags: ['轻松氛围', '多位演员', '高性价比'],
  },
  {
    id: 'sku-008',
    title: '即兴喜剧团建专场',
    showType: 'improv',
    coverImage: 'https://picsum.photos/seed/improv-teambuilding/400/225',
    description: '将即兴喜剧与团队建设完美结合，员工不仅是观众，更是演出的一部分。通过即兴游戏和互动环节，增强团队默契与凝聚力。',
    duration: 90,
    price: 12800,
    priceUnit: '场',
    rating: 4.8,
    ratingCount: 134,
    salesCount: 36,
    suitableScene: '团队建设、公司团建、部门联谊',
    businessType: 'custom_mix',
    performers: [],
    tags: ['团建专属', '员工参与', '提升凝聚力'],
  },
];

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: THEME.bgPage,
    minHeight: 'calc(100vh - 112px)',
  },
  /* Page Header */
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: 0,
    lineHeight: '36px',
  },
  subtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    marginTop: 8,
    lineHeight: '22px',
  },
  /* Filter Bar */
  filterBar: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 24,
    border: `1px solid ${THEME.border}`,
    position: 'sticky' as const,
    top: 64,
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  searchRow: {
    marginBottom: 16,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  categoryTabs: {
    flex: 1,
    minWidth: 0,
  },
  filterSelects: {
    display: 'flex',
    gap: 12,
    flexShrink: 0,
  },
  /* Results Grid */
  resultsSection: {
    marginTop: 8,
  },
  skuCardCol: {
    marginBottom: 20,
  },
  /* Pagination */
  paginationWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px 0 16px',
  },
  /* Empty */
  emptyWrapper: {
    padding: '80px 0',
  },
};

/* ─── SkuList Component ─── */
const SkuList: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [businessType, setBusinessType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  /* ─── Filtering & Sorting Logic ─── */
  const filteredSkus = useMemo(() => {
    let result = [...mockSkus];

    // Filter by category (showType)
    if (activeCategory !== 'all') {
      result = result.filter((sku) => sku.showType === activeCategory);
    }

    // Filter by business type
    if (businessType !== 'all') {
      result = result.filter((sku) => sku.businessType === businessType);
    }

    // Filter by search text
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (sku) =>
          sku.title.toLowerCase().includes(keyword) ||
          sku.description.toLowerCase().includes(keyword) ||
          sku.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [searchText, activeCategory, businessType, sortBy]);

  /* ─── Handlers ─── */
  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setCurrentPage(1);
  };

  const handleBusinessTypeChange = (value: string) => {
    setBusinessType(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  /* ─── Render ─── */
  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>演出方案</h1>
        <p style={styles.subtitle}>发现优质喜剧演出内容</p>
      </div>

      {/* Search & Filter Bar */}
      <div style={styles.filterBar}>
        {/* Search */}
        <div style={styles.searchRow}>
          <Input
            prefix={<SearchOutlined style={{ color: THEME.textTertiary }} />}
            allowClear
            placeholder="搜索演出方案、演员、演出类型..."
            size="large"
            value={searchText}
            onChange={handleSearch}
            style={{ height: 48, borderRadius: 10 }}
          />
        </div>

        {/* Filter Row */}
        <div style={styles.filterRow}>
          {/* Category Tabs */}
          <div style={styles.categoryTabs}>
            <Tabs
              activeKey={activeCategory}
              onChange={handleCategoryChange}
              items={categoryItems.map((item) => ({
                key: item.key,
                label: item.label,
              }))}
              size="middle"
              tabBarStyle={{
                marginBottom: 0,
                borderBottom: 'none',
              }}
            />
          </div>

          {/* Select Filters */}
          <div style={styles.filterSelects}>
            <Select
              value={businessType}
              onChange={handleBusinessTypeChange}
              options={businessTypeOptions}
              style={{ width: 140 }}
              size="middle"
            />
            <Select
              value={sortBy}
              onChange={handleSortChange}
              options={sortOptions}
              style={{ width: 140 }}
              size="middle"
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div style={styles.resultsSection}>
        {filteredSkus.length > 0 ? (
          <>
            <Row gutter={[20, 0]}>
              {filteredSkus.map((sku) => (
                <Col key={sku.id} span={6} style={styles.skuCardCol}>
                  <SkuCard sku={sku} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div style={styles.paginationWrapper}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={48}
                showSizeChanger
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条方案`
                }
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                pageSizeOptions={['8', '12', '16', '24']}
              />
            </div>
          </>
        ) : (
          <div style={styles.emptyWrapper}>
            <Empty
              description="暂无匹配的演出方案，试试调整筛选条件"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkuList;
