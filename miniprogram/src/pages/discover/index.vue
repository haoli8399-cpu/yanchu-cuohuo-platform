<template>
  <view class="discover-page">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <!-- 品牌栏 -->
      <view class="brand-bar">
        <view class="brand-left">
          <view class="brand-cube" />
          <text class="brand-name">演立方</text>
          <text class="brand-tagline">商演找演立方</text>
        </view>
        <view class="agent-badge">
          <view class="agent-dot" />
          <text>小演</text>
        </view>
      </view>

      <!-- Hero 引导区 -->
      <view class="hero-section">
        <view class="hero-ai-hint">
          <view class="ai-mini-cube">AI</view>
          <text class="hero-ai-text">小演帮你快速成交</text>
        </view>
        <view class="hero-title">你只需要一句需求</view>
        <view class="hero-subtitle">小演自动匹配演出方案、算出报价、盯到成单</view>
      </view>

      <!-- 核心：输入栏（固定） -->
      <view class="input-bar">
        <view class="voice-btn" @click="goVoice">
          <text>🎤</text>
        </view>
        <input
          class="input-field"
          v-model="inputText"
          placeholder="说一句需求，小演立刻匹配..."
          placeholder-style="color: #9ca3af; font-size: 24rpx;"
          @confirm="onSend"
        />
        <view class="send-btn" @click="onSend">
          <text>发送</text>
        </view>
      </view>

      <!-- 粘贴入口（次级） -->
      <view class="paste-link" @click="goPaste">
        <text>📱 粘贴微信聊天记录自动识别</text>
        <text class="paste-arrow">→</text>
      </view>

      <!-- 活动类型标签 -->
      <view class="tag-row">
        <view
          v-for="tag in activityTags"
          :key="tag.value"
          class="tag-item"
          :class="{ active: selectedTag === tag.value }"
          @click="onTagSelect(tag.value)"
        >
          <text>{{ tag.label }}</text>
        </view>
      </view>

      <!-- AI 最近方案 -->
      <view class="recent-section">
        <view class="section-header" @click="goAllPlans">
          <text class="section-title">◇ AI 最近方案</text>
          <van-icon name="arrow" size="24rpx" color="#9ca3af" />
        </view>
        <view
          v-for="plan in recentPlans"
          :key="plan.id"
          class="plan-card"
          :style="{ borderLeftColor: plan.accent || 'var(--color-primary)' }"
          @click="goPlan(plan.id)"
        >
          <view class="plan-info">
            <text class="plan-name">{{ plan.name }}</text>
            <text class="plan-meta">{{ plan.meta }}</text>
          </view>
          <text class="plan-price">{{ plan.price }}</text>
        </view>
      </view>

      <!-- 历史需求 -->
      <view class="history-link" @click="goHistory">
        <text>📋 查看历史需求</text>
      </view>

      <view class="bottom-space" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const inputText = ref('');
const selectedTag = ref('all');

const activityTags = [
  { value: 'all', label: '全部' },
  { value: 'talkshow', label: '脱口秀' },
  { value: 'annual', label: '年会' },
  { value: 'team', label: '团建' },
  { value: 'business', label: '商业活动' },
  { value: 'roadshow', label: '路演' },
  { value: 'other', label: '其他' },
];

const recentPlans = [
  { id: 'talkshow-standard', name: '脱口秀标准版', meta: 'T3·60min·匹配 94% · 自营', price: '¥6,000', accent: 'var(--color-primary)' },
  { id: 'magic-comedy', name: '魔术喜剧', meta: 'T4·45min·匹配 87% · 经纪合作', price: '¥3,800', accent: '#f59e0b' },
];

onMounted(() => {
  uni.setNavigationBarTitle({ title: '演立方' });
});

function goSubmit(mode: 'input' | 'paste' | 'voice') {
  uni.setStorageSync('submitEntryMode', mode);
  if (mode === 'input' && inputText.value.trim()) {
    uni.setStorageSync('submitPresetText', inputText.value.trim());
  }
  uni.switchTab({ url: '/pages/request/submit' });
}

function onSend() {
  if (!inputText.value.trim()) return;
  goSubmit('input');
}

function goPaste() {
  goSubmit('paste');
}

function goVoice() {
  uni.setStorageSync('submitEntryMode', 'voice');
  uni.switchTab({ url: '/pages/request/submit' });
}

function goHistory() {
  uni.navigateTo({ url: '/pages/request/list' });
}

function onTagSelect(value: string) {
  selectedTag.value = value;
  if (value === 'all') {
    uni.switchTab({ url: '/pages/sku/list' });
  } else {
    uni.setStorageSync('skuActivityFilter', value);
    uni.switchTab({ url: '/pages/sku/list' });
  }
}

function goAllPlans() {
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

/* ===== Brand Bar ===== */
.brand-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 0;
}
.brand-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.brand-cube {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  background: $color-primary;
}
.brand-name {
  font-size: $text-xl;
  font-weight: 700;
  color: $color-text-primary;
}
.brand-tagline {
  font-size: $text-xs;
  color: $color-text-tertiary;
  padding-left: 8rpx;
  border-left: 2rpx solid $color-border;
  font-weight: 400;
}
.agent-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: $radius-full;
  background: $color-primary-subtle;
  color: $color-primary;
  font-size: $text-sm;
  font-weight: 600;
}
.agent-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: $green;
  animation: dot-breathe 2s ease-in-out infinite;
}
@keyframes dot-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ===== Hero ===== */
.hero-section {
  padding: 32rpx 32rpx 0;
  text-align: center;
}
.hero-ai-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  margin-bottom: 12rpx;
}
.ai-mini-cube {
  width: 28rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background: $color-primary;
  color: #fff;
  font-size: 16rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-ai-text {
  font-size: $text-sm;
  color: $color-primary;
  font-weight: 600;
}
.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.2;
  color: $color-text-primary;
  margin-bottom: 8rpx;
}
.hero-subtitle {
  display: block;
  font-size: $text-base;
  color: $color-text-secondary;
  line-height: 1.5;
  margin-bottom: 28rpx;
}

/* ===== Input Bar ===== */
.input-bar {
  margin: 0 32rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: $color-bg-card;
  border: 2rpx solid $color-border;
  border-radius: $radius-full;
  padding: 6rpx;
  box-shadow: $shadow-sm;
}
.voice-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: $color-primary-subtle;
  border: 2rpx solid $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
}
.voice-btn:active { opacity: 0.7; }

.input-field {
  flex: 1;
  height: 60rpx;
  padding: 0 12rpx;
  background: transparent;
  border: none;
  outline: none;
  font-size: $text-base;
  color: $color-text-primary;
  font-family: $font-family-base;
}

.send-btn {
  height: 56rpx;
  padding: 0 28rpx;
  background: $color-primary;
  color: $color-text-inverse;
  border-radius: $radius-full;
  font-size: $text-base;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.send-btn:active { opacity: 0.85; }

/* ===== Paste Link ===== */
.paste-link {
  text-align: center;
  padding: 12rpx 0 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  font-size: $text-sm;
  color: $color-primary;
  font-weight: 600;
}
.paste-arrow {
  font-size: $text-xs;
  color: $color-primary-light;
}

/* ===== Tag Row ===== */
.tag-row {
  display: flex;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  flex-wrap: wrap;
}
.tag-item {
  padding: 10rpx 24rpx;
  border-radius: $radius-full;
  font-size: $text-sm;
  font-weight: 500;
  color: $color-text-secondary;
  background: $color-bg-input;
  border: 2rpx solid transparent;
}
.tag-item.active {
  background: $color-primary-subtle;
  color: $color-primary;
  font-weight: 600;
  border-color: transparent;
}
.tag-item:active { opacity: 0.7; }

/* ===== Recent Section ===== */
.recent-section {
  padding: 16rpx 32rpx 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.section-title {
  font-size: $text-lg;
  font-weight: 800;
  color: $color-text-primary;
}
.plan-card {
  min-height: 120rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 14rpx;
  border-radius: $radius-md;
  background: $color-bg-card;
  border-left: 6rpx solid $color-primary;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}
.plan-card:active { opacity: 0.85; }
.plan-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.plan-name {
  font-size: $text-md;
  font-weight: 700;
  color: $color-text-primary;
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

/* ===== History Link ===== */
.history-link {
  text-align: center;
  padding: 20rpx 0;
  font-size: $text-sm;
  color: $color-text-tertiary;
}
.history-link:active { opacity: 0.6; }

.bottom-space {
  height: 160rpx;
}
</style>
