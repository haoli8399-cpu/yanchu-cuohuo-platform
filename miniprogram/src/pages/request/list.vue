<template>
  <view class="demand-list-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">我的需求</text>
      <view class="nav-add" @click="goSubmit">
        <text class="nav-add-btn">+</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-value primary">{{ stats.total }}</text>
        <text class="stat-label">全部</text>
      </view>
      <view class="stat-card">
        <text class="stat-value warning">{{ stats.active }}</text>
        <text class="stat-label">进行中</text>
      </view>
      <view class="stat-card">
        <text class="stat-value success">{{ stats.signed }}</text>
        <text class="stat-label">已签约</text>
      </view>
    </view>

    <!-- 状态筛选 Tabs -->
    <scroll-view scroll-x class="filter-tabs" show-scrollbar="false">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: selectedStatus === tab.value }"
        @click="onStatusChange(tab.value)"
      >
        {{ tab.label }}
      </view>
    </scroll-view>

    <!-- 需求列表 -->
    <scroll-view
      scroll-y
      class="demand-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading && demandList.length === 0" class="loading-state">
        <van-loading type="spinner" size="48rpx" />
        <text class="loading-text">加载中...</text>
      </view>

      <template v-else-if="demandList.length > 0">
        <view
          v-for="item in demandList"
          :key="item.id"
          class="demand-card"
          :class="{ cancelled: item.status === 'cancelled' }"
          @click="goDetail(item.id)"
        >
          <!-- 标题 + 状态 -->
          <view class="card-header">
            <text class="card-title">{{ item.title || item.sku_title }}</text>
            <CfStatusTag :type="item.status" />
          </view>
          <!-- 信息行 -->
          <view class="card-info-row">演出类型：{{ item.category_label || item.sku_title }}</view>
          <view class="card-info-row">期望时间：{{ item.event_date }}</view>
          <view class="card-info-row">预算范围：¥{{ formatPrice(item.budget_min) }} - ¥{{ formatPrice(item.budget_max) }}</view>
          <!-- 底部 -->
          <view class="card-footer">
            <text class="card-time">提交于 {{ item.created_at }}</text>
            <text v-if="item.status === 'quoted'" class="card-view-quote">查看方案 ></text>
          </view>
        </view>
      </template>

      <EmptyState v-else icon="todo-list-o" title="暂无需求" description="去发现页选方案或提交新需求" />

      <!-- 底部间距 -->
      <view style="height: 140rpx;"></view>
    </scroll-view>

    <TabBar current="/pages/request/list" />
    <FloatingPhone />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getDemandList } from '@/services/api';
import { formatPrice } from '@/utils/format';
import CfStatusTag from '@/components/CfStatusTag.vue';

const demandList = ref<any[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const selectedStatus = ref('');

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待报价', value: 'pending' },
  { label: '已报价', value: 'quoted' },
  { label: '已确认', value: 'confirmed' },
  { label: '已签约', value: 'signed' },
  { label: '已取消', value: 'cancelled' },
];

const stats = reactive({
  total: 0,
  active: 0,
  signed: 0,
});

function onStatusChange(val: string) {
  selectedStatus.value = val;
  fetchDemands(true, val);
}

async function fetchDemands(reset = false, status = '') {
  if (!reset && loading.value) return;
  loading.value = true;
  try {
    const params: any = { page: 1, pageSize: 50 };
    if (status) params.status = status;
    const res = await getDemandList(params);
    if (res.ok) {
      const list = res.data || [];
      demandList.value = list;
      // 更新统计
      stats.total = list.length;
      stats.active = list.filter((d: any) => ['pending', 'quoted', 'confirmed'].includes(d.status)).length;
      stats.signed = list.filter((d: any) => d.status === 'signed').length;
    }
  } catch (e) {
    console.error('加载需求失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await fetchDemands(true, selectedStatus.value);
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/request/detail?id=${id}` });
}

function goSubmit() {
  uni.navigateTo({ url: '/pages/request/submit' });
}

onMounted(() => { fetchDemands(true); });
</script>

<style lang="scss" scoped>
.demand-list-page {
  height: 100vh;
  background: var(--color-bg-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: var(--color-bg-card);
  position: relative;
  border-bottom: 1rpx solid var(--color-divider);
  .nav-title { font-size: 34rpx; font-weight: 600; color: var(--color-text-primary); }
  .nav-add {
    position: absolute;
    right: 24rpx;
    top: 50%;
    transform: translateY(-50%);
    .nav-add-btn {
      width: 64rpx; height: 64rpx;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      line-height: 1;
    }
  }
}

// 统计概览
.stats-row {
  display: flex;
  gap: $space-sm;
  margin: $space-md $space-base;

  .stat-card {
    flex: 1;
    background: $color-bg-card;
    border-radius: $radius-md;
    padding: $space-lg $space-sm;
    text-align: center;
    box-shadow: $shadow-sm;

    .stat-value {
      font-size: $text-3xl;
      font-weight: 700;
      display: block;
      &.primary { color: $color-primary; }
      &.warning { color: $state-warning; }
      &.success { color: $state-success; }
    }
    .stat-label {
      font-size: $text-xs;
      color: $color-text-tertiary;
      margin-top: 4rpx;
      display: block;
    }
  }
}

// 状态筛选
.filter-tabs {
  white-space: nowrap;
  margin: 0 $space-base $space-sm;
  .filter-tab {
    display: inline-block;
    padding: 12rpx $space-lg;
    border-radius: $radius-full;
    font-size: $text-base;
    font-weight: 500;
    background: $color-divider;
    color: $color-text-secondary;
    margin-right: $space-sm;
    &.active {
      background: $color-primary;
      color: $color-text-inverse;
    }
  }
}

.demand-list {
  flex: 1;
  padding: 0 $space-base;
}

.demand-card {
  background: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
  transition: opacity 0.15s;

  &.cancelled { opacity: 0.55; }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-sm;

  .card-title {
    font-size: $text-md;
    font-weight: 500;
    color: $color-text-primary;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: $space-sm;
  }
}

.card-info-row {
  font-size: $text-base;
  color: $color-text-secondary;
  line-height: 1.8;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $space-md;
  padding-top: $space-md;
  border-top: 1rpx solid $color-divider;

  .card-time { font-size: $text-sm; color: $color-text-tertiary; }
  .card-view-quote { font-size: $text-base; color: $color-primary; font-weight: 500; }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  gap: $space-sm;
  .loading-text { font-size: $text-base; color: $color-text-tertiary; }
}
</style>
