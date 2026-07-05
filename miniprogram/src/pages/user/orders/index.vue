<template>
  <view class="orders-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" size="48rpx" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空态 -->
    <view v-else-if="list.length === 0" class="empty-state">
      <van-icon name="orders-o" size="80rpx" color="#d4d4d8" />
      <text class="empty-text">暂无订单记录</text>
      <text class="empty-desc">提交演出需求后可在订单中查看进度</text>
    </view>

    <!-- 订单列表 -->
    <scroll-view v-else scroll-y class="order-list" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <!-- 状态切换 -->
      <view class="status-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="status-tab"
          :class="{ active: selectedStatus === tab.value }"
          @click="onTabChange(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>

      <view v-for="order in filteredList" :key="order.id" class="order-card" @click="goDetail(order.id)">
        <view class="order-header">
          <text class="order-title">{{ order.sku_title }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">{{ order.status_label || order.status }}</text>
        </view>
        <view class="order-info">
          <text class="order-date">📅 {{ order.performance_date }}</text>
          <text class="order-venue">📍 {{ order.venue }}</text>
        </view>
        <view class="order-footer">
          <text class="order-price" v-if="order.quote_amount">¥{{ order.quote_amount }}</text>
          <text class="order-price" v-else>待报价</text>
          <text class="order-time">{{ formatTime(order.created_at) }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDemandList } from '@/services/api';
import type { DemandRequest } from '@/types';

const list = ref<DemandRequest[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const selectedStatus = ref('');

const tabs = [
  { label: '全部', value: '' },
  { label: '待报价', value: '待报价' },
  { label: '已报价', value: '已报价' },
  { label: '已签约', value: '已签约' },
  { label: '已完成', value: '已完成' },
];

const statusClassMap: Record<string, string> = {
  '待报价': 'status-pending',
  '已报价': 'status-quoted',
  '待确认': 'status-pending-confirm',
  '已确认': 'status-confirmed',
  '已签约': 'status-contracted',
  '已完成': 'status-completed',
  '已取消': 'status-cancelled',
};

function getStatusClass(status: string): string {
  return statusClassMap[status] || '';
}

const filteredList = computed(() => {
  if (!selectedStatus.value) return list.value;
  return list.value.filter(o => o.status === selectedStatus.value);
});

async function fetchOrders() {
  try {
    const res = await getDemandList();
    if (res.ok) list.value = res.data || [];
  } catch (e) {
    console.error('加载订单失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await fetchOrders();
}

function onTabChange(status: string) {
  selectedStatus.value = status;
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/request/detail?id=${id}` });
}

function formatTime(iso: string) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

onMounted(() => fetchOrders());
</script>

<style lang="scss" scoped>
.orders-page { min-height: 100vh; background: var(--color-bg-page); }

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 60vh; gap: 16rpx;
  .loading-text { font-size: 28rpx; color: var(--color-text-tertiary); }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 160rpx 0; gap: 16rpx;
  .empty-text { font-size: 30rpx; color: var(--color-text-secondary); font-weight: 500; }
  .empty-desc { font-size: 24rpx; color: var(--color-text-tertiary); }
}

.order-list { height: 100vh; padding-bottom: 40rpx; }

.status-tabs {
  display: flex; padding: 16rpx 32rpx; gap: 12rpx; background: var(--color-bg-page);
  border-bottom: 1rpx solid var(--color-border); overflow-x: auto; white-space: nowrap;

  .status-tab {
    flex-shrink: 0; padding: 8rpx 24rpx; border-radius: var(--radius-md);
    font-size: 26rpx; color: var(--color-text-secondary);
    background: var(--color-bg-card); border: 1rpx solid var(--color-border);

    &.active { color: #fff; background: var(--color-primary); border-color: var(--color-primary); }
  }
}

.order-card {
  margin: 20rpx 32rpx; background: var(--color-bg-card); border-radius: var(--radius-lg);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  padding: 24rpx;

  .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;
    .order-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 16rpx; }
    .order-status { font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 8rpx; white-space: nowrap;
      &.status-pending { background: rgba(245,158,11,.15); color: #f59e0b; }
      &.status-quoted { background: rgba(59,130,246,.15); color: #3b82f6; }
      &.status-pending-confirm { background: rgba(167,139,250,.15); color: #7c3aed; }
      &.status-confirmed { background: rgba(34,197,94,.15); color: #22c55e; }
      &.status-contracted { background: rgba(34,197,94,.15); color: #16a34a; }
      &.status-completed { background: rgba(34,197,94,.15); color: #15803d; }
      &.status-cancelled { background: rgba(239,68,68,.15); color: #ef4444; }
    }
  }

  .order-info { display: flex; gap: 16rpx; font-size: 24rpx; color: var(--color-text-secondary); }
  .order-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx solid var(--color-border);
    .order-price { font-size: 28rpx; font-weight: 700; color: var(--state-error); }
    .order-time { font-size: 22rpx; color: var(--color-text-tertiary); }
  }
}
</style>
