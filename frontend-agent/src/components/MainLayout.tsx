import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

/* ─── Design Tokens ─── */
const THEME = {
  brand: '#7c3aed',
  brandHover: '#6d28d9',
  brandLight: '#a78bfa',
  brandBg: '#f5f3ff',
  brandSubtle: '#ede9fe',
  bgPage: '#f5f5f7',
  bgCard: '#ffffff',
  bgInput: '#f7f7f8',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textPlaceholder: '#c4c4cc',
  border: '#e5e7eb',
  divider: '#f0f0f2',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

/* ─── Types ─── */
interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

/* ─── SVG Icons (inline, no imports) ─── */
const IconHome = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V13h6v8" />
  </svg>
);

const IconSku = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <path d="M2 9h20" />
    <path d="M9 21V9" />
  </svg>
);

const IconDemand = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconUser = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconNotification = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const IconBellHeader = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const IconChevronDown = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const IconLogout = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconSettings = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: THEME.bgPage,
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    color: THEME.textPrimary,
  },
  /* Sidebar */
  sidebar: {
    width: 240,
    minWidth: 240,
    height: '100vh',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    backgroundColor: '#fff',
    borderRight: `1px solid ${THEME.border}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  sidebarHeader: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px',
    backgroundColor: THEME.brand,
    color: '#fff',
    flexShrink: 0,
  },
  sidebarLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
    color: '#fff',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: '8px 0',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    margin: '2px 8px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: THEME.textSecondary,
    fontSize: 14,
    borderLeft: '3px solid transparent',
    textDecoration: 'none',
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    fontWeight: 500,
    borderLeftColor: THEME.brand,
  },
  navItemIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  /* Sidebar Footer (User) */
  sidebarFooter: {
    borderTop: `1px solid ${THEME.divider}`,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 14,
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 14,
    fontWeight: 500,
    color: THEME.textPrimary,
    lineHeight: '20px',
  },
  userRoleBadge: {
    display: 'inline-block',
    fontSize: 11,
    lineHeight: '16px',
    padding: '0 6px',
    borderRadius: 4,
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    fontWeight: 500,
    marginTop: 2,
  },
  /* Main Area */
  mainArea: {
    marginLeft: 240,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  /* Header */
  header: {
    height: 64,
    minHeight: 64,
    backgroundColor: '#fff',
    borderBottom: `1px solid ${THEME.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 99,
  },
  headerLeft: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  notificationBtn: {
    position: 'relative' as const,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    transition: 'background-color 0.2s',
    color: THEME.textSecondary,
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: THEME.error,
    border: '2px solid #fff',
  },
  userDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 8,
    transition: 'background-color 0.2s',
  },
  dropdownAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: THEME.brandBg,
    color: THEME.brand,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 13,
  },
  dropdownName: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: 500,
  },
  /* Content */
  content: {
    flex: 1,
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  /* Dropdown Menu */
  dropdownOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownMenu: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: 4,
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
    padding: '4px 0',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    fontSize: 14,
    color: THEME.textPrimary,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left' as const,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: THEME.divider,
    margin: '4px 0',
  },
  /* Loading */
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    color: THEME.textTertiary,
    fontSize: 14,
  },
};

/* ─── Breadcrumb Mapping ─── */
const breadcrumbMap: Record<string, string> = {
  '/': '发现首页',
  '/skus': '演出方案',
  '/demands': '我的需求',
  '/demands/submit': '提交需求',
  '/user': '个人中心',
  '/notifications': '通知中心',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  // Prefix match for detail pages
  if (pathname.startsWith('/skus/')) return '方案详情';
  if (pathname.startsWith('/demands/')) return '需求详情';
  if (pathname.startsWith('/cases/')) return '案例详情';
  return '页面';
}

/* ─── Menu Config ─── */
const navItems: NavItem[] = [
  { key: 'discover', label: '发现首页', path: '/', icon: IconHome },
  { key: 'skus', label: '演出方案', path: '/skus', icon: IconSku },
  { key: 'demands', label: '我的需求', path: '/demands', icon: IconDemand },
  { key: 'user', label: '个人中心', path: '/user', icon: IconUser },
  { key: 'notifications', label: '通知中心', path: '/notifications', icon: IconNotification },
];

/* ─── MainLayout Component ─── */
const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasNotification] = React.useState(true);
  const [hoveredNav, setHoveredNav] = React.useState<string | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = React.useState<number | null>(null);

  // Determine active nav key
  const activeKey = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'discover';
    if (path.startsWith('/skus')) return 'skus';
    if (path.startsWith('/demands')) return 'demands';
    if (path.startsWith('/user')) return 'user';
    if (path.startsWith('/notifications')) return 'notifications';
    return '';
  }, [location.pathname]);

  const handleNavClick = (item: NavItem) => {
    navigate(item.path);
  };

  const pageTitle = getPageTitle(location.pathname);

  // Mock user data - in production this would come from auth context
  const userName = '活动公司用户';
  const userRole = '企业认证';

  return (
    <div style={styles.layout}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Header with logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <span style={styles.sidebarTitle}>喜剧工厂</span>
        </div>

        {/* Navigation */}
        <ul style={styles.navList}>
          {navItems.map((item) => {
            const isActive = activeKey === item.key;
            const isHovered = hoveredNav === item.key && !isActive;
            return (
              <li
                key={item.key}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  backgroundColor: isHovered ? '#f9f5ff' : (isActive ? styles.navItemActive.backgroundColor : undefined),
                }}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredNav(item.key)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <span style={styles.navItemIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>

        {/* Footer - User info */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userAvatar}>张</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{userName}</div>
            <span style={styles.userRoleBadge}>{userRole}</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div style={styles.mainArea}>
        {/* Top Header Bar */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>{pageTitle}</div>
          <div style={styles.headerRight}>
            {/* Notification Bell */}
            <button
              style={styles.notificationBtn}
              onClick={() => navigate('/notifications')}
              title="通知中心"
            >
              {IconBellHeader}
              {hasNotification && <span style={styles.notificationDot} />}
            </button>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                style={styles.userDropdown}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setHoveredDropdown(0)}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <div style={styles.dropdownAvatar}>张</div>
                <span style={styles.dropdownName}>{userName}</span>
                <span style={{ display: 'flex', alignItems: 'center', color: THEME.textTertiary }}>
                  {IconChevronDown}
                </span>
              </div>

              {dropdownOpen && (
                <>
                  <div style={styles.dropdownOverlay} onClick={() => setDropdownOpen(false)} />
                  <div style={styles.dropdownMenu}>
                    <button
                      style={{
                        ...styles.dropdownItem,
                        backgroundColor: hoveredDropdown === 1 ? '#f5f5f7' : undefined,
                      }}
                      onMouseEnter={() => setHoveredDropdown(1)}
                      onMouseLeave={() => setHoveredDropdown(null)}
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/user');
                      }}
                    >
                      {IconSettings}
                      <span>个人设置</span>
                    </button>
                    <div style={styles.dropdownDivider} />
                    <button
                      style={{
                        ...styles.dropdownItem,
                        color: THEME.error,
                        backgroundColor: hoveredDropdown === 2 ? '#fef2f2' : undefined,
                      }}
                      onMouseEnter={() => setHoveredDropdown(2)}
                      onMouseLeave={() => setHoveredDropdown(null)}
                      onClick={() => {
                        setDropdownOpen(false);
                        // handleLogout()
                      }}
                    >
                      {IconLogout}
                      <span>退出登录</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
