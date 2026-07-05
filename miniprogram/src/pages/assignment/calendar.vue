// @ts-nocheck
<template>
  <view class="calendar-page">
    <!-- 月份导航 -->
    <view class="month-nav">
      <text class="nav-btn" @click="prevMonth">‹</text>
      <text class="month-title">{{ year }}年{{ month }}月</text>
      <text class="nav-btn" @click="nextMonth">›</text>
    </view>

    <!-- 星期头 -->
    <view class="weekday-header">
      <text v-for="d in weekdays" :key="d" class="weekday">{{ d }}</text>
    </view>

    <!-- 日历网格 6行x7列 → 42格 -->
    <view class="calendar-grid">
      <view
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="calendar-cell"
        :class="{
          empty: !day,
          today: day?.isToday,
          hasEvent: day?.assignments.length > 0,
          active: day?.isSelected
        }"
        @click="selectDay(day)"
      >
        <text class="day-number">{{ day?.date || '' }}</text>
        <view v-if="day?.assignments.length" class="day-dot" />
      </view>
    </view>

    <!-- 选中日期的排期列表 -->
    <scroll-view scroll-y class="day-detail" v-if="selectedDay">
      <view class="detail-title">{{ selectedDay.year }}年{{ selectedDay.month }}月{{ selectedDay.date }}日 排期</view>
      <view v-if="selectedDay.assignments.length > 0">
        <view
          v-for="item in selectedDay.assignments"
          :key="item.id"
          class="detail-card"
          @click="goDetail(item.id)"
        >
          <view class="detail-card-top">
            <text class="detail-name">{{ item.sku_title }}</text>
            <text class="detail-status" :style="statusStyle(item.status)">{{ item.status_label || item.status }}</text>
          </view>
          <view class="detail-time">
            <van-icon name="clock-o" size="28rpx" class="detail-info-icon" />
            <text>{{ item.start_time }}-{{ item.end_time }}</text>
          </view>
          <view class="detail-venue">
            <van-icon name="location-o" size="28rpx" class="detail-info-icon" />
            <text>{{ item.venue_name || item.venue }}</text>
          </view>
          <view class="detail-role">
            <van-icon name="coupon-o" size="28rpx" class="detail-info-icon" />
            <text>{{ item.role_name }} · ¥{{ item.fee }}</text>
          </view>
        </view>
      </view>
      <EmptyState v-else icon="calendar-o" title="该日暂无排期" description="选择其他日期查看排期" />
    </scroll-view>

    <!-- 无选中日期时提示 -->
    <view v-else class="day-detail-placeholder">
      <van-icon name="calendar-o" size="80rpx" class="empty-icon" />
      <text class="empty-text">点击日历中的日期查看排期详情</text>
    </view>

    <TabBar current="/pages/assignment/list" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAssignmentList } from '@/services/api';
import type { Assignment } from '@/types';

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1); // 1-12
const assignments = ref<Assignment[]>([]);
const selectedDay = ref<CalendarDay | null>(null);

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isToday: boolean;
  isSelected: boolean;
  assignments: Assignment[];
}

/**
 * 计算某个月有多少天
 */
function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/**
 * 获取某个月1号是星期几（0=日 ~ 6=六）
 */
function firstDayOfMonth(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay();
}

/**
 * 生成42格日历数据（6行×7列）
 */
const calendarDays = computed(() => {
  const y = year.value;
  const m = month.value;
  const totalDays = daysInMonth(y, m);
  const firstDay = firstDayOfMonth(y, m);

  // 上月补充天数
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const prevTotalDays = daysInMonth(prevYear, prevMonth);

  // 下月
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedStr = selectedDay.value
    ? `${String(selectedDay.value.year).padStart(4, '0')}-${String(selectedDay.value.month).padStart(2, '0')}-${String(selectedDay.value.date).padStart(2, '0')}`
    : '';

  // 按 show_date 建立索引
  const dateMap: Record<string, Assignment[]> = {};
  for (const a of assignments.value) {
    const sd = a.show_date;
    if (!dateMap[sd]) dateMap[sd] = [];
    dateMap[sd].push(a);
  }

  const days: (CalendarDay | null)[] = [];
  const totalCells = 42; // 6 rows

  for (let i = 0; i < totalCells; i++) {
    let d: number;
    let my: number, mm: number;

    if (i < firstDay) {
      // 上月
      d = prevTotalDays - firstDay + i + 1;
      my = prevYear;
      mm = prevMonth;
    } else if (i >= firstDay + totalDays) {
      // 下月
      d = i - firstDay - totalDays + 1;
      my = nextYear;
      mm = nextMonth;
    } else {
      // 本月
      d = i - firstDay + 1;
      my = y;
      mm = m;
    }

    const dateStr = `${String(my).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;

    days.push({
      date: d,
      month: mm,
      year: my,
      isToday,
      isSelected,
      assignments: dateMap[dateStr] || [],
    });
  }

  return days;
});

function selectDay(day: CalendarDay | null) {
  if (!day) return;
  selectedDay.value = day;
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/assignment/detail?id=${id}` });
}

function prevMonth() {
  if (month.value === 1) {
    month.value = 12;
    year.value -= 1;
  } else {
    month.value -= 1;
  }
  selectedDay.value = null;
  fetchAssignments();
}

function nextMonth() {
  if (month.value === 12) {
    month.value = 1;
    year.value += 1;
  } else {
    month.value += 1;
  }
  selectedDay.value = null;
  fetchAssignments();
}

function statusStyle(status: string) {
  const map: Record<string, string> = {
    '待确认': 'color: #f59e0b;',
    '已确认': 'color: #22c55e;',
    '已拒绝': 'color: #ef4444;',
    '已取消': 'color: #71717a;',
  };
  return map[status] || map['已取消'];
}

async function fetchAssignments() {
  const monthStr = `${year.value}-${String(month.value).padStart(2, '0')}`;
  try {
    const res = await getAssignmentList({ month: monthStr });
    if (res.ok && res.data) {
      assignments.value = res.data;
    }
  } catch (e) {
    console.error('加载排期失败:', e);
  }
}

onMounted(() => {
  fetchAssignments();
});
</script>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* ── 月份导航 ── */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  gap: 32rpx;
}

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  border-radius: 50%;
  /* 44pt 触控目标 */
  min-width: 88rpx;
  min-height: 88rpx;
}

.month-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* ── 星期头 ── */
.weekday-header {
  display: flex;
  padding: 0 12rpx;
  margin-bottom: 8rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  padding: 12rpx 0;
}

/* ── 日历网格 ── */
.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 12rpx;
}

.calendar-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  position: relative;
  border-radius: var(--radius-sm);
  /* 44pt 触控目标 */
  min-height: 88rpx;

  &.empty {
    opacity: 0.25;
    pointer-events: none;
  }

  &.today .day-number {
    background: var(--color-primary);
    color: #fff;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.active {
    background: rgba(167, 139, 250, 0.12);
  }

  &.hasEvent .day-number {
    font-weight: 600;
  }
}

.day-number {
  font-size: 28rpx;
  color: var(--color-text-primary);
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--color-primary);
  position: absolute;
  bottom: 8rpx;
}

/* ── 选中日期的详情 ── */
.day-detail {
  flex: 1;
  padding: 24rpx;
}

.day-detail-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 24rpx;
  gap: 16rpx;

  .empty-icon { display: flex; justify-content: center; }
  .empty-text { font-size: 28rpx; color: var(--color-text-secondary); }
}

.detail-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid var(--color-border);
}

.detail-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  padding: 24rpx;
  margin-bottom: 16rpx;

  .detail-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
  }

  .detail-name {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .detail-status {
    font-size: 22rpx;
    padding: 4rpx 14rpx;
    border-radius: var(--radius-xs);
    background: var(--color-bg-page);
  }

  .detail-time,
  .detail-venue,
  .detail-role {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
    line-height: 1.8;
  }
  .detail-info-icon { flex-shrink: 0; }
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 48rpx 0;
  font-size: 28rpx;
  color: var(--color-text-secondary);
}
.empty-hint-icon { flex-shrink: 0; }
</style>
