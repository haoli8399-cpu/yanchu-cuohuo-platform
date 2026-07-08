<template>
  <view class="placeholder-page">
    <view class="placeholder-icon">⚙️</view>
    <text class="placeholder-title">设置</text>
    <text class="placeholder-desc">账户和偏好设置</text>
  </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.placeholder-page {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 70vh; padding: 40rpx;
}
.placeholder-icon { font-size: 100rpx; margin-bottom: 24rpx; }
.placeholder-title { font-size: 32rpx; font-weight: 700; color: #1a1a2e; margin-bottom: 12rpx; }
.placeholder-desc { font-size: 26rpx; color: #6b7280; }
</style>