/**
 * 演员档期看板 (P-11, P1)
 *
 * 功能：月度日历展示所有演员排期
 * - 按月份切换视图
 * - 按演员筛选
 * - 点击日期查看排期详情
 * - 触控 ≥ 44px，三态处理
 *
 * Code Standards:
 * - UX-1: 触控目标 ≥ 44px
 * - UX-2: 三态处理
 * - API-7: 所有 API 调用通过 apiClient
 */
import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Calendar,
  Badge,
  Modal,
  Tag,
  Select,
  Button,
  Spin,
  Result,
  Empty,
  Space,
  Row,
  Col,
} from 'antd';
import {
  ReloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { getCalendar } from '@/services/order';
import { getPerformerList } from '@/services/performer';
import type { CalendarEntry } from '@/types/order';
import type { PerformerListItem } from '@/types/performer';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

/** 颜色池用于区分演员 */
const PERFORMER_COLORS = [
  '#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96',
  '#13c2c2', '#fa541c', '#a0d911', '#2f54eb', '#f5222d',
];

/** 演员名称 → 颜色映射 */
function getPerformerColor(name: string, idx: number): string {
  return PERFORMER_COLORS[idx % PERFORMER_COLORS.length];
}

/** 获取日期字符串 (YYYY-MM-DD) */
function formatDateStr(d: Dayjs): string {
  return d.format('YYYY-MM-DD');
}

const ScheduleCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [performers, setPerformers] = useState<PerformerListItem[]>([]);
  const [selectedPerformer, setSelectedPerformer] = useState<string | undefined>();

  // 详情弹窗
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateAssignments, setSelectedDateAssignments] = useState<
    CalendarEntry['assignments']
  >([]);

  /** 加载演员列表 */
  useEffect(() => {
    getPerformerList({ page: 1, pageSize: 200 })
      .then((res) => setPerformers(res.data.items))
      .catch(() => {}); // 演员筛选可选，静默失败
  }, []);

  /** 加载档期数据 */
  const loadCalendar = () => {
    setLoading(true);
    setError(null);
    const month = currentMonth.format('YYYY-MM');
    getCalendar(month, selectedPerformer)
      .then((res) => setEntries(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err : new Error('加载失败')),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCalendar();
  }, [currentMonth, selectedPerformer]);

  /** 构建日期 → 排期条目映射 */
  const dateMap = new Map<string, CalendarEntry['assignments']>();
  entries.forEach((entry) => {
    dateMap.set(entry.date, entry.assignments);
  });

  /** 日期单元格渲染 */
  const dateCellRender = (date: Dayjs) => {
    const dateStr = formatDateStr(date);
    const assignments = dateMap.get(dateStr);
    if (!assignments || assignments.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12 }}>
        {assignments.slice(0, 3).map((a, idx) => (
          <li key={a.id} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <Badge
              color={getPerformerColor(a.performer.name, idx)}
              text={
                <span style={{ fontSize: 11 }}>
                  {a.performer.name}
                </span>
              }
            />
          </li>
        ))}
        {assignments.length > 3 && (
          <li style={{ color: '#999', fontSize: 11 }}>
            ...还有{assignments.length - 3}项
          </li>
        )}
      </ul>
    );
  };

  /** 点击日期查看详情 */
  const handleDateSelect = (date: Dayjs) => {
    const dateStr = formatDateStr(date);
    const assignments = dateMap.get(dateStr) || [];
    setSelectedDate(dateStr);
    setSelectedDateAssignments(assignments);
    setDetailModalOpen(true);
  };

  // 加载中
  if (loading && entries.length === 0) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" tip="加载档期数据..." />
        </div>
      </PageContainer>
    );
  }

  // 错误
  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="档期数据加载失败"
          subTitle={error.message}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              style={{ minHeight: 44 }}
              onClick={loadCalendar}
            >
              重试
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 工具栏 */}
      <Row
        gutter={[16, 16]}
        align="middle"
        style={{ marginBottom: 16 }}
      >
        <Col>
          <Select
            allowClear
            showSearch
            placeholder="按演员筛选"
            style={{ width: 220, minHeight: 44 }}
            value={selectedPerformer}
            onChange={setSelectedPerformer}
            optionFilterProp="label"
            options={performers.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
          />
        </Col>
        <Col flex="auto" />
        <Col>
          <Button
            icon={<ReloadOutlined />}
            style={{ minHeight: 44 }}
            onClick={loadCalendar}
          >
            刷新
          </Button>
        </Col>
      </Row>

      {/* 日历 */}
      <Calendar
        cellRender={(date) => ({
          ...date,
          children: dateCellRender(date),
        })}
        onSelect={handleDateSelect}
        onPanelChange={(d) => setCurrentMonth(d)}
        style={{ background: '#fff', borderRadius: 8, padding: 16 }}
      />

      {/* 日期详情弹窗 */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>{selectedDate} 排期详情</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedDateAssignments.length === 0 ? (
          <Empty description="当天无排期" />
        ) : (
          <div>
            {selectedDateAssignments.map((a, idx) => (
              <div
                key={a.id}
                style={{
                  padding: '12px 0',
                  borderBottom:
                    idx < selectedDateAssignments.length - 1
                      ? '1px solid #f0f0f0'
                      : 'none',
                }}
              >
                <div style={{ marginBottom: 4 }}>
                  <Tag color={getPerformerColor(a.performer.name, idx)}>
                    {a.performer.name}
                  </Tag>
                  <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>
                    {a.time_slot || '全天'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {a.demand_title}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ScheduleCalendarPage;
