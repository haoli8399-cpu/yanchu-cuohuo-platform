<template>
  <view class="settlement-page">
    <CfNavBar title="结算记录" />
    
    <!-- Monthly Summary -->
    <view class="settlement-page__summary" v-if="summary.totalAmount > 0">
      <view class="settlement-page__summary-item">
        <text class="settlement-page__summary-num settlement-page__summary-num--total">¥{{ formatAmount(summary.totalAmount) }}</text>
        <text class="settlement-page__summary-label">月度收入</text>
      </view>
      <view class="settlement-page__summary-divider" />
      <view class="settlement-page__summary-item">
        <text class="settlement-page__summary-num settlement-page__summary-num--shows">{{ summary.totalShows }}</text>
        <text class="settlement-page__summary-label">演出场次</text>
      </view>
    </view>

    <!-- Month Selector -->
    <view class="settlement-page__month-selector">
      <text class="settlement-page__month-arrow" @click="prevMonth">&#x2039;</text>
      <text class="settlement-page__month-text">{{ displayMonth }}</text>
      <text class="settlement-page__month-arrow" @click="nextMonth">&#x203a;</text>
    </view>

    <!-- Settlement List -->
    <scroll-view
      scroll-y
      class="settlement-page__list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading" class="settlement-page__loading">
        <text class="settlement-page__loading-text">加载中...</text>
      </view>

      <template v-else-if="list.length > 0">
        <view
          v-for="item in list"
          :key="item.id"
          class="settlement-page__card"
        >
          <view class="settlement-page__card-header">
            <view class="settlement-page__card-header-left">
              <text class="settlement-page__card-title">{{ item.sku_title }}</text>
              <text class="settlement-page__card-date">{{ item.show_date }}</text>
            </view>
            <view class="settlement-page__card-header-right">
              <text class="settlement-page__card-amount">¥{{ item.final_amount }}</text>
              <CfStatusTag :type="item.status" />
            </view>
          </view>

          <!-- Fee Detail -->
          <view class="settlement-page__card-fee">
            <view class="settlement-page__card-fee-row">
              <text class="settlement-page__card-fee-label">演出费</text>
              <text class="settlement-page__card-fee-value">+¥{{ item.fee }}</text>
            </view>
            <view v-if="item.adjustment !== 0" class="settlement-page__card-fee-row">
              <text class="settlement-page__card-fee-label">调整</text>
              <text class="settlement-page__card-fee-value" :class="item.adjustment > 0 ? 'settlement-page__card-fee-value--positive' : 'settlement-page__card-fee-value--negative'">
                {{ item.adjustment > 0 ? '+' : '' }}¥{{ item.adjustment }}
              </text>
            </view>
            <view class="settlement-page__card-fee-row settlement-page__card-fee-row--total">
              <text class="settlement-page__card-fee-label">实收金额</text>
              <text class="settlement-page__card-fee-value settlement-page__card-fee-value--total">¥{{ item.final_amount }}</text>
            </view>
          </view>

          <view class="settlement-page__card-footer">
            <text class="settlement-page__card-footer-month">{{ item.settlement_month }} 结算</text>
            <text v-if="item.settled_at" class="settlement-page__card-footer-date">
              发放于 {{ formatDate(item.settled_at) }}
            </text>
          </view>
        </view>
      </template>

      <CfEmptyState v-else icon="bill-o" text="暂无结算记录" />
    </scroll-view>

    <TabBar current="/pages/settlement/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { getSettlementList } from '@/services/api';
import type { SettlementRecord } from '@/types';
import CfStatusTag from '@/components/CfStatusTag.vue';
import CfEmptyState from '@/components/CfEmptyState.vue';
import CfNavBar from '@/components/CfNavBar.vue';

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

async function fetchSettlements() {
  loading.value = true;
  try {
    const res = await getSettlementList({ month: currentMonth.value || undefined });
    if (res.ok && res.data) {
      list.value = res.data;
      summary.totalAmount = res.data.reduce((s: number, i: SettlementRecord) => s + i.final_amount, 0);
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
.settlement-page {
  min-height: 100vh;
  background-color: $color-bg-page;
  padding-bottom: 120rpx;
}

/* Summary */
.settlement-page__summary {
  display: flex;
  align-items: center;
  margin: $space-md $space-base;
  background: linear-gradient(135deg, $color-primary-dark, $color-primary);
  border-radius: $radius-md;
  padding: $space-2xl 0;
  box-shadow: $shadow-md;
}
.settlement-page__summary-item {
  flex: 1;
  text-align: center;
}
.settlement-page__summary-num {
  font-size: $text-3xl;
  font-weight: 700;
  color: #fff;
  display: block;
}
.settlement-page__summary-num--total {
  font-size: 48rpx;
}
.settlement-page__summary-num--shows {
  color: rgba(255,255,255,.9);
}
.settlement-page__summary-label {
  font-size: $text-sm;
  color: rgba(255,255,255,.7);
  margin-top: 4rpx;
  display: block;
}
.settlement-page__summary-divider {
  width: 1rpx;
  height: 48rpx;
  background-color: rgba(255,255,255,.2);
}

/* Month Selector */
.settlement-page__month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-md $space-base;
  gap: $space-2xl;
}
.settlement-page__month-text {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
}
.settlement-page__month-arrow {
  font-size: $text-2xl;
  color: $color-text-secondary;
  padding: $space-xs;
  min-width: 88rpx;
  text-align: center;
}

/* List */
.settlement-page__list {
  padding: 0 $space-base;
}

.settlement-page__loading {
  padding: 80rpx 0;
  text-align: center;
}
.settlement-page__loading-text {
  font-size: $text-md;
  color: $color-text-tertiary;
}

/* Card */
.settlement-page__card {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
}

.settlement-page__card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $space-md;
}
.settlement-page__card-header-left {
  flex: 1;
}
.settlement-page__card-title {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  display: block;
}
.settlement-page__card-date {
  font-size: $text-sm;
  color: $color-text-tertiary;
  display: block;
  margin-top: 4rpx;
}
.settlement-page__card-header-right {
  display: flex;
  align-items: center;
  gap: $space-sm;
  flex-shrink: 0;
}
.settlement-page__card-amount {
  font-size: $text-lg;
  font-weight: 600;
  color: $color-primary;
}

/* Fee Detail */
.settlement-page__card-fee {
  margin-bottom: $space-md;
  padding: $space-md;
  background-color: $color-bg-page;
  border-radius: $radius-xs;
}
.settlement-page__card-fee-row {
  display: flex;
  justify-content: space-between;
  padding: 6rpx 0;
  &--total {
    border-top: 1rpx solid $color-border;
    padding-top: $space-sm;
    margin-top: 8rpx;
  }
}
.settlement-page__card-fee-label {
  font-size: $text-sm;
  color: $color-text-tertiary;
}
.settlement-page__card-fee-value {
  font-size: $text-base;
  color: $color-text-primary;
  font-weight: 500;
  &--positive { color: $state-success; }
  &--negative { color: $state-error; }
  &--total { font-size: $text-xl; font-weight: 700; color: $state-error; }
}

/* Card Footer */
.settlement-page__card-footer {
  display: flex;
  justify-content: space-between;
}
.settlement-page__card-footer-month {
  font-size: $text-xs;
  color: $color-text-tertiary;
}
.settlement-page__card-footer-date {
  font-size: $text-xs;
  color: $state-confirmed;
}
</style>
