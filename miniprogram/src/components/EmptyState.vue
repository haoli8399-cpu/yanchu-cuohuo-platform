<template>
  <view class="empty-state">
    <van-icon :name="icon" size="96rpx" :color="iconColor" />
    <text class="empty-title">{{ title }}</text>
    <text class="empty-desc">{{ description }}</text>
    <van-button v-if="actionText" type="primary" size="small" round @click="$emit('action')">
      {{ actionText }}
    </van-button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  iconColor?: string;
  title?: string;
  description?: string;
  actionText?: string;
}>();
defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}
.empty-title {
  font-size: var(--text-lg, 32rpx);
  font-weight: var(--font-semibold, 600);
  color: var(--color-text-primary);
  margin-top: 24rpx;
  margin-bottom: 8rpx;
}
.empty-desc {
  font-size: var(--text-sm, 24rpx);
  color: var(--color-text-tertiary);
  margin-bottom: 24rpx;
  line-height: 1.5;
}
</style>
