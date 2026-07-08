import { useEffect, useState } from 'react';
import {
  Card, Col, Empty, Row, Spin, Statistic, Tag, Typography,
} from 'antd';
import {
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined,
  TeamOutlined, WalletOutlined, WarningOutlined,
} from '@ant-design/icons';
import {
  fetchCalendar, fetchCheckinsToday, fetchCredit, fetchSettlements, PERFORMER_COLOR_MAP,
  type CalendarEvent, type CheckinRecord, type CheckinStatus, type CreditSummary, type SettlementSummary,
} from '../../services/supplier';

const { Text } = Typography;

const CHECKIN_META: Record<CheckinStatus, { label: string; color: string; dot: string }> = {
  signed: { label: '已签到', color: '#16a34a', dot: '#16a34a' },
  unsigned: { label: '未签到', color: '#f59e0b', dot: '#f59e0b' },
  late: { label: '迟到', color: '#ef4444', dot: '#ef4444' },
};

export default function CompanyOverview() {
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [settlements, setSettlements] = useState<SettlementSummary | null>(null);
  const [credit, setCredit] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCalendar(), fetchCheckinsToday(), fetchSettlements(), fetchCredit()]).then(
      ([c, ck, s, cr]) => {
        setCalendar(c); setCheckins(ck); setSettlements(s); setCredit(cr); setLoading(false);
      }
    );
  }, []);

  // 排期日历：按日期分组
  const calendarByDate = calendar.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});
  const calendarDates = Object.keys(calendarByDate).sort();

  const maxCredit = credit?.trend.reduce((m, p) => Math.max(m, p.avg), 0) ?? 100;

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        {/* 1. 排期日历 */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<span><CalendarOutlined style={{ color: '#7c3aed', marginRight: 6 }} />排期日历（全部艺人）</span>}
            styles={{ body: { maxHeight: 360, overflowY: 'auto' } }}
          >
            {calendarDates.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无排期" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {calendarDates.map((date) => (
                  <div key={date} style={{ background: '#faf9ff', borderRadius: 8, padding: 10, border: '1px solid #f0eefb' }}>
                    <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>{date}</Text>
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {calendarByDate[date].map((e) => (
                        <Tag key={e.id} style={{ border: 'none', background: e.color, color: '#fff', fontWeight: 600 }}>
                          {e.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* 2. 今日签到 */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<span><CheckCircleOutlined style={{ color: '#7c3aed', marginRight: 6 }} />今日签到</span>}
          >
            {checkins.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="今日无演出" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {checkins.map((c) => {
                  const m = CHECKIN_META[c.status];
                  return (
                    <div key={c.performerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
                        <Text strong>{c.name}</Text>
                      </div>
                      <Tag color={m.color} style={{ border: 'none', fontWeight: 600 }}>{m.label}</Tag>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* 3. 结算总览 */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<span><WalletOutlined style={{ color: '#7c3aed', marginRight: 6 }} />结算总览</span>}
          >
            {settlements && (
              <>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={12}>
                    <Statistic title="本月待结算" value={settlements.pendingTotal} prefix="¥"
                      valueStyle={{ fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="已结算" value={settlements.settledTotal} prefix="¥"
                      valueStyle={{ fontFamily: "'JetBrains Mono', monospace", color: '#16a34a' }} />
                  </Col>
                </Row>
                <div style={{ borderTop: '1px solid #f0f1f3', paddingTop: 8 }}>
                  {settlements.perPerformer.map((p) => (
                    <div key={p.performerId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <Text style={{ fontSize: 13 }}>{p.name}</Text>
                      <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                        <span style={{ color: '#f59e0b' }}>待 ¥{p.pending.toLocaleString()}</span>
                        <span style={{ color: '#cbd5e1', margin: '0 6px' }}>/</span>
                        <span style={{ color: '#16a34a' }}>已 ¥{p.settled.toLocaleString()}</span>
                      </Text>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* 4. 信誉看板 */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<span><RiseOutlined style={{ color: '#7c3aed', marginRight: 6 }} />信誉看板</span>}
          >
            {credit && (
              <>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={12}>
                    <Statistic title="旗下平均信誉分" value={credit.avg}
                      valueStyle={{ fontFamily: "'JetBrains Mono', monospace", color: '#7c3aed' }} />
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>最低分预警</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="red" style={{ border: 'none', fontWeight: 600 }}>
                          <WarningOutlined /> {credit.minName} · {credit.min}
                        </Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div style={{ borderTop: '1px solid #f0f1f3', paddingTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>信誉变动趋势</Text>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, marginTop: 8 }}>
                    {credit.trend.map((t) => (
                      <div key={t.month} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: `${(t.avg / maxCredit) * 70}px`, background: '#7c3aed', borderRadius: 4, minHeight: 4,
                        }} />
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{t.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}
