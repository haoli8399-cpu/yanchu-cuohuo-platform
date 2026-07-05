<template>
  <view class="assign-detail-page">
    <template v-if="detail">
      <!-- 状态横幅 -->
      <view class="status-banner" :style="{ background: statusStyle(detail.status).bg }">
        <text class="status-text" :style="{ color: statusStyle(detail.status).color }">
          {{ detail.status_label || detail.status }}
        </text>
        <text v-if="detail.confirm_deadline && detail.status === '待确认'" class="deadline-text">
          请在 {{ detail.confirm_deadline }} 前确认
        </text>
      </view>

      <!-- 演出基本信息 -->
      <view class="info-card">
        <view class="card-title">演出信息</view>
        <view class="info-grid">
          <view class="info-item">
            <text class="item-label">演出名称</text>
            <text class="item-value">{{ detail.sku_title }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">日期时间</text>
            <text class="item-value">{{ detail.show_date }} {{ detail.start_time }}-{{ detail.end_time }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">演出场地</text>
            <text class="item-value">{{ detail.venue_name || detail.venue }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">活动公司</text>
            <text class="item-value">{{ detail.company_name }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">演出角色</text>
            <text class="item-value highlight">{{ detail.role_name }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">阵容</text>
            <text class="item-value">{{ detail.cast_info || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 阵容信息 -->
      <view class="info-card" v-if="detail.cast_list && detail.cast_list.length">
        <view class="card-title">阵容信息</view>
        <view class="cast-list">
          <view v-for="actor in detail.cast_list" :key="actor.id" class="cast-item">
            <text class="cast-name">{{ actor.name }}</text>
            <text class="cast-role">{{ actor.role_name }}</text>
          </view>
        </view>
      </view>

      <!-- 费用信息 -->
      <view class="info-card">
        <view class="card-title">费用信息</view>
        <view class="fee-highlight">
          <text class="fee-amount">¥{{ detail.fee }}</text>
          <text class="fee-desc">本场演出费</text>
        </view>
      </view>

      <!-- 演出反馈 -->
      <view class="info-card" v-if="detail.feedback">
        <view class="card-title">演出反馈</view>
        <view class="feedback-content">
          <text class="feedback-text">{{ detail.feedback.content }}</text>
          <text v-if="detail.feedback.created_at" class="feedback-date">{{ detail.feedback.created_at.slice(0,10) }}</text>
        </view>
      </view>

      <!-- 拒绝原因（如已拒绝） -->
      <view v-if="detail.status === '已拒绝' && detail.reject_reason" class="info-card">
        <view class="card-title">拒绝原因</view>
        <view class="reject-reason">
          <text class="reason-icon">💬</text>
          <text class="reason-text">{{ detail.reject_reason }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section" v-if="detail.status === '待确认'">
        <view class="action-hint">
          <text class="hint-icon">⚠️</text>
          <text class="hint-text">请在截止时间前确认，逾期将自动取消</text>
        </view>
        <view class="action-btns">
          <van-button plain hairline type="danger" size="large" round @click="handleReject" style="flex:1">拒绝</van-button>
          <van-button type="primary" size="large" round :loading="actionLoading" @click="handleConfirm" style="flex:1">确认接单</van-button>
        </view>
      </view>

      <!-- 已确认的操作提示 -->
      <view v-if="detail.status === '已确认'" class="action-section confirmed">
        <view class="confirmed-hint">
          <text class="confirmed-icon">✅</text>
          <text class="confirmed-text">已确认，请按时到场并完成签到打卡</text>
        </view>
        <van-button type="success" size="large" round block @click="goCheckin">去签到</van-button>
      </view>
    </template>

    <!-- 加载/错误 -->
    <view v-else class="loading-state">
      <van-loading size="48rpx" color="#7c3aed" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getAssignmentDetail, confirmAssignment } from '@/services/api';
import type { Assignment } from '@/types';

const detail = ref<Assignment | null>(null);
const actionLoading = ref(false);

onLoad((options: any) => {
  const id = options?.id || '';
  if (id) fetchDetail(id);
});

function statusStyle(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    '待确认': { bg: 'rgba(245,158,11,.1)', color: '#f59e0b' },
    '已确认': { bg: 'rgba(34,197,94,.1)', color: '#22c55e' },
    '已拒绝': { bg: 'rgba(239,68,68,.1)', color: '#ef4444' },
    '已取消': { bg: 'rgba(113,113,122,.1)', color: '#71717a' }
  };
  return map[status] || map['已取消'];
}

async function fetchDetail(id: string) {
  try {
    const res = await getAssignmentDetail(id);
    if (res.ok && res.data) {
      detail.value = res.data;
    }
  } catch (e) {
    console.error('加载详情失败:', e);
  }
}

async function handleConfirm() {
  if (!detail.value) return;
  actionLoading.value = true;
  try {
    const res = await confirmAssignment(detail.value.id, 'confirm');
    if (res.ok) {
      detail.value.status = '已确认';
      detail.value.status_label = '已确认';
      uni.showToast({ title: '确认成功', icon: 'success' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' });
  } finally {
    actionLoading.value = false;
  }
}

async function handleReject() {
  if (!detail.value) return;
  uni.showModal({
    title: '拒绝原因',
    editable: true,
    placeholderText: '请输入拒绝原因（时间冲突/不适配/档期已满/其他）',
    success: async (res) => {
      if (res.confirm) {
        actionLoading.value = true;
        const reason = res.content || '';
        const result = await confirmAssignment(detail.value!.id, 'reject', reason);
        if (result.ok) {
          detail.value!.status = '已拒绝';
          detail.value!.status_label = '已拒绝';
          detail.value!.reject_reason = reason;
          uni.showToast({ title: '已拒绝', icon: 'none' });
        }
        actionLoading.value = false;
      }
    }
  });
}

function goCheckin() {
  uni.navigateTo({ url: '/pages/checkin/index' });
}
</script>

<style lang="scss" scoped>
.assign-detail-page { min-height: 100vh; background: var(--color-bg-page); padding: 20rpx 24rpx; padding-bottom: 120rpx; }

.status-banner {
  padding: 24rpx; border-radius: var(--radius-md); margin-bottom: 24rpx; text-align: center;

  .status-text { font-size: 32rpx; font-weight: 700; display: block; }
  .deadline-text { font-size: 24rpx; color: var(--color-text-tertiary); margin-top: 8rpx; display: block; }
}

.info-card {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);

  .card-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1rpx solid var(--color-border); }
}

.info-grid {
  .info-item { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid var(--color-border);
    &:last-child { border-bottom: none; }
  }
  .item-label { font-size: 26rpx; color: var(--color-text-tertiary); }
  .item-value { font-size: 26rpx; color: var(--color-text-primary); text-align: right; max-width: 60%;
    &.highlight { color: var(--color-primary); font-weight: 600; }
  }
}

.fee-highlight {
  text-align: center; padding: 32rpx 0;

  .fee-amount { font-size: 64rpx; font-weight: 800; color: var(--state-error); display: block; }
  .fee-desc { font-size: 24rpx; color: var(--color-text-tertiary); margin-top: 8rpx; display: block; }
}

.feedback-content {
  padding: 20rpx; background: rgba(167,139,250,.06);
  border-radius: var(--radius-xs);

  .feedback-text { font-size: 26rpx; color: var(--color-text-secondary); line-height: 1.6; display: block; }
  .feedback-date { font-size: 22rpx; color: var(--color-text-tertiary); margin-top: 8rpx; display: block; }
}

.cast-list { display: flex; flex-direction: column; gap: 12rpx; }
.cast-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx; background: var(--color-bg-page); border-radius: var(--radius-xs);
}
.cast-name { font-size: 28rpx; color: var(--color-text-primary); font-weight: 500; }
.cast-role { font-size: 24rpx; color: var(--color-primary); }

.reject-reason {
  display: flex; align-items: flex-start; gap: 12rpx; padding: 16rpx;
  background: rgba(239,68,68,.06); border-radius: var(--radius-xs);

  .reason-icon { font-size: 28rpx; }
  .reason-text { font-size: 26rpx; color: var(--color-text-secondary); line-height: 1.6; }
}

.action-section {
  margin-top: 20rpx;

  .action-hint { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 0; margin-bottom: 16rpx;
    .hint-icon { font-size: 28rpx; }
    .hint-text { font-size: 24rpx; color: var(--state-warning); }
  }

  .action-btns { display: flex; gap: 20rpx; }

  &.confirmed {
  .confirmed-hint { display: flex; align-items: center; gap: 8rpx; padding: 16rpx; background: rgba(34,197,94,.06); border-radius: var(--radius-xs); margin-bottom: 20rpx;
    .confirmed-icon { font-size: 28rpx; }
    .confirmed-text { font-size: 24rpx; color: var(--state-success); }
  }
  }
}

.loading-state { padding: 60rpx 0; text-align: center; color: var(--color-text-tertiary); }
</style>
