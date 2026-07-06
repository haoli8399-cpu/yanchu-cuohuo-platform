<template>
  <view class="onboarding-page">
    <CfNavBar title="演员入驻" :showBack="false">
      <template #right>
        <text class="onboarding-page__nav-help" @tap="showHelp">帮助</text>
      </template>
    </CfNavBar>

    <!-- Step progress indicator -->
    <view class="onboarding-page__progress">
      <view class="onboarding-page__steps">
        <view
          v-for="(step, idx) in steps"
          :key="idx"
          class="onboarding-page__step-row"
        >
          <view
            class="onboarding-page__step-circle"
            :class="{
              'onboarding-page__step-circle--done': idx < currentStep,
              'onboarding-page__step-circle--active': idx === currentStep
            }"
          >
            <text>{{ idx < currentStep ? '\u2713' : idx + 1 }}</text>
          </view>
          <view
            v-if="idx < steps.length - 1"
            class="onboarding-page__step-line"
            :class="{ 'onboarding-page__step-line--done': idx < currentStep }"
          />
        </view>
      </view>
      <view class="onboarding-page__step-labels">
        <text
          v-for="(step, idx) in steps"
          :key="idx"
          class="onboarding-page__step-label"
          :class="{
            'onboarding-page__step-label--done': idx < currentStep,
            'onboarding-page__step-label--active': idx === currentStep
          }"
        >{{ step }}</text>
      </view>
    </view>

    <!-- Form body -->
    <view class="onboarding-page__body">
      <!-- Step 1: 基本信息 -->
      <view v-show="currentStep === 0" class="onboarding-page__card">
        <text class="onboarding-page__card-title">基本信息</text>
        <view class="onboarding-page__form-cell">
          <text class="onboarding-page__form-label">艺名 / 舞台名</text>
          <input
            v-model="form.stageName"
            placeholder="输入您的艺名"
            placeholder-class="onboarding-page__placeholder"
            maxlength="20"
          />
        </view>
        <view class="onboarding-page__form-cell">
          <text class="onboarding-page__form-label">联系方式</text>
          <input
            v-model="form.contact"
            placeholder="微信号或手机号"
            placeholder-class="onboarding-page__placeholder"
            maxlength="20"
          />
        </view>
      </view>

      <!-- Step 2: 演出类型 -->
      <view v-show="currentStep === 1" class="onboarding-page__card">
        <text class="onboarding-page__card-title">演出类型</text>
        <view class="onboarding-page__form-cell onboarding-page__form-cell--tags">
          <view class="onboarding-page__tag-group">
            <view
              v-for="t in performanceTypes"
              :key="t"
              class="onboarding-page__tag"
              :class="{ 'onboarding-page__tag--active': form.types.includes(t) }"
              @click="toggleType(t)"
            >
              {{ t }}
            </view>
          </view>
        </view>
      </view>

      <!-- Step 3: 个人简介 -->
      <view v-show="currentStep === 2" class="onboarding-page__card">
        <text class="onboarding-page__card-title">个人简介</text>
        <view class="onboarding-page__form-textarea">
          <textarea
            v-model="form.bio"
            placeholder="简单介绍您的演出经历和风格"
            placeholder-class="onboarding-page__placeholder"
            maxlength="200"
          />
        </view>
      </view>
    </view>

    <!-- Fixed bottom CTA -->
    <view class="onboarding-page__fixed-bottom">
      <button
        v-if="currentStep > 0"
        class="onboarding-page__btn onboarding-page__btn--secondary"
        @tap="goPrev"
      >上一步</button>
      <button
        v-if="currentStep < steps.length - 1"
        class="onboarding-page__btn onboarding-page__btn--primary onboarding-page__btn--full"
        @tap="goNext"
      >下一步</button>
      <button
        v-else
        class="onboarding-page__btn onboarding-page__btn--primary onboarding-page__btn--full"
        :disabled="submitting || !canSubmit"
        :loading="submitting"
        @tap="handleSubmit"
      >提交申请</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { submitOnboarding } from '@/services/api';
import CfNavBar from '@/components/CfNavBar.vue';

const authStore = useAuthStore();
const submitting = ref(false);
const currentStep = ref(0);
const steps = ['基本信息', '演出类型', '个人资料'];

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

function showHelp() {
  uni.showToast({ title: '填写资料，开启您的演出之旅', icon: 'none' });
}

function goPrev() {
  if (currentStep.value > 0) currentStep.value--;
}

function goNext() {
  if (currentStep.value < steps.length - 1) currentStep.value++;
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
      authStore.userInfo = result.data;

      uni.showToast({ title: '入驻申请已提交', icon: 'success', duration: 2000 });

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
  background-color: $color-bg-page;
  display: flex;
  flex-direction: column;

  // ── 导航帮助按钮 ──
  &__nav-help {
    font-size: $text-md;
    color: $color-primary;
  }

  // ── 步骤进度指示器 ──
  &__progress {
    padding: $space-xl $space-base $space-md;
  }

  &__steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $space-sm;
  }

  &__step-row {
    display: flex;
    align-items: center;
  }

  &__step-circle {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background-color: $color-bg-input;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-base;
    color: $color-text-tertiary;

    &--done {
      background-color: $state-confirmed;
      color: #fff;
    }

    &--active {
      background-color: $color-primary;
      color: #fff;
      font-weight: 600;
    }
  }

  &__step-line {
    width: 80rpx;
    height: 4rpx;
    background-color: $color-primary-subtle;

    &--done {
      background-color: $state-confirmed;
    }
  }

  &__step-labels {
    display: flex;
    justify-content: space-around;
    padding: 0 $space-base;
  }

  &__step-label {
    font-size: $text-sm;
    color: $color-text-tertiary;

    &--done {
      color: $state-confirmed;
    }

    &--active {
      color: $color-primary;
      font-weight: 600;
    }
  }

  // ── 表单卡片 ──
  &__body {
    flex: 1;
    padding: 0 $space-base;
    padding-bottom: 160rpx;
  }

  &__card {
    background-color: $color-bg-card;
    border-radius: $radius-md;
    padding: $space-lg;
  }

  &__card-title {
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
    display: block;
    margin-bottom: $space-md;
  }

  &__form-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 96rpx;
    border-bottom: 1rpx solid $color-divider;

    &:last-of-type {
      border-bottom: none;
    }

    input {
      flex: 1;
      text-align: right;
      font-size: $text-md;
    }

    &--tags {
      height: auto;
      border-bottom: none;
      padding: $space-sm 0;
    }
  }

  &__form-label {
    font-size: $text-base;
    color: $color-text-secondary;
    margin-right: $space-md;
    flex-shrink: 0;
  }

  &__placeholder {
    color: $color-text-placeholder;
  }

  &__form-textarea {
    padding: $space-md 0;

    textarea {
      width: 100%;
      height: 180rpx;
      font-size: $text-md;
      margin-top: $space-sm;
    }
  }

  &__tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  &__tag {
    min-width: 120rpx;
    height: 64rpx;
    line-height: 64rpx;
    text-align: center;
    padding: 0 24rpx;
    background-color: $color-bg-card;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    font-size: 26rpx;
    color: $color-text-secondary;
    transition: all $transition-fast;

    &--active {
      background-color: $color-primary-subtle;
      border-color: $color-primary;
      color: $color-primary-light;
      font-weight: 600;
    }

    &:active {
      opacity: 0.7;
    }
  }

  // ── 固定底部 ──
  &__fixed-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: $space-md;
    padding: $space-md $space-base;
    padding-bottom: calc(#{$space-md} + env(safe-area-inset-bottom));
    background-color: $color-bg-card;
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
    z-index: $z-nav-bar;
  }

  &__btn {
    height: 88rpx;
    border-radius: $radius-full;
    font-size: $text-lg;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 0;

    &::after { border: none; }

    &--primary {
      flex: 1;
      background-color: $color-primary;
      color: $color-text-inverse;

      &:active { opacity: 0.85; }
    }

    &--secondary {
      width: 180rpx;
      flex-shrink: 0;
      background-color: $color-bg-input;
      color: $color-text-secondary;

      &:active { opacity: 0.7; }
    }

    &--full {
      flex: 1;
    }

    &[disabled] {
      opacity: 0.5;
    }
  }
}
</style>
