<template>
  <view class="credit-page">
    <!-- 信誉分圆环 -->
    <view class="score-hero">
      <view class="score-ring">
        <view class="ring-bg" />
        <view class="ring-fill" :style="{ background: `conic-gradient(${levelColor} ${scorePercent * 3.6}deg, transparent ${scorePercent * 3.6}deg)` }" />
        <view class="ring-inner">
          <text class="score-value">{{ creditData.total_score }}</text>
          <text class="score-label">信誉分</text>
          <text class="score-level" :style="{ color: levelColor }">{{ creditData.level_label || creditData.level }}</text>
        </view>
      </view>
    </view>

    <!-- 维度评分 -->
    <view class="dimensions-card">
      <view class="section-title">评分维度</view>
      <view class="dimension-list">
        <view class="dimension-item">
          <view class="dim-header">
            <text class="dim-label">守时</text>
            <text class="dim-score" :style="{ color: scoreColor(creditData.punctuality_score) }">
              {{ creditData.punctuality_score }}
            </text>
          </view>
          <view class="dim-bar">
            <view class="dim-fill" :style="{ width: creditData.punctuality_score + '%', background: scoreBarColor(creditData.punctuality_score) }" />
          </view>
        </view>
        <view class="dimension-item">
          <view class="dim-header">
            <text class="dim-label">专业度</text>
            <text class="dim-score" :style="{ color: scoreColor(creditData.professionalism_score) }">
              {{ creditData.professionalism_score }}
            </text>
          </view>
          <view class="dim-bar">
            <view class="dim-fill" :style="{ width: creditData.professionalism_score + '%', background: scoreBarColor(creditData.professionalism_score) }" />
          </view>
        </view>
        <view class="dimension-item">
          <view class="dim-header">
            <text class="dim-label">表演</text>
            <text class="dim-score" :style="{ color: scoreColor(creditData.performance_score) }">
              {{ creditData.performance_score }}
            </text>
          </view>
          <view class="dim-bar">
            <view class="dim-fill" :style="{ width: creditData.performance_score + '%', background: scoreBarColor(creditData.performance_score) }" />
          </view>
        </view>
        <view class="dimension-item">
          <view class="dim-header">
            <text class="dim-label">沟通</text>
            <text class="dim-score" :style="{ color: scoreColor(creditData.communication_score) }">
              {{ creditData.communication_score }}
            </text>
          </view>
          <view class="dim-bar">
            <view class="dim-fill" :style="{ width: creditData.communication_score + '%', background: scoreBarColor(creditData.communication_score) }" />
          </view>
        </view>
      </view>
    </view>

    <!-- 信誉历史 -->
    <view class="history-card">
      <view class="section-title">信誉记录</view>
      <view v-if="creditData.history && creditData.history.length > 0" class="history-list">
        <view
          v-for="(item, idx) in creditData.history"
          :key="item.id || idx"
          class="history-item"
        >
          <view class="history-left">
            <view class="history-dot" :class="item.score_change > 0 ? 'positive' : 'negative'" />
            <view v-if="idx < creditData.history.length - 1" class="history-line" />
          </view>
          <view class="history-content">
            <view class="history-header">
              <text class="history-event">{{ item.event }}</text>
              <text
                class="history-change"
                :class="item.score_change > 0 ? 'positive' : 'negative'"
              >
                {{ item.score_change > 0 ? '+' : '' }}{{ item.score_change }}
              </text>
            </view>
            <text class="history-reason">{{ item.reason }}</text>
            <text class="history-date">{{ item.date }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>暂无信誉记录</text>
      </view>
    </view>

    <!-- 说明 -->
    <view class="info-card">
      <view class="section-title">信誉分说明</view>
      <view class="info-item">
        <text class="info-dot excellent" />
        <text class="info-text">优秀 850-1000：优先派单、更高演出费</text>
      </view>
      <view class="info-item">
        <text class="info-dot good" />
        <text class="info-text">良好 700-849：正常接单</text>
      </view>
      <view class="info-item">
        <text class="info-dot normal" />
        <text class="info-text">一般 500-699：部分限制</text>
      </view>
      <view class="info-item">
        <text class="info-dot poor" />
        <text class="info-text">较差 0-499：暂停接单</text>
      </view>
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
.credit-page { min-height: 100vh; background: var(--color-bg-page); padding: 20rpx 24rpx; padding-bottom: 120rpx; }

.score-hero {
  display: flex; align-items: center; justify-content: center; padding: 48rpx 0;

  .score-ring {
    width: 280rpx; height: 280rpx; position: relative; display: flex; align-items: center; justify-content: center;

    .ring-bg {
      position: absolute; inset: 0; border-radius: 50%;
      background: var(--color-bg-card);
    }

    .ring-fill {
      position: absolute; inset: 10rpx; border-radius: 50%;
      mask: radial-gradient(transparent 55%, #000 56%);
      -webkit-mask: radial-gradient(transparent 55%, #000 56%);
    }

    .ring-inner {
      position: absolute; inset: 20rpx; border-radius: 50%; background: var(--color-bg-page);
      display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1;

      .score-value { font-size: 72rpx; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
      .score-label { font-size: 22rpx; color: var(--color-text-tertiary); margin-top: 4rpx; }
      .score-level { font-size: 26rpx; font-weight: 600; margin-top: 8rpx; }
    }
  }
}

.dimensions-card, .history-card, .info-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);

  .section-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); margin-bottom: 20rpx; }
}

.dimension-list {
  .dimension-item { margin-bottom: 20rpx;
    &:last-child { margin-bottom: 0; }
  }

  .dim-header { display: flex; justify-content: space-between; margin-bottom: 10rpx; }
  .dim-label { font-size: 26rpx; color: var(--color-text-secondary); }
  .dim-score { font-size: 26rpx; font-weight: 700; }

  .dim-bar { height: 12rpx; background: var(--color-bg-page); border-radius: 6rpx; overflow: hidden; }
  .dim-fill { height: 100%; border-radius: 6rpx; transition: width .6s ease; }
}

.history-list {
  .history-item { display: flex; padding-left: 20rpx; }

  .history-left { position: relative; margin-right: 20rpx;
    .history-dot {
      width: 16rpx; height: 16rpx; border-radius: 50%; margin-top: 6rpx;
      &.positive { background: #22c55e; }
      &.negative { background: #ef4444; }
    }
    .history-line { position: absolute; top: 26rpx; left: 7rpx; width: 2rpx; height: calc(100% - 8rpx); background: var(--color-border); }
  }

  .history-content { flex: 1; padding-bottom: 28rpx;
    .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6rpx; }
    .history-event { font-size: 26rpx; color: var(--color-text-primary); font-weight: 500; }
    .history-change { font-size: 26rpx; font-weight: 700;
      &.positive { color: #22c55e; }
      &.negative { color: #ef4444; }
    }
    .history-reason { font-size: 24rpx; color: var(--color-text-secondary); display: block; }
    .history-date { font-size: 22rpx; color: var(--color-text-tertiary); display: block; margin-top: 4rpx; }
  }
}

.info-card {
  .info-item { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx;
    &:last-child { margin-bottom: 0; }
  }
  .info-dot { width: 16rpx; height: 16rpx; border-radius: 50%; flex-shrink: 0;
    &.excellent { background: #22c55e; }
    &.good { background: #3b82f6; }
    &.normal { background: #f59e0b; }
    &.poor { background: #ef4444; }
  }
  .info-text { font-size: 24rpx; color: var(--color-text-secondary); }
}

.empty-state { padding: 40rpx 0; text-align: center; color: var(--color-text-tertiary); }
</style>
