<template>
  <view class="message-page">
    <!-- 导航栏 -->
    <CfNavBar title="消息" :showBack="true" />

    <!-- 列表区域 -->
    <scroll-view
      scroll-y
      class="message-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态：两类消息都为空 -->
      <view v-if="planNotifications.length === 0 && systemAnnouncements.length === 0" class="empty-state">
        <van-icon name="comment-o" size="96rpx" color="#d1d5db" />
        <text class="empty-text">暂无消息</text>
      </view>

      <template v-else>
        <!-- 需求通知 -->
        <view class="section">
          <view class="section-header">
            <text class="section-icon">📋</text>
            <text class="section-title">需求通知</text>
            <view v-if="unreadPlanCount > 0" class="section-badge">{{ unreadPlanCount }}</view>
          </view>
          <view
            v-for="item in planNotifications"
            :key="item.id"
            class="msg-card"
            :class="{ unread: item.unread }"
            @click="onPlanClick(item)"
          >
            <view class="msg-card-top">
              <text class="msg-title">{{ item.title }}</text>
              <view v-if="item.unread" class="unread-dot"></view>
            </view>
            <text class="msg-desc">{{ item.desc }}</text>
            <text class="msg-time">{{ item.date }}</text>
          </view>
        </view>

        <!-- 系统公告 -->
        <view class="section">
          <view class="section-header">
            <text class="section-icon">📢</text>
            <text class="section-title">系统公告</text>
          </view>
          <view
            v-for="item in systemAnnouncements"
            :key="item.id"
            class="msg-card"
            @click="onAnnouncementClick(item)"
          >
            <view class="msg-card-top">
              <text class="msg-title">{{ item.title }}</text>
            </view>
            <text v-if="item.desc" class="msg-desc">{{ item.desc }}</text>
            <text class="msg-time">{{ item.date }}</text>
          </view>
        </view>

        <!-- 底部引导 -->
        <view class="footer-hint" @click="goFindPlan">
          <text>没有新消息？试试「找方案」发现更多 ›</text>
        </view>
      </template>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getNotificationList, markNotificationRead } from '@/services/api';
import type { NotificationItem } from '@/services/api';
import CfNavBar from '@/components/CfNavBar.vue';

interface PlanNotification {
  id: string;
  title: string;
  desc: string;
  date: string;
  unread: boolean;
  related_id?: string;
}
interface SystemAnnouncement {
  id: string;
  title: string;
  desc: string;
  date: string;
}

const planNotifications = ref<PlanNotification[]>([]);
const systemAnnouncements = ref<SystemAnnouncement[]>([]);
const refreshing = ref(false);

const unreadPlanCount = computed(() => planNotifications.value.filter(p => p.unread).length);

// 通知类型 → 需求通知分组
const PLAN_TYPES = new Set(['demand_status', 'plan_confirmed', 'quoted', 'demand_quoted']);
// 通知类型 → 系统公告分组
const SYSTEM_TYPES = new Set(['system', 'system_announcement']);

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

// 将 API 返回的 NotificationItem 映射为前端展示结构
function mapToPlan(item: NotificationItem): PlanNotification {
  return {
    id: item.id,
    title: item.title,
    desc: item.content,
    date: formatDate(item.created_at),
    unread: !item.is_read,
    related_id: item.related_id,
  };
}

function mapToAnnouncement(item: NotificationItem): SystemAnnouncement {
  return {
    id: item.id,
    title: item.title,
    desc: item.content,
    date: formatDate(item.created_at),
  };
}

async function fetchNotifications() {
  try {
    const res = await getNotificationList({ page: 1, pageSize: 20 });
    if (res.ok && res.data) {
      const plans: PlanNotification[] = [];
      const announcements: SystemAnnouncement[] = [];

      for (const item of res.data) {
        if (PLAN_TYPES.has(item.type)) {
          plans.push(mapToPlan(item));
        } else if (SYSTEM_TYPES.has(item.type)) {
          announcements.push(mapToAnnouncement(item));
        } else {
          // 未识别的类型：统一归为系统公告
          announcements.push(mapToAnnouncement(item));
        }
      }

      planNotifications.value = plans;
      systemAnnouncements.value = announcements;
    } else {
      planNotifications.value = [];
      systemAnnouncements.value = [];
    }
  } catch {
    planNotifications.value = [];
    systemAnnouncements.value = [];
  }
  refreshing.value = false;
}

async function onPlanClick(item: PlanNotification) {
  // 标记已读
  if (item.unread) {
    item.unread = false;
    markNotificationRead(item.id).catch(() => {});
  }
  if (item.related_id) {
    uni.navigateTo({ url: `/pages/request/detail?id=${item.related_id}` });
  }
}

function onAnnouncementClick(_item: SystemAnnouncement) {
  // 系统公告暂为纯展示，后续可跳公告详情
}

function goFindPlan() {
  uni.switchTab({ url: '/pages/sku/list' });
}

function onRefresh() {
  refreshing.value = true;
  fetchNotifications();
}

onMounted(() => {
  fetchNotifications();
});
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background: $color-bg-page;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  height: 100vh;
  padding-top: 16rpx;
  box-sizing: border-box;
}

// 区块
.section {
  margin: 0 32rpx 28rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 4rpx 16rpx;
  .section-icon { font-size: 32rpx; }
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $color-text-primary;
  }
  .section-badge {
    min-width: 32rpx;
    height: 32rpx;
    padding: 0 8rpx;
    border-radius: 9999px;
    background: $state-error;
    color: #fff;
    font-size: 22rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// 消息卡片
.msg-card {
  background: $color-bg-card;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;
  transition: background 0.2s;
  &:active { background: $color-bg-input; }
  &.unread {
    background: $color-primary-bg;
    border: 1rpx solid $color-primary-lighter;
  }
}

.msg-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .msg-title {
    font-size: 28rpx;
    font-weight: 500;
    color: $color-text-primary;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.unread-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $state-error;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.msg-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: $color-text-secondary;
  line-height: 1.5;
}

.msg-time {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $color-text-tertiary;
}

// 底部引导
.footer-hint {
  margin: 8rpx 32rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: $color-primary;
  padding: 24rpx 0;
  &:active { opacity: 0.7; }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  .empty-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: $color-text-tertiary;
  }
}
</style>
