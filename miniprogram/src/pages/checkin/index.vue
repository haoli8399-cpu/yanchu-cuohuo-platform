<template>
  <view class="checkin-page">
    <!-- 当前待签到 -->
    <view v-if="currentCheckin" class="current-section">
      <view class="current-badge">当前待签到</view>
      <view class="current-card">
        <view class="current-header">
          <text class="current-title">{{ currentCheckin.show_date }}</text>
          <text class="current-venue">{{ currentCheckin.venue }}</text>
        </view>
        <view class="current-status">
          <view class="status-dot" :class="statusClass(currentCheckin.status)" />
          <text>{{ currentCheckin.status_label || currentCheckin.status }}</text>
        </view>

        <!-- 签到按钮 -->
        <van-button
          v-if="currentCheckin.status === '未签到'"
          type="success"
          size="large"
          round
          block
          :loading="checkingIn"
          @click="handleCheckin"
        >
          📍 签到打卡
        </van-button>

        <!-- 签退按钮 -->
        <van-button
          v-if="currentCheckin.status === '已签到'"
          type="warning"
          size="large"
          round
          block
          :loading="checkingOut"
          @click="handleCheckout"
        >
          ✅ 签退离开
        </van-button>

        <!-- 已签退信息 -->
        <view v-if="currentCheckin.status === '已签退'" class="done-info">
          <view class="done-row">
            <text class="done-label">签到时间</text>
            <text class="done-value">{{ formatTime(currentCheckin.checkin_time) }}</text>
          </view>
          <view class="done-row">
            <text class="done-label">签到地点</text>
            <text class="done-value">{{ currentCheckin.checkin_location }}</text>
          </view>
          <view class="done-row">
            <text class="done-label">签退时间</text>
            <text class="done-value">{{ formatTime(currentCheckin.checkout_time) }}</text>
          </view>
        </view>
      </view>

      <!-- 签到位置信息 -->
      <view v-if="location" class="location-info">
        <text class="location-icon">📍</text>
        <text class="location-text">{{ location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` }}</text>
      </view>
    </view>

    <!-- 历史签到记录 -->
    <view class="history-section">
      <view class="section-title">签到记录</view>
      <view v-if="historyList.length > 0" class="history-list">
        <view
          v-for="item in historyList"
          :key="item.id"
          class="history-item"
        >
          <view class="history-left">
            <view class="history-dot" :class="statusClass(item.status)" />
            <view class="history-line" v-if="true" />
          </view>
          <view class="history-content">
            <view class="history-date">{{ item.show_date }}</view>
            <view class="history-venue">{{ item.venue }}</view>
            <view v-if="item.status === '已签退'" class="history-detail">
              <text>签到：{{ formatTime(item.checkin_time) }}</text>
              <text>签退：{{ formatTime(item.checkout_time) }}</text>
            </view>
            <view class="history-status" :style="{ color: statusColor(item.status) }">
              {{ item.status_label || item.status }}
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>暂无签到记录</text>
      </view>
    </view>

    <!-- 签到结果弹窗 -->
    <view v-if="showResult" class="result-overlay" @click="showResult = false">
      <view class="result-card" @click.stop>
        <text class="result-icon">🎉</text>
        <text class="result-title">签到成功</text>
        <view class="result-info">
          <view class="result-row">
            <text class="result-label">签到时间</text>
            <text class="result-value">{{ resultTime }}</text>
          </view>
          <view class="result-row">
            <text class="result-label">签到地点</text>
            <text class="result-value">{{ resultLocation }}</text>
          </view>
        </view>
        <button class="result-close" @click="showResult = false">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCheckinList, doCheckin } from '@/services/api';
import type { CheckinRecord } from '@/types';

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
    // 拍照
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
    // 模拟签退（调用签到接口更新状态）
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
.checkin-page { min-height: 100vh; background: var(--color-bg-page); padding: 20rpx 24rpx; padding-bottom: 120rpx; }

.current-section { margin-bottom: 40rpx; }

.current-badge {
  display: inline-block; font-size: 22rpx; color: var(--color-primary);
  background: rgba(167,139,250,.15); padding: 6rpx 20rpx; border-radius: var(--radius-lg); margin-bottom: 16rpx;
}

.current-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);

  .current-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;
    .current-title { font-size: 32rpx; font-weight: 700; color: var(--color-text-primary); }
    .current-venue { font-size: 24rpx; color: var(--color-text-tertiary); }
  }

  .current-status { display: flex; align-items: center; gap: 8rpx; font-size: 26rpx; color: var(--color-text-secondary); margin-bottom: 24rpx;
    .status-dot { width: 12rpx; height: 12rpx; border-radius: 50%;
      &.pending { background: #f59e0b; }
      &.active { background: #22c55e; }
      &.done { background: #71717a; }
    }
  }
}

.done-info {
  .done-row { display: flex; justify-content: space-between; padding: 10rpx 0; border-bottom: 1rpx solid var(--color-border); }
  .done-label { font-size: 24rpx; color: var(--color-text-tertiary); }
  .done-value { font-size: 24rpx; color: var(--color-text-primary); }
}

.location-info {
  display: flex; align-items: center; gap: 8rpx; margin-top: 16rpx;
  padding: 16rpx; background: rgba(59,130,246,.06); border-radius: var(--radius-xs);

  .location-icon { font-size: 24rpx; }
  .location-text { font-size: 24rpx; color: var(--state-info); }
}

.history-section {
  .section-title { font-size: 30rpx; font-weight: 600; color: var(--color-text-primary); margin-bottom: 20rpx; }
}

.history-item {
  display: flex; padding-left: 24rpx;

  .history-left { position: relative; margin-right: 24rpx; }
  .history-dot {
    width: 16rpx; height: 16rpx; border-radius: 50%; margin-top: 8rpx;
    &.pending { background: #f59e0b; }
    &.active { background: #22c55e; }
    &.done { background: #71717a; }
  }
  .history-line { position: absolute; top: 28rpx; left: 7rpx; width: 2rpx; height: calc(100% - 4rpx); background: var(--color-border); }

  .history-content {
    flex: 1; padding-bottom: 28rpx;

    .history-date { font-size: 26rpx; color: var(--color-text-primary); font-weight: 500; }
    .history-venue { font-size: 24rpx; color: var(--color-text-secondary); margin-top: 4rpx; }
    .history-detail { margin-top: 8rpx;
      text { display: block; font-size: 22rpx; color: var(--color-text-tertiary); }
    }
    .history-status { font-size: 22rpx; margin-top: 6rpx; }
  }
}

.empty-state { padding: 60rpx 0; text-align: center; color: var(--color-text-tertiary); }

.result-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.7);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}

.result-card {
  background: var(--color-bg-card); border-radius: var(--radius-lg); padding: 48rpx 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  text-align: center; width: 560rpx;

  .result-icon { font-size: 80rpx; display: block; margin-bottom: 16rpx; }
  .result-title { font-size: 36rpx; font-weight: 700; color: var(--state-success); display: block; }

  .result-info { margin: 32rpx 0; text-align: left; }
  .result-row { display: flex; justify-content: space-between; padding: 10rpx 0; }
  .result-label { font-size: 24rpx; color: var(--color-text-tertiary); }
  .result-value { font-size: 24rpx; color: var(--color-text-primary); }

  .result-close {
    width: 100%; height: 80rpx; background: var(--color-primary);
    color: #fff; border-radius: var(--radius-lg); font-size: 28rpx; border: none; margin-top: 16rpx;
  }
}
</style>
