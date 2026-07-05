<template>
  <view class="skeleton-card">
    <view class="skeleton-line w-60" />
    <view class="skeleton-line w-40" />
    <view class="skeleton-line w-80" />
    <view class="skeleton-line w-50" />
  </view>
</template>
<style lang="scss" scoped>
.skeleton-card {
  background: var(--color-bg-card); border-radius: var(--radius-lg); padding: 28rpx;
  margin-bottom: 20rpx;
}
.skeleton-line {
  height: 28rpx; border-radius: 6rpx;
  background: linear-gradient(90deg, var(--skeleton-shimmer-start) 25%, var(--skeleton-shimmer-mid) 50%, var(--skeleton-shimmer-start) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 16rpx;
  &:last-child { margin-bottom: 0; }
}
.w-60 { width: 60%; } .w-40 { width: 40%; } .w-80 { width: 80%; } .w-50 { width: 50%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
