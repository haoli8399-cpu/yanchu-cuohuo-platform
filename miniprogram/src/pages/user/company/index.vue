<template>
  <view class="company-page">
    <view class="form-card">
      <view class="form-group">
        <text class="form-label">企业名称</text>
        <input class="form-input" v-model="companyName" placeholder="请输入企业全称" />
      </view>

      <view class="form-group">
        <text class="form-label">统一社会信用代码</text>
        <input class="form-input" v-model="creditCode" placeholder="请输入统一社会信用代码" />
      </view>

      <view class="form-group">
        <text class="form-label">营业执照</text>
        <view class="upload-area" @click="handleUpload">
          <van-icon name="photograph" size="48rpx" color="#a1a1aa" />
          <text class="upload-text">点击上传营业执照照片</text>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">联系人</text>
        <input class="form-input" v-model="contact" placeholder="请输入联系人姓名" />
      </view>

      <view class="form-group">
        <text class="form-label">联系电话</text>
        <input class="form-input" v-model="phone" type="number" maxlength="11" placeholder="请输入联系电话" />
      </view>
    </view>

    <view class="submit-bar">
      <van-button type="primary" size="large" round block @click="handleSubmit">保存企业信息</van-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const companyName = ref('');
const creditCode = ref('');
const contact = ref('');
const phone = ref('');

function handleUpload() {
  uni.showToast({ title: '上传功能待联调', icon: 'none' });
}

function handleSubmit() {
  if (!companyName.value.trim()) {
    uni.showToast({ title: '请输入企业名称', icon: 'none' });
    return;
  }
  uni.showToast({ title: '保存成功（Mock）', icon: 'success' });
}
</script>

<style lang="scss" scoped>
.company-page {
  min-height: 100vh; background: var(--color-bg-page); padding: 24rpx;
}
.form-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx;
}
.form-group {
  margin-bottom: 28rpx;
  .form-label { font-size: 28rpx; color: var(--color-text-secondary); margin-bottom: 12rpx; }
  .form-input {
    width: 100%; height: 80rpx; background: var(--color-bg-page);
    border: 1rpx solid var(--color-border); border-radius: var(--radius-sm);
    padding: 0 24rpx; font-size: 28rpx; color: var(--color-text-primary);
    box-sizing: border-box;
  }
}
.upload-area {
  width: 100%; min-height: 160rpx; background: var(--color-bg-page);
  border: 2rpx dashed var(--color-border); border-radius: var(--radius-sm);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12rpx;
  .upload-text { font-size: 24rpx; color: var(--color-text-tertiary); }
}
.submit-bar {
  padding: 40rpx 0;
}
</style>
