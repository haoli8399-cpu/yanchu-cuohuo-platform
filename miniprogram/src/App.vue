<template>
  <view class="app-container">
    <!-- uni-app 小程序不支持 router-view，页面路由由 pages.json 管理 -->
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// 白名单：不需要登录即可访问的页面
const publicPages = [
  '/pages/login/index',
];
// 未入驻演员可访问的页面
const onboardingPages = [
  '/pages/onboarding/index',
];

onLaunch(() => {
  // 检查登录状态
  authStore.checkLoginStatus();
});

// 每次页面显示时检查登录状态 — 路由守卫
onShow(() => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1] as any;
    const route = '/' + currentPage.route;

    // 未登录且不在白名单 → 跳转登录页
    if (!authStore.isLoggedIn && !publicPages.includes(route)) {
      uni.reLaunch({ url: '/pages/login/index' });
      return;
    }

    // 已登录的演员角色但未入驻且不在入驻页 → 跳转到入驻页
    const userInfo = authStore.userInfo;
    if (userInfo?.role === 'performer' && !userInfo.actor_id && !onboardingPages.includes(route)) {
      uni.reLaunch({ url: '/pages/onboarding/index' });
    }
  }
});
</script>

<style lang="scss">
/* ============================================
   Comedy Factory (喜剧工厂) — Brand Design System
   ============================================ */
page {
  /* ——— Brand Primary (Purple System) ——— */
  --color-primary: #7c3aed;
  --color-primary-hover: #6d28d9;
  --color-primary-active: #5b21b6;
  --color-primary-light: #a78bfa;
  --color-primary-lighter: #ddd6fe;
  --color-primary-bg: #f5f3ff;
  --color-primary-subtle: #ede9fe;

  /* ——— Neutral Scale ——— */
  --color-bg-page: #f5f5f7;
  --color-bg-card: #ffffff;
  --color-bg-elevated: #ffffff;
  --color-bg-input: #f7f7f8;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);

  /* ——— Text ——— */
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-text-placeholder: #c4c4cc;
  --color-text-inverse: #ffffff;
  --color-text-link: #7c3aed;

  /* ——— Border & Divider ——— */
  --color-border: #e5e7eb;
  --color-divider: #f0f0f2;

  /* ——— Semantic Status ——— */
  --state-pending: #f59e0b;
  --state-pending-bg: #fffbeb;
  --state-quoted: #3b82f6;
  --state-quoted-bg: #eff6ff;
  --state-confirmed: #22c55e;
  --state-confirmed-bg: #f0fdf4;
  --state-signed: #7c3aed;
  --state-signed-bg: #f5f3ff;
  --state-cancelled: #ef4444;
  --state-cancelled-bg: #fef2f2;
  --state-info: #6366f1;
  --state-info-bg: #eef2ff;
  --state-success: #22c55e;
  --state-warning: #f59e0b;
  --state-error: #ef4444;

  /* ——— Shadow ——— */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.05);
  --shadow-float: 0 8px 32px rgba(0, 0, 0, 0.12);

  /* ——— Radius ——— */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* ——— Spacing ——— */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-base: 16px;
  --space-lg: 20px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* ——— Typography ——— */
  --text-xs: 20rpx;
  --text-sm: 24rpx;
  --text-base: 28rpx;
  --text-md: 30rpx;
  --text-lg: 32rpx;
  --text-xl: 36rpx;
  --text-2xl: 40rpx;
  --text-3xl: 48rpx;
  --text-4xl: 56rpx;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ——— Tab Bar ——— */
  --tab-bar-height: 100rpx;
  --tab-bar-bg: #ffffff;
  --tab-bar-border: #e5e7eb;
  --tab-bar-icon-inactive: #9ca3af;
  --tab-bar-icon-active: #7c3aed;
  --tab-bar-text-inactive: #9ca3af;
  --tab-bar-text-active: #7c3aed;

  /* ——— Navigation Bar ——— */
  --nav-bar-height: 88rpx;
  --nav-bar-bg: #ffffff;
  --nav-bar-title-color: #1a1a2e;

  /* ——— Component Specific ——— */
  --btn-primary-bg: #7c3aed;
  --btn-primary-text: #ffffff;
  --btn-primary-radius: 44rpx;
  --btn-primary-height: 88rpx;
  --btn-primary-font-size: 32rpx;

  --btn-ghost-bg: #f5f3ff;
  --btn-ghost-text: #7c3aed;

  --card-bg: #ffffff;
  --card-radius: 16rpx;
  --card-padding: 24rpx;
  --card-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  --input-bg: #f7f7f8;
  --input-radius: 12rpx;
  --input-border: #e5e7eb;
  --input-height: 80rpx;
  --input-padding: 0 24rpx;
  --input-font-size: 28rpx;

  --tag-radius: 8rpx;
  --tag-padding: 4rpx 12rpx;
  --tag-font-size: 22rpx;

  font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-size: 28rpx;
  line-height: 1.5;
}

/* ========== 通用辅助 ========== */
.hover-opacity { transition: opacity 0.15s ease; &:active { opacity: .7; } }
.hover-scale { transition: transform 0.15s ease; &:active { transform: scale(.97); } }
</style>
