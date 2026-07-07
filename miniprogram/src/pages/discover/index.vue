<template>
  <view class="discover-page">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <view class="brand-bar">
        <view class="brand-left">
          <view class="brand-cube" />
          <text class="brand-name">演立方</text>
        </view>
        <view class="agent-tag">
          <text>🤖 小演</text>
        </view>
      </view>

      <view class="hero-panel">
        <text class="hero-title">客户一句话需求，交给小演</text>
        <van-button class="paste-btn" type="primary" block @click="goPaste">
          📱 粘贴客户微信聊天记录
        </van-button>
        <text class="hero-subtitle">说一句需求，小演立刻匹配方案与报价</text>

        <view class="quick-actions">
          <view class="quick-action" @click="goVoice">
            <text>🎤 语音说需求</text>
          </view>
          <view class="quick-action" @click="goForm">
            <text>✍️ 填写表单</text>
          </view>
          <view class="quick-action" @click="goHistory">
            <text>📋 历史需求</text>
          </view>
        </view>
      </view>

      <view class="activity-section">
        <van-grid :column-num="3" :border="false" gutter="16rpx">
          <van-grid-item v-for="item in activityTypes" :key="item" use-slot>
            <view class="activity-pill" @click="goActivity(item)">
              <text>{{ item }}</text>
            </view>
          </van-grid-item>
        </van-grid>
      </view>

      <view class="recent-section">
        <view class="section-title-row">
          <text class="section-title">◇ AI 最近方案</text>
          <van-icon name="arrow" size="28rpx" color="#a1a1aa" />
        </view>

        <view
          v-for="plan in recentPlans"
          :key="plan.id"
          class="plan-card"
          @click="goPlan(plan.id)"
        >
          <view class="plan-main">
            <text class="plan-name">{{ plan.name }}</text>
            <text class="plan-meta">{{ plan.meta }}</text>
          </view>
          <text class="plan-price">{{ plan.price }}</text>
        </view>
      </view>

      <view class="bottom-space" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const activityTypes = ['脱口秀', '年会', '团建', '商业活动', '路演', '其他'];

const recentPlans = [
  { id: 'talkshow-standard', name: '脱口秀标准版', meta: 'T3·60min·匹配 94%', price: '¥6,000' },
  { id: 'magic-comedy', name: '魔术喜剧', meta: 'T4·45min·匹配 87%', price: '¥3,800' },
];

onMounted(() => {
  uni.setNavigationBarTitle({ title: '演立方' });
});

function goSubmit(mode: 'paste' | 'voice' | 'form') {
  uni.setStorageSync('submitEntryMode', mode);
  uni.switchTab({ url: '/pages/request/submit' });
}

function goPaste() {
  goSubmit('paste');
}

function goVoice() {
  goSubmit('voice');
}

function goForm() {
  goSubmit('form');
}

function goHistory() {
  uni.navigateTo({ url: '/pages/request/list' });
}

function goActivity(type: string) {
  uni.setStorageSync('skuActivityFilter', type);
  uni.switchTab({ url: '/pages/sku/list' });
}

function goPlan(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
.discover-page {
  min-height: 100vh;
  background: $color-bg-page;
}

.page-scroll {
  height: 100vh;
  box-sizing: border-box;
}

.brand-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 0;
}

.brand-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-cube {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  background: $color-primary;
  box-shadow: 8rpx 8rpx 0 $color-primary-bg;
}

.brand-name {
  font-size: $text-xl;
  line-height: 1;
  font-weight: 700;
  color: $color-text-primary;
}

.agent-tag {
  height: 56rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  border-radius: $radius-full;
  background: $color-bg-card;
  color: $color-primary;
  font-size: $text-sm;
  font-weight: 600;
  box-shadow: $shadow-sm;
}

.hero-panel {
  margin: 48rpx 32rpx 0;
  padding: 40rpx 32rpx;
  min-height: 560rpx;
  box-sizing: border-box;
  border-radius: $radius-lg;
  background: $color-bg-card;
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  display: block;
  font-size: 52rpx;
  line-height: 1.16;
  font-weight: 800;
  color: $color-text-primary;
  margin-bottom: 40rpx;
}

.paste-btn {
  height: 104rpx;
  line-height: 104rpx;
  border-radius: $radius-full;
  background: $color-primary;
  border-color: $color-primary;
  color: $color-text-inverse;
  font-size: $text-lg;
  font-weight: 700;
  margin-bottom: 24rpx;
}

.hero-subtitle {
  display: block;
  text-align: center;
  font-size: $text-base;
  color: $color-text-secondary;
  margin-bottom: 40rpx;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
}

.quick-action {
  flex: 1;
  height: 72rpx;
  border-radius: $radius-full;
  border: 2rpx solid $color-primary;
  background: $color-bg-card;
  color: $color-primary;
  font-size: $text-sm;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.activity-section {
  margin: 32rpx 32rpx 0;
}

.activity-pill {
  width: 100%;
  height: 72rpx;
  border-radius: $radius-full;
  background: #f5f5f7;
  color: $color-text-primary;
  font-size: $text-base;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-section {
  margin: 40rpx 32rpx 0;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: $text-lg;
  color: $color-text-primary;
  font-weight: 800;
}

.plan-card {
  min-height: 128rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: $radius-md;
  background: $color-bg-card;
  border-left: 6rpx solid $color-primary;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.plan-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.plan-name {
  font-size: $text-md;
  color: $color-text-primary;
  font-weight: 700;
}

.plan-meta {
  font-size: $text-sm;
  color: $color-text-secondary;
}

.plan-price {
  flex-shrink: 0;
  color: $color-primary;
  font-size: $text-xl;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

.bottom-space {
  height: 160rpx;
}
</style>
