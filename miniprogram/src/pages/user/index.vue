<template>
  <view class="user-page">
    <!-- ===== 活动公司端：BEM风格 + 卡片化设计 ===== -->
    <template v-if="authStore.isAgent">
      <!-- 导航栏 -->
      <CfNavBar title="我的" :showBack="false" />

      <!-- 用户卡片头部 -->
      <view class="user-page__header">
        <view class="user-page__profile">
          <view class="user-page__avatar">
            <text class="user-page__avatar-text">{{ userInitial }}</text>
          </view>
          <view class="user-page__info">
            <text class="user-page__name">{{ authStore.userInfo?.company_name || authStore.userInfo?.name || '未登录' }}</text>
            <view class="user-page__badges">
              <view class="user-page__badge user-page__badge--role"><text>活动公司</text></view>
              <view class="user-page__badge user-page__badge--verified"><text>认证企业</text></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 数据概览卡片 -->
      <view class="user-page__overview">
        <view class="user-page__overview-item">
          <text class="user-page__overview-num">{{ stats.demandCount }}</text>
          <text class="user-page__overview-label">需求总数</text>
        </view>
        <view class="user-page__overview-divider" />
        <view class="user-page__overview-item">
          <text class="user-page__overview-num user-page__overview-num--pending">{{ stats.activeCount }}</text>
          <text class="user-page__overview-label">进行中</text>
        </view>
        <view class="user-page__overview-divider" />
        <view class="user-page__overview-item">
          <text class="user-page__overview-num user-page__overview-num--confirmed">{{ stats.signedCount }}</text>
          <text class="user-page__overview-label">已签约</text>
        </view>
      </view>

      <!-- 功能菜单组 1 -->
      <view class="user-page__menu">
        <view class="user-page__menu-item" @click="switchTab('/pages/request/list')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #f5f3ff;">
            <van-icon name="todo-list-o" size="32rpx" color="#7c3aed" />
          </view>
          <text class="user-page__menu-text">我的需求</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/user/favorites/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #fef2f2;">
            <van-icon name="like-o" size="32rpx" color="#ef4444" />
          </view>
          <text class="user-page__menu-text">我的收藏</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/user/orders/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #eff6ff;">
            <van-icon name="clock-o" size="32rpx" color="#3b82f6" />
          </view>
          <text class="user-page__menu-text">历史订单</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/user/company/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #f5f3ff;">
            <van-icon name="shop-o" size="32rpx" color="#7c3aed" />
          </view>
          <text class="user-page__menu-text">企业信息</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/notification/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #fff7ed;">
            <van-icon name="bell-o" size="32rpx" color="#f97316" />
          </view>
          <text class="user-page__menu-text">消息通知</text>
          <view class="user-page__menu-right">
            <view v-if="unreadCount > 0" class="user-page__unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
            <text class="user-page__menu-arrow">&#8250;</text>
          </view>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/message/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #eef2ff;">
            <van-icon name="comment-o" size="32rpx" color="#6366f1" />
          </view>
          <text class="user-page__menu-text">消息中心</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item user-page__menu-item--last" @click="navigateTo('/pages/user/invoice/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #fffbeb;">
            <van-icon name="bill-o" size="32rpx" color="#f59e0b" />
          </view>
          <text class="user-page__menu-text">发票管理</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
      </view>

      <!-- 功能菜单组 2 -->
      <view class="user-page__menu">
        <view class="user-page__menu-item" @click="navigateTo('/pages/user/feedback/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #eef2ff;">
            <van-icon name="service-o" size="32rpx" color="#6366f1" />
          </view>
          <text class="user-page__menu-text">联系客服</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/user/feedback/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #f0fdf4;">
            <van-icon name="chat-o" size="32rpx" color="#22c55e" />
          </view>
          <text class="user-page__menu-text">意见反馈</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item" @click="navigateTo('/pages/user/agreement/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #f5f3ff;">
            <van-icon name="info-o" size="32rpx" color="#7c3aed" />
          </view>
          <text class="user-page__menu-text">关于我们</text>
          <text class="user-page__menu-arrow">&#8250;</text>
        </view>
        <view class="user-page__menu-item user-page__menu-item--last" @click="navigateTo('/pages/user/settings/index')" hover-class="user-page__menu-item--active">
          <view class="user-page__menu-icon" style="background: #f7f7f8;">
            <van-icon name="setting-o" size="32rpx" color="#6b7280" />
          </view>
          <text class="user-page__menu-text">设置</text>
          <text class="user-page__menu-arrow">&#8250;</text>
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
        <van-cell title="关于喜剧工厂" is-link @click="navigateTo('/pages/user/agreement/index')" :border="false">
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
        <van-cell title="关于喜剧工厂" is-link @click="navigateTo('/pages/user/agreement/index')" :border="false">
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

  // ===== 头部区域 =====
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
