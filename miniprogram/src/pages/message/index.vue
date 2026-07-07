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
import { getNotificationList } from '@/services/api';
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

// ── 演示数据（后续对接 GET /v1/notifications 后替换） ──
const planNotifications = ref<PlanNotification[]>([]);
const systemAnnouncements = ref<SystemAnnouncement[]>([]);
const refreshing = ref(false);

const unreadPlanCount = computed(() => planNotifications.value.filter(p => p.unread).length);

function loadDemoData() {
  // 演示数据：和后续接口结构一致，方便替换
  planNotifications.value = [
    {
      id: 'pn-001',
      title: '你有1个新方案待查看',
      desc: '脱口秀标准版 T3 60min',
      date: '2026-07-07',
      unread: true,
      related_id: 'demand-001',
    },
  ];
  systemAnnouncements.value = [
    {
      id: 'sa-001',
      title: '喜剧工厂上线AI经纪人功能',
      desc: '智能匹配 + 三档方案推荐，提交需求更省心',
      date: '2026-07-06',
    },
  ];
}

// TODO(Phase 3): 对接真实接口 GET /v1/notifications，按 type 分组为 需求通知 / 系统公告
async function fetchNotifications() {
  // 开发阶段使用演示数据；接口就绪后改为：
  // const res = await getNotificationList({ page: 1, pageSize: 20 });
  // if (res.ok) { 分组映射... }
  const res = await getNotificationList({ page: 1, pageSize: 20 }).catch(() => null);
  // 当前仍以演示数据呈现，保证页面可用
  loadDemoData();
  if (res && res.ok) {
    // 接口已返回时，可选：用真实数据覆盖演示数据（这里保留演示以贴近附件截图）
  }
  refreshing.value = false;
}

function onPlanClick(item: PlanNotification) {
  item.unread = false;
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
  loadDemoData();
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
