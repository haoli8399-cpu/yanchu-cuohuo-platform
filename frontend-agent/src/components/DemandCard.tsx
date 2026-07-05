import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Request, ShowType } from '../types';
import StatusTag from './StatusTag';

/* ─── Label Mappings ─── */
const ShowTypeLabels: Record<ShowType, string> = {
  talkshow: '脱口秀',
  improv: '即兴喜剧',
  manzai: '漫才',
  newcomedy: '新喜剧',
  magic: '魔术喜剧',
  family: '亲子喜剧',
};

/* ─── Design Tokens ─── */
const THEME = {
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  divider: '#f0f0f2',
  brand: '#7c3aed',
};

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    border: `1px solid ${THEME.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '22px',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap' as const,
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    display: 'flex',
    alignItems: 'center',
    color: THEME.textTertiary,
    flexShrink: 0,
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
    color: THEME.textTertiary,
    flexShrink: 0,
    transition: 'transform 0.2s',
  },
};

/* ─── SVG Icons ─── */
const IconCalendar = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconLocation = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconShowType = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const IconChevronRight = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

/* ─── Props ─── */
interface DemandCardProps {
  demand: Request;
}

/* ─── Format Date Helper ─── */
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

/* ─── Component ─── */
const DemandCard: React.FC<DemandCardProps> = ({ demand }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    navigate(`/demands/${demand.id}`);
  };

  const cardStyle: React.CSSProperties = {
    ...styles.card,
    boxShadow: isHovered
      ? '0 4px 12px rgba(0,0,0,0.08)'
      : '0 1px 2px rgba(0,0,0,0.04)',
  };

  const arrowStyle: React.CSSProperties = {
    ...styles.arrow,
    transform: isHovered ? 'translateX(2px)' : 'none',
    color: isHovered ? THEME.brand : THEME.textTertiary,
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content */}
      <div style={styles.content}>
        {/* Title + Status */}
        <div style={styles.header}>
          <span style={styles.title}>{demand.title}</span>
          <StatusTag status={demand.status} size="small" />
        </div>

        {/* Meta Info */}
        <div style={styles.meta}>
          {/* Show Type */}
          <span style={styles.metaItem}>
            <span style={styles.metaIcon}>{IconShowType}</span>
            <span>{ShowTypeLabels[demand.showType] || demand.showType}</span>
          </span>

          {/* Expected Date */}
          <span style={styles.metaItem}>
            <span style={styles.metaIcon}>{IconCalendar}</span>
            <span>{formatDate(demand.expectedDate)}</span>
          </span>

          {/* Location */}
          <span style={styles.metaItem}>
            <span style={styles.metaIcon}>{IconLocation}</span>
            <span>{demand.location}</span>
          </span>

          {/* Created Date */}
          <span style={{ ...styles.metaItem, color: THEME.textTertiary }}>
            提交于 {formatDate(demand.createdAt)}
          </span>
        </div>
      </div>

      {/* Right Arrow */}
      <div style={arrowStyle}>
        {IconChevronRight}
      </div>
    </div>
  );
};

export default DemandCard;
