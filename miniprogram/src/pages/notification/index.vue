<template>
  <view class="notification-page">
    <!-- 列表区域 -->
    <scroll-view
      scroll-y
      class="notification-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="loading && notificationList.length === 0" class="loading-state">
        <van-loading type="spinner" size="48rpx" />
        <text class="loading-text">加载中...</text>
      </view>

      <template v-else-if="notificationList.length > 0">
        <view
          v-for="item in notificationList"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.is_read }"
          @click="onNotificationClick(item)"
        >
          <view class="notification-left">
            <view class="notification-icon" :style="{ background: item._iconBg || getIconBg(item.type) }">
              <van-icon :name="item._iconName || getIconName(item.type)" size="36rpx" :color="item._iconColor || getIconColor(item.type)" />
            </view>
            <view class="notification-body">
              <view class="notification-header">
                <text class="notification-title">{{ item.title }}</text>
                <view v-if="!item.is_read" class="unread-dot"></view>
              </view>
              <text class="notification-content">{{ item.content }}</text>
              <text class="notification-time">{{ formatTime(item.created_at) }}</text>
            </view>
          </view>
          <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
        </view>
      </template>

      <EmptyState v-else icon="bell-o" title="暂无通知" description="有新的消息会在这里显示" />

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getNotificationList, markNotificationRead } from '@/services/api';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  related_id?: string;
  related_type?: string;
  created_at: string;
  _iconName?: string;
  _iconBg?: string;
  _iconColor?: string;
}

const notificationList = ref<NotificationItem[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const page = ref(1);
const hasMore = ref(true);

const TYPE_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  demand_status: { icon: 'todo-list-o', bg: '#eff6ff', color: '#3b82f6' },
  plan_confirmed: { icon: 'checked', bg: '#f0fdf4', color: '#22c55e' },
  assignment_new: { icon: 'clock-o', bg: '#f5f3ff', color: '#7c3aed' },
  settlement: { icon: 'gold-coin-o', bg: '#fffbeb', color: '#f59e0b' },
  system: { icon: 'info-o', bg: '#fef2f2', color: '#ef4444' },
};

function getIconName(type: string): string {
  return TYPE_CONFIG[type]?.icon || 'bell-o';
}
function getIconBg(type: string): string {
  return TYPE_CONFIG[type]?.bg || '#f5f5f7';
}
function getIconColor(type: string): string {
  return TYPE_CONFIG[type]?.color || '#6b7280';
}

function formatTime(iso: string): string {
  if (!iso) return '';
  // 智能格式化：当天显示时间，其他显示日期
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  const diff = now.getTime() - d.getTime();
  const daysDiff = Math.floor(diff / (1000 * 3600 * 24));
  if (daysDiff === 1) return '昨天';
  if (daysDiff === 2) return '前天';
  if (daysDiff < 7) return `${daysDiff}天前`;
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

function onNotificationClick(item: NotificationItem) {
  // 标记已读
  if (!item.is_read) {
    markReadAction(item.id);
  }
  // 跳转到相关页面
  if (item.related_id && item.related_type) {
    const routeMap: Record<string, string> = {
      demand: '/pages/request/detail?id=' + item.related_id,
      assignment: '/pages/assignment/detail?id=' + item.related_id,
      settlement: '/pages/settlement/index',
    };
    const url = routeMap[item.related_type];
    if (url) {
      uni.navigateTo({ url });
    }
  }
}

async function markReadAction(id: string) {
  try {
    const res = await markNotificationRead(id);
    if (res.ok) {
      const item = notificationList.value.find(n => n.id === id);
      if (item) item.is_read = true;
    }
  } catch (e) {
    console.error('标记已读失败:', e);
  }
}

async function fetchNotifications(reset = false) {
  if (!reset && !hasMore.value) return;
  if (reset) page.value = 1;
  loading.value = true;

  try {
    const res = await getNotificationList({ page: page.value, pageSize: 20 });
    if (res.ok) {
      const list: NotificationItem[] = (res.data || []).map((item: any) => ({
        ...item,
        _iconName: getIconName(item.type),
        _iconBg: getIconBg(item.type),
        _iconColor: getIconColor(item.type),
      }));
      if (reset) {
        notificationList.value = list;
      } else {
        notificationList.value.push(...list);
      }
      hasMore.value = list.length >= 20;
      if (list.length > 0) page.value++;
    }
  } catch (e) {
    console.error('加载通知失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onRefresh() {
  refreshing.value = true;
  fetchNotifications(true);
}

onMounted(() => {
  fetchNotifications(true);
});
</script>

<style lang="scss" scoped>
.notification-page {
  min-height: 100vh;
  background: #f5f5f7;
}

.notification-list {
  height: 100vh;
  padding-top: 16rpx;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  margin: 0 32rpx 12rpx;
  background: #ffffff;
  border-radius: 20rpx;
  transition: background 0.2s;
}
.notification-item:active {
  background: #f9f9fb;
}
.notification-item.unread {
  background: #faf5ff;
  border: 1px solid #ede9fe;
}

.notification-left {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
}

.notification-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.notification-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.notification-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 480rpx;
}

.unread-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

.notification-content {
  font-size: 26rpx;
  color: #6b7280;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.5;
}

.notification-time {
  font-size: 22rpx;
  color: #9ca3af;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 16rpx;
}
.loading-text {
  font-size: 26rpx;
  color: #9ca3af;
}
</style>
