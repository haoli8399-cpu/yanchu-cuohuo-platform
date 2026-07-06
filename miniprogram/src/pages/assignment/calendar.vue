// @ts-nocheck
<template>
  <view class="calendar-page">
    <CfNavBar title="排期日历" :showBack="true" backText="返回" />

    <!-- Month Selector -->
    <view class="calendar-page__month-selector">
      <text class="calendar-page__month-arrow" @click="prevMonth">&#x2039;</text>
      <text class="calendar-page__month-text">{{ year }}年{{ month }}月</text>
      <text class="calendar-page__month-arrow" @click="nextMonth">&#x203a;</text>
    </view>

    <!-- Weekday Header -->
    <view class="calendar-page__weekdays">
      <text v-for="d in weekdays" :key="d" class="calendar-page__weekday">{{ d }}</text>
    </view>

    <!-- Calendar Grid -->
    <view class="calendar-page__grid">
      <view
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="calendar-page__day"
        :class="{
          'calendar-page__day--other': !day?.currentMonth,
          'calendar-page__day--today': day?.isToday,
          'calendar-page__day--selected': day?.isSelected,
        }"
        @click="selectDay(day)"
      >
        <text class="calendar-page__day-num">{{ day?.date || '' }}</text>
        <view v-if="day?.assignments && day.assignments.length" class="calendar-page__day-dot" />
      </view>
    </view>

    <!-- Legend -->
    <view class="calendar-page__legend">
      <view class="calendar-page__legend-item">
        <view class="calendar-page__legend-dot calendar-page__legend-dot--confirmed" />
        <text>已确认</text>
      </view>
      <view class="calendar-page__legend-item">
        <view class="calendar-page__legend-dot calendar-page__legend-dot--pending" />
        <text>待确认</text>
      </view>
      <view class="calendar-page__legend-item">
        <view class="calendar-page__legend-dot calendar-page__legend-dot--completed" />
        <text>已完成</text>
      </view>
    </view>

    <!-- Selected Day Detail -->
    <scroll-view v-if="selectedDay" scroll-y class="calendar-page__detail">
      <text class="calendar-page__detail-title">{{ selectedDay.year }}年{{ selectedDay.month }}月{{ selectedDay.date }}日 排期</text>
      <view v-if="selectedDay.assignments.length > 0">
        <view
          v-for="item in selectedDay.assignments"
          :key="item.id"
          class="calendar-page__detail-card"
          @click="goDetail(item.id)"
        >
          <view class="calendar-page__detail-card-header">
            <text class="calendar-page__detail-card-name">{{ item.sku_title }}</text>
            <CfStatusTag :type="item.status" />
          </view>
          <view class="calendar-page__detail-card-row">
            <text class="calendar-page__detail-card-icon">🕐</text>
            <text class="calendar-page__detail-card-text">{{ item.start_time }}-{{ item.end_time }}</text>
          </view>
          <view class="calendar-page__detail-card-row">
            <text class="calendar-page__detail-card-icon">📍</text>
            <text class="calendar-page__detail-card-text">{{ item.venue_name || item.venue }}</text>
          </view>
          <view class="calendar-page__detail-card-row">
            <text class="calendar-page__detail-card-icon">💰</text>
            <text class="calendar-page__detail-card-text">{{ item.role_name }} · ¥{{ item.fee }}</text>
          </view>
        </view>
      </view>
      <CfEmptyState v-else icon="calendar-o" text="该日暂无排期" />
    </scroll-view>

    <!-- No Day Selected -->
    <view v-else class="calendar-page__placeholder">
      <text class="calendar-page__placeholder-icon">📅</text>
      <text class="calendar-page__placeholder-text">点击日历中的日期查看排期详情</text>
    </view>

    <TabBar current="/pages/assignment/list" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAssignmentList } from '@/services/api';
import type { Assignment } from '@/types';
import CfNavBar from '@/components/CfNavBar.vue';
import CfStatusTag from '@/components/CfStatusTag.vue';
import CfEmptyState from '@/components/CfEmptyState.vue';

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);
const assignments = ref<Assignment[]>([]);
const selectedDay = ref<CalendarDay | null>(null);

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  currentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  assignments: Assignment[];
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function firstDayOfMonth(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay();
}

const calendarDays = computed(() => {
  const y = year.value;
  const m = month.value;
  const totalDays = daysInMonth(y, m);
  const firstDay = firstDayOfMonth(y, m);

  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const prevTotalDays = daysInMonth(prevYear, prevMonth);

  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedStr = selectedDay.value
    ? `${String(selectedDay.value.year).padStart(4, '0')}-${String(selectedDay.value.month).padStart(2, '0')}-${String(selectedDay.value.date).padStart(2, '0')}`
    : '';

  const dateMap: Record<string, Assignment[]> = {};
  for (const a of assignments.value) {
    const sd = a.show_date;
    if (!dateMap[sd]) dateMap[sd] = [];
    dateMap[sd].push(a);
  }

  const days: CalendarDay[] = [];
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    let d: number;
    let my: number;
    let mm: number;
    let currentMonth = false;

    if (i < firstDay) {
      d = prevTotalDays - firstDay + i + 1;
      my = prevYear;
      mm = prevMonth;
    } else if (i >= firstDay + totalDays) {
      d = i - firstDay - totalDays + 1;
      my = nextYear;
      mm = nextMonth;
    } else {
      d = i - firstDay + 1;
      my = y;
      mm = m;
      currentMonth = true;
    }

    const dateStr = `${String(my).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;

    days.push({
      date: d,
      month: mm,
      year: my,
      currentMonth,
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
  background-color: $color-bg-page;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* Month Selector */
.calendar-page__month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-md $space-base;
  gap: $space-2xl;
}
.calendar-page__month-text {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  min-width: 200rpx;
  text-align: center;
}
.calendar-page__month-arrow {
  font-size: $text-2xl;
  color: $color-text-secondary;
  padding: $space-xs $space-sm;
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Weekday Header */
.calendar-page__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 $space-sm;
  margin-bottom: 8rpx;
}
.calendar-page__weekday {
  text-align: center;
  font-size: $text-sm;
  color: $color-text-tertiary;
  padding: $space-sm 0;
}

/* Grid */
.calendar-page__grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 $space-base;
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg $space-sm;
  box-shadow: $shadow-sm;
}

.calendar-page__day {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  position: relative;
  border-radius: $radius-sm;
  min-height: 88rpx;
  font-size: $text-base;
  color: $color-text-primary;

  &--other {
    color: $color-text-placeholder;
    opacity: .4;
  }
  &--today {
    background-color: $color-primary-bg;
    color: $color-primary;
    font-weight: 600;
  }
  &--selected {
    background-color: $color-primary;
    color: #fff !important;
    border-radius: 50%;
    font-weight: 600;
  }
}

.calendar-page__day-num {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-page__day-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: $color-primary;
  position: absolute;
  bottom: 8rpx;
}

/* Legend */
.calendar-page__legend {
  display: flex;
  justify-content: center;
  gap: $space-xl;
  padding: $space-md $space-base;
}
.calendar-page__legend-item {
  display: flex;
  align-items: center;
  gap: $space-xs;
  font-size: $text-sm;
  color: $color-text-secondary;
}
.calendar-page__legend-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;

  &--confirmed { background-color: $state-confirmed; }
  &--pending { background-color: $state-pending; }
  &--completed { background-color: $state-quoted; }
}

/* Detail */
.calendar-page__detail {
  flex: 1;
  padding: $space-md $space-base;
}
.calendar-page__detail-title {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-md;
  display: block;
  padding-bottom: $space-sm;
  border-bottom: 1rpx solid $color-border;
}

.calendar-page__detail-card {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  padding: $space-lg;
  margin-bottom: $space-md;
  border-left: 8rpx solid $color-primary;
}
.calendar-page__detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-sm;
}
.calendar-page__detail-card-name {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
}
.calendar-page__detail-card-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 4rpx;
}
.calendar-page__detail-card-icon {
  font-size: $text-sm;
  flex-shrink: 0;
}
.calendar-page__detail-card-text {
  font-size: $text-base;
  color: $color-text-secondary;
}

/* Placeholder */
.calendar-page__placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx $space-base;
  gap: $space-md;
}
.calendar-page__placeholder-icon {
  font-size: 80rpx;
}
.calendar-page__placeholder-text {
  font-size: $text-md;
  color: $color-text-secondary;
}
</style>
