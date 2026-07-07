<template>
  <view class="user-page page-with-tabbar">
    <!-- Profile Header -->
    <view class="user-page__header">
      <view class="user-page__profile">
        <image src="/static/images/performer-avatar.jpg" mode="aspectFill" class="user-page__avatar" />
        <view class="user-page__info">
          <text class="user-page__name">星辰文化传媒</text>
          <view class="user-page__badges">
            <view class="user-page__badge user-page__badge--role"><text>活动公司</text></view>
            <view class="user-page__badge user-page__badge--verified"><text>认证企业</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Data Overview -->
    <view class="user-page__overview card">
      <view class="user-page__overview-item">
        <text class="user-page__overview-num">12</text>
        <text class="user-page__overview-label">需求总数</text>
      </view>
      <view class="user-page__overview-divider" />
      <view class="user-page__overview-item">
        <text class="user-page__overview-num user-page__overview-num--pending">5</text>
        <text class="user-page__overview-label">进行中</text>
      </view>
      <view class="user-page__overview-divider" />
      <view class="user-page__overview-item">
        <text class="user-page__overview-num user-page__overview-num--confirmed">7</text>
        <text class="user-page__overview-label">已签约</text>
      </view>
    </view>

    <!-- Menu Group 1 -->
    <view class="user-page__menu card">
      <view v-for="item in menuGroup1" :key="item.label" class="user-page__menu-item" @tap="handleMenuTap(item)">
        <view class="user-page__menu-icon" :style="{ backgroundColor: item.iconBg }">
          <text>{{ item.icon }}</text>
        </view>
        <text class="user-page__menu-text">{{ item.label }}</text>
        <text class="user-page__menu-arrow">></text>
      </view>
    </view>

    <!-- Menu Group 2 -->
    <view class="user-page__menu card">
      <view v-for="item in menuGroup2" :key="item.label" class="user-page__menu-item" @tap="handleMenuTap(item)">
        <view class="user-page__menu-icon" :style="{ backgroundColor: item.iconBg }">
          <text>{{ item.icon }}</text>
        </view>
        <text class="user-page__menu-text">{{ item.label }}</text>
        <text class="user-page__menu-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const menuGroup1 = [
  { label: '我的需求', icon: '📋', iconBg: '#f5f3ff' },
  { label: '我的收藏', icon: '❤️', iconBg: '#fef2f2' },
  { label: '历史订单', icon: '🕐', iconBg: '#eff6ff' },
  { label: '企业信息', icon: '🏢', iconBg: '#f0fdf4' },
  { label: '发票管理', icon: '🧾', iconBg: '#fffbeb' },
]

const menuGroup2 = [
  { label: '联系客服', icon: '🎧', iconBg: '#eef2ff' },
  { label: '意见反馈', icon: '✉️', iconBg: '#f0fdf4' },
  { label: '关于我们', icon: 'ℹ️', iconBg: '#f5f3ff' },
  { label: '设置', icon: '⚙️', iconBg: '#f5f5f7' },
]

function handleMenuTap(item: typeof menuGroup1[0]) {
  uni.showToast({ title: item.label, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.user-page {
  &__header {
    background: linear-gradient(135deg, $color-primary, $color-primary-active);
    padding: $space-xl $space-base 80rpx;
  }

  &__profile { display: flex; align-items: center; }

  &__avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    margin-right: $space-lg;
  }

  &__name { font-size: $text-xl; font-weight: 600; color: #fff; display: block; margin-bottom: $space-xs; }

  &__badges { display: flex; gap: $space-sm; }
  &__badge { padding: 4rpx 16rpx; border-radius: $radius-full; font-size: $text-xs; }
  &__badge--role { background: rgba(255,255,255,0.2); color: #fff; }
  &__badge--verified { background: #fbbf24; color: $color-text-primary; }

  &__overview {
    margin-top: -48rpx;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  &__overview-item { flex: 1; text-align: center; }
  &__overview-num { font-size: $text-3xl; font-weight: 700; color: $color-text-primary; display: block; }
  &__overview-num--pending { color: $state-pending; }
  &__overview-num--confirmed { color: $state-confirmed; }
  &__overview-label { font-size: $text-xs; color: $color-text-tertiary; margin-top: 4rpx; display: block; }
  &__overview-divider { width: 1rpx; height: 48rpx; background-color: $color-divider; }

  &__menu {
    padding: 0 !important;
    overflow: hidden;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    padding: $space-lg $space-lg;
    border-bottom: 1rpx solid $color-divider;
    &:last-child { border-bottom: none; }
    &:active { background-color: $color-bg-page; }
  }

  &__menu-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-right: $space-md;
  }

  &__menu-text { flex: 1; font-size: $text-md; color: $color-text-primary; }
  &__menu-arrow { color: $color-text-placeholder; font-size: $text-sm; }
}
</style>
