<template>
  <view class="settlement-page">
    <!-- 月度筛选 -->
    <view class="month-picker">
      <view class="month-nav" @click="prevMonth">‹</view>
      <text class="month-display">{{ displayMonth }}</text>
      <view class="month-nav" @click="nextMonth">›</view>
    </view>

    <!-- 月度汇总 -->
    <view class="summary-card" v-if="summary.totalAmount > 0">
      <view class="summary-item">
        <text class="summary-value">¥{{ formatAmount(summary.totalAmount) }}</text>
        <text class="summary-label">月度收入</text>
      </view>
      <view class="summary-divider" />
      <view class="summary-item">
        <text class="summary-value">{{ summary.totalShows }}</text>
        <text class="summary-label">演出场次</text>
      </view>
    </view>

    <!-- 结算列表 -->
    <scroll-view
      scroll-y
      class="settlement-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading" class="loading-state">
        <view style="display:flex;justify-content:center;padding:80rpx 0">
          <van-loading size="48rpx" color="#7c3aed" />
        </view>
      </view>

      <template v-else-if="list.length > 0">
        <view
          v-for="item in list"
          :key="item.id"
          class="settlement-card"
        >
          <view class="card-header">
            <view>
              <text class="card-title">{{ item.sku_title }}</text>
              <text class="card-date">{{ item.show_date }}</text>
            </view>
            <view
              class="card-status"
              :style="{ background: statusStyle(item.status).bg, color: statusStyle(item.status).color }"
            >
              {{ item.status_label || item.status }}
            </view>
          </view>

          <!-- 费用明细 -->
          <view class="fee-detail">
            <view class="fee-row">
              <text class="fee-label">演出费</text>
              <text class="fee-value">+¥{{ item.fee }}</text>
            </view>
            <view class="fee-row" v-if="item.adjustment !== 0">
              <text class="fee-label">调整</text>
              <text class="fee-value" :class="item.adjustment > 0 ? 'positive' : 'negative'">
                {{ item.adjustment > 0 ? '+' : '' }}¥{{ item.adjustment }}
              </text>
            </view>
            <view class="fee-row total">
              <text class="fee-label">实收金额</text>
              <text class="fee-value total-amount">¥{{ item.final_amount }}</text>
            </view>
          </view>

          <view class="card-footer">
            <text class="footer-month">{{ item.settlement_month }} 结算</text>
            <text v-if="item.settled_at" class="footer-settled">
              发放于 {{ formatDate(item.settled_at) }}
            </text>
          </view>
        </view>
      </template>

      <EmptyState v-else icon="bill-o" title="暂无结算记录" description="演出完成后自动生成结算" />
    </scroll-view>
    <TabBar current="/pages/settlement/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { getSettlementList } from '@/services/api';
import type { SettlementRecord } from '@/types';

const loading = ref(true);
const refreshing = ref(false);
const currentMonth = ref('');
const list = ref<SettlementRecord[]>([]);

const summary = reactive({ totalAmount: 0, totalShows: 0 });

const displayMonth = computed(() => {
  const m = currentMonth.value;
  if (!m) return '';
  const [y, mo] = m.split('-');
  return `${y}年${parseInt(mo)}月`;
});

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function statusStyle(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    '待结算': { bg: 'rgba(245,158,11,.15)', color: '#f59e0b' },
    '已结算': { bg: 'rgba(59,130,246,.15)', color: '#3b82f6' },
    '已发放': { bg: 'rgba(34,197,94,.15)', color: '#22c55e' }
  };
  return map[status] || { bg: 'rgba(113,113,122,.15)', color: '#71717a' };
}

async function fetchSettlements() {
  loading.value = true;
  try {
    const res = await getSettlementList({ month: currentMonth.value || undefined });
    if (res.ok && res.data) {
      list.value = res.data;
      // 计算汇总
      summary.totalAmount = res.data.reduce((s, i) => s + i.final_amount, 0);
      summary.totalShows = res.data.length;
    }
  } catch (e) {
    console.error('加载结算失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await fetchSettlements();
}

function prevMonth() {
  const [y, m] = currentMonth.value.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth() {
  const [y, m] = currentMonth.value.split('-').map(Number);
  const d = new Date(y, m, 1);
  currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

watch(currentMonth, () => { fetchSettlements(); });

onMounted(() => {
  const now = new Date();
  currentMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});
</script>

<style lang="scss" scoped>
.settlement-page { min-height: 100vh; background: var(--color-bg-page); padding-bottom: 120rpx; }

.month-picker {
  display: flex; align-items: center; justify-content: center; padding: 24rpx;
  background: var(--color-bg-card); border-bottom: 1rpx solid var(--color-border);

  .month-nav { font-size: 40rpx; color: var(--color-primary); padding: 0 32rpx; }
  .month-display { font-size: 32rpx; font-weight: 700; color: var(--color-text-primary); min-width: 180rpx; text-align: center; }
}

.summary-card {
  display: flex; align-items: center; margin: 20rpx 24rpx;
  background: linear-gradient(135deg, #4c1d95, #7c3aed);
  border-radius: var(--radius-md); padding: 32rpx 0;

  .summary-item { flex: 1; text-align: center; }
  .summary-value { font-size: 40rpx; font-weight: 700; color: #fff; display: block; }
  .summary-label { font-size: 24rpx; color: rgba(255,255,255,.7); margin-top: 4rpx; display: block; }
  .summary-divider { width: 1rpx; height: 48rpx; background: rgba(255,255,255,.2); }
}

.settlement-list { padding: 0 24rpx 20rpx; }

.settlement-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx; margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}

.card-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20rpx;

  .card-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); display: block; }
  .card-date { font-size: 24rpx; color: var(--color-text-tertiary); display: block; margin-top: 4rpx; }

  .card-status {
    padding: 6rpx 16rpx; border-radius: var(--radius-xs); font-size: 22rpx; flex-shrink: 0;
  }
}

.fee-detail {
  margin-bottom: 16rpx; padding: 16rpx; background: var(--color-bg-page); border-radius: var(--radius-xs);

  .fee-row { display: flex; justify-content: space-between; padding: 6rpx 0;
    &.total { border-top: 1rpx solid var(--color-border); padding-top: 12rpx; margin-top: 8rpx; }
  }
  .fee-label { font-size: 24rpx; color: var(--color-text-tertiary); }
  .fee-value { font-size: 26rpx; color: var(--color-text-primary); font-weight: 500;
    &.positive { color: var(--state-success); }
    &.negative { color: var(--state-error); }
  }
  .total-amount { font-size: 32rpx; font-weight: 700; color: var(--state-error); }
}

.card-footer { display: flex; justify-content: space-between;
  .footer-month { font-size: 22rpx; color: var(--color-text-tertiary); }
  .footer-settled { font-size: 22rpx; color: var(--state-success); }
}

.loading-state { padding: 20rpx 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0;
  .empty-icon { display: flex; justify-content: center; margin-bottom: 16rpx; }
  .empty-title { font-size: 32rpx; font-weight: 600; color: var(--color-primary); margin-bottom: 8rpx; }
  .empty-desc { font-size: 26rpx; color: var(--color-text-tertiary); }
}
</style>
