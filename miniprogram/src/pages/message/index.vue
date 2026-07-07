<template>
  <view class="message-page">
    <CfNavBar title="消息" :showBack="false" />

    <view class="message-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="message-tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="message-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="filteredMessages.length === 0" class="empty-state">
        <van-icon name="comment-o" size="96rpx" color="#d1d5db" />
        <text class="empty-text">暂无消息</text>
      </view>

      <view
        v-for="item in filteredMessages"
        :key="item.id"
        class="message-card"
        @click="onMessageClick(item)"
      >
        <view class="message-avatar" :style="{ background: typeMeta[item.kind].color }">
          <text>{{ typeMeta[item.kind].icon }}</text>
        </view>
        <view class="message-body">
          <view class="message-head">
            <text class="message-title">{{ item.title }}</text>
            <text class="message-time">{{ item.time }}</text>
          </view>
          <text class="message-summary">{{ item.summary }}</text>
        </view>
        <view v-if="item.unread" class="unread-dot" />
      </view>

      <view class="footer-hint" @click="goFindPlan">
        <text>没有新消息？试试「找方案」发现更多 ›</text>
      </view>
      <view style="height: 40rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getNotificationList, markNotificationRead } from '@/services/api';
import type { NotificationItem } from '@/services/api';
import CfNavBar from '@/components/CfNavBar.vue';

type MessageKind = 'agent' | 'plan' | 'followup' | 'system';
type TabValue = 'all' | 'plan' | 'followup' | 'system';

interface MessageItem {
  id: string;
  kind: MessageKind;
  title: string;
  summary: string;
  time: string;
  unread: boolean;
  related_id?: string;
}

const tabs: { label: string; value: TabValue }[] = [
  { label: '全部', value: 'all' },
  { label: '方案通知', value: 'plan' },
  { label: '跟进消息', value: 'followup' },
  { label: '系统通知', value: 'system' },
];

const typeMeta: Record<MessageKind, { icon: string; color: string }> = {
  agent: { icon: '演', color: '#7c3aed' },
  plan: { icon: '案', color: '#3b82f6' },
  followup: { icon: '催', color: '#ef4444' },
  system: { icon: '系', color: '#16a34a' },
};

const activeTab = ref<TabValue>('all');
const refreshing = ref(false);
const messages = ref<MessageItem[]>([]);

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value;
  return messages.value.filter((item) => item.kind === activeTab.value);
});

const fallbackMessages: MessageItem[] = [
  { id: 'm1', kind: 'agent', title: '小演已生成新方案', summary: '脱口秀标准版、魔术喜剧、升级版三档报价已准备好。', time: '09:42', unread: true },
  { id: 'm2', kind: 'plan', title: '方案报价已更新', summary: '星火经纪调整了魔术喜剧 45min 的渠道价。', time: '昨天', unread: true },
  { id: 'm3', kind: 'followup', title: '跟进提醒', summary: '客户已查看报价 2 次，建议今天电话确认。', time: '周一', unread: false },
  { id: 'm4', kind: 'system', title: '系统通知', summary: '演立方服务协议已更新，请查看最新条款。', time: '07-01', unread: false },
];

function formatTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toKind(type: string): MessageKind {
  if (['demand_status', 'plan_confirmed', 'quoted', 'demand_quoted'].includes(type)) return 'plan';
  if (['follow_up', 'followup', 'reminder'].includes(type)) return 'followup';
  if (['system', 'system_announcement'].includes(type)) return 'system';
  return 'agent';
}

function mapMessage(item: NotificationItem): MessageItem {
  return {
    id: item.id,
    kind: toKind(item.type),
    title: item.title,
    summary: item.content,
    time: formatTime(item.created_at),
    unread: !item.is_read,
    related_id: item.related_id,
  };
}

async function fetchMessages() {
  try {
    const res = await getNotificationList({ page: 1, pageSize: 30 });
    if (res.ok && res.data?.length) {
      messages.value = res.data.map(mapMessage);
    } else {
      messages.value = fallbackMessages;
    }
  } catch {
    messages.value = fallbackMessages;
  } finally {
    refreshing.value = false;
  }
}

async function onMessageClick(item: MessageItem) {
  if (item.unread) {
    item.unread = false;
    markNotificationRead(item.id).catch(() => {});
  }
  if (item.related_id) {
    uni.navigateTo({ url: `/pages/request/detail?id=${item.related_id}` });
  }
}

function goFindPlan() {
  uni.switchTab({ url: '/pages/sku/list' });
}

function onRefresh() {
  refreshing.value = true;
  fetchMessages();
}

onMounted(fetchMessages);
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background: $color-bg-page;
  display: flex;
  flex-direction: column;
}

.message-tabs {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 32rpx 12rpx;
  background: $color-bg-page;
  overflow-x: auto;
}

.message-tab {
  flex-shrink: 0;
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-card;
  color: $color-text-secondary;
  font-size: 24rpx;
  font-weight: 700;
  &.active {
    background: $color-primary;
    color: #ffffff;
  }
}

.message-list {
  flex: 1;
  height: 100vh;
  padding: 12rpx 32rpx 160rpx;
  box-sizing: border-box;
}

.message-card {
  position: relative;
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: $radius-md;
  background: $color-bg-card;
  box-shadow: $shadow-sm;
}

.message-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: center;
}

.message-title {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: $color-text-primary;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  flex-shrink: 0;
  color: $color-text-tertiary;
  font-size: 22rpx;
}

.message-summary {
  display: block;
  margin-top: 10rpx;
  color: $color-text-secondary;
  font-size: 24rpx;
  line-height: 1.45;
}

.unread-dot {
  position: absolute;
  right: 22rpx;
  top: 22rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ef4444;
}

.footer-hint {
  text-align: center;
  font-size: 26rpx;
  color: $color-primary;
  padding: 24rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: $color-text-tertiary;
}
</style>
