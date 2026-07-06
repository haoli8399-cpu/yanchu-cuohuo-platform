<template>
  <view class="checkin-page">
    <CfNavBar title="签到打卡" :showBack="true" backText="返回" />

    <!-- Event Info Card (left border accent) -->
    <view v-if="currentCheckin" class="checkin-page__event">
      <text class="checkin-page__event-title">{{ currentCheckin.show_date }}</text>
      <text class="checkin-page__event-info">{{ currentCheckin.venue }}</text>
      <CfStatusTag :type="statusTagType" />
    </view>

    <!-- Check-in Status -->
    <view v-if="currentCheckin" class="checkin-page__status">
      <!-- 未签到：显示签到按钮 -->
      <view v-if="currentCheckin.status === '未签到'" class="checkin-page__status-cta">
        <view class="checkin-page__status-circle checkin-page__status-circle--pending">
          <text class="checkin-page__status-icon-text">📍</text>
        </view>
        <text class="checkin-page__status-heading">待签到</text>
        <van-button
          type="success"
          size="large"
          round
          block
          :loading="checkingIn"
          @click="handleCheckin"
        >
          📍 签到打卡
        </van-button>
      </view>

      <!-- 已签到：显示签到成功 + 签退按钮 -->
      <view v-if="currentCheckin.status === '已签到'" class="checkin-page__status-done">
        <view class="checkin-page__status-circle checkin-page__status-circle--active">
          <text class="checkin-page__checkmark">\u2713</text>
        </view>
        <text class="checkin-page__status-heading checkin-page__status-heading--active">已签到</text>
        <text class="checkin-page__status-time">签到时间：{{ formatTime(currentCheckin.checkin_time) }}</text>
        <text class="checkin-page__status-location">签到地点：{{ currentCheckin.checkin_location }}</text>
        <van-button
          type="warning"
          size="large"
          round
          block
          :loading="checkingOut"
          @click="handleCheckout"
        >
          ✅ 签退离开
        </van-button>
      </view>

      <!-- 已签退：显示完整签到信息 -->
      <view v-if="currentCheckin.status === '已签退'" class="checkin-page__status-done">
        <view class="checkin-page__status-circle checkin-page__status-circle--done">
          <text class="checkin-page__checkmark">\u2713</text>
        </view>
        <text class="checkin-page__status-heading checkin-page__status-heading--done">已签退</text>
        <text class="checkin-page__status-time">签到时间：{{ formatTime(currentCheckin.checkin_time) }}</text>
        <text class="checkin-page__status-location">签到地点：{{ currentCheckin.checkin_location }}</text>
        <text class="checkin-page__status-time">签退时间：{{ formatTime(currentCheckin.checkout_time) }}</text>
      </view>
    </view>

    <!-- Location info -->
    <view v-if="location" class="checkin-page__location">
      <text class="checkin-page__location-icon">📍</text>
      <text class="checkin-page__location-text">{{ location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` }}</text>
    </view>

    <!-- Detail -->
    <view v-if="currentCheckin && currentCheckin.status === '已签退'" class="checkin-page__detail">
      <text class="checkin-page__detail-title">签到信息</text>
      <view class="checkin-page__detail-row">
        <text class="checkin-page__detail-label">到达时间</text>
        <text class="checkin-page__detail-value">{{ formatTime(currentCheckin.checkin_time) }}</text>
      </view>
      <view class="checkin-page__detail-row">
        <text class="checkin-page__detail-label">签到方式</text>
        <text class="checkin-page__detail-value">GPS定位签到</text>
      </view>
      <view class="checkin-page__detail-row">
        <text class="checkin-page__detail-label">签到地点</text>
        <text class="checkin-page__detail-value">{{ currentCheckin.checkin_location }}</text>
      </view>
      <view class="checkin-page__detail-row">
        <text class="checkin-page__detail-label">签退时间</text>
        <text class="checkin-page__detail-value">{{ formatTime(currentCheckin.checkout_time) }}</text>
      </view>
    </view>

    <!-- Note -->
    <view class="checkin-page__note">
      <text>请在演出开始前90分钟内完成签到，迟到签到将影响信誉评分</text>
    </view>

    <!-- History -->
    <view class="checkin-page__history">
      <text class="checkin-page__history-title">签到记录</text>
      <view v-if="historyList.length > 0" class="checkin-page__history-list">
        <view
          v-for="item in historyList"
          :key="item.id"
          class="checkin-page__history-item"
        >
          <view class="checkin-page__history-left">
            <view class="checkin-page__history-dot" :class="'checkin-page__history-dot--' + statusClass(item.status)" />
            <view class="checkin-page__history-line" />
          </view>
          <view class="checkin-page__history-content">
            <view class="checkin-page__history-date">{{ item.show_date }}</view>
            <view class="checkin-page__history-venue">{{ item.venue }}</view>
            <view v-if="item.status === '已签退'" class="checkin-page__history-detail">
              <text>签到：{{ formatTime(item.checkin_time) }}</text>
              <text>签退：{{ formatTime(item.checkout_time) }}</text>
            </view>
            <view class="checkin-page__history-status" :style="{ color: statusColor(item.status) }">
              {{ item.status_label || item.status }}
            </view>
          </view>
        </view>
      </view>
      <view v-else class="checkin-page__empty">
        <text>暂无签到记录</text>
      </view>
    </view>

    <!-- Result Modal -->
    <view v-if="showResult" class="checkin-page__result-overlay" @click="showResult = false">
      <view class="checkin-page__result-card" @click.stop>
        <text class="checkin-page__result-icon">🎉</text>
        <text class="checkin-page__result-title">签到成功</text>
        <view class="checkin-page__result-info">
          <view class="checkin-page__result-row">
            <text class="checkin-page__result-label">签到时间</text>
            <text class="checkin-page__result-value">{{ resultTime }}</text>
          </view>
          <view class="checkin-page__result-row">
            <text class="checkin-page__result-label">签到地点</text>
            <text class="checkin-page__result-value">{{ resultLocation }}</text>
          </view>
        </view>
        <button class="checkin-page__result-close" @click="showResult = false">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCheckinList, doCheckin } from '@/services/api';
import type { CheckinRecord } from '@/types';
import CfNavBar from '@/components/CfNavBar.vue';
import CfStatusTag from '@/components/CfStatusTag.vue';

const checkingIn = ref(false);
const checkingOut = ref(false);
const showResult = ref(false);
const resultTime = ref('');
const resultLocation = ref('');
const checkinList = ref<CheckinRecord[]>([]);
const location = ref<UniNamespace.GetLocationRes | null>(null);

const currentCheckin = computed(() =>
  checkinList.value.find(c => c.status !== '已签退') || checkinList.value[0] || null
);

const historyList = computed(() =>
  checkinList.value.filter(c => c.status === '已签退')
);

const statusTagType = computed(() => {
  const map: Record<string, string> = {
    '未签到': 'pending',
    '已签到': 'signed',
    '已签退': 'completed',
  };
  return map[currentCheckin.value?.status || ''] || 'pending';
});

function statusClass(status: string) {
  const map: Record<string, string> = { '未签到': 'pending', '已签到': 'active', '已签退': 'done' };
  return map[status] || '';
}

function statusColor(status: string) {
  const map: Record<string, string> = { '未签到': '#f59e0b', '已签到': '#22c55e', '已签退': '#71717a' };
  return map[status] || '#71717a';
}

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return iso; }
}

async function fetchCheckins() {
  try {
    const res = await getCheckinList();
    if (res.ok && res.data) {
      checkinList.value = res.data;
    }
  } catch (e) {
    console.error('加载签到列表失败:', e);
  }
}

async function getLocation(): Promise<string> {
  return new Promise((resolve) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        location.value = res;
        resolve(`${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`);
      },
      fail: () => {
        uni.showToast({ title: '获取位置失败，使用默认位置', icon: 'none' });
        resolve('位置获取失败');
      }
    });
  });
}

async function handleCheckin() {
  if (!currentCheckin.value) return;
  checkingIn.value = true;

  try {
    const locStr = await getLocation();
    let photoUrl = '';
    try {
      const photoRes = await new Promise<UniNamespace.ChooseImageSuccessCallbackResult>((resolve, reject) => {
        uni.chooseImage({
          count: 1,
          sourceType: ['camera'],
          success: resolve,
          fail: reject
        });
      });
      photoUrl = photoRes.tempFilePaths[0] || '';
    } catch {
      // 拍照失败不阻塞签到
    }

    const res = await doCheckin({
      assignment_id: currentCheckin.value.assignment_id,
      latitude: location.value?.latitude || 0,
      longitude: location.value?.longitude || 0,
      location: locStr,
      photo_url: photoUrl
    });

    if (res.ok) {
      if (currentCheckin.value) {
        currentCheckin.value.status = '已签到';
        currentCheckin.value.status_label = '已签到';
        currentCheckin.value.checkin_time = new Date().toISOString();
        currentCheckin.value.checkin_location = locStr;
      }
      resultTime.value = new Date().toLocaleString();
      resultLocation.value = locStr;
      showResult.value = true;
    } else {
      uni.showToast({ title: res.error || '签到失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '签到异常', icon: 'none' });
  } finally {
    checkingIn.value = false;
  }
}

async function handleCheckout() {
  if (!currentCheckin.value) return;
  checkingOut.value = true;

  try {
    const locStr = await getLocation();
    const res = await doCheckin({
      assignment_id: currentCheckin.value.assignment_id,
      latitude: location.value?.latitude || 0,
      longitude: location.value?.longitude || 0,
      location: locStr
    });

    if (res.ok && currentCheckin.value) {
      currentCheckin.value.status = '已签退';
      currentCheckin.value.status_label = '已签退';
      currentCheckin.value.checkout_time = new Date().toISOString();
      uni.showToast({ title: '签退成功', icon: 'success' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '签退异常', icon: 'none' });
  } finally {
    checkingOut.value = false;
  }
}

onMounted(() => { fetchCheckins(); });
</script>

<style lang="scss" scoped>
.checkin-page {
  min-height: 100vh;
  background-color: $color-bg-page;
  padding-bottom: $space-2xl;

  // ── 事件卡片（左边界线） ──
  &__event {
    margin: 16rpx $space-base;
    padding: $space-lg;
    background-color: $color-bg-card;
    border-radius: $radius-md;
    border-left: 8rpx solid $color-primary;
  }

  &__event-title {
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
    display: block;
    margin-bottom: $space-sm;
  }

  &__event-info {
    font-size: $text-base;
    color: $color-text-secondary;
    display: block;
    margin-bottom: $space-sm;
  }

  // ── 签到状态 ──
  &__status {
    margin: 0 $space-base $space-md;
    padding: $space-2xl $space-lg;
    background-color: $color-bg-card;
    border-radius: $radius-md;
    text-align: center;
  }

  &__status-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-md;
  }

  &__status-done {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-sm;
  }

  &__status-circle {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $space-md;

    &--pending {
      background-color: $state-pending-bg;
    }

    &--active {
      background-color: $state-confirmed-bg;
    }

    &--done {
      background-color: $color-bg-input;
    }
  }

  &__status-icon-text {
    font-size: 80rpx;
  }

  &__checkmark {
    font-size: 80rpx;
    color: $state-confirmed;
    font-weight: 700;
  }

  &__status-heading {
    font-size: $text-2xl;
    font-weight: 600;
    color: $color-text-primary;
    display: block;
    margin-bottom: $space-sm;

    &--active {
      color: $state-confirmed;
    }

    &--done {
      color: $color-text-tertiary;
    }
  }

  &__status-time {
    font-size: $text-base;
    color: $color-text-secondary;
    display: block;
    margin-bottom: 4rpx;
  }

  &__status-location {
    font-size: $text-base;
    color: $color-text-secondary;
    display: block;
  }

  // ── 位置信息 ──
  &__location {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin: 0 $space-base $space-md;
    padding: 16rpx;
    background-color: $state-info-bg;
    border-radius: $radius-xs;
  }

  &__location-icon {
    font-size: 24rpx;
  }

  &__location-text {
    font-size: 24rpx;
    color: $state-info;
  }

  // ── 详情行 ──
  &__detail {
    margin: 0 $space-base $space-md;
    padding: $space-lg;
    background-color: $color-bg-card;
    border-radius: $radius-md;
  }

  &__detail-title {
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
    display: block;
    margin-bottom: $space-md;
  }

  &__detail-row {
    display: flex;
    justify-content: space-between;
    padding: $space-sm 0;
  }

  &__detail-label {
    font-size: $text-base;
    color: $color-text-secondary;
  }

  &__detail-value {
    font-size: $text-base;
    color: $color-text-primary;
  }

  // ── 提示信息 ──
  &__note {
    margin: 0 $space-base $space-md;
    padding: $space-md $space-lg;
    background-color: $color-bg-input;
    border-radius: $radius-md;
    font-size: $text-base;
    color: $color-text-secondary;
  }

  // ── 历史记录 ──
  &__history {
    margin: 0 $space-base;
  }

  &__history-title {
    font-size: $text-lg;
    font-weight: 600;
    color: $color-text-primary;
    display: block;
    margin-bottom: $space-md;
  }

  &__history-list {
    padding-left: $space-sm;
  }

  &__history-item {
    display: flex;
    padding-left: 24rpx;
  }

  &__history-left {
    position: relative;
    margin-right: 24rpx;
  }

  &__history-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    margin-top: 8rpx;

    &--pending { background-color: #f59e0b; }
    &--active { background-color: #22c55e; }
    &--done { background-color: #71717a; }
  }

  &__history-line {
    position: absolute;
    top: 28rpx;
    left: 7rpx;
    width: 2rpx;
    height: calc(100% - 4rpx);
    background-color: $color-border;
  }

  &__history-content {
    flex: 1;
    padding-bottom: 28rpx;
  }

  &__history-date {
    font-size: 26rpx;
    color: $color-text-primary;
    font-weight: 500;
  }

  &__history-venue {
    font-size: 24rpx;
    color: $color-text-secondary;
    margin-top: 4rpx;
  }

  &__history-detail {
    margin-top: 8rpx;

    text {
      display: block;
      font-size: 22rpx;
      color: $color-text-tertiary;
    }
  }

  &__history-status {
    font-size: 22rpx;
    margin-top: 6rpx;
  }

  &__empty {
    padding: 60rpx 0;
    text-align: center;
    color: $color-text-tertiary;
  }

  // ── 签到结果弹窗 ──
  &__result-overlay {
    position: fixed;
    inset: 0;
    background-color: $color-bg-overlay;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: $z-modal;
  }

  &__result-card {
    background-color: $color-bg-card;
    border-radius: $radius-lg;
    padding: 48rpx 40rpx;
    text-align: center;
    width: 560rpx;
  }

  &__result-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 16rpx;
  }

  &__result-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $state-success;
    display: block;
  }

  &__result-info {
    margin: $space-xl 0;
    text-align: left;
  }

  &__result-row {
    display: flex;
    justify-content: space-between;
    padding: 10rpx 0;
  }

  &__result-label {
    font-size: 24rpx;
    color: $color-text-tertiary;
  }

  &__result-value {
    font-size: 24rpx;
    color: $color-text-primary;
  }

  &__result-close {
    width: 100%;
    height: 80rpx;
    background-color: $color-primary;
    color: #fff;
    border-radius: $radius-lg;
    font-size: 28rpx;
    border: none;
    margin-top: 16rpx;

    &::after { border: none; }

    &:active { opacity: 0.85; }
  }
}
</style>
