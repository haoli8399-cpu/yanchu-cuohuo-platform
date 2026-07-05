import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col, message } from 'antd';
import {
  EditOutlined,
  RightOutlined,
  CheckCircleFilled,
  FileTextOutlined,
  StarOutlined,
  HistoryOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { CompanyUser } from '@/types';

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

/* ─── Mock Data ─── */
const mockUser: CompanyUser = {
  id: 'user-001',
  name: '张经理',
  avatar: '',
  role: 'company',
  phone: '138****8888',
  verified: true,
  companyName: '星辰文化传媒有限公司',
  memberType: 'verified',
  stats: {
    totalRequests: 48,
    ongoingRequests: 8,
    signedRequests: 28,
  },
};

const goodRating = '98.5%';

const companyInfo = [
  { label: '企业名称', value: '星辰文化传媒有限公司' },
  { label: '联系人', value: '张经理' },
  { label: '联系电话', value: '138****8888' },
  { label: '企业地址', value: '北京市朝阳区建国路88号' },
  { label: '认证状态', value: '已认证' },
  { label: '注册时间', value: '2024-03-15' },
];

interface MenuCardItem {
  key: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const menuCards: MenuCardItem[] = [
  {
    key: 'demands',
    title: '我的需求',
    description: '管理您的演出需求订单',
    path: '/demands',
    icon: <UnorderedListOutlined />,
    iconBg: THEME.brandBg,
    iconColor: THEME.brand,
  },
  {
    key: 'favorites',
    title: '我的收藏',
    description: '收藏的演出方案和演员',
    path: '#',
    icon: <StarOutlined />,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    key: 'history',
    title: '历史订单',
    description: '查看已完成的历史演出订单',
    path: '#',
    icon: <HistoryOutlined />,
    iconBg: '#e0e7ff',
    iconColor: '#4f46e5',
  },
  {
    key: 'invoice',
    title: '发票管理',
    description: '申请和管理电子发票',
    path: '#',
    icon: <FileTextOutlined />,
    iconBg: '#fce7f3',
    iconColor: '#db2777',
  },
  {
    key: 'support',
    title: '联系客服',
    description: '在线客服咨询和帮助',
    path: '#',
    icon: <CustomerServiceOutlined />,
    iconBg: '#d1fae5',
    iconColor: '#059669',
  },
  {
    key: 'feedback',
    title: '意见反馈',
    description: '提交您的建议和意见',
    path: '#',
    icon: <MessageOutlined />,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    key: 'about',
    title: '关于我们',
    description: '了解喜剧工厂平台',
    path: '#',
    icon: <InfoCircleOutlined />,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    key: 'settings',
    title: '系统设置',
    description: '账户和安全设置',
    path: '#',
    icon: <SettingOutlined />,
    iconBg: '#f3f4f6',
    iconColor: '#6b7280',
  },
];

/* ─── Stat Card Config ─── */
const statCards = [
  {
    label: '需求总数',
    value: mockUser.stats.totalRequests,
    icon: <FileTextOutlined />,
    iconColor: THEME.brand,
    iconBg: THEME.brandBg,
  },
  {
    label: '进行中',
    value: mockUser.stats.ongoingRequests,
    icon: <ClockCircleOutlined />,
    iconColor: THEME.warning,
    iconBg: '#fef3c7',
  },
  {
    label: '已签约',
    value: mockUser.stats.signedRequests,
    icon: <CheckCircleFilled />,
    iconColor: THEME.success,
    iconBg: '#d1fae5',
  },
  {
    label: '好评率',
    value: goodRating,
    icon: <ThunderboltOutlined />,
    iconColor: THEME.info,
    iconBg: '#dbeafe',
    isText: true,
  },
];

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 960,
    margin: '0 auto',
  },
  /* Profile Header Card */
  profileCard: {
    background: THEME.bgCard,
    borderRadius: 12,
    padding: 0,
    marginBottom: 24,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  profileGradientAccent: {
    height: 6,
    background: `linear-gradient(to right, ${THEME.brand}, ${THEME.brandLight}, ${THEME.brandLight}88)`,
  },
  profileContent: {
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${THEME.brand}, ${THEME.brandLight})`,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 700,
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 700,
    color: THEME.textPrimary,
    lineHeight: '32px',
  },
  badgeRow: {
    display: 'flex',
    gap: 8,
    marginTop: 10,
  },
  badgeCompany: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    background: THEME.brandBg,
    color: THEME.brand,
    border: 'none',
  },
  badgeVerified: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    background: '#d1fae5',
    color: '#166534',
    border: 'none',
  },
  memberType: {
    fontSize: 13,
    color: THEME.textTertiary,
    marginTop: 8,
  },
  editBtnWrapper: {
    position: 'absolute' as const,
    top: 24,
    right: 32,
  },
  /* Stats Cards */
  statsRow: {
    marginBottom: 24,
  },
  statCard: {
    background: THEME.bgCard,
    borderRadius: 12,
    padding: '24px 20px',
    textAlign: 'center' as const,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    margin: '0 auto 12px',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: '36px',
  },
  statLabel: {
    fontSize: 13,
    color: THEME.textTertiary,
    marginTop: 4,
  },
  /* Company Info Section */
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
    justifyContent: 'space-between',
    padding: '20px 28px',
    borderBottom: `1px solid ${THEME.divider}`,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    margin: 0,
  },
  sectionBody: {
    padding: '20px 28px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px 40px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: THEME.textTertiary,
    width: 80,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  /* Menu Grid */
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  menuCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${THEME.divider}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    textAlign: 'center' as const,
    gap: 12,
    textDecoration: 'none',
    position: 'relative' as const,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: THEME.textPrimary,
    margin: 0,
  },
  menuDesc: {
    fontSize: 12,
    color: THEME.textTertiary,
    lineHeight: '18px',
    margin: 0,
  },
  menuArrow: {
    position: 'absolute' as const,
    top: 20,
    right: 16,
    fontSize: 12,
    color: THEME.textTertiary,
  },
};

/* ─── Component ─── */
const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuClick = (item: MenuCardItem) => {
    if (item.path !== '#') {
      navigate(item.path);
    } else {
      message.info(`${item.title} 功能开发中`);
    }
  };

  const handleEditProfile = () => {
    message.info('编辑资料功能开发中');
  };

  const handleEditCompanyInfo = () => {
    message.info('编辑企业信息功能开发中');
  };

  return (
    <div style={styles.page}>
      {/* ── Profile Header Card ── */}
      <div style={styles.profileCard}>
        <div style={styles.profileGradientAccent} />
        <div style={styles.profileContent}>
          <div style={styles.profileAvatar}>星</div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{mockUser.companyName}</h1>
            <div style={styles.badgeRow}>
              <span style={styles.badgeCompany}>
                <SafetyCertificateOutlined style={{ marginRight: 4, fontSize: 12 }} />
                活动公司
              </span>
              <span style={styles.badgeVerified}>
                <CheckCircleFilled style={{ fontSize: 12 }} />
                已认证
              </span>
            </div>
            <div style={styles.memberType}>认证企业会员</div>
          </div>
          <div style={styles.editBtnWrapper}>
            <Button ghost icon={<EditOutlined />} onClick={handleEditProfile}>
              编辑
            </Button>
          </div>
        </div>
      </div>

      {/* ── Statistics Cards Row ── */}
      <div style={styles.statsRow}>
        <Row gutter={16}>
          {statCards.map((stat) => (
            <Col span={6} key={stat.label}>
              <div style={styles.statCard}>
                <div
                  style={{
                    ...styles.statIcon,
                    background: stat.iconBg,
                    color: stat.iconColor,
                  }}
                >
                  {stat.icon}
                </div>
                <div style={{ ...styles.statValue, color: stat.iconColor }}>
                  {stat.isText ? stat.value : stat.value}
                </div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ── Company Info Section ── */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>企业信息</h2>
          <Button type="link" icon={<EditOutlined />} onClick={handleEditCompanyInfo}>
            编辑
          </Button>
        </div>
        <div style={styles.sectionBody}>
          <div style={styles.infoGrid}>
            {companyInfo.map((item) => (
              <div key={item.label} style={styles.infoRow}>
                <span style={styles.infoLabel}>{item.label}</span>
                {item.label === '认证状态' ? (
                  <span
                    style={{
                      ...styles.infoValue,
                      color: THEME.success,
                    }}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span style={styles.infoValue}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu Grid Section ── */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>功能菜单</h2>
        </div>
        <div style={{ ...styles.sectionBody }}>
          <div style={styles.menuGrid}>
            {menuCards.map((item) => (
              <div
                key={item.key}
                style={styles.menuCard}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 4px 12px 0 rgba(0,0,0,0.08)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = THEME.brandLight;
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.borderColor = THEME.divider;
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <span style={styles.menuArrow}>
                  <RightOutlined />
                </span>
                <div
                  style={{
                    ...styles.menuIcon,
                    background: item.iconBg,
                    color: item.iconColor,
                  }}
                >
                  {item.icon}
                </div>
                <p style={styles.menuTitle}>{item.title}</p>
                <p style={styles.menuDesc}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
