import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sku, ShowType } from '../types';

/* ─── Show Type Label Mapping ─── */
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
  brand: '#7c3aed',
  bgPage: '#f5f5f7',
  bgCard: '#ffffff',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  price: '#ef4444',
  starFilled: '#f59e0b',
  starEmpty: '#e5e7eb',
};

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    border: `1px solid ${THEME.border}`,
    display: 'flex',
    flexDirection: 'column',
  },
  coverWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', /* 16:9 */
    backgroundColor: '#f0f0f2',
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  showTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '18px',
    backdropFilter: 'blur(4px)',
  },
  body: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.textPrimary,
    lineHeight: '22px',
    marginBottom: 6,
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  description: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: '18px',
    marginBottom: 12,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  ratingWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: THEME.textTertiary,
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontSize: 14,
  },
  starFilled: {
    color: THEME.starFilled,
  },
  starEmpty: {
    color: THEME.starEmpty,
  },
  ratingCount: {
    fontSize: 12,
    color: THEME.textTertiary,
  },
  priceWrapper: {
    textAlign: 'right' as const,
  },
  price: {
    fontSize: 18,
    fontWeight: 700,
    color: THEME.price,
    lineHeight: '24px',
  },
  priceUnit: {
    fontSize: 12,
    color: THEME.textTertiary,
    marginLeft: 2,
  },
  tags: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
    marginTop: 8,
  },
  tag: {
    padding: '2px 8px',
    borderRadius: 4,
    backgroundColor: '#f5f5f7',
    color: THEME.textSecondary,
    fontSize: 11,
    lineHeight: '16px',
  },
};

/* ─── Props ─── */
interface SkuCardProps {
  sku: Sku;
}

/* ─── Rating Stars Helper ─── */
function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span style={styles.stars}>
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`} style={styles.starFilled}>&#9733;</span>
      ))}
      {hasHalf && <span style={styles.starFilled}>&#9733;</span>}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} style={styles.starEmpty}>&#9733;</span>
      ))}
    </span>
  );
}

/* ─── Component ─── */
const SkuCard: React.FC<SkuCardProps> = ({ sku }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    navigate(`/skus/${sku.id}`);
  };

  const cardStyle: React.CSSProperties = {
    ...styles.card,
    boxShadow: isHovered
      ? '0 8px 24px rgba(0,0,0,0.1)'
      : '0 1px 2px rgba(0,0,0,0.04)',
    transform: isHovered ? 'translateY(-2px)' : 'none',
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div style={styles.coverWrapper}>
        <img
          style={styles.coverImage}
          src={sku.coverImage}
          alt={sku.title}
          loading="lazy"
        />
        <span style={styles.showTypeBadge}>
          {ShowTypeLabels[sku.showType] || sku.showType}
        </span>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <div style={styles.title}>{sku.title}</div>
        <div style={styles.description}>{sku.description}</div>

        {/* Tags */}
        {sku.tags && sku.tags.length > 0 && (
          <div style={styles.tags}>
            {sku.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          {/* Rating */}
          <div style={styles.ratingWrapper}>
            <RatingStars rating={sku.rating} />
            <span style={styles.ratingCount}>({sku.ratingCount})</span>
          </div>

          {/* Price */}
          <div style={styles.priceWrapper}>
            <span style={styles.price}>
              &yen;{sku.price.toLocaleString()}
            </span>
            <span style={styles.priceUnit}>/{sku.priceUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkuCard;
