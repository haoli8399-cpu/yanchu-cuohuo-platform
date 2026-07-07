<template>
  <view class="voice-input-wrap">
    <!-- 录音中提示浮层（显示在按钮上方） -->
    <view
      class="voice-recording-overlay"
      v-if="state === 'recording'"
      @touchstart.prevent
    >
      <view class="voice-wave">
        <view v-for="i in 9" :key="i" class="wave-bar" :style="{ animationDelay: (i * 0.08) + 's' }" />
      </view>
      <text class="voice-cancel-hint" v-if="cancelling">松开手指，取消发送</text>
      <view class="voice-duration">
        <text class="voice-dot">🔴</text>
        <text class="voice-time">{{ formatTime(duration) }}</text>
      </view>
    </view>

    <!-- 语音按钮 -->
    <button
      class="CfVoiceBtn"
      :class="[state, { cancelling }]"
      @touchstart="onPress"
      @touchend="onRelease"
      @touchmove="onMove"
      @touchcancel="onCancel"
      hover-class="none"
    >
      <view class="CfVoiceBtn-icon">
        <text v-if="state === 'idle'">🎤</text>
        <text v-else-if="state === 'recording'">🔴</text>
        <text v-else-if="state === 'uploading'">⏳</text>
        <text v-else-if="state === 'done'">✓</text>
      </view>
    </button>

    <!-- Toast 提示 -->
    <view class="voice-toast" v-if="toast.visible">
      <view class="voice-toast-content">
        <text>{{ toast.message }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

type VoiceState = 'idle' | 'recording' | 'uploading' | 'done';

const state = ref<VoiceState>('idle');
const cancelling = ref(false);
const duration = ref(0);
const recordingTimer = ref<ReturnType<typeof setInterval> | null>(null);
const maxDuration = 60; // 最长录音 60s

const toast = reactive({
  visible: false,
  message: '',
  timer: null as ReturnType<typeof setTimeout> | null,
});

function showToast(msg: string) {
  toast.message = msg;
  toast.visible = true;
  if (toast.timer) clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { toast.visible = false; }, 2500);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const emit = defineEmits<{
  /** 语音识别成功，返回文字 */
  (e: 'result', text: string): void;
}>();

let startY = 0;

function onPress(e: TouchEvent) {
  if (state.value === 'uploading') return;
  startY = e.touches[0].clientY;
  cancelling.value = false;
  state.value = 'recording';
  duration.value = 0;
  recordingTimer.value = setInterval(() => {
    duration.value++;
    if (duration.value >= maxDuration) {
      onRelease(); // 超时自动停止
    }
  }, 1000);
  // 触发外部录音开始
  uni.showToast({ title: '开始录音', icon: 'none', duration: 800 });
}

function onMove(e: TouchEvent) {
  if (state.value !== 'recording') return;
  const dy = startY - e.touches[0].clientY;
  cancelling.value = dy > 40; // 上滑超过 40px 进入取消状态
}

function onRelease() {
  if (state.value !== 'recording') return;
  stopTimer();

  if (cancelling.value) {
    state.value = 'idle';
    cancelling.value = false;
    showToast('已取消录音');
    return;
  }

  if (duration.value < 1) {
    state.value = 'idle';
    showToast('录音时间太短');
    return;
  }

  state.value = 'uploading';
  // 触发外部上传逻辑；上传完成后调用 complete(text) 或 fail()
}

function onCancel() {
  if (state.value !== 'recording') return;
  stopTimer();
  state.value = 'idle';
  cancelling.value = false;
}

function stopTimer() {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }
}

/** 外部调用：识别成功 */
function complete(text: string) {
  state.value = 'done';
  emit('result', text);
  setTimeout(() => { state.value = 'idle'; }, 600);
}

/** 外部调用：识别失败 */
function fail(msg?: string) {
  state.value = 'idle';
  showToast(msg || '识别失败，请重试');
}

defineExpose({ complete, fail });
</script>

<style lang="scss">
// ========================================
// Voice Input Component — 演立方 YANLI
// 设计稿：演立方设计预览/语音输入设计方案.html
// ========================================

$voice-btn-size: 72rpx;
$voice-btn-radius: 50%;
$transition-fast: 0.2s ease-out;

.CfVoiceBtn {
  position: relative;
  flex-shrink: 0;
  width: $voice-btn-size;
  height: $voice-btn-size;
  border-radius: $voice-btn-radius;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  transition: all $transition-fast;
  cursor: default;

  /* 待命状态 */
  &.idle {
    background: #f5f5f7;       // $color-bg-page
    border: 2rpx solid #e5e7eb; // $color-border
    .CfVoiceBtn-icon { color: #6b7280; font-size: 32rpx; }
  }

  /* 录音中 */
  &.recording {
    background: #ef4444;        // 品牌红色
    box-shadow: 0 0 0 4rpx rgba(239, 68, 68, 0.2);
    animation: voice-pulse 1.5s ease-in-out infinite;
    .CfVoiceBtn-icon { color: #fff; font-size: 28rpx; }
  }

  /* 上传中 */
  &.uploading {
    background: #7c3aed;        // $color-primary
    pointer-events: none;
    .CfVoiceBtn-icon {
      color: #fff;
      font-size: 28rpx;
      animation: voice-spin 0.8s linear infinite;
    }
  }

  /* 完成瞬态 */
  &.done {
    background: #f0fdf4;        // $color-green-bg
    .CfVoiceBtn-icon { color: #16a34a; font-size: 28rpx; }
    pointer-events: none;
    transition: none;
  }

  /* 上滑取消态 */
  &.cancelling {
    opacity: 0.6;
  }
}

.CfVoiceBtn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* ===== 脉冲动画 ===== */
@keyframes voice-pulse {
  0%, 100% { box-shadow: 0 0 0 4rpx rgba(239, 68, 68, 0.2); }
  50% { box-shadow: 0 0 0 10rpx rgba(239, 68, 68, 0.08); }
}

/* ===== 旋转动画 ===== */
@keyframes voice-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== 录音中浮层 ===== */
.voice-recording-overlay {
  position: fixed;
  bottom: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 24rpx;
  padding: 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  z-index: 1000;
}

/* 声波动画条 */
.voice-wave {
  display: flex;
  align-items: center;
  gap: 4rpx;
  height: 64rpx;
}

.wave-bar {
  width: 6rpx;
  height: 100%;
  background: #a78bfa;     // $color-primary-light
  border-radius: 3rpx;
  animation: voice-wave 1.2s ease-in-out infinite;

  @for $i from 1 through 9 {
    &:nth-child(#{$i}) {
      $heights: 30%, 60%, 80%, 50%, 70%, 40%, 65%, 90%, 45%;
      height: nth($heights, $i);
      animation-delay: $i * 0.08s;
    }
  }
}

@keyframes voice-wave {
  0%, 100% {
    transform: scaleY(0.6);
    background: #a78bfa;
  }
  50% {
    transform: scaleY(1);
    background: #7c3aed;
  }
}

/* 取消提示 */
.voice-cancel-hint {
  color: #fca5a5;
  font-size: 22rpx;
  font-weight: 500;
}

/* 录音时长 */
.voice-duration {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.voice-dot {
  font-size: 16rpx;
  animation: blink 1s step-end infinite;
}
.voice-time {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* ===== Toast ===== */
.voice-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  pointer-events: none;
}
.voice-toast-content {
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  white-space: nowrap;
}
</style>
