<template>
  <view class="assignment-list-page">
    <!-- Stats -->
    <view class="assignment-list-page__stats">
      <view class="assignment-list-page__stat-card">
        <text class="assignment-list-page__stat-num assignment-list-page__stat-num--pending">{{ pendingCount }}</text>
        <text class="assignment-list-page__stat-label">待确认</text>
      </view>
      <view class="assignment-list-page__stat-card">
        <text class="assignment-list-page__stat-num assignment-list-page__stat-num--today">{{ todayCount }}</text>
        <text class="assignment-list-page__stat-label">今日演出</text>
      </view>
      <view class="assignment-list-page__stat-card">
        <text class="assignment-list-page__stat-num assignment-list-page__stat-num--settlement">¥{{ pendingAmount }}</text>
        <text class="assignment-list-page__stat-label">待结算</text>
      </view>
    </view>

    <!-- Calendar Entry -->
    <view class="assignment-list-page__calendar-entry" @click="goCalendar">
      <text class="assignment-list-page__calendar-icon">📅</text>
      <view class="assignment-list-page__calendar-info">
        <text class="assignment-list-page__calendar-title">排期日历</text>
        <text class="assignment-list-page__calendar-desc">查看月度演出日程</text>
      </view>
      <text class="assignment-list-page__calendar-arrow">›</text>
    </view>

    <!-- Status Tabs -->
    <view class="assignment-list-page__tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="assignment-list-page__tab"
        :class="{ 'assignment-list-page__tab--active': activeStatus === tab.value }"
        @click="activeStatus = tab.value"
      >
        {{ tab.label }}
        <text v-if="tab.count" class="assignment-list-page__tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <!-- Assignment List -->
    <scroll-view
      scroll-y
      class="assignment-list-page__list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading" class="assignment-list-page__loading">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </view>

      <template v-else-if="filteredList.length > 0">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="assignment-list-page__card"
          :class="`assignment-list-page__card--${item.status === '待确认' ? 'pending' : item.status === '已确认' ? 'confirmed' : item.status === '已拒绝' ? 'rejected' : 'completed'}`"
          @click="goDetail(item.id)"
        >
          <view class="assignment-list-page__card-header">
            <text class="assignment-list-page__card-title">{{ item.sku_title }}</text>
            <CfStatusTag :type="item.status" />
          </view>

          <view class="assignment-list-page__card-body">
            <view class="assignment-list-page__card-info">
              <text class="assignment-list-page__card-info-icon">📅</text>
              <text class="assignment-list-page__card-info-text">{{ item.show_date }} {{ item.start_time }}-{{ item.end_time }}</text>
            </view>
            <view class="assignment-list-page__card-info">
              <text class="assignment-list-page__card-info-icon">📍</text>
              <text class="assignment-list-page__card-info-text">{{ item.venue_name || item.venue }}</text>
            </view>
            <view class="assignment-list-page__card-info">
              <text class="assignment-list-page__card-info-icon">🏢</text>
              <text class="assignment-list-page__card-info-text">{{ item.company_name }}</text>
            </view>
          </view>

          <view class="assignment-list-page__card-footer">
            <view class="assignment-list-page__card-fee">
              <text class="assignment-list-page__card-fee-label">演出费</text>
              <text class="assignment-list-page__card-fee-amount">¥{{ item.fee }}</text>
            </view>
            <text class="assignment-list-page__card-role">{{ item.role_name }}</text>
          </view>

          <!-- Actions for pending -->
          <view v-if="item.status === '待确认'" class="assignment-list-page__card-actions">
            <button class="assignment-list-page__btn assignment-list-page__btn--reject" size="mini" @click.stop="handleReject(item)">拒绝</button>
            <button class="assignment-list-page__btn assignment-list-page__btn--accept" size="mini" @click.stop="handleConfirm(item)">确认接单</button>
          </view>

          <!-- Deadline warning -->
          <view v-if="item.confirm_deadline && item.status === '待确认'" class="assignment-list-page__card-deadline">
            <text class="assignment-list-page__card-deadline-icon">⏰</text>
            <text class="assignment-list-page__card-deadline-text">确认截止：{{ item.confirm_deadline }}</text>
          </view>
        </view>
      </template>

      <CfEmptyState v-else icon="clock-o" text="还没有演出排期" />
    </scroll-view>

    <TabBar current="/pages/assignment/list" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAssignmentList, confirmAssignment } from '@/services/api';
import type { Assignment } from '@/types';
import CfStatusTag from '@/components/CfStatusTag.vue';
import CfEmptyState from '@/components/CfEmptyState.vue';

const loading = ref(true);
const refreshing = ref(false);
const activeStatus = ref('');
const assignments = ref<Assignment[]>([]);

const statusTabs = [
  { label: '全部', value: '', count: 0 },
  { label: '待确认', value: '待确认', count: 0 },
  { label: '已确认', value: '已确认', count: 0 },
  { label: '已拒绝', value: '已拒绝', count: 0 }
];

const pendingCount = computed(() => assignments.value.filter(a => a.status === '待确认').length);
const todayCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return assignments.value.filter(a => a.show_date === today && a.status !== '已拒绝').length;
});
const pendingAmount = computed(() => {
  return assignments.value
    .filter(a => a.status === '已确认')
    .reduce((sum, a) => sum + a.fee, 0);
});

const filteredList = computed(() => {
  let list = assignments.value;
  if (activeStatus.value) {
    list = list.filter(a => a.status === activeStatus.value);
  }
  return [...list].sort((a, b) => {
    if (a.status === '待确认' && b.status !== '待确认') return -1;
    if (a.status !== '待确认' && b.status === '待确认') return 1;
    return a.show_date.localeCompare(b.show_date);
  });
});

function isUrgent(item: Assignment): boolean {
  if (item.status !== '待确认' || !item.confirm_deadline) return false;
  const deadline = new Date(item.confirm_deadline).getTime();
  const now = Date.now();
  return (deadline - now) < 48 * 3600000;
}

async function fetchAssignments() {
  loading.value = true;
  try {
    const res = await getAssignmentList();
    if (res.ok && res.data) {
      assignments.value = res.data;
    }
  } catch (e) {
    console.error('加载排期失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await fetchAssignments();
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/assignment/detail?id=${id}` });
}

function goCalendar() {
  uni.navigateTo({ url: '/pages/assignment/calendar' });
}

async function handleConfirm(item: Assignment) {
  uni.showModal({
    title: '确认接单',
    content: `确认接受"${item.sku_title}"的演出任务？\n日期：${item.show_date}\n角色：${item.role_name}\n费用：¥${item.fee}`,
    success: async (res) => {
      if (res.confirm) {
        const result = await confirmAssignment(item.id, 'confirm');
        if (result.ok) {
          item.status = '已确认';
          item.status_label = '已确认';
          uni.showToast({ title: '已确认接单', icon: 'success' });
        }
      }
    }
  });
}

async function handleReject(item: Assignment) {
  uni.showModal({
    title: '拒绝原因',
    editable: true,
    placeholderText: '请输入拒绝原因（时间冲突/不适配等）',
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content || '';
        const result = await confirmAssignment(item.id, 'reject', reason);
        if (result.ok) {
          item.status = '已拒绝';
          item.status_label = '已拒绝';
          item.reject_reason = reason;
          uni.showToast({ title: '已拒绝', icon: 'none' });
        }
      }
    }
  });
}

onMounted(() => { fetchAssignments(); });
</script>

<style lang="scss" scoped>
.assignment-list-page {
  height: 100vh;
  background-color: $color-bg-page;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Stats */
.assignment-list-page__stats {
  display: flex;
  gap: $space-sm;
  padding: $space-md $space-base;
}
.assignment-list-page__stat-card {
  flex: 1;
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-md $space-sm;
  text-align: center;
  box-shadow: $shadow-sm;
}
.assignment-list-page__stat-label {
  font-size: $text-xs;
  color: $color-text-tertiary;
  display: block;
  margin-top: 8rpx;
}
.assignment-list-page__stat-num {
  font-size: $text-3xl;
  font-weight: 700;
  display: block;
}
.assignment-list-page__stat-num--pending { color: $state-pending; }
.assignment-list-page__stat-num--today { color: $color-primary; }
.assignment-list-page__stat-num--settlement { color: $state-error; }

/* Calendar Entry */
.assignment-list-page__calendar-entry {
  display: flex;
  align-items: center;
  margin: 0 $space-base $space-md;
  padding: $space-lg;
  background-color: $color-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
}
.assignment-list-page__calendar-icon { font-size: 40rpx; margin-right: $space-lg; }
.assignment-list-page__calendar-info { flex: 1; }
.assignment-list-page__calendar-title { font-size: $text-md; font-weight: 600; color: $color-text-primary; display: block; }
.assignment-list-page__calendar-desc { font-size: $text-sm; color: $color-text-tertiary; margin-top: 4rpx; display: block; }
.assignment-list-page__calendar-arrow { font-size: 40rpx; color: $color-text-tertiary; }

/* Tabs */
.assignment-list-page__tabs {
  display: flex;
  background-color: $color-bg-card;
  padding: 16rpx $space-base;
  border-bottom: 1rpx solid $color-border;
}
.assignment-list-page__tab {
  flex: 1;
  text-align: center;
  padding: 14rpx 0;
  font-size: $text-sm;
  color: $color-text-secondary;
  border-radius: $radius-lg;
  position: relative;
  &.assignment-list-page__tab--active {
    background-color: $color-primary;
    color: #fff;
  }
}
.assignment-list-page__tab-count {
  font-size: 20rpx;
  background-color: rgba(255,255,255,.3);
  color: inherit;
  border-radius: 20rpx;
  padding: 2rpx 12rpx;
  margin-left: 6rpx;
}

/* List */
.assignment-list-page__list {
  flex: 1;
  padding: $space-md $space-base;
}

.assignment-list-page__loading {
  padding: $space-md 0;
}

/* Cards */
.assignment-list-page__card {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
  border-left: 8rpx solid $color-border;
  position: relative;
  overflow: hidden;

  &--pending { border-left-color: $state-pending; }
  &--confirmed { border-left-color: $state-confirmed; }
  &--rejected { border-left-color: $state-cancelled; }
  &--completed { border-left-color: $state-quoted; }
}

.assignment-list-page__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-sm;
}
.assignment-list-page__card-title {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  flex: 1;
  margin-right: $space-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignment-list-page__card-body {
  margin-bottom: $space-md;
}
.assignment-list-page__card-info {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}
.assignment-list-page__card-info-icon {
  font-size: $text-sm;
  margin-right: 8rpx;
  flex-shrink: 0;
}
.assignment-list-page__card-info-text {
  font-size: $text-base;
  color: $color-text-secondary;
}

.assignment-list-page__card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-sm $space-md;
  background-color: $color-bg-page;
  border-radius: $radius-xs;
}
.assignment-list-page__card-fee-label {
  font-size: $text-xs;
  color: $color-text-tertiary;
}
.assignment-list-page__card-fee-amount {
  font-size: $text-xl;
  font-weight: 700;
  color: $state-error;
  margin-left: 8rpx;
}
.assignment-list-page__card-role {
  font-size: $text-sm;
  color: $color-primary;
  background-color: $color-primary-bg;
  padding: 4rpx 16rpx;
  border-radius: $radius-xs;
}

/* Actions */
.assignment-list-page__card-actions {
  display: flex;
  gap: $space-md;
  margin-top: $space-md;
  justify-content: flex-end;
}
.assignment-list-page__btn {
  border-radius: $radius-full;
  border: none;
  padding: 0 40rpx;
  height: 64rpx;
  font-size: $text-sm;
  line-height: 64rpx;

  &--accept {
    background-color: $state-confirmed;
    color: #fff;
  }
  &--reject {
    background-color: transparent;
    color: $state-cancelled;
    border: 2rpx solid $state-cancelled;
  }
}

/* Deadline */
.assignment-list-page__card-deadline {
  display: flex;
  align-items: center;
  margin-top: $space-sm;
  font-size: $text-xs;
  color: $state-warning;
}
.assignment-list-page__card-deadline-icon {
  margin-right: 6rpx;
}
.assignment-list-page__card-deadline-text {
  font-size: $text-xs;
  color: $state-warning;
}
</style>
