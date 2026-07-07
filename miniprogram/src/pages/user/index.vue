<template>
  <view class="user-page">
    <!-- ===== 活动公司端：BEM风格 + 卡片化设计 ===== -->
    <template v-if="authStore.isAgent">
      <!-- 导航栏 -->
      <CfNavBar title="我的" :showBack="false" />

      <view class="company-card">
        <view class="company-main">
          <view class="company-avatar">
            <text>{{ companyInitial }}</text>
          </view>
          <view class="company-info">
            <text class="company-name">{{ companyName }}</text>
            <text class="company-verified">已认证企业</text>
          </view>
        </view>
        <view class="company-stats">
          <view class="company-stat">
            <text class="company-stat-num">6</text>
            <text class="company-stat-label">本月成交</text>
          </view>
          <view class="company-stat">
            <text class="company-stat-num">¥36K</text>
            <text class="company-stat-label">本月收入</text>
          </view>
          <view class="company-stat">
            <text class="company-stat-num">15</text>
            <text class="company-stat-label">合作艺人</text>
          </view>
        </view>
      </view>

      <view class="function-grid">
        <view
          v-for="item in functionItems"
          :key="item.label"
          class="function-item"
          @click="openFunction(item)"
        >
          <view class="function-icon" :style="{ background: item.bg }">
            <van-icon :name="item.icon" size="34rpx" :color="item.color" />
          </view>
          <text class="function-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="recent-orders">
        <view class="recent-header">
          <text class="recent-title">最近订单</text>
          <text class="recent-more" @click="navigateTo('/pages/user/orders/index')">查看全部 ›</text>
        </view>
        <view v-for="order in recentOrders" :key="order.id" class="recent-order">
          <text class="recent-order-name">{{ order.name }}</text>
          <text class="recent-order-status" :class="order.statusClass">{{ order.status }}</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="user-page__logout">
        <button class="user-page__logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>

    <!-- ===== 演员端（暂留原样式，Phase 3 改） ===== -->
    <template v-if="authStore.isPerformer">
      <CfNavBar title="我的" :showBack="false" />
      <view class="user-card">
        <view class="user-avatar" :style="{ background: avatarBg }">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ authStore.userInfo?.name || '未登录' }}</text>
          <view class="user-role"><text class="role-badge">{{ roleLabel }}</text></view>
          <text v-if="authStore.userInfo?.company_name" class="user-company">{{ authStore.userInfo.company_name }}</text>
        </view>
        <view class="user-edit" @click="goEditProfile"><text>编辑</text></view>
      </view>
      <van-grid :column-num="3" :border="false" class="stats-grid">
        <van-grid-item>
          <view class="stat-content">
            <text class="stat-value">{{ stats.assignmentCount }}</text>
            <text class="stat-label">排期</text>
          </view>
        </van-grid-item>
        <van-grid-item>
          <view class="stat-content">
            <text class="stat-value">{{ formatPrice(stats.monthlyIncome) }}</text>
            <text class="stat-label">月收入</text>
          </view>
        </van-grid-item>
        <van-grid-item>
          <view class="stat-content">
            <text class="stat-value">{{ stats.creditScore }}</text>
            <text class="stat-label">信誉分</text>
          </view>
        </van-grid-item>
      </van-grid>
      <van-cell-group class="menu-section" :border="false">
        <van-cell title="排期管理" is-link @click="navigateTo('/pages/assignment/list')" :border="false">
          <van-icon slot="icon" name="clock-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="签到打卡" is-link @click="navigateTo('/pages/checkin/index')" :border="false">
          <van-icon slot="icon" name="location-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="结算记录" is-link @click="navigateTo('/pages/settlement/index')" :border="false">
          <van-icon slot="icon" name="balance-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="信誉分" is-link @click="navigateTo('/pages/credit/index')" :border="false">
          <van-icon slot="icon" name="star-o" size="36rpx" class="menu-icon" />
        </van-cell>
      </van-cell-group>
      <van-cell-group class="menu-section" :border="false">
        <van-cell title="关于演立方" is-link @click="navigateTo('/pages/user/agreement/index')" :border="false">
          <van-icon slot="icon" name="info-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="意见反馈" is-link @click="navigateTo('/pages/user/feedback/index')" :border="false">
          <van-icon slot="icon" name="chat-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="设置" is-link @click="navigateTo('/pages/user/settings/index')" :border="false">
          <van-icon slot="icon" name="setting-o" size="36rpx" class="menu-icon" />
        </van-cell>
      </van-cell-group>
      <view class="user-page__logout">
        <button class="user-page__logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>

    <!-- ===== 管理员端（暂留原样式） ===== -->
    <template v-if="authStore.isAdmin">
      <CfNavBar title="我的" :showBack="false" />
      <view class="user-card">
        <view class="user-avatar" :style="{ background: avatarBg }">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ authStore.userInfo?.name || '未登录' }}</text>
          <view class="user-role"><text class="role-badge">{{ roleLabel }}</text></view>
        </view>
      </view>
      <van-cell-group class="menu-section" :border="false">
        <van-cell title="运营后台" is-link @click="navigateTo('/pages/admin/index')" :border="false">
          <van-icon slot="icon" name="manager-o" size="36rpx" class="menu-icon" />
        </van-cell>
      </van-cell-group>
      <van-cell-group class="menu-section" :border="false">
        <van-cell title="关于演立方" is-link @click="navigateTo('/pages/user/agreement/index')" :border="false">
          <van-icon slot="icon" name="info-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="意见反馈" is-link @click="navigateTo('/pages/user/feedback/index')" :border="false">
          <van-icon slot="icon" name="chat-o" size="36rpx" class="menu-icon" />
        </van-cell>
        <van-cell title="设置" is-link @click="navigateTo('/pages/user/settings/index')" :border="false">
          <van-icon slot="icon" name="setting-o" size="36rpx" class="menu-icon" />
        </van-cell>
      </van-cell-group>
      <view class="user-page__logout">
        <button class="user-page__logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { formatPrice } from '@/utils/format';
import { getNotificationList } from '@/services/api';
import CfNavBar from '@/components/CfNavBar.vue';

const authStore = useAuthStore();

const avatarColors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2"];
const avatarBg = computed(() => {
  const name = authStore.userInfo?.name || "";
  return avatarColors[name.length % avatarColors.length];
});
const userInitial = computed(() => (authStore.userInfo?.name || '?').charAt(0));
const companyName = computed(() => authStore.userInfo?.company_name || authStore.userInfo?.name || '演立方合作企业');
const companyInitial = computed(() => companyName.value.charAt(0));

const roleLabel = computed(() => {
  const map: Record<string, string> = { agent: '活动公司', performer: '演员', admin: '管理员' };
  return map[authStore.userInfo?.role || ''] || '用户';
});

const stats = reactive({
  demandCount: 12,
  activeCount: 3,
  signedCount: 8,
  assignmentCount: 5,
  monthlyIncome: 12800,
  creditScore: 920
});

const unreadCount = ref(0);

const functionItems = [
  { label: '订单管理', icon: 'orders-o', color: '#7c3aed', bg: '#f5f3ff', url: '/pages/user/orders/index' },
  { label: '收藏方案', icon: 'like-o', color: '#ef4444', bg: '#fef2f2', url: '/pages/user/favorites/index' },
  { label: '我的方案', icon: 'todo-list-o', color: '#3b82f6', bg: '#eff6ff', url: '/pages/request/list' },
  { label: '企业认证', icon: 'shop-o', color: '#16a34a', bg: '#f0fdf4', url: '/pages/user/company/index' },
  { label: '艺人管理', icon: 'friends-o', color: '#f59e0b', bg: '#fffbeb', url: '/pages/user/feedback/index' },
  { label: '数据报告', icon: 'bar-chart-o', color: '#6366f1', bg: '#eef2ff', url: '/pages/notification/index' },
  { label: '设置', icon: 'setting-o', color: '#6b7280', bg: '#f7f7f8', url: '/pages/user/settings/index' },
  { label: '切换艺人模式', icon: 'exchange', color: '#7c3aed', bg: '#f5f3ff', url: '/pages/onboarding/index' },
];

const recentOrders = [
  { id: 'o1', name: '星河科技年会脱口秀', status: '待确认', statusClass: 'warning' },
  { id: 'o2', name: '锦城地产开业魔术喜剧', status: '演出中', statusClass: 'success' },
  { id: 'o3', name: '云启银行客户答谢会', status: '已完成', statusClass: 'done' },
  { id: 'o4', name: '青柠传媒团建活动', status: '已报价', statusClass: 'info' },
];

async function fetchUnreadCount() {
  try {
    const res = await getNotificationList({ page: 1, pageSize: 50 });
    if (res.ok) {
      const list = res.data || [];
      unreadCount.value = list.filter((n: any) => !n.is_read).length;
    }
  } catch (e) {
    console.error('获取未读通知数失败:', e);
  }
}

onMounted(() => {
  fetchUnreadCount();
});

function navigateTo(url: string) { uni.navigateTo({ url }); }
function switchTab(url: string) { uni.switchTab({ url }); }

function openFunction(item: { url: string; tab?: boolean }) {
  if (item.tab) {
    uni.switchTab({ url: item.url });
    return;
  }
  uni.navigateTo({ url: item.url });
}

function goEditProfile() {
  uni.showToast({ title: '编辑资料（待实现）', icon: 'none' });
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.reLaunch({ url: '/pages/login/index' });
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: 120rpx;
}

.company-card {
  margin: 24rpx $space-lg;
  padding: 32rpx;
  border-radius: $radius-lg;
  background: $color-primary;
  color: #ffffff;
  box-shadow: $shadow-md;
}

.company-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.company-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 3rpx solid rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 800;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.company-name {
  font-size: $text-xl;
  font-weight: 800;
}

.company-verified {
  align-self: flex-start;
  padding: 4rpx 14rpx;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.18);
  font-size: $text-xs;
  font-weight: 700;
}

.company-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 32rpx;
}

.company-stat {
  flex: 1;
  text-align: center;
}

.company-stat-num {
  display: block;
  font-size: $text-2xl;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
}

.company-stat-label {
  display: block;
  margin-top: 6rpx;
  font-size: $text-xs;
  color: rgba(255, 255, 255, 0.72);
}

.function-grid {
  margin: 0 $space-lg 24rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  padding: 24rpx;
  border-radius: $radius-lg;
  background: $color-bg-card;
  box-shadow: $shadow-sm;
}

.function-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.function-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.function-label {
  width: 100%;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.25;
  color: $color-text-primary;
  font-weight: 600;
}

.recent-orders {
  margin: 0 $space-lg 24rpx;
  padding: 24rpx;
  border-radius: $radius-lg;
  background: $color-bg-card;
  box-shadow: $shadow-sm;
}

.recent-header,
.recent-order {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-header {
  margin-bottom: 12rpx;
}

.recent-title {
  font-size: $text-md;
  font-weight: 800;
  color: $color-text-primary;
}

.recent-more {
  color: $color-primary;
  font-size: $text-sm;
}

.recent-order {
  min-height: 72rpx;
  border-top: 1rpx solid $color-divider;
}

.recent-order-name {
  flex: 1;
  min-width: 0;
  color: $color-text-primary;
  font-size: $text-base;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-order-status {
  margin-left: 16rpx;
  padding: 4rpx 14rpx;
  border-radius: $radius-full;
  font-size: 22rpx;
  font-weight: 700;
  background: #f5f5f7;
  color: #6b7280;
  &.warning {
    background: #fffbeb;
    color: #f59e0b;
  }
  &.success,
  &.done {
    background: #f0fdf4;
    color: #16a34a;
  }
  &.info {
    background: #f5f3ff;
    color: $color-primary;
  }
}

  // ===== 头部区域 =====
/* Legacy styles kept for performer/admin layouts. */
.user-page {
  &__header {
    background: linear-gradient(135deg, $color-primary, $color-primary-dark);
    padding: $space-xl $space-base 80rpx;
  }

  &__profile {
    display: flex;
    align-items: center;
  }

  &__avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4rpx solid #ffffff;
    margin-right: $space-lg;
  }

  &__avatar-text {
    font-size: 44rpx;
    font-weight: 700;
    color: #ffffff;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  &__name {
    font-size: $text-xl;
    font-weight: 600;
    color: #ffffff;
    display: block;
  }

  &__badges {
    display: flex;
    gap: $space-sm;
  }

  &__badge {
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
    font-size: $text-xs;

    &--role {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    &--verified {
      background: #fbbf24;
      color: $color-text-primary;
    }
  }

  // ===== 数据概览浮层卡片 =====
  &__overview {
    margin: -48rpx $space-lg 24rpx;
    position: relative;
    z-index: 1;
    background: $color-bg-card;
    border-radius: $radius-md;
    padding: $space-lg;
    display: flex;
    align-items: center;
    box-shadow: $shadow-sm;
  }

  &__overview-item {
    flex: 1;
    text-align: center;
  }

  &__overview-num {
    font-size: $text-3xl;
    font-weight: 700;
    color: $color-text-primary;
    display: block;

    &--pending {
      color: $state-pending;
    }

    &--confirmed {
      color: $state-confirmed;
    }
  }

  &__overview-label {
    font-size: $text-xs;
    color: $color-text-tertiary;
    margin-top: 4rpx;
    display: block;
  }

  &__overview-divider {
    width: 1rpx;
    height: 48rpx;
    background-color: $color-divider;
  }

  // ===== 菜单组 =====
  &__menu {
    margin: 0 $space-lg 24rpx;
    background: $color-bg-card;
    border-radius: $radius-md;
    overflow: hidden;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    padding: $space-lg $space-lg;
    border-bottom: 1rpx solid $color-divider;

    &--last {
      border-bottom: none;
    }

    &--active {
      background-color: $color-bg-page;
    }
  }

  &__menu-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $space-md;
  }

  &__menu-text {
    flex: 1;
    font-size: $text-md;
    color: $color-text-primary;
  }

  &__menu-arrow {
    color: $color-text-placeholder;
    font-size: $text-sm;
  }

  &__menu-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__unread-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36rpx;
    height: 36rpx;
    padding: 0 10rpx;
    border-radius: $radius-full;
    background: $state-error;
    color: #ffffff;
    font-size: 22rpx;
    font-weight: 600;
  }

  // ===== 退出登录 =====
  &__logout {
    padding: 40rpx $space-xl;
  }

  &__logout-btn {
    width: 100%;
    height: 88rpx;
    background: transparent;
    border: 1rpx solid $state-error;
    border-radius: $radius-lg;
    color: $state-error;
    font-size: 28rpx;
    line-height: 88rpx;
  }
}

// ===== 演员端/管理员端旧样式（Phase 3 改，不动） =====
.user-card {
  display: flex;
  align-items: center;
  background: $color-bg-card;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
}
.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}
.user-avatar .avatar-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $color-text-primary;
  display: block;
}
.user-role {
  margin-top: 6rpx;
}
.role-badge {
  font-size: 22rpx;
  color: $color-primary;
  background: $color-primary-bg;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}
.user-company {
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 6rpx;
  display: block;
}
.user-edit {
  font-size: 26rpx;
  color: $color-text-tertiary;
}
.stats-grid {
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.stat-content {
  text-align: center;
  padding: 24rpx 0;
}
.stat-content .stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: $color-primary;
  display: block;
}
.stat-content .stat-label {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 4rpx;
  display: block;
}
.menu-section {
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
.menu-icon {
  margin-right: 16rpx;
}
</style>
