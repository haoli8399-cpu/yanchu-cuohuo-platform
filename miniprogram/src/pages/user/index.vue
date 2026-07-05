<template>
  <view class="user-page">
    <!-- ===== 活动公司端：紫渐变头部 ===== -->
    <template v-if="authStore.isAgent">
      <view class="profile-header">
        <view class="profile-row">
          <view class="profile-avatar">
            <text class="avatar-text">{{ userInitial }}</text>
          </view>
          <view class="profile-info">
            <text class="profile-name">{{ authStore.userInfo?.company_name || authStore.userInfo?.name || '未登录' }}</text>
            <view class="profile-tags">
              <text class="tag-role">活动公司</text>
              <text class="tag-verified">认证企业</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 数据概览浮层卡片 -->
      <view class="stats-card">
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-value" style="color: #1a1a2e;">{{ stats.demandCount }}</text>
            <text class="stat-label">需求总数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value" style="color: #f59e0b;">{{ stats.activeCount }}</text>
            <text class="stat-label">进行中</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value" style="color: #22c55e;">{{ stats.signedCount }}</text>
            <text class="stat-label">已签约</text>
          </view>
        </view>
      </view>

      <!-- 功能菜单组 1 -->
      <view class="menu-group">
        <view class="menu-item" @click="switchTab('/pages/request/list')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #f5f3ff;">
              <van-icon name="todo-list-o" size="32rpx" color="#7c3aed" />
            </view>
            <text class="menu-text">我的需求</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/favorites/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #fef2f2;">
              <van-icon name="like-o" size="32rpx" color="#ef4444" />
            </view>
            <text class="menu-text">我的收藏</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/orders/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #eff6ff;">
              <van-icon name="clock-o" size="32rpx" color="#3b82f6" />
            </view>
            <text class="menu-text">历史订单</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/company/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #f5f3ff;">
              <van-icon name="shop-o" size="32rpx" color="#7c3aed" />
            </view>
            <text class="menu-text">企业信息</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/notification/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #fff7ed;">
              <van-icon name="bell-o" size="32rpx" color="#f97316" />
            </view>
            <text class="menu-text">消息通知</text>
          </view>
          <view class="menu-right">
            <view v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
            <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
          </view>
        </view>
        <view class="menu-item" style="border-bottom: none;" @click="navigateTo('/pages/user/invoice/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #fffbeb;">
              <van-icon name="bill-o" size="32rpx" color="#f59e0b" />
            </view>
            <text class="menu-text">发票管理</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
      </view>

      <!-- 功能菜单组 2 -->
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/user/feedback/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #eef2ff;">
              <van-icon name="service-o" size="32rpx" color="#6366f1" />
            </view>
            <text class="menu-text">联系客服</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/feedback/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #f0fdf4;">
              <van-icon name="chat-o" size="32rpx" color="#22c55e" />
            </view>
            <text class="menu-text">意见反馈</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/agreement/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #f5f3ff;">
              <van-icon name="info-o" size="32rpx" color="#7c3aed" />
            </view>
            <text class="menu-text">关于我们</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
        <view class="menu-item" style="border-bottom: none;" @click="navigateTo('/pages/user/settings/index')" hover-class="menu-hover">
          <view class="menu-left">
            <view class="icon-circle" style="background: #f7f7f8;">
              <van-icon name="setting-o" size="32rpx" color="#6b7280" />
            </view>
            <text class="menu-text">设置</text>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>

    <!-- ===== 演员端（暂留原样式，Phase 3 改） ===== -->
    <template v-if="authStore.isPerformer">
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
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>

    <!-- ===== 管理员端（暂留原样式） ===== -->
    <template v-if="authStore.isAdmin">
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
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>

    <TabBar current="/pages/user/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { formatPrice } from '@/utils/format';
import { getNotificationList } from '@/services/api';

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
.user-page { min-height: 100vh; background: #f5f5f7; padding-bottom: 120rpx; }

/* ===== 公司端：紫渐变头部 ===== */
.profile-header {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  padding: 48rpx 32rpx 80rpx;
  border-radius: 0 0 48rpx 48rpx;
}
.profile-row { display: flex; align-items: center; gap: 24rpx; }
.profile-avatar {
  width: 112rpx; height: 112rpx; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  border: 4rpx solid #ffffff;
}
.profile-avatar .avatar-text { font-size: 44rpx; font-weight: 700; color: #ffffff; }
.profile-info { display: flex; flex-direction: column; gap: 12rpx; }
.profile-name { font-size: 36rpx; font-weight: 600; color: #ffffff; }
.profile-tags { display: flex; align-items: center; gap: 12rpx; }
.tag-role {
  display: inline-flex; align-items: center;
  padding: 4rpx 16rpx; border-radius: 9999px;
  font-size: 22rpx; color: #ffffff;
  background: rgba(255,255,255,0.2);
}
.tag-verified {
  display: inline-flex; align-items: center;
  padding: 4rpx 16rpx; border-radius: 9999px;
  font-size: 22rpx; font-weight: 500;
  background: #fbbf24; color: #1a1a2e;
}

/* ===== 数据概览卡片 ===== */
.stats-card {
  margin: -40rpx 32rpx 24rpx;
  position: relative; z-index: 10;
  background: #ffffff; border-radius: 32rpx; padding: 32rpx;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stats-row { display: flex; align-items: center; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 48rpx; font-weight: 700; display: block; }
.stat-label { font-size: 24rpx; color: #9ca3af; margin-top: 8rpx; display: block; }
.stat-divider { width: 1px; height: 40rpx; background: #f0f0f2; }

/* ===== 菜单组 ===== */
.menu-group { margin: 0 32rpx 24rpx; background: #ffffff; border-radius: 24rpx; overflow: hidden; }
.menu-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1px solid #f0f0f2;
}
.menu-hover { background: #f9f9fb; }
.menu-left { display: flex; align-items: center; gap: 20rpx; }
.icon-circle { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.menu-text { font-size: 30rpx; color: #1a1a2e; }

/* 消息通知红点 */
.menu-right { display: flex; align-items: center; gap: 12rpx; }
.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 10rpx;
  border-radius: 9999px;
  background: #ef4444;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 600;
}

/* ===== 退出登录 ===== */
.logout-section { padding: 40rpx 32rpx; }
.logout-btn {
  width: 100%; height: 88rpx; background: transparent;
  border: 1px solid var(--state-error, #ef4444);
  border-radius: var(--radius-lg, 16rpx);
  color: var(--state-error, #ef4444);
  font-size: 28rpx; line-height: 88rpx;
}

/* ===== 演员端/管理员端旧样式 ===== */
.user-card {
  display: flex; align-items: center; background: var(--color-bg-card, #ffffff);
  padding: 48rpx 32rpx; margin-bottom: 24rpx;
}
.user-avatar {
  width: 100rpx; height: 100rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin-right: 24rpx;
}
.user-avatar .avatar-text { font-size: 40rpx; font-weight: 700; color: #fff; }
.user-info { flex: 1; }
.user-name { font-size: 36rpx; font-weight: 700; color: var(--color-text-primary, #1a1a2e); display: block; }
.user-role { margin-top: 6rpx; }
.role-badge { font-size: 22rpx; color: var(--color-primary, #7c3aed); background: var(--color-bg-card, #f5f3ff); padding: 4rpx 16rpx; border-radius: 8rpx; }
.user-company { font-size: 24rpx; color: var(--color-text-secondary, #6b7280); margin-top: 6rpx; display: block; }
.user-edit { font-size: 26rpx; color: var(--color-text-tertiary, #9ca3af); }

.stats-grid { margin: 0 24rpx 24rpx; background: #fff; border-radius: 16rpx; overflow: hidden; }
.stat-content { text-align: center; padding: 24rpx 0; }
.stat-content .stat-value { font-size: 36rpx; font-weight: 700; color: var(--color-primary, #7c3aed); display: block; }
.stat-content .stat-label { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; display: block; }

.menu-section { margin: 0 24rpx 24rpx; border-radius: 16rpx; overflow: hidden; }
.menu-icon { margin-right: 16rpx; }
</style>
