<template>
  <view class="feedback-page">
    <view class="form-card">
      <view class="form-group">
        <text class="form-label">反馈类型</text>
        <picker mode="selector" :range="types" @change="onTypeChange">
          <view class="form-picker">
            {{ selectedType || '请选择反馈类型' }}
            <van-icon name="arrow-down" size="24rpx" color="#a1a1aa" />
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">反馈内容</text>
        <textarea
          class="form-textarea"
          v-model="content"
          placeholder="请详细描述您的问题或建议..."
          maxlength="500"
        />
        <text class="char-count">{{ content.length }}/500</text>
      </view>

      <view class="form-group">
        <text class="form-label">联系方式（选填）</text>
        <input class="form-input" v-model="contact" placeholder="手机号或微信号" />
      </view>
    </view>

    <view class="submit-bar">
      <van-button type="primary" size="large" round block :disabled="!content.trim()" @click="handleSubmit">
        提交反馈
      </van-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { submitFeedback } from '@/services/api';

const types = ['功能建议', '体验问题', '内容错误', '其他'];
const selectedType = ref('');
const content = ref('');
const contact = ref('');

function onTypeChange(e: any) {
  selectedType.value = types[e.detail.value];
}

async function handleSubmit() {
  if (!content.value.trim()) return;
  uni.showLoading({ title: '提交中...' });
  try {
    const res = await submitFeedback({
      type: selectedType.value || '其他',
      content: content.value,
      contact: contact.value || undefined
    });
    uni.hideLoading();
    if (res.ok) {
      uni.showToast({ title: '反馈提交成功，感谢您的建议！', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      uni.showToast({ title: res.error || '提交失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '提交异常', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh; background: var(--color-bg-page); padding: 24rpx;
}
.form-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx;
}
.form-group {
  margin-bottom: 28rpx;
  .form-label { font-size: 28rpx; color: var(--color-text-secondary); margin-bottom: 12rpx; }
  .form-input, .form-picker {
    width: 100%; height: 80rpx; background: var(--color-bg-page);
    border: 1rpx solid var(--color-border); border-radius: var(--radius-sm);
    padding: 0 24rpx; font-size: 28rpx; color: var(--color-text-primary);
    display: flex; align-items: center; justify-content: space-between;
    box-sizing: border-box;
  }
  .form-textarea {
    width: 100%; min-height: 240rpx; background: var(--color-bg-page);
    border: 1rpx solid var(--color-border); border-radius: var(--radius-sm);
    padding: 20rpx 24rpx; font-size: 26rpx; color: var(--color-text-primary);
    box-sizing: border-box;
  }
}
.char-count { display: block; text-align: right; font-size: 22rpx; color: var(--color-text-tertiary); margin-top: 8rpx; }
.submit-bar { padding: 40rpx 0; }
</style>
