import React from 'react';

/* ─── Status Label Mapping ─── */
const StatusLabels: Record<string, string> = {
  pending_quote: '待报价',
  quoted: '已报价',
  confirmed: '已确认',
  signed: '已签约',
  cancelled: '已取消',
  completed: '已完成',
  settled: '已结算',
  pending_confirm: '待确认',
  rejected: '已拒绝',
  transferred: '已转账',
  pending: '待处理',
};

/* ─── Color Mapping ─── */
type StatusColor = {
  bg: string;
  text: string;
  border: string;
};

const StatusColorMap: Record<string, StatusColor> = {
  pending_quote: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  quoted: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  confirmed: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  signed: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  cancelled: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  completed: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  settled: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  pending_confirm: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  rejected: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  transferred: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  pending: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
};

const DefaultColor: StatusColor = { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };

/* ─── Style Variants ─── */
interface StyleConfig {
  default: React.CSSProperties;
  small: React.CSSProperties;
}

const tagStyles: StyleConfig = {
  default: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '20px',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  small: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '18px',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
};

/* ─── Props ─── */
interface StatusTagProps {
  status: string;
  size?: 'small' | 'default';
}

/* ─── Component ─── */
const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'default' }) => {
  const label = StatusLabels[status] || status;
  const color = StatusColorMap[status] || DefaultColor;
  const baseStyle = tagStyles[size];

  const style: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: color.bg,
    color: color.text,
    borderColor: color.border,
  };

  return <span style={style}>{label}</span>;
};

export default StatusTag;
