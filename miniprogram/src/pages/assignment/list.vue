<template>
  <view class="assign-list-page">
    <!-- 数据概览 -->
    <view class="stats-summary">
      <view class="stat-card">
        <text class="stat-value">{{ pendingCount }}</text>
        <text class="stat-label">待确认</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ todayCount }}</text>
        <text class="stat-label">今日演出</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">¥{{ pendingAmount }}</text>
        <text class="stat-label">待结算</text>
      </view>
    </view>
    <!-- 日历入口 -->
    <view class="calendar-entry" @click="goCalendar">
      <text class="cal-icon">📅</text>
      <view class="cal-info">
        <text class="cal-title">排期日历</text>
        <text class="cal-desc">查看月度演出日程</text>
      </view>
      <text class="cal-arrow">›</text>
    </view>
    <!-- 状态筛选 -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="status-tab"
        :class="{ active: activeStatus === tab.value }"
        @click="activeStatus = tab.value"
      >
        {{ tab.label }}
        <text v-if="tab.count" class="tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 排期列表 -->
    <scroll-view
      scroll-y
      class="assign-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading" class="loading-state">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </view>

      <template v-else-if="filteredList.length > 0">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="assign-card"
          :class="{ urgent: isUrgent(item) }"
          @click="goDetail(item.id)"
        >
          <!-- 状态标签 -->
          <view class="card-status" :style="{ background: statusStyle(item.status).bg, color: statusStyle(item.status).color }">
            {{ item.status_label || item.status }}
          </view>

          <!-- 演出信息 -->
          <view class="card-body">
            <view class="card-header">
              <text class="card-title">{{ item.sku_title }}</text>
              <text class="card-role">{{ item.role_name }}</text>
            </view>

            <view class="card-info">
              <view class="info-row">
                <text class="info-icon">📅</text>
                <text class="info-text">{{ item.show_date }} {{ item.start_time }}-{{ item.end_time }}</text>
              </view>
              <view class="info-row">
                <text class="info-icon">📍</text>
                <text class="info-text">{{ item.venue_name || item.venue }}</text>
              </view>
              <view class="info-row">
                <text class="info-icon">🏢</text>
                <text class="info-text">{{ item.company_name }}</text>
              </view>
            </view>

            <!-- 费用 -->
            <view class="card-fee">
              <text class="fee-label">演出费</text>
              <text class="fee-amount">¥{{ item.fee }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="card-actions" v-if="item.status === '待确认'">
            <van-button plain hairline type="danger" size="small" @click.stop="handleReject(item)">拒绝</van-button>
            <van-button type="primary" size="small" @click.stop="handleConfirm(item)">确认接单</van-button>
          </view>

          <!-- 截止时间 -->
          <view v-if="item.confirm_deadline && item.status === '待确认'" class="card-deadline">
            <view class="deadline-icon-wrap">
              <van-icon name="clock-o" size="24rpx" class="deadline-icon" />
              <text class="deadline-text">确认截止：{{ item.confirm_deadline }}</text>
            </view>
          </view>
        </view>
      </template>

      <EmptyState v-else icon="clock-o" title="还没有演出排期" description="等待运营为你分配演出任务" />
    </scroll-view>
    <TabBar current="/pages/assignment/list" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAssignmentList, confirmAssignment } from '@/services/api';
import type { Assignment } from '@/types';

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
  // 按日期排序，紧急的排前面
  return [...list].sort((a, b) => {
    if (a.status === '待确认' && b.status !== '待确认') return -1;
    if (a.status !== '待确认' && b.status === '待确认') return 1;
    return a.show_date.localeCompare(b.show_date);
  });
});

function statusStyle(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    '待确认': { bg: 'rgba(245,158,11,.15)', color: '#f59e0b' },
    '已确认': { bg: 'rgba(34,197,94,.15)', color: '#22c55e' },
    '已拒绝': { bg: 'rgba(239,68,68,.15)', color: '#ef4444' },
    '已取消': { bg: 'rgba(113,113,122,.15)', color: '#71717a' }
  };
  return map[status] || map['已取消'];
}

function isUrgent(item: Assignment): boolean {
  if (item.status !== '待确认' || !item.confirm_deadline) return false;
  const deadline = new Date(item.confirm_deadline).getTime();
  const now = Date.now();
  return (deadline - now) < 48 * 3600000; // 48小时内
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
.assign-list-page { height: 100vh; background: var(--color-bg-page); display: flex; flex-direction: column; overflow: hidden; }

.status-tabs {
  display: flex; background: var(--color-bg-card); padding: 16rpx 24rpx;
  border-bottom: 1rpx solid var(--color-border);

  .status-tab {
    flex: 1; text-align: center; padding: 14rpx 0; font-size: 26rpx; color: var(--color-text-secondary);
    border-radius: var(--radius-lg); position: relative;

    &.active { background: var(--color-primary); color: #fff; }

    .tab-count {
      font-size: 20rpx; background: rgba(255,255,255,.3); color: inherit;
      border-radius: 20rpx; padding: 2rpx 12rpx; margin-left: 6rpx;
    }
  }
}

.assign-list { flex: 1; padding: 20rpx 24rpx; }

.assign-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 24rpx; margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  position: relative; overflow: hidden;

  &.urgent { border: 2rpx solid var(--state-warning); }
}

.card-status {
  position: absolute; top: 0; right: 0; padding: 6rpx 20rpx;
  font-size: 22rpx; border-radius: 0 var(--radius-md) 0 var(--radius-md);
}

.card-body { margin-top: 8rpx; }

.card-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx;

  .card-title { font-size: 30rpx; font-weight: 600; color: var(--color-text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card-role {
    flex-shrink: 0; font-size: 24rpx; color: var(--color-primary-light);
    background: rgba(167,139,250,.15); padding: 4rpx 16rpx; border-radius: var(--radius-xs); margin-left: 12rpx;
  }
}

.card-info {
  margin-bottom: 16rpx;

  .info-row { display: flex; align-items: center; margin-bottom: 8rpx; }
  .info-icon { font-size: 24rpx; margin-right: 8rpx; }
  .info-text { font-size: 26rpx; color: var(--color-text-secondary); }
}

.card-fee {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx; background: rgba(239,68,68,.06); border-radius: var(--radius-xs);

  .fee-label { font-size: 24rpx; color: var(--color-text-tertiary); }
  .fee-amount { font-size: 32rpx; font-weight: 700; color: var(--state-error); }
}

.card-actions {
  display: flex; gap: 16rpx; margin-top: 20rpx;
}

.card-deadline {
  display: flex; align-items: center; margin-top: 12rpx;
  font-size: 22rpx; color: var(--state-warning);

  .deadline-icon { margin-right: 6rpx; }
}

.loading-state { padding: 20rpx 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0;
  .empty-icon { display: flex; justify-content: center; margin-bottom: 16rpx; }
  .empty-title { font-size: 32rpx; font-weight: 600; color: var(--color-primary); margin-bottom: 8rpx; }
  .empty-desc { font-size: 26rpx; color: var(--color-text-tertiary); }
}

.stats-summary {
  display: flex; gap: 16rpx; padding: 20rpx 24rpx;
}
.stat-card {
  flex: 1; background: var(--color-bg-card); border-radius: var(--radius-md);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  padding: 24rpx 16rpx; text-align: center;
}
.stat-value { font-size: 40rpx; font-weight: 800; color: var(--color-primary); display: block; }
.stat-label { font-size: 22rpx; color: var(--color-text-tertiary); margin-top: 4rpx; display: block; }

.calendar-entry {
  display: flex; align-items: center; margin: 0 24rpx 16rpx;
  padding: 24rpx; background: var(--color-bg-card); border-radius: var(--radius-md);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.cal-icon { font-size: 40rpx; margin-right: 20rpx; }
.cal-info { flex: 1; }
.cal-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); display: block; }
.cal-desc { font-size: 24rpx; color: var(--color-text-tertiary); margin-top: 4rpx; display: block; }
.cal-arrow { font-size: 40rpx; color: var(--color-text-tertiary); }
</style>
