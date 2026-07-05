<template>
  <view class="onboarding-page">
    <view class="brand-header">
      <view class="brand-icon">🎭</view>
      <view class="brand-title">演员入驻</view>
      <view class="brand-desc">填写资料，开启您的演出之旅</view>
    </view>

    <view class="form-section">
      <van-field
        v-model="form.stageName"
        label="艺名 / 舞台名"
        placeholder="输入您的艺名"
        maxlength="20"
        :border="false"
        input-class="van-field-input-custom"
      />

      <view class="form-item">
        <text class="form-label">演出类型</text>
        <view class="tag-group">
          <view
            v-for="t in performanceTypes"
            :key="t"
            class="tag"
            :class="{ active: form.types.includes(t) }"
            @click="toggleType(t)"
          >
            {{ t }}
          </view>
        </view>
      </view>

      <van-field
        v-model="form.bio"
        label="自我介绍"
        type="textarea"
        placeholder="简单介绍您的演出经历和风格"
        maxlength="200"
        autosize
        :border="false"
        input-class="van-field-input-custom"
      />

      <van-field
        v-model="form.contact"
        label="联系方式"
        placeholder="微信号或手机号"
        maxlength="20"
        :border="false"
        input-class="van-field-input-custom"
      />

      <van-button type="primary" size="large" round block :loading="submitting" :disabled="submitting || !canSubmit" @click="handleSubmit">提交申请</van-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { submitOnboarding } from '@/services/api';

const authStore = useAuthStore();
const submitting = ref(false);

const performanceTypes = ['脱口秀', '即兴喜剧', '漫才', '新喜剧', '魔术脱口秀', '其他'];

const form = ref({
  stageName: '',
  types: [] as string[],
  bio: '',
  contact: '',
});

const canSubmit = computed(() => {
  return form.value.stageName.trim().length > 0
    && form.value.types.length > 0
    && form.value.contact.trim().length > 0;
});

function toggleType(t: string) {
  const idx = form.value.types.indexOf(t);
  if (idx >= 0) {
    form.value.types.splice(idx, 1);
  } else {
    form.value.types.push(t);
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    const result = await submitOnboarding({
      stage_name: form.value.stageName.trim(),
      performance_types: form.value.types,
      bio: form.value.bio.trim(),
      contact: form.value.contact.trim(),
    });

    if (result.ok && result.data) {
      // 更新 auth store 中的 userInfo（此时已包含 actor_id）
      authStore.userInfo = result.data;

      uni.showToast({ title: '入驻申请已提交', icon: 'success', duration: 2000 });

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/assignment/list' });
      }, 1500);
    } else {
      uni.showToast({ title: result.error || '提交失败，请重试', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交异常', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.onboarding-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding: 40rpx 32rpx 60rpx;
}

// ── 品牌头部 ──
.brand-header {
  text-align: center;
  padding: 40rpx 0 48rpx;

  .brand-icon { font-size: 72rpx; margin-bottom: 16rpx; }
  .brand-title {
    font-size: 48rpx;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: 4rpx;
  }
  .brand-desc {
    font-size: 26rpx;
    color: var(--color-text-tertiary);
    margin-top: 12rpx;
  }
}

// ── 表单区域 ──
.form-section {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 40rpx 32rpx;
}

.form-item {
  margin-bottom: 36rpx;

  &:last-of-type { margin-bottom: 48rpx; }
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16rpx;
}

// ── 标签选择 ──
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  min-width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  padding: 0 24rpx;
  background: var(--color-bg-card);
  border: 2rpx solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 26rpx;
  color: var(--color-text-secondary);
  transition: all 0.2s;

  &.active {
    background: rgba(167, 139, 250, 0.15);
    border-color: var(--color-primary);
    color: var(--color-primary-light);
    font-weight: 600;
  }

  &:active { opacity: 0.7; }
}

// ── 提交按钮间距 ──
.van-button { margin-top: 32rpx; }
</style>
