import React, { useState, useMemo } from 'react';
import { Badge, Button, Empty, Pagination } from 'antd';
import type { NotificationType } from '@/types';

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
  unread: '#3b82f6',
  read: '#d1d5db',
  hoverBg: '#fafafa',
};

/* ─── Types ─── */
interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
  read: boolean;
}

type TabKey = 'all' | NotificationType;

/* ─── Mock Data ─── */
const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: '您的需求收到了新的报价',
    description: '需求"公司年会脱口秀"已收到来自演员张三的报价，请尽快查看并确认。',
    type: 'system',
    time: '10分钟前',
    read: false,
  },
  {
    id: '2',
    title: '演员王小明已确认排期',
    description: '演员王小明已确认12月28日的演出排期，演出将按计划进行。',
    type: 'demand',
    time: '1小时前',
    read: false,
  },
  {
    id: '3',
    title: '需求"公司年会脱口秀"状态更新为已签约',
    description: '您的需求已成功签约，请关注后续排期和演出安排。',
    type: 'demand',
    time: '2小时前',
    read: true,
  },
  {
    id: '4',
    title: '系统维护通知：6月15日系统升级',
    description: '为提升服务质量，系统将于6月15日凌晨2:00-6:00进行升级维护，届时部分功能将暂时不可用。',
    type: 'system',
    time: '昨天',
    read: true,
  },
  {
    id: '5',
    title: '新方案推荐：都市脱口秀之夜',
    description: '根据您的需求偏好，我们为您推荐了新的演出方案"都市脱口秀之夜"，快来看看吧。',
    type: 'quote',
    time: '昨天',
    read: false,
  },
  {
    id: '6',
    title: '结算提醒：5月演出费用已到账',
    description: '您5月份的演出费用 ¥15,000 已到账，请及时查收。如有疑问请联系客服。',
    type: 'system',
    time: '3天前',
    read: true,
  },
  {
    id: '7',
    title: '您的评价已提交成功',
    description: '您对"公司年会脱口秀"的评价已成功提交，感谢您的反馈！',
    type: 'demand',
    time: '5天前',
    read: true,
  },
  {
    id: '8',
    title: '欢迎注册喜剧工厂',
    description: '欢迎加入喜剧工厂平台！您可以在这里浏览演出方案、提交需求、管理排期。如有任何问题，请随时联系客服。',
    type: 'system',
    time: '2024-03-15',
    read: true,
  },
];

const tabItems: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'system', label: '系统通知' },
  { key: 'demand', label: '需求动态' },
  { key: 'quote', label: '报价提醒' },
];

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 800,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: THEME.textPrimary,
    margin: 0,
    lineHeight: '30px',
  },
  markAllBtn: {
    fontSize: 14,
    color: THEME.brand,
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: `1px solid ${THEME.border}`,
    marginBottom: 16,
  },
  tab: {
    padding: '10px 20px',
    fontSize: 14,
    color: THEME.textSecondary,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    transition: 'all 0.2s ease',
    background: 'none',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    fontWeight: 500,
    lineHeight: '20px',
  },
  tabActive: {
    color: THEME.brand,
    borderBottomColor: THEME.brand,
    fontWeight: 600,
  },
  tabHover: {
    color: THEME.brandLight,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${THEME.border}`,
  },
  cardUnread: {
    borderLeft: `3px solid ${THEME.brand}`,
  },
  cardRead: {
    borderLeft: '3px solid transparent',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
  },
  dotUnread: {
    backgroundColor: THEME.unread,
  },
  dotRead: {
    backgroundColor: THEME.read,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '22px',
    marginBottom: 4,
  },
  titleRead: {
    fontWeight: 400,
    color: THEME.textSecondary,
  },
  description: {
    fontSize: 13,
    color: THEME.textTertiary,
    lineHeight: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeTag: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 4,
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    fontWeight: 500,
    lineHeight: '18px',
  },
  time: {
    fontSize: 12,
    color: THEME.textTertiary,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 16,
  },
  empty: {
    padding: '60px 0',
  },
};

/* ─── Component ─── */
const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTypeLabel = (type: NotificationType): string => {
    const map: Record<string, string> = {
      system: '系统通知',
      demand: '需求动态',
      quote: '报价提醒',
    };
    return map[type] || type;
  };

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>通知中心</h1>
          <Badge count={unreadCount} style={{ backgroundColor: '#ef4444' }} />
        </div>
        <Button type="link" size="small" style={styles.markAllBtn} onClick={handleMarkAllRead}>
          全部已读
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabs}>
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.key;
          const isHovered = hoveredTab === tab.key && !isActive;
          return (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
                ...(isHovered ? styles.tabHover : {}),
              }}
              onClick={() => handleTabChange(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {paginatedNotifications.length > 0 ? (
        <div style={styles.list}>
          {paginatedNotifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.card,
                ...(notification.read ? styles.cardRead : styles.cardUnread),
              }}
              onClick={() => handleNotificationClick(notification.id)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = THEME.hoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = THEME.bgCard;
              }}
            >
              {/* Dot Indicator */}
              <div
                style={{
                  ...styles.dot,
                  ...(notification.read ? styles.dotRead : styles.dotUnread),
                }}
              />

              {/* Content */}
              <div style={styles.content}>
                <div
                  style={{
                    ...styles.title,
                    ...(notification.read ? styles.titleRead : {}),
                  }}
                >
                  {notification.title}
                </div>
                <div style={styles.description}>{notification.description}</div>
                <div style={styles.meta}>
                  <span style={styles.typeTag}>{getTypeLabel(notification.type)}</span>
                  <span style={styles.time}>{notification.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <Empty description="暂无通知" />
        </div>
      )}

      {/* Pagination */}
      {filteredNotifications.length > pageSize && (
        <div style={styles.pagination}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredNotifications.length}
            onChange={handlePageChange}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default Notifications;
