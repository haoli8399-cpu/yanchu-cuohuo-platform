<template>
  <view class="login-page">
    <!-- Purple gradient brand area with background image -->
    <view class="login-page__brand">
      <image class="login-page__brand-bg" src="/static/images/login-bg.jpg" mode="aspectFill" />
      <view class="login-page__brand-overlay">
        <text class="login-page__title">喜剧工厂</text>
        <text class="login-page__subtitle">连接优质演出内容</text>
      </view>
    </view>

    <!-- White card area -->
    <view class="login-page__card">
      <button
        class="login-page__wechat-btn"
        :disabled="loading"
        :style="{ opacity: loading ? 0.7 : 1 }"
        @click="handleLogin"
      >
        <image class="login-page__wechat-icon" src="/static/icons/wechat.png" mode="aspectFit" />
        <text>微信一键登录</text>
      </button>

      <view class="login-page__agreement">
        <text class="login-page__agreement-text">
          登录即表示同意
          <text class="login-page__link" @tap="showAgreement">《用户协议》</text>
          和
          <text class="login-page__link" @tap="showPrivacy">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const success = await authStore.login();
    if (success) {
      const role = authStore.userInfo?.role;
      const actorId = authStore.userInfo?.actor_id;

      if (role === 'performer' && !actorId) {
        uni.reLaunch({ url: '/pages/onboarding/index' });
        return;
      }

      const routeMap: Record<string, string> = {
        'agent': '/pages/discover/index',
        'performer': '/pages/assignment/list',
        'admin': '/pages/sku/list'
      };
      const target = routeMap[role || ''] || '/pages/sku/list';
      uni.reLaunch({ url: target });
    }
  } finally {
    loading.value = false;
  }
}

function showAgreement() {
  uni.showModal({
    title: "用户协议",
    content: "欢迎使用喜剧工厂。\n\n1. 服务说明：本平台为喜剧工厂，连接演出需求方（活动公司/甲方）与演出供给方（演员/艺人）。\n\n2. 用户注册：用户需提供真实手机号完成注册，一个手机号对应一个账户。\n\n3. 使用规则：用户应遵守法律法规，不得利用平台从事违法违规活动。\n\n4. 责任声明：平台不对演出质量、演员表现等做任何明示或暗示的担保。\n\n5. 隐私保护：我们将按照隐私政策保护您的个人信息。",
    showCancel: false
  });
}

function showPrivacy() {
  uni.showModal({
    title: "隐私政策",
    content: "喜剧工厂重视您的隐私。\n\n1. 信息收集：我们收集您提供的手机号、微信昵称、头像等基本信息。\n\n2. 使用目的：用于账户管理、订单通知、服务改进。\n\n3. 信息共享：未经您同意，我们不会向第三方共享您的个人信息，法律法规另有规定的除外。\n\n4. 数据安全：我们采取行业标准的安全措施保护您的数据。\n\n5. 用户权利：您可以申请注销账户，我们将在核实后删除您的信息。",
    showCancel: false
  });
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: $color-bg-page;

  // ── 紫色渐变品牌区 ──
  &__brand {
    position: relative;
    height: 50vh;
    min-height: 360px;
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__brand-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    opacity: 0.15;
  }

  &__brand-overlay {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    font-size: 64rpx;
    font-weight: 700;
    color: $color-text-inverse;
    letter-spacing: 4rpx;
    margin-bottom: $space-sm;
  }

  &__subtitle {
    font-size: $text-md;
    color: rgba(255, 255, 255, 0.7);
  }

  // ── 白色卡片 ──
  &__card {
    background-color: $color-bg-card;
    border-radius: $radius-lg $radius-lg 0 0;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    padding: 64rpx $space-2xl;
    padding-bottom: calc(64rpx + env(safe-area-inset-bottom));
    flex: 1;
  }

  // ── 微信登录按钮 ──
  &__wechat-btn {
    width: 100%;
    height: 96rpx;
    background-color: #07C160;
    color: $color-text-inverse;
    border-radius: $radius-full;
    font-size: $text-lg;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-sm;
    border: none;
    padding: 0;
    line-height: 1;
    box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
    transition: opacity $transition-fast;

    &::after { border: none; }

    &:active { opacity: 0.85; }
  }

  &__wechat-icon {
    width: 40rpx;
    height: 40rpx;
  }

  // ── 协议链接 ──
  &__agreement {
    margin-top: $space-xl;
    text-align: center;
  }

  &__agreement-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }

  &__link {
    color: $color-text-link;
  }
}
</style>
