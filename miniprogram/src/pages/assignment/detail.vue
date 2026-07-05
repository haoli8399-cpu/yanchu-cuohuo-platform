<template>
  <view class="assignment-detail-page">
    <template v-if="detail">
      <!-- Status Banner -->
      <view class="assignment-detail-page__banner">
        <text class="assignment-detail-page__banner-title">{{ detail.sku_title }}</text>
        <view class="assignment-detail-page__banner-meta">
          <CfStatusTag :type="detail.status" />
          <text class="assignment-detail-page__banner-sub">{{ detail.role_name }}</text>
        </view>
        <text v-if="detail.confirm_deadline && detail.status === '待确认'" class="assignment-detail-page__banner-deadline">
          请在 {{ detail.confirm_deadline }} 前确认
        </text>
      </view>

      <!-- Show Info -->
      <view class="assignment-detail-page__card">
        <text class="assignment-detail-page__card-title">演出信息</text>
        <view class="assignment-detail-page__info-grid">
          <view class="assignment-detail-page__info-row">
            <text class="assignment-detail-page__info-label">演出日期</text>
            <text class="assignment-detail-page__info-value">{{ detail.show_date }}</text>
          </view>
          <view class="assignment-detail-page__info-row">
            <text class="assignment-detail-page__info-label">演出时间</text>
            <text class="assignment-detail-page__info-value">{{ detail.start_time }}-{{ detail.end_time }}</text>
          </view>
          <view class="assignment-detail-page__info-row">
            <text class="assignment-detail-page__info-label">演出场地</text>
            <text class="assignment-detail-page__info-value">{{ detail.venue_name || detail.venue }}</text>
          </view>
          <view class="assignment-detail-page__info-row">
            <text class="assignment-detail-page__info-label">活动公司</text>
            <text class="assignment-detail-page__info-value">{{ detail.company_name }}</text>
          </view>
          <view class="assignment-detail-page__info-row">
            <text class="assignment-detail-page__info-label">演出角色</text>
            <text class="assignment-detail-page__info-value assignment-detail-page__info-value--highlight">{{ detail.role_name }}</text>
          </view>
          <view v-if="detail.cast_info" class="assignment-detail-page__info-row">
            <text class="assignment-detail-page__info-label">阵容</text>
            <text class="assignment-detail-page__info-value">{{ detail.cast_info }}</text>
          </view>
        </view>
      </view>

      <!-- Cast List -->
      <view v-if="detail.cast_list && detail.cast_list.length" class="assignment-detail-page__card">
        <text class="assignment-detail-page__card-title">阵容信息</text>
        <view class="assignment-detail-page__cast-list">
          <view v-for="actor in detail.cast_list" :key="actor.id" class="assignment-detail-page__cast-item">
            <text class="assignment-detail-page__cast-name">{{ actor.name }}</text>
            <text class="assignment-detail-page__cast-role">{{ actor.role_name }}</text>
          </view>
        </view>
      </view>

      <!-- Fee -->
      <view class="assignment-detail-page__card">
        <text class="assignment-detail-page__card-title">费用信息</text>
        <view class="assignment-detail-page__fee-highlight">
          <text class="assignment-detail-page__fee-amount">¥{{ detail.fee }}</text>
          <text class="assignment-detail-page__fee-desc">本场演出费</text>
        </view>
      </view>

      <!-- Feedback -->
      <view v-if="detail.feedback" class="assignment-detail-page__card">
        <text class="assignment-detail-page__card-title">演出反馈</text>
        <view class="assignment-detail-page__feedback">
          <text class="assignment-detail-page__feedback-text">{{ detail.feedback.content }}</text>
          <text v-if="detail.feedback.created_at" class="assignment-detail-page__feedback-date">{{ detail.feedback.created_at.slice(0,10) }}</text>
        </view>
      </view>

      <!-- Reject Reason -->
      <view v-if="detail.status === '已拒绝' && detail.reject_reason" class="assignment-detail-page__card">
        <text class="assignment-detail-page__card-title">拒绝原因</text>
        <view class="assignment-detail-page__reject-reason">
          <text class="assignment-detail-page__reject-icon">💬</text>
          <text class="assignment-detail-page__reject-text">{{ detail.reject_reason }}</text>
        </view>
      </view>

      <!-- Action: Pending -->
      <view v-if="detail.status === '待确认'" class="assignment-detail-page__action assignment-detail-page__action--pending">
        <view class="assignment-detail-page__action-hint">
          <text>⚠️ 请在截止时间前确认，逾期将自动取消</text>
        </view>
        <view class="assignment-detail-page__action-btns">
          <button class="assignment-detail-page__btn assignment-detail-page__btn--reject" @click="handleReject">拒绝</button>
          <button class="assignment-detail-page__btn assignment-detail-page__btn--accept" :class="{ 'assignment-detail-page__btn--loading': actionLoading }" @click="handleConfirm">确认接单</button>
        </view>
      </view>

      <!-- Action: Confirmed -->
      <view v-if="detail.status === '已确认'" class="assignment-detail-page__action assignment-detail-page__action--confirmed">
        <view class="assignment-detail-page__action-hint assignment-detail-page__action-hint--confirmed">
          <text>✅ 已确认，请按时到场并完成签到打卡</text>
        </view>
        <button class="assignment-detail-page__btn assignment-detail-page__btn--checkin" @click="goCheckin">去签到</button>
      </view>
    </template>

    <!-- Loading -->
    <view v-else class="assignment-detail-page__loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getAssignmentDetail, confirmAssignment } from '@/services/api';
import type { Assignment } from '@/types';
import CfStatusTag from '@/components/CfStatusTag.vue';

const detail = ref<Assignment | null>(null);
const actionLoading = ref(false);

onLoad((options: any) => {
  const id = options?.id || '';
  if (id) fetchDetail(id);
});

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
.assignment-detail-page {
  min-height: 100vh;
  background-color: $color-bg-page;
  padding: $space-md $space-base;
  padding-bottom: 120rpx;
}

/* Banner */
.assignment-detail-page__banner {
  background-color: $color-bg-card;
  border-left: 8rpx solid $color-primary;
  border-radius: $radius-md;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
}
.assignment-detail-page__banner-title {
  font-size: $text-xl;
  font-weight: 600;
  color: $color-text-primary;
  display: block;
}
.assignment-detail-page__banner-meta {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-top: $space-sm;
}
.assignment-detail-page__banner-sub {
  font-size: $text-base;
  color: $color-text-secondary;
}
.assignment-detail-page__banner-deadline {
  font-size: $text-sm;
  color: $state-warning;
  display: block;
  margin-top: $space-sm;
}

/* Cards */
.assignment-detail-page__card {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
}
.assignment-detail-page__card-title {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-lg;
  padding-bottom: $space-sm;
  border-bottom: 1rpx solid $color-border;
  display: block;
}

/* Info Grid */
.assignment-detail-page__info-row {
  display: flex;
  justify-content: space-between;
  padding: $space-sm 0;
  border-bottom: 1rpx solid $color-divider;
  &:last-child { border-bottom: none; }
}
.assignment-detail-page__info-label {
  font-size: $text-base;
  color: $color-text-tertiary;
  flex-shrink: 0;
}
.assignment-detail-page__info-value {
  font-size: $text-base;
  color: $color-text-primary;
  text-align: right;
  max-width: 60%;
  &--highlight { color: $color-primary; font-weight: 600; }
}

/* Cast */
.assignment-detail-page__cast-list {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}
.assignment-detail-page__cast-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-sm $space-md;
  background-color: $color-bg-page;
  border-radius: $radius-xs;
}
.assignment-detail-page__cast-name {
  font-size: $text-md;
  color: $color-text-primary;
  font-weight: 500;
}
.assignment-detail-page__cast-role {
  font-size: $text-sm;
  color: $color-primary;
}

/* Fee */
.assignment-detail-page__fee-highlight {
  text-align: center;
  padding: $space-xl 0;
}
.assignment-detail-page__fee-amount {
  font-size: 64rpx;
  font-weight: 800;
  color: $state-error;
  display: block;
}
.assignment-detail-page__fee-desc {
  font-size: $text-sm;
  color: $color-text-tertiary;
  margin-top: 8rpx;
  display: block;
}

/* Feedback */
.assignment-detail-page__feedback {
  padding: $space-md;
  background-color: $color-bg-page;
  border-radius: $radius-xs;
}
.assignment-detail-page__feedback-text {
  font-size: $text-base;
  color: $color-text-secondary;
  line-height: 1.6;
  display: block;
}
.assignment-detail-page__feedback-date {
  font-size: $text-xs;
  color: $color-text-tertiary;
  margin-top: 8rpx;
  display: block;
}

/* Reject Reason */
.assignment-detail-page__reject-reason {
  display: flex;
  align-items: flex-start;
  gap: $space-sm;
  padding: $space-md;
  background-color: $state-cancelled-bg;
  border-radius: $radius-xs;
}
.assignment-detail-page__reject-icon { font-size: $text-md; flex-shrink: 0; }
.assignment-detail-page__reject-text {
  font-size: $text-base;
  color: $color-text-secondary;
  line-height: 1.6;
}

/* Actions */
.assignment-detail-page__action {
  margin-top: $space-md;
}
.assignment-detail-page__action-hint {
  padding: $space-sm $space-md;
  background-color: $state-pending-bg;
  border-radius: $radius-xs;
  font-size: $text-sm;
  color: $state-pending;
  margin-bottom: $space-md;
  text-align: center;
  &--confirmed {
    background-color: $state-confirmed-bg;
    color: $state-confirmed;
  }
}
.assignment-detail-page__action-btns {
  display: flex;
  gap: $space-lg;
}

.assignment-detail-page__btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: $radius-full;
  font-size: $text-md;
  font-weight: 500;
  border: none;
  text-align: center;

  &--accept {
    background-color: $state-confirmed;
    color: #fff;
  }
  &--reject {
    background-color: transparent;
    color: $state-cancelled;
    border: 2rpx solid $state-cancelled;
  }
  &--checkin {
    background-color: $color-primary;
    color: #fff;
  }
  &--loading {
    opacity: .7;
  }
}

/* Loading */
.assignment-detail-page__loading {
  padding: 120rpx 0;
  text-align: center;
  color: $color-text-tertiary;
  font-size: $text-md;
}
</style>
