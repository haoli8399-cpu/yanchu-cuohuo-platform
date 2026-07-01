/**
 * 需求基本信息卡片（P-28 客户信息）
 * 在 Detail 和 AIPlan 页面共用
 */
import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Descriptions, Tag } from 'antd';
import type { DemandDetail } from '@/types/demand';
import { UrgencyLabel, UrgencyColor, SourceLabel } from '@/types/demand';

const { Item } = Descriptions;

export interface DemandInfoCardProps {
  demand: DemandDetail;
}

const DemandInfoCard: React.FC<DemandInfoCardProps> = ({ demand }) => {
  return (
    <ProCard title="基本信息" style={{ marginBottom: 16 }}>
      <Descriptions column={2} bordered size="small">
        <Item label="活动公司">{demand.client?.name || '-'}</Item>
        <Item label="来源">
          <Tag>{SourceLabel[demand.source]}</Tag>
        </Item>
        <Item label="活动类型">{demand.event_type}</Item>
        <Item label="紧急程度">
          <Tag color={UrgencyColor[demand.urgency]}>
            {UrgencyLabel[demand.urgency]}
          </Tag>
        </Item>
        <Item label="活动日期">{demand.event_date}</Item>
        <Item label="活动时间">{demand.event_time || '-'}</Item>
        <Item label="城市">{demand.city}</Item>
        <Item label="地址">{demand.address}</Item>
        <Item label="观众人数">{demand.audience_count ?? '-'}</Item>
        <Item label="预算">
          {demand.budget ? `¥${demand.budget.toLocaleString()}` : '-'}
        </Item>
        <Item label="演出时长">
          {demand.duration_minutes ? `${demand.duration_minutes}分钟` : '-'}
        </Item>
        <Item label="喜剧风格">{demand.comedy_style || '-'}</Item>
        <Item label="特殊要求" span={2}>
          {demand.special_requirements || '-'}
        </Item>
      </Descriptions>
    </ProCard>
  );
};

export default DemandInfoCard;
