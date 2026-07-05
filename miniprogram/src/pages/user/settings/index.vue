<template>
  <view class="settings-page">
    <van-cell-group :border="false">
      <van-cell title="账号注销" is-link @click="handleDeleteAccount" :border="false">
        <van-icon slot="icon" name="delete-o" size="36rpx" class="menu-icon" />
      </van-cell>
    </van-cell-group>

    <view class="version-info">
      <text class="version-label">当前版本</text>
      <text class="version-value">v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { deleteAccount } from '@/services/api';

async function handleDeleteAccount() {
  const res = await uni.showModal({
    title: '账号注销',
    content: '注销后所有数据将被清除且不可恢复，确定要注销吗？'
  });
  if (!res.confirm) return;

  uni.showLoading({ title: '注销中...' });
  try {
    const result = await deleteAccount();
    if (result.ok) {
      uni.hideLoading();
      uni.showToast({ title: '账号已注销', icon: 'success' });
      // 清空本地数据，跳回登录页
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      setTimeout(() => uni.reLaunch({ url: '/pages/login/index' }), 1500);
    } else {
      uni.hideLoading();
      uni.showToast({ title: result.error || '注销失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '注销异常', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh; background: var(--color-bg-page); padding: 24rpx;
}
.menu-icon { margin-right: 16rpx; }
.version-info {
  display: flex; justify-content: center; flex-direction: column;
  align-items: center; padding: 80rpx 0; gap: 8rpx;
  .version-label { font-size: 24rpx; color: var(--color-text-tertiary); }
  .version-value { font-size: 28rpx; color: var(--color-text-secondary); }
}
</style>
