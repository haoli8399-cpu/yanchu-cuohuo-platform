import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  Row,
  Col,
  Empty,
  Pagination,
  Button,
} from 'antd';
import type { RequestStatus, ShowType, Request } from '@/types';
import DemandCard from '@/components/DemandCard';

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
  blue: '#3b82f6',
  amber: '#f59e0b',
  green: '#22c55e',
  purple: '#7c3aed',
};

/* ─── Mock Data ─── */
const mockDemands: Request[] = [
  {
    id: 'req-001',
    title: '公司年会脱口秀',
    status: 'pending_quote',
    showType: 'talkshow' as ShowType,
    businessType: 'commercial',
    expectedDate: '2026-08-15',
    location: '北京市朝阳区国贸大酒店',
    duration: 90,
    budgetMin: 15000,
    budgetMax: 25000,
    audienceCount: 300,
    specialRequirements: '希望有互动环节，主题围绕互联网科技',
    contactName: '王经理',
    contactPhone: '13800138001',
    createdAt: '2026-07-01',
    quotes: [],
  },
  {
    id: 'req-002',
    title: '商场开业即兴喜剧',
    status: 'quoted',
    showType: 'improv' as ShowType,
    businessType: 'outshow',
    expectedDate: '2026-08-20',
    location: '上海市浦东新区世纪大道1088号',
    duration: 60,
    budgetMin: 10000,
    budgetMax: 15000,
    audienceCount: 200,
    specialRequirements: '适合家庭观众，内容积极向上',
    contactName: '李总',
    contactPhone: '13900139002',
    createdAt: '2026-06-28',
    quotes: [],
  },
  {
    id: 'req-003',
    title: '产品发布会漫才表演',
    status: 'confirmed',
    showType: 'manzai' as ShowType,
    businessType: 'sponsor',
    expectedDate: '2026-07-25',
    location: '深圳市南山区科技园会展中心',
    duration: 30,
    budgetMin: 8000,
    budgetMax: 12000,
    audienceCount: 150,
    specialRequirements: '在产品演示间隙穿插漫才表演',
    contactName: '陈助理',
    contactPhone: '13700137003',
    createdAt: '2026-06-25',
    quotes: [],
  },
  {
    id: 'req-004',
    title: '年度晚宴脱口秀专场',
    status: 'signed',
    showType: 'talkshow' as ShowType,
    businessType: 'commercial',
    expectedDate: '2026-09-10',
    location: '广州市天河区W酒店宴会厅',
    duration: 120,
    budgetMin: 30000,
    budgetMax: 50000,
    audienceCount: 500,
    specialRequirements: '需要公司内部梗，提前一周提供素材',
    contactName: '赵总监',
    contactPhone: '13600136004',
    createdAt: '2026-06-20',
    quotes: [],
  },
  {
    id: 'req-005',
    title: '客户答谢会魔术喜剧',
    status: 'pending_quote',
    showType: 'magic' as ShowType,
    businessType: 'commercial',
    expectedDate: '2026-08-30',
    location: '杭州市西湖区香格里拉饭店',
    duration: 60,
    budgetMin: 20000,
    budgetMax: 30000,
    audienceCount: 250,
    specialRequirements: '包含近景魔术和舞台魔术',
    contactName: '孙经理',
    contactPhone: '13500135005',
    createdAt: '2026-07-02',
    quotes: [],
  },
  {
    id: 'req-006',
    title: '团建活动新喜剧',
    status: 'quoted',
    showType: 'newcomedy' as ShowType,
    businessType: 'custom_content',
    expectedDate: '2026-08-05',
    location: '成都市高新区天府软件园',
    duration: 90,
    budgetMin: 12000,
    budgetMax: 18000,
    audienceCount: 100,
    specialRequirements: '融入公司文化元素，互动性强',
    contactName: '周助理',
    contactPhone: '13400134006',
    createdAt: '2026-06-30',
    quotes: [],
  },
];

/* ─── Status Filter Tabs ─── */
type FilterKey = 'all' | RequestStatus;

interface TabItem {
  key: FilterKey;
  label: string;
}

const tabItems: TabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_quote', label: '待报价' },
  { key: 'quoted', label: '已报价' },
  { key: 'confirmed', label: '已确认' },
  { key: 'signed', label: '已签约' },
  { key: 'cancelled', label: '已取消' },
];

/* ─── Stat Cards Data ─── */
const statCards = [
  { label: '全部需求', count: 48, color: THEME.blue },
  { label: '待报价', count: 12, color: THEME.amber },
  { label: '进行中', count: 8, color: THEME.green },
  { label: '已签约', count: 28, color: THEME.purple },
];

/* ─── Style Objects ─── */
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 14,
    color: THEME.textTertiary,
    margin: 0,
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    fontWeight: 600,
    fontSize: 13,
    padding: '2px 10px',
    borderRadius: 12,
    border: `1px solid ${THEME.brand}`,
  },
  createBtn: {
    backgroundColor: THEME.brand,
    borderColor: THEME.brand,
    borderRadius: 8,
    fontWeight: 500,
  },
  statRow: {
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    backgroundColor: THEME.bgCard,
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden',
    cursor: 'default',
    transition: 'box-shadow 0.2s ease',
  },
  statCardBorder: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: '12px 0 0 12px',
  },
  statContent: {
    paddingLeft: 16,
  },
  statCount: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: '36px',
  },
  statLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  tabsCard: {
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    backgroundColor: THEME.bgCard,
    marginBottom: 16,
  },
  tabsCardInner: {
    padding: '8px 24px 0 24px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0 8px',
  },
  emptyContainer: {
    padding: '60px 0',
  },
};

/* ─── Component ─── */
const DemandList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter demands based on active tab
  const filteredDemands = useMemo(() => {
    if (activeTab === 'all') return mockDemands;
    return mockDemands.filter((d) => d.status === activeTab);
  }, [activeTab]);

  // Total count from stat cards
  const totalCount = 48;

  // Build Ant Design Tabs items
  const tabsProps = {
    items: tabItems.map((tab) => ({
      key: tab.key,
      label: tab.label,
    })),
    activeKey: activeTab,
    onChange: (key: string) => {
      setActiveTab(key as FilterKey);
      setCurrentPage(1);
    },
  };

  return (
    <div style={styles.container}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>我的需求</h1>
            <span style={styles.countBadge}>{totalCount}</span>
          </div>
          <p style={styles.pageSubtitle}>管理您的演出需求，跟踪报价与签约进度</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
          onClick={() => navigate('/demands/submit')}
          style={styles.createBtn}
        >
          提交需求
        </Button>
      </div>

      {/* ── Statistics Bar ── */}
      <Row gutter={16} style={styles.statRow}>
        {statCards.map((stat) => (
          <Col xs={12} sm={6} key={stat.label}>
            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statCardBorder,
                  backgroundColor: stat.color,
                }}
              />
              <div style={styles.statContent}>
                <div style={{ ...styles.statCount, color: stat.color }}>
                  {stat.count}
                </div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── Filter Tabs ── */}
      <div style={styles.tabsCard}>
        <div style={styles.tabsCardInner}>
          <Tabs {...tabsProps} />
        </div>
      </div>

      {/* ── Demand List ── */}
      {filteredDemands.length > 0 ? (
        <div style={styles.listContainer}>
          {filteredDemands.map((demand) => (
            <DemandCard key={demand.id} demand={demand} />
          ))}
        </div>
      ) : (
        <div style={styles.emptyContainer}>
          <Empty
            description={
              <span style={{ color: THEME.textTertiary }}>
                暂无相关需求记录
              </span>
            }
          >
            <Button
              type="primary"
              style={styles.createBtn}
              onClick={() => navigate('/demands/submit')}
            >
              立即提交需求
            </Button>
          </Empty>
        </div>
      )}

      {/* ── Pagination ── */}
      {filteredDemands.length > 0 && (
        <div style={styles.paginationContainer}>
          <Pagination
            current={currentPage}
            onChange={setCurrentPage}
            total={filteredDemands.length}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
};

export default DemandList;
