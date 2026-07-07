<template>
  <view class="order-page">
    <CfNavBar title="订单详情" :showBack="true" backText="返回" />

    <scroll-view scroll-y class="order-page__scroll" :show-scrollbar="false">
      <view class="state-card">
        <view class="state-chain">
          <block v-for="(node, index) in states" :key="node.key">
            <view class="state-node" :class="`state-node--${node.tone}`">
              <text>{{ node.key }}</text>
            </view>
            <text v-if="index < states.length - 1" class="state-arrow">→</text>
          </block>
        </view>
      </view>

      <view class="order-card">
        <view class="order-card__header">
          <text class="order-card__title">XX科技年会</text>
          <CfStatusTag type="confirmed" />
        </view>
        <view class="order-card__row">
          <text class="order-card__label">方案</text>
          <text class="order-card__value">脱口秀标准版 · T3 · 60min</text>
        </view>
        <view class="order-card__row">
          <text class="order-card__label">时间</text>
          <text class="order-card__value">10月20日 · 300人</text>
        </view>
        <view class="order-card__row">
          <text class="order-card__label">报价</text>
          <text class="order-card__price">¥6,000</text>
        </view>
      </view>

      <view class="won-card">
        <view class="won-card__glow" />
        <view class="won-card__check">
          <text>✓</text>
        </view>
        <text class="won-card__title">已成交</text>
        <view class="won-card__grid">
          <view v-for="item in wonStats" :key="item.label" class="won-card__stat">
            <text class="won-card__stat-label">{{ item.label }}</text>
            <text class="won-card__stat-value">{{ item.value }}</text>
          </view>
        </view>
        <view class="won-card__action" @tap="viewFullOrder">
          <text>查看完整订单</text>
        </view>
      </view>

      <view class="action-row">
        <view class="action-row__btn action-row__btn--ghost" @tap="inviteReview">
          <text>邀请评价</text>
        </view>
        <view class="action-row__btn action-row__btn--primary" @tap="contactAgent">
          <text>联系小演</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'

const states = [
  { key: 'new', tone: 'new' },
  { key: 'qualified', tone: 'qualified' },
  { key: 'quoted', tone: 'quoted' },
  { key: 'negotiating', tone: 'negotiating' },
  { key: 'pending', tone: 'pending' },
  { key: 'won', tone: 'won' },
]

const wonStats = [
  { label: '收益', value: '¥3,500' },
  { label: '评价', value: '待评价' },
  { label: '转化', value: '3 天' },
  { label: '周期', value: '行业平均 5 天' },
]

function viewFullOrder() {
  uni.showToast({ title: '订单信息已展开', icon: 'none' })
}

function inviteReview() {
  uni.showToast({ title: '已生成评价邀请', icon: 'success' })
}

function contactAgent() {
  uni.showToast({ title: '小演已接入', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__scroll {
    height: 100vh;
  }
}

.state-card,
.order-card,
.won-card {
  margin: $space-md $space-base 0;
  border-radius: $radius-md;
}

.state-card {
  padding: $space-sm;
  background: $color-bg-card;
  border: 1rpx solid $color-border;
}

.state-chain {
  display: flex;
  align-items: center;
  gap: 6rpx;
  overflow-x: auto;
}

.state-node {
  flex-shrink: 0;
  height: 44rpx;
  padding: 0 12rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  color: $color-text-inverse;
  font-size: $text-xs;
  font-weight: 800;

  &--new { background: $color-text-tertiary; }
  &--qualified { background: $color-info; }
  &--quoted { background: $color-primary; }
  &--negotiating { background: $color-warning; }
  &--pending { background: $state-pending; }
  &--won { background: $color-success; }
}

.state-arrow {
  color: $color-text-tertiary;
  font-size: $text-xs;
}

.order-card {
  padding: $space-md;
  border: 1rpx solid $color-border;
  background: $color-bg-card;
  box-shadow: $shadow-sm;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-sm;
    margin-bottom: $space-sm;
  }

  &__title {
    color: $color-text-primary;
    font-size: $text-lg;
    font-weight: 800;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: $space-md;
    padding: $space-xs 0;
  }

  &__label {
    color: $color-text-secondary;
    font-size: $text-sm;
  }

  &__value {
    color: $color-text-primary;
    font-size: $text-sm;
    text-align: right;
  }

  &__price {
    color: $color-primary;
    font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: $text-md;
    font-weight: 800;
  }
}

.won-card {
  position: relative;
  overflow: hidden;
  padding: $space-xl $space-md $space-md;
  background: $color-stage-dark;
  color: $color-text-inverse;
  text-align: center;

  &__glow {
    position: absolute;
    top: -80rpx;
    left: 50%;
    width: 300rpx;
    height: 180rpx;
    border-radius: 50%;
    transform: translateX(-50%);
    background: rgba($color-primary, 0.45);
    filter: blur(36rpx);
  }

  &__check {
    position: relative;
    z-index: 1;
    width: 80rpx;
    height: 80rpx;
    margin: 0 auto $space-sm;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-success;
    font-size: $text-2xl;
    font-weight: 800;
  }

  &__title {
    position: relative;
    z-index: 1;
    display: block;
    font-size: $text-xl;
    font-weight: 800;
  }

  &__grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-sm;
    margin-top: $space-md;
  }

  &__stat {
    padding: $space-sm;
    border: 1rpx solid rgba($color-text-inverse, 0.16);
    border-radius: $radius-sm;
    background: rgba($color-text-inverse, 0.08);
  }

  &__stat-label,
  &__stat-value {
    display: block;
  }

  &__stat-label {
    color: rgba($color-text-inverse, 0.64);
    font-size: $text-xs;
  }

  &__stat-value {
    margin-top: 2rpx;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 800;
  }

  &__action {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 56rpx;
    margin-top: $space-md;
    padding: 0 $space-lg;
    border-radius: $radius-full;
    background: $color-primary;
    font-size: $text-xs;
    font-weight: 800;
  }
}

.action-row {
  display: flex;
  gap: $space-sm;
  padding: $space-md $space-base $space-xl;

  &__btn {
    flex: 1;
    height: 72rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-base;
    font-weight: 800;
  }

  &__btn--ghost {
    border: 2rpx solid $color-primary;
    color: $color-primary;
    background: $color-bg-card;
  }

  &__btn--primary {
    background: $color-primary;
    color: $color-text-inverse;
  }
}
</style>
