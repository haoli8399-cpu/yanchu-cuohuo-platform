<template>
  <view class="credit-page">
    <!-- Score Hero -->
    <view class="credit-page__hero">
      <view class="credit-page__circle">
        <view class="credit-page__circle-ring" :style="{ background: `conic-gradient(${levelColor} ${scorePercent * 3.6}deg, $color-primary-subtle ${scorePercent * 3.6}deg)` }">
          <view class="credit-page__circle-inner">
            <text class="credit-page__circle-score">{{ creditData.total_score }}</text>
            <text class="credit-page__circle-label">信誉分</text>
          </view>
        </view>
      </view>
      <text class="credit-page__level" :style="{ color: levelColor }">{{ creditData.level_label || creditData.level }}</text>

      <!-- Badges -->
      <view class="credit-page__badges">
        <text class="credit-page__badge credit-page__badge--green">准时率 98%</text>
        <text class="credit-page__badge credit-page__badge--green">履约率 100%</text>
        <text class="credit-page__badge credit-page__badge--green">好评率 95%</text>
      </view>
    </view>

    <!-- Score Breakdown -->
    <view class="credit-page__card">
      <text class="credit-page__card-title">评分维度</text>
      <view class="credit-page__dimension">
        <view class="credit-page__dimension-header">
          <text class="credit-page__dimension-label">守时</text>
          <text class="credit-page__dimension-score" :style="{ color: scoreColor(creditData.punctuality_score) }">
            {{ creditData.punctuality_score }}
          </text>
        </view>
        <view class="credit-page__dimension-bar">
          <view class="credit-page__dimension-fill" :style="{ width: creditData.punctuality_score + '%', background: scoreBarColor(creditData.punctuality_score) }" />
        </view>
      </view>
      <view class="credit-page__dimension">
        <view class="credit-page__dimension-header">
          <text class="credit-page__dimension-label">专业度</text>
          <text class="credit-page__dimension-score" :style="{ color: scoreColor(creditData.professionalism_score) }">
            {{ creditData.professionalism_score }}
          </text>
        </view>
        <view class="credit-page__dimension-bar">
          <view class="credit-page__dimension-fill" :style="{ width: creditData.professionalism_score + '%', background: scoreBarColor(creditData.professionalism_score) }" />
        </view>
      </view>
      <view class="credit-page__dimension">
        <view class="credit-page__dimension-header">
          <text class="credit-page__dimension-label">表演</text>
          <text class="credit-page__dimension-score" :style="{ color: scoreColor(creditData.performance_score) }">
            {{ creditData.performance_score }}
          </text>
        </view>
        <view class="credit-page__dimension-bar">
          <view class="credit-page__dimension-fill" :style="{ width: creditData.performance_score + '%', background: scoreBarColor(creditData.performance_score) }" />
        </view>
      </view>
      <view class="credit-page__dimension">
        <view class="credit-page__dimension-header">
          <text class="credit-page__dimension-label">沟通</text>
          <text class="credit-page__dimension-score" :style="{ color: scoreColor(creditData.communication_score) }">
            {{ creditData.communication_score }}
          </text>
        </view>
        <view class="credit-page__dimension-bar">
          <view class="credit-page__dimension-fill" :style="{ width: creditData.communication_score + '%', background: scoreBarColor(creditData.communication_score) }" />
        </view>
      </view>
    </view>

    <!-- Credit History -->
    <view class="credit-page__card">
      <text class="credit-page__card-title">信誉变动记录</text>
      <view v-if="creditData.history && creditData.history.length > 0" class="credit-page__timeline">
        <view
          v-for="(item, idx) in creditData.history"
          :key="item.id || idx"
          class="credit-page__timeline-item"
        >
          <view class="credit-page__timeline-left">
            <view
              class="credit-page__timeline-dot"
              :class="item.score_change > 0 ? 'credit-page__timeline-dot--up' : 'credit-page__timeline-dot--down'"
            />
            <view v-if="idx < creditData.history.length - 1" class="credit-page__timeline-line" />
          </view>
          <view class="credit-page__timeline-content">
            <view class="credit-page__timeline-header">
              <text class="credit-page__timeline-event">{{ item.event }}</text>
              <text
                class="credit-page__timeline-change"
                :class="item.score_change > 0 ? 'credit-page__timeline-change--up' : 'credit-page__timeline-change--down'"
              >
                {{ item.score_change > 0 ? '+' : '' }}{{ item.score_change }}分
              </text>
            </view>
            <text class="credit-page__timeline-reason">{{ item.reason }}</text>
            <text class="credit-page__timeline-date">{{ item.date }}</text>
          </view>
        </view>
      </view>
      <view v-else class="credit-page__empty">
        <text>暂无信誉记录</text>
      </view>
    </view>

    <!-- Info -->
    <view class="credit-page__card">
      <text class="credit-page__card-title">信誉分说明</text>
      <view class="credit-page__info-item">
        <text class="credit-page__info-dot credit-page__info-dot--excellent" />
        <text class="credit-page__info-text">优秀 850-1000：优先派单、更高演出费</text>
      </view>
      <view class="credit-page__info-item">
        <text class="credit-page__info-dot credit-page__info-dot--good" />
        <text class="credit-page__info-text">良好 700-849：正常接单</text>
      </view>
      <view class="credit-page__info-item">
        <text class="credit-page__info-dot credit-page__info-dot--normal" />
        <text class="credit-page__info-text">一般 500-699：部分限制</text>
      </view>
      <view class="credit-page__info-item">
        <text class="credit-page__info-dot credit-page__info-dot--poor" />
        <text class="credit-page__info-text">较差 0-499：暂停接单</text>
      </view>
    </view>

    <!-- Tip -->
    <view class="credit-page__tip">
      <text>信誉分影响接单优先级和咖位晋升，请保持良好的演出记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCreditScore } from '@/services/api';
import type { CreditScore } from '@/types';

const creditData = ref<CreditScore>({
  actor_id: '',
  total_score: 0,
  level: '一般',
  punctuality_score: 0,
  performance_score: 0,
  communication_score: 0,
  professionalism_score: 0,
  history: [],
  updated_at: ''
});

const scorePercent = computed(() =>
  Math.min(100, Math.max(0, creditData.value.total_score / 10))
);

const levelColor = computed(() => {
  const score = creditData.value.total_score;
  if (score >= 850) return '#22c55e';
  if (score >= 700) return '#3b82f6';
  if (score >= 500) return '#f59e0b';
  return '#ef4444';
});

function scoreColor(val: number): string {
  if (val >= 85) return '#22c55e';
  if (val >= 70) return '#3b82f6';
  if (val >= 50) return '#f59e0b';
  return '#ef4444';
}

function scoreBarColor(val: number): string {
  if (val >= 85) return 'linear-gradient(90deg, #22c55e, #4ade80)';
  if (val >= 70) return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
  if (val >= 50) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  return 'linear-gradient(90deg, #ef4444, #f87171)';
}

async function fetchCredit() {
  try {
    const res = await getCreditScore();
    if (res.ok && res.data) {
      creditData.value = res.data;
    }
  } catch (e) {
    console.error('加载信誉分失败:', e);
  }
}

onMounted(() => { fetchCredit(); });
</script>

<style lang="scss" scoped>
.credit-page {
  min-height: 100vh;
  background-color: $color-bg-page;
  padding: $space-md $space-base;
  padding-bottom: $space-2xl;
}

/* Hero */
.credit-page__hero {
  text-align: center;
  padding: $space-2xl $space-base $space-xl;
}
.credit-page__circle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-lg;
}
.credit-page__circle-ring {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.credit-page__circle-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: $color-bg-page;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.credit-page__circle-score {
  font-size: 72rpx;
  font-weight: 800;
  color: $color-text-primary;
  line-height: 1;
}
.credit-page__circle-label {
  font-size: $text-sm;
  color: $color-text-tertiary;
  margin-top: 4rpx;
}

.credit-page__level {
  font-size: $text-lg;
  font-weight: 600;
  display: block;
  margin-bottom: $space-lg;
}

.credit-page__badges {
  display: flex;
  justify-content: center;
  gap: $space-md;
  flex-wrap: wrap;
}
.credit-page__badge {
  font-size: $text-sm;
  padding: 6rpx 20rpx;
  border-radius: $radius-full;
  &--green {
    color: $state-confirmed;
    background-color: $state-confirmed-bg;
  }
}

/* Cards */
.credit-page__card {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
}
.credit-page__card-title {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-lg;
  display: block;
}

/* Dimensions */
.credit-page__dimension {
  margin-bottom: $space-md;
  &:last-child { margin-bottom: 0; }
}
.credit-page__dimension-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}
.credit-page__dimension-label {
  font-size: $text-base;
  color: $color-text-secondary;
}
.credit-page__dimension-score {
  font-size: $text-base;
  font-weight: 700;
}
.credit-page__dimension-bar {
  height: 12rpx;
  background-color: $color-bg-page;
  border-radius: $radius-full;
  overflow: hidden;
}
.credit-page__dimension-fill {
  height: 100%;
  border-radius: $radius-full;
  transition: width .6s ease;
}

/* Timeline */
.credit-page__timeline {
  padding-left: $space-xl;
  border-left: 4rpx solid $color-primary-subtle;
}
.credit-page__timeline-item {
  display: flex;
  padding-bottom: $space-lg;
  position: relative;
}
.credit-page__timeline-left {
  position: relative;
  margin-right: $space-md;
}
.credit-page__timeline-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  position: absolute;
  left: calc(-#{$space-xl} - 10rpx);
  top: 4rpx;
  &--up { background-color: $state-confirmed; }
  &--down { background-color: $state-error; }
}
.credit-page__timeline-line {
  position: absolute;
  left: calc(-#{$space-xl} - 3rpx);
  top: 16rpx;
  width: 2rpx;
  height: calc(100% + 8rpx);
  background-color: $color-border;
}
.credit-page__timeline-content {
  flex: 1;
  padding-left: $space-sm;
}
.credit-page__timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}
.credit-page__timeline-event {
  font-size: $text-base;
  font-weight: 500;
  color: $color-text-primary;
}
.credit-page__timeline-change {
  font-size: $text-base;
  font-weight: 700;
  &--up { color: $state-confirmed; }
  &--down { color: $state-error; }
}
.credit-page__timeline-reason {
  font-size: $text-sm;
  color: $color-text-secondary;
  display: block;
}
.credit-page__timeline-date {
  font-size: $text-xs;
  color: $color-text-tertiary;
  display: block;
  margin-top: 4rpx;
}

.credit-page__empty {
  padding: $space-xl 0;
  text-align: center;
  color: $color-text-tertiary;
  font-size: $text-md;
}

/* Info */
.credit-page__info-item {
  display: flex;
  align-items: center;
  gap: $space-sm;
  margin-bottom: $space-sm;
  &:last-child { margin-bottom: 0; }
}
.credit-page__info-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
  &--excellent { background-color: $state-confirmed; }
  &--good { background-color: #3b82f6; }
  &--normal { background-color: $state-pending; }
  &--poor { background-color: $state-error; }
}
.credit-page__info-text {
  font-size: $text-sm;
  color: $color-text-secondary;
}

/* Tip */
.credit-page__tip {
  margin: $space-md 0;
  padding: $space-md $space-lg;
  background-color: $color-bg-input;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $color-text-secondary;
  text-align: center;
}
</style>
