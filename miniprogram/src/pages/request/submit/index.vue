<template>
  <view class="request-submit-page">
    <!-- Tab 切换 -->
    <view class="submit-tabs">
      <view class="tab-item" :class="{ active: mode === 'sku' }" @click="mode = 'sku'">
        <text>📋 选方案提交</text>
      </view>
      <view class="tab-item" :class="{ active: mode === 'ai' }" @click="mode = 'ai'">
        <text>💬 描述需求</text>
      </view>
    </view>

    <scroll-view scroll-y class="chat-scroll" v-if="mode === 'ai'">
      <!-- 小演 AI 对话 -->
      <view class="message ai-message">
        <view class="ai-avatar">AI</view>
        <view class="bubble ai-bubble">
          <text class="bubble-text">你好！请告诉我你的需求，或者直接语音说给我。</text>
        </view>
      </view>

      <view class="message ai-message">
        <view class="ai-avatar">AI</view>
        <view class="bubble ai-bubble">
          <view class="capability-tags">
            <text class="cap-tag">✅ 判断需求</text>
            <text class="cap-tag">✅ 推荐方案</text>
            <text class="cap-tag">✅ 算出报价</text>
            <text class="cap-tag">✅ 提醒跟进</text>
          </view>
        </view>
      </view>

      <view v-for="(msg, i) in messages" :key="i"
        class="message" :class="msg.from === 'user' ? 'user-message' : 'ai-message'">
        <view v-if="msg.from === 'ai'" class="ai-avatar">AI</view>
        <view class="bubble" :class="msg.from === 'user' ? 'user-bubble' : 'ai-bubble'">
          <text class="bubble-text">{{ msg.text }}</text>
        </view>
      </view>

      <!-- 快捷回复芯片 -->
      <view class="quick-chips" v-if="showChips">
        <text class="chip" v-for="c in quickChips" :key="c" @click="onChip(c)">{{ c }}</text>
      </view>
    </scroll-view>

    <!-- SKU 模式占位 -->
    <view v-if="mode === 'sku'" class="sku-placeholder">
      <text>📋 从方案库中选择已有方案提交</text>
    </view>

    <!-- 粘贴入口 -->
    <view class="paste-entry" @click="onPaste">
      <text>📱 粘贴微信聊天记录，AI 自动识别</text>
    </view>

    <!-- 底部输入栏 -->
    <view class="bottom-bar">
      <view class="voice-entry" @click="onVoice">
        <text>🎤</text>
      </view>
      <input class="chat-input" v-model="inputText" placeholder="描述你的演出需求..."
        placeholder-style="color: #9ca3af" @confirm="onSend" />
      <view class="send-entry" @click="onSend">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const mode = ref<'sku' | 'ai'>('ai');
const inputText = ref('');
const showChips = ref(true);

const messages = ref<{ from: string; text: string }[]>([]);
const quickChips = ['50-100人', '100-300人', '300-500人', '脱口秀', '年会', '团建'];

onMounted(() => {
  uni.setNavigationBarTitle({ title: '提需求' });
});

function onSend() {
  if (!inputText.value.trim()) return;
  messages.value.push({ from: 'user', text: inputText.value.trim() });
  inputText.value = '';
  showChips.value = false;

  setTimeout(() => {
    messages.value.push({ from: 'ai', text: '收到！我先确认几个信息：① 多少人参加？' });
    showChips.value = true;
  }, 500);
}

function onChip(text: string) {
  inputText.value = text;
  onSend();
}

function onPaste() {
  uni.setStorageSync('submitEntryMode', 'paste');
}

function onVoice() {
  uni.setStorageSync('submitEntryMode', 'voice');
}
</script>

<style lang="scss" scoped>
.request-submit-page {
  min-height: 100vh;
  background: $color-bg-page;
  display: flex;
  flex-direction: column;
}

.submit-tabs {
  display: flex;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: $color-bg-card;
  border-bottom: 2rpx solid $color-border;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: $radius-sm;
  font-size: $text-base;
  font-weight: 600;
  color: $color-text-secondary;
  background: $color-bg-input;
}
.tab-item.active {
  background: $color-primary;
  color: $color-text-inverse;
}

.chat-scroll {
  flex: 1;
  padding: 24rpx 32rpx;
}

.message {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
  align-items: flex-start;
}
.user-message { justify-content: flex-end; }

.ai-avatar {
  width: 48rpx; height: 48rpx;
  border-radius: 8rpx;
  background: $color-primary;
  color: #fff;
  font-size: 20rpx; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.bubble {
  max-width: 480rpx;
  padding: 16rpx 24rpx;
  border-radius: $radius-md;
  font-size: $text-base;
  line-height: 1.5;
}
.ai-bubble { background: $color-primary-subtle; color: $color-text-primary; }
.user-bubble { background: $color-bg-input; color: $color-text-primary; }

.capability-tags { display: flex; gap: 8rpx; flex-wrap: wrap; }
.cap-tag {
  font-size: 22rpx; font-weight: 600;
  padding: 6rpx 14rpx; border-radius: 9999px;
  background: $color-bg-card; color: $color-primary;
}

.quick-chips {
  display: flex; gap: 8rpx; flex-wrap: wrap; padding: 12rpx 0;
}
.chip {
  padding: 12rpx 24rpx;
  border: 2rpx solid $color-primary;
  border-radius: 9999px;
  font-size: $text-sm; font-weight: 600; color: $color-primary;
}
.chip:active { background: $color-primary-subtle; }

.sku-placeholder {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: $text-base; color: $color-text-tertiary;
}

.paste-entry {
  margin: 12rpx 32rpx;
  padding: 14rpx;
  text-align: center;
  border: 2rpx dashed $color-primary;
  border-radius: $radius-md;
  font-size: $text-sm; font-weight: 600; color: $color-primary;
  background: $color-primary-subtle;
}
.paste-entry:active { opacity: 0.7; }

.bottom-bar {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 32rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  background: $color-bg-card;
  border-top: 2rpx solid $color-border;
}
.voice-entry {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: $color-primary-subtle; border: 2rpx solid $color-primary;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; flex-shrink: 0;
}
.chat-input {
  flex: 1; height: 64rpx; padding: 0 16rpx;
  background: $color-bg-input;
  border-radius: $radius-full;
  font-size: $text-base; border: none; outline: none;
}
.send-entry {
  height: 56rpx; padding: 0 28rpx;
  background: $color-primary; color: $color-text-inverse;
  border-radius: $radius-full;
  font-size: $text-base; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
</style>