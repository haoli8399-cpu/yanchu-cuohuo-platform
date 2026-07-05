import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb, Button, Divider, Timeline, Rate, Space, Avatar, message } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  RobotOutlined,
  PhoneOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { RequestStatus, Request, Quote, TierLevel } from '@/types';
import StatusTag from '@/components/StatusTag';

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
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

/* ─── Status Color Map for Gradient Border ─── */
const statusBorderColors: Record<RequestStatus, string> = {
  pending_quote: THEME.warning,
  quoted: THEME.info,
  confirmed: THEME.success,
  signed: THEME.brand,
  cancelled: THEME.error,
};

/* ─── Mock Data ─── */
const mockQuotes: Quote[] = [
  {
    id: 'q1',
    performer: {
      id: 'p1',
      name: '王小明',
      avatar: '',
      tierLevel: 'T1' as TierLevel,
      experience: '5年经验',
      showCount: 320,
      yearsActive: 5,
    },
    price: 15800,
    description:
      '根据贵公司年会主题，我将定制一段约20分钟的脱口秀表演。内容围绕互联网职场生活、团队协作趣事等展开，穿插互动环节，确保现场氛围热烈。包含前期沟通与内容定制服务。',
    respondedAt: '5小时前',
  },
  {
    id: 'q2',
    performer: {
      id: 'p2',
      name: '李大鹏',
      avatar: '',
      tierLevel: 'T2' as TierLevel,
      experience: '3年经验',
      showCount: 150,
      yearsActive: 3,
    },
    price: 12500,
    description:
      '提供15-20分钟脱口秀表演，擅长职场幽默和即兴互动。可根据年会主题做内容微调，表演风格轻松活泼，适合公司年会场景。可提供彩排一次。',
    respondedAt: '3小时前',
  },
  {
    id: 'q3',
    performer: {
      id: 'p3',
      name: '张笑天',
      avatar: '',
      tierLevel: 'T1' as TierLevel,
      experience: '8年经验',
      showCount: 580,
      yearsActive: 8,
    },
    price: 18000,
    description:
      '资深脱口秀演员，曾为多家500强企业年会演出。本次表演将包含25分钟定制脱口秀+10分钟即兴互动环节。提前一周进行需求沟通，确保内容贴合企业文化与年会氛围。',
    respondedAt: '3小时前',
  },
];

const mockRequest: Request = {
  id: 'req-001',
  title: '公司年会脱口秀',
  status: 'quoted' as RequestStatus,
  showType: 'talkshow',
  businessType: 'commercial',
  expectedDate: '2025-02-15',
  location: '北京市朝阳区国贸大酒店宴会厅',
  duration: 30,
  budgetMin: 10000,
  budgetMax: 20000,
  audienceCount: 200,
  specialRequirements: '希望内容积极向上，适合公司年会氛围，有互动环节',
  contactName: '张经理',
  contactPhone: '138****8888',
  createdAt: '2025-01-20 14:30',
  quotes: mockQuotes,
};

const timelineEvents = [
  { content: '收到3个报价方案', time: '2小时前', color: 'blue' as const },
  { content: '演员张笑天提交了报价', time: '3小时前', color: 'purple' as const },
  { content: '演员李大鹏提交了报价', time: '3小时前', color: 'purple' as const },
  { content: '演员王小明提交了报价', time: '5小时前', color: 'purple' as const },
  { content: '需求已提交，等待报价', time: '昨天 14:30', color: 'gray' as const },
  { content: '创建需求', time: '昨天 14:30', color: 'green' as const },
];

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 960,
    margin: '0 auto',
  },
  breadcrumb: {
    marginBottom: 20,
  },
  /* Status Header Card */
  statusHeaderCard: {
    background: THEME.bgCard,
    borderRadius: 12,
    padding: 0,
    marginBottom: 24,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  gradientBorder: {
    height: 4,
    background: `linear-gradient(to right, ${THEME.brand}, ${THEME.brandLight})`,
  },
  statusHeaderContent: {
    padding: '28px 32px',
  },
  statusHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  demandTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: 0,
  },
  demandDate: {
    fontSize: 13,
    color: THEME.textTertiary,
    marginTop: 8,
  },
  infoRow: {
    display: 'flex',
    gap: 32,
    marginTop: 16,
    flexWrap: 'wrap' as const,
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: THEME.textTertiary,
  },
  infoValue: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  /* AI Quotes Section */
  sectionCard: {
    background: THEME.bgCard,
    borderRadius: 12,
    padding: 0,
    marginBottom: 24,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 28px',
    borderBottom: `1px solid ${THEME.divider}`,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${THEME.brand}, ${THEME.brandLight})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 16,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: THEME.textTertiary,
    marginLeft: 8,
    fontWeight: 400,
  },
  sectionBody: {
    padding: '20px 28px',
  },
  quoteCard: {
    borderLeft: `4px solid ${THEME.brand}`,
    background: '#fff',
    borderRadius: 8,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s',
  },
  quoteCardLast: {
    borderLeft: `4px solid ${THEME.brand}`,
    background: '#fff',
    borderRadius: 8,
    padding: '20px 24px',
    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s',
  },
  quoteHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  performerAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: THEME.brandBg,
    color: THEME.brand,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 600,
    flexShrink: 0,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '24px',
  },
  performerMeta: {
    fontSize: 13,
    color: THEME.textTertiary,
    marginTop: 2,
  },
  tierBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: 4,
    marginLeft: 8,
  },
  tierT1: {
    background: '#fef3c7',
    color: '#92400e',
  },
  tierT2: {
    background: '#e0e7ff',
    color: '#3730a3',
  },
  quotePrice: {
    fontSize: 28,
    fontWeight: 700,
    color: THEME.error,
    marginTop: 16,
  },
  quotePriceUnit: {
    fontSize: 14,
    fontWeight: 400,
    color: THEME.textTertiary,
    marginLeft: 4,
  },
  quoteDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 12,
    lineHeight: '22px',
  },
  quoteTime: {
    fontSize: 12,
    color: THEME.textTertiary,
    marginTop: 12,
  },
  quoteActions: {
    display: 'flex',
    gap: 12,
    marginTop: 16,
  },
  /* Timeline Section */
  timelineContent: {
    padding: '24px 28px',
  },
  timelineItem: {
    paddingBottom: 16,
  },
  /* Rating Card */
  ratingContent: {
    padding: '28px 32px',
    textAlign: 'center' as const,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    marginBottom: 16,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  ratingText: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 12,
  },
  ratingSubmitBtn: {
    marginTop: 20,
  },
};

/* ─── Avatar Color Helper ─── */
function getAvatarColor(name: string): string {
  const colors = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/* ─── Component ─── */
const DemandDetail: React.FC = () => {
  const { id: _id } = useParams<{ id: string }>();
  const [ratingValue, setRatingValue] = useState<number>(0);

  const demand = mockRequest;
  const borderColor = statusBorderColors[demand.status];

  const canAccept = demand.status === 'quoted' || demand.status === 'pending_quote';
  const showRating = demand.status === 'signed';

  const handleAcceptQuote = (_quoteId: string) => {
    message.success('已采纳该方案');
  };

  const handleContact = (performerName: string) => {
    message.info(`正在联系 ${performerName}...`);
  };

  const handleConfirmPlan = () => {
    message.success('方案已确认');
  };

  const handleReject = () => {
    message.info('已标记为不采纳');
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0) {
      message.warning('请先选择评分');
      return;
    }
    message.success(`感谢您的评价！已提交 ${ratingValue} 星评分`);
  };

  return (
    <div style={styles.page}>
      {/* ── Breadcrumb ── */}
      <div style={styles.breadcrumb}>
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined style={{ marginRight: 4 }} />
                  首页
                </Link>
              ),
            },
            {
              title: <Link to="/demands">我的需求</Link>,
            },
            {
              title: '需求详情',
            },
          ]}
        />
      </div>

      {/* ── Status Header Card ── */}
      <div style={styles.statusHeaderCard}>
        <div style={{ ...styles.gradientBorder, background: `linear-gradient(to right, ${borderColor}, ${borderColor}88)` }} />
        <div style={styles.statusHeaderContent}>
          <div style={styles.statusHeaderTop}>
            <div style={styles.statusHeaderLeft}>
              <h1 style={styles.demandTitle}>{demand.title}</h1>
              <StatusTag status={demand.status} />
            </div>
            {canAccept && (
              <Space>
                <Button type="primary" onClick={handleConfirmPlan}>
                  <CheckCircleOutlined />
                  确认方案
                </Button>
                <Button onClick={handleReject}>
                  <CloseOutlined />
                  不采纳
                </Button>
              </Space>
            )}
          </div>
          <div style={styles.demandDate}>创建于 {demand.createdAt}</div>
          <div style={styles.infoRow}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>演出类型</span>
              <span style={styles.infoValue}>脱口秀</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>期望日期</span>
              <span style={styles.infoValue}>{demand.expectedDate}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>地点</span>
              <span style={styles.infoValue}>{demand.location}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>预算范围</span>
              <span style={styles.infoValue}>
                ¥{demand.budgetMin.toLocaleString()} - ¥{demand.budgetMax.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Recommended Quotes Section ── */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <RobotOutlined />
          </div>
          <h2 style={styles.sectionTitle}>
            AI 推荐方案
            <span style={styles.sectionSubtitle}>({demand.quotes.length}个报价)</span>
          </h2>
        </div>
        <div style={styles.sectionBody}>
          {demand.quotes.map((quote: Quote, index: number) => {
            const isLast = index === demand.quotes.length - 1;
            const isT1 = quote.performer.tierLevel === 'T1';
            return (
              <div key={quote.id} style={isLast ? styles.quoteCardLast : styles.quoteCard}>
                {/* Performer Header */}
                <div style={styles.quoteHeader}>
                  <Avatar
                    size={44}
                    style={{
                      backgroundColor: getAvatarColor(quote.performer.name),
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {quote.performer.name.charAt(0)}
                  </Avatar>
                  <div style={styles.performerInfo}>
                    <div>
                      <span style={styles.performerName}>{quote.performer.name}</span>
                      <span
                        style={{
                          ...styles.tierBadge,
                          ...(isT1 ? styles.tierT1 : styles.tierT2),
                        }}
                      >
                        {quote.performer.tierLevel}
                      </span>
                    </div>
                    <div style={styles.performerMeta}>
                      {quote.performer.experience} | 已完成 {quote.performer.showCount} 场演出
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Price */}
                <div style={styles.quotePrice}>
                  ¥{quote.price.toLocaleString()}
                  <span style={styles.quotePriceUnit}>元</span>
                </div>

                {/* Description */}
                <div style={styles.quoteDescription}>{quote.description}</div>

                {/* Response Time */}
                <div style={styles.quoteTime}>响应时间: {quote.respondedAt}</div>

                {/* Actions */}
                {canAccept && (
                  <div style={styles.quoteActions}>
                    <Button type="primary" onClick={() => handleAcceptQuote(quote.id)}>
                      <CheckCircleOutlined />
                      采纳此方案
                    </Button>
                    <Button ghost onClick={() => handleContact(quote.performer.name)}>
                      <PhoneOutlined />
                      联系沟通
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Timeline Section ── */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div
            style={{
              ...styles.sectionIcon,
              background: `linear-gradient(135deg, ${THEME.info}, #60a5fa)`,
            }}
          >
            <FileTextOutlined />
          </div>
          <h2 style={styles.sectionTitle}>需求动态</h2>
        </div>
        <div style={styles.timelineContent}>
          <Timeline
            items={timelineEvents.map((event) => ({
              color: event.color,
              children: (
                <div>
                  <div style={{ fontSize: 14, color: THEME.textPrimary }}>{event.content}</div>
                  <div style={{ fontSize: 12, color: THEME.textTertiary, marginTop: 4 }}>{event.time}</div>
                </div>
              ),
            }))}
          />
        </div>
      </div>

      {/* ── Rating Card (shown when signed) ── */}
      {showRating && (
        <div style={styles.sectionCard}>
          <div style={styles.ratingContent}>
            <h2 style={styles.ratingTitle}>
              <StarOutlined style={{ marginRight: 8, color: THEME.warning }} />
              对本次服务进行评价
            </h2>
            <div style={styles.ratingRow}>
              <Rate
                value={ratingValue}
                onChange={(value) => setRatingValue(value)}
                style={{ fontSize: 32 }}
              />
              {ratingValue > 0 && (
                <span style={{ fontSize: 14, color: THEME.textSecondary }}>
                  {ratingValue} 分
                </span>
              )}
            </div>
            <div style={styles.ratingText}>您的评价将帮助我们持续提升服务质量</div>
            <div style={styles.ratingSubmitBtn}>
              <Button type="primary" onClick={handleSubmitRating}>
                提交评价
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandDetail;
