<template>
  <view class="message-page">
    <CfNavBar title="消息" />

    <view class="tab-row">
      <view
        v-for="tab in tabs"
        :key="tab"
        class="tab-row__item"
        :class="{ 'tab-row__item--active': activeTab === tab }"
        @tap="activeTab = tab"
      >
        <text>{{ tab }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="message-list" :show-scrollbar="false">
      <view
        v-for="item in filteredMessages"
        :key="item.id"
        class="message-item"
      >
        <view class="message-item__avatar" :class="`message-item__avatar--${item.tone}`">
          <text>{{ item.icon }}</text>
        </view>
        <view class="message-item__content">
          <view class="message-item__top">
            <text class="message-item__title">{{ item.title }}</text>
            <text class="message-item__time">{{ item.time }}</text>
          </view>
          <text class="message-item__summary">{{ item.summary }}</text>
        </view>
        <view v-if="item.unread" class="message-item__dot" />
      </view>
      <view class="bottom-space" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const tabs = ['全部', '方案通知', '跟进消息', '系统']
const activeTab = ref('全部')

const messages = [
  {
    id: 'm1',
    type: '全部',
    tone: 'agent',
    icon: '◇',
    title: '小演 · XX科技年会',
    time: '10:32',
    summary: 'T3级60min ¥6,000，点击查看详情',
    unread: true,
  },
  {
    id: 'm2',
    type: '方案通知',
    tone: 'plan',
    icon: '📋',
    title: '方案通知',
    time: '09:15',
    summary: 'XX地产开盘方案已被客户查看',
    unread: false,
  },
  {
    id: 'm3',
    type: '跟进消息',
    tone: 'follow',
    icon: '💬',
    title: '跟进提醒',
    time: '昨天',
    summary: 'XX银行答谢已等待48h，需要今天推进确认',
    unread: true,
  },
  {
    id: 'm4',
    type: '方案通知',
    tone: 'plan',
    icon: '📋',
    title: '报价已发送',
    time: '昨天',
    summary: 'XX保险年会报价已发送给活动公司',
    unread: false,
  },
  {
    id: 'm5',
    type: '系统',
    tone: 'system',
    icon: '🔔',
    title: '系统通知',
    time: '7/5',
    summary: '本月成交率提升 20%，继续保持响应速度',
    unread: false,
  },
]

const filteredMessages = computed(() => {
  if (activeTab.value === '全部') return messages
  return messages.filter(item => item.type === activeTab.value)
})
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: calc($tab-bar-height + $space-lg);
}

.tab-row {
  display: flex;
  gap: $space-sm;
  padding: $space-sm $space-base;
  background: $color-bg-card;
  border-bottom: 1rpx solid $color-border;

  &__item {
    flex: 1;
    height: 56rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-secondary;
    background: $color-bg-input;
    font-size: $text-xs;
    font-weight: 700;

    &--active {
      color: $color-text-inverse;
      background: $color-primary;
    }
  }
}

.message-list {
  height: calc(100vh - 180rpx);
  padding: $space-sm $space-base 0;
}

.message-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-md;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  background: $color-bg-card;

  & + & {
    margin-top: $space-sm;
  }

  &__avatar {
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: $text-lg;

    &--agent { background: $color-primary-subtle; color: $color-primary; }
    &--plan { background: rgba($color-info, 0.1); color: $color-info; }
    &--follow { background: rgba($color-danger, 0.08); color: $color-danger; }
    &--system { background: rgba($color-success, 0.1); color: $color-success; }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-sm;
  }

  &__title {
    color: $color-text-primary;
    font-size: $text-base;
    font-weight: 800;
  }

  &__time {
    color: $color-text-tertiary;
    font-size: $text-xs;
    white-space: nowrap;
  }

  &__summary {
    display: block;
    margin-top: 4rpx;
    color: $color-text-secondary;
    font-size: $text-sm;
    line-height: 1.45;
  }

  &__dot {
    position: absolute;
    top: $space-md;
    right: $space-md;
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: $color-danger;
  }
}

.bottom-space {
  height: $space-xl;
}
</style>
