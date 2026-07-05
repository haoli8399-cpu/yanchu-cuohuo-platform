<template>
  <view class="admin-dashboard">
    <view class="dashboard-header">
      <text class="page-title">运营后台</text>
      <text class="page-subtitle">管理演出方案和分类</text>
    </view>

    <view class="menu-grid">
      <view class="menu-card" @click="goSKU">
        <view class="menu-icon purple">
          <van-icon name="music-o" size="48rpx" color="#7c3aed" />
        </view>
        <text class="menu-title">SKU 管理</text>
        <text class="menu-desc">新增、编辑、上架/下架演出方案</text>
      </view>

      <view class="menu-card" @click="goCategories">
        <view class="menu-icon blue">
          <van-icon name="label-o" size="48rpx" color="#3b82f6" />
        </view>
        <text class="menu-title">分类管理</text>
        <text class="menu-desc">维护演出方案分类标签</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goSKU() {
  uni.navigateTo({ url: '/pages/admin/sku/index' });
}
function goCategories() {
  uni.navigateTo({ url: '/pages/admin/categories/index' });
}
</script>

<style lang="scss" scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding: 24rpx;
}
.dashboard-header {
  padding: 32rpx 0;
  .page-title { font-size: 40rpx; font-weight: 700; color: var(--color-text-primary); }
  .page-subtitle { font-size: 26rpx; color: var(--color-text-tertiary); margin-top: 8rpx; }
}
.menu-grid {
  display: flex; flex-direction: column; gap: 24rpx;
}
.menu-card {
  background: var(--color-bg-card); border-radius: var(--radius-md);
  padding: 36rpx 32rpx; display: flex; flex-direction: column; gap: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  &:active { opacity: .85; }

  .menu-icon {
    width: 80rpx; height: 80rpx; border-radius: 20rpx;
    display: flex; align-items: center; justify-content: center;
    &.purple { background: #f3e8ff; }
    &.blue { background: #dbeafe; }
  }
  .menu-title { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary); }
  .menu-desc { font-size: 26rpx; color: var(--color-text-tertiary); line-height: 1.5; }
}
</style>
