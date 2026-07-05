<template>
  <view class="login-page">
    <!-- 顶部：紫色渐变 + 品牌 -->
    <view class="top-gradient">
      <view class="brand-content">
        <text class="brand-name">喜剧工厂</text>
        <text class="brand-tagline">连接优质演出内容</text>
      </view>
    </view>

    <!-- 底部：白色卡片 + 登录按钮 -->
    <view class="bottom-card">
      <button
        class="wechat-btn"
        :disabled="loading"
        :style="{ opacity: loading ? 0.7 : 1 }"
        @click="handleLogin"
      >
        <image class="wechat-icon" src="/static/icons/wechat.png" mode="aspectFit" />
        <text class="wechat-btn-text">微信一键登录</text>
      </button>

      <view class="agreement-row">
        <text class="agreement-link" @click="showAgreement">用户协议</text>
        <view class="agreement-dot"></view>
        <text class="agreement-link" @click="showPrivacy">隐私政策</text>
      </view>

      <view class="safe-bottom"></view>
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
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page);
}

/* ===== 顶部紫色渐变区 ===== */
.top-gradient {
  background: linear-gradient(170deg, #7c3aed 0%, #5b21b6 100%);
  position: relative;
  height: 45vh;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,58,237,.3), rgba(91,33,182,.5));
    opacity: 0.15;
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 64rpx;
}

.brand-name {
  font-size: 64rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.06em;
  line-height: 1.3;
}

.brand-tagline {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16rpx;
  letter-spacing: 0.04em;
}

/* ===== 底部白色卡片 ===== */
.bottom-card {
  position: relative;
  z-index: 2;
  margin-top: -48rpx;
  background: #ffffff;
  border-radius: 48rpx 48rpx 0 0;
  padding: 64rpx 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

/* ===== 微信登录按钮 ===== */
.wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: calc(100% - 128rpx);
  margin: 0 64rpx;
  height: 96rpx;
  border-radius: 9999px;
  background-color: #07C160;
  border: none;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
  transition: opacity 0.2s ease;
  padding: 0;
  line-height: 1;
}

.wechat-btn:active {
  opacity: 0.85;
}

.wechat-icon {
  width: 40rpx;
  height: 40rpx;
  vertical-align: middle;
}

.wechat-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.02em;
  vertical-align: middle;
}

/* ===== 协议行 ===== */
.agreement-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 40rpx;
  padding: 0 64rpx;
}

.agreement-link {
  font-size: 24rpx;
  color: var(--color-text-tertiary);
  text-decoration: none;
}

.agreement-link:active {
  color: var(--color-text-secondary);
}

.agreement-dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background-color: #d1d5db;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 20px);
  margin-top: auto;
  width: 100%;
}
</style>
