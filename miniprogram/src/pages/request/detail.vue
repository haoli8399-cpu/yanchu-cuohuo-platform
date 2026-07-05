<template>
  <view class="page">
    <!-- Navigation Bar -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <van-icon name="arrow-left" size="40rpx" color="#1a1a2e" />
        <text class="nav-back-text">返回</text>
      </view>
      <text class="nav-title">需求详情</text>
      <view class="nav-right">
        <text class="nav-edit" @click="goEdit">编辑</text>
      </view>
    </view>

    <view v-if="loading" class="loading-section">
      <van-loading type="spinner" size="48rpx" custom-class="loading-spinner" />
      <text class="loading-text">加载中...</text>
    </view>

    <template v-else-if="demand">
      <scroll-view scroll-y class="content-scroll">
        <!-- Section 1: Status Header Card -->
        <view class="status-card">
          <view class="status-header">
            <text class="demand-title">{{ demand.sku_title || '需求详情' }}</text>
            <CfStatusTag :type="statusTagType" />
          </view>
          <view class="divider"></view>
          <view class="info-list">
            <view class="info-row" v-for="(item, idx) in infoRows" :key="idx" v-if="item.value">
              <text class="info-label">{{ item.label }}</text>
              <text class="info-value">{{ item.value }}</text>
            </view>
          </view>
        </view>

        <!-- Section 2: AI 方案卡片 -->
        <view v-if="demand.plan" class="plan-card">
          <view class="section-header">
            <text class="section-title">AI 方案</text>
            <text class="section-tag">已生成</text>
          </view>

          <view class="plan-body">
            <text class="plan-description">{{ demand.plan.content || "暂无方案内容" }}</text>
            <view class="plan-performers">
              <text class="plan-label">推荐演员：</text>
              <text>{{ demand.plan.performer_names?.join("、") || "待运营分配" }}</text>
            </view>
            <view class="plan-price">
              <text class="plan-label">方案报价：</text>
              <text class="price-value">¥{{ demand.plan.price }}</text>
            </view>
          </view>

          <view class="plan-actions" v-if="demand.status === '已报价' || demand.status === '待确认'">
            <button class="btn-confirm" @click="confirmPlan">确认方案</button>
            <button class="btn-reject" @click="rejectPlan">不采纳</button>
          </view>
        </view>

        <!-- Section 3: Timeline -->
        <view class="timeline-card">
          <text class="tl-section-title">需求动态</text>
          <view class="timeline">
            <view class="timeline-bar"></view>
            <view v-for="(step, idx) in timelineData" :key="idx" class="timeline-item">
              <view class="timeline-dot" :class="step.done ? (step.active ? 'active' : 'done') : 'pending'"></view>
              <view class="timeline-content">
                <text class="tl-title">{{ step.label }}</text>
                <text class="tl-time" v-if="step.time">{{ step.time }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Section 4: 评价（已签约状态显示） -->
        <view v-if="demand.status === '已签约'" class="review-card">
          <text class="review-card-title">评价本次演出</text>
          <text class="review-card-hint">您的评价将帮助其他活动公司更好地选择方案</text>

          <view class="review-rate-row">
            <text class="review-label">评分</text>
            <van-rate v-model="reviewRating" :size="40" color="#f59e0b" void-color="#e5e5ea" />
          </view>

          <view class="review-textarea-wrap">
            <textarea
              v-model="reviewContent"
              class="review-textarea"
              placeholder="分享您的演出体验..."
              :maxlength="300"
              :auto-height="true"
            />
            <text class="review-count">{{ reviewContent.length }}/300</text>
          </view>

          <button
            class="btn-submit-review"
            :disabled="reviewRating === 0 || !reviewContent.trim() || submitting"
            @click="doSubmitReview"
          >
            {{ submitting ? '提交中...' : '提交评价' }}
          </button>
        </view>

        <view style="height: 40rpx;"></view>
      </scroll-view>
    </template>

    <view v-else class="error-section">
      <van-icon name="warn-o" size="80rpx" color="#9ca3af" />
      <text class="error-text">加载失败</text>
      <button class="retry-btn" @click="fetchDetail">重新加载</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getDemandDetail, confirmPlan as apiConfirmPlan, rejectPlan as apiRejectPlan, submitReview } from "@/services/api";
import type { DemandRequest } from "@/types";
import CfStatusTag from '@/components/CfStatusTag.vue';

const demandId = ref("");
const demand = ref<DemandRequest | null>(null);
const loading = ref(true);

// 评价表单
const reviewRating = ref(0);
const reviewContent = ref("");
const submitting = ref(false);

onLoad((options: any) => {
  demandId.value = options?.id || "";
  if (demandId.value) fetchDetail();
});

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await getDemandDetail(demandId.value);
    if (res.ok && res.data) demand.value = res.data;
  } catch (e) {
    console.error("加载需求详情失败:", e);
  } finally {
    loading.value = false;
  }
}

const infoRows = computed(() => {
  const d = demand.value;
  if (!d) return [];
  return [
    { label: "演出类型", value: d.sku_title },
    { label: "期望时间", value: d.performance_date },
    { label: "演出地点", value: d.venue },
    { label: "预算范围", value: d.budget_range },
    { label: "创建时间", value: d.created_at },
  ];
});

const statusTagType = computed(() => {
  const status = demand.value?.status || '';
  // Chinese → English mapping (API may return Chinese)
  const map: Record<string, string> = {
    '待报价': 'pending',
    '已报价': 'quoted',
    '待确认': 'confirmed',
    '已确认': 'confirmed',
    '已签约': 'signed',
    '已取消': 'cancelled',
  };
  return map[status] || status;
});

const timelineData = computed(() => {
  const d = demand.value;
  if (!d) return [];
  const statusOrder = ["待报价", "已报价", "待确认", "已确认", "已签约"];
  const currentIdx = statusOrder.indexOf(d.status);
  return statusOrder.map((label, idx) => ({
    label: { "待报价": "提交需求", "已报价": "AI生成方案", "待确认": "待您确认", "已确认": "已确认方案", "已签约": "已签约" }[label] || label,
    time: idx === 0 ? d.created_at : idx <= currentIdx ? d.updated_at : "",
    done: idx <= currentIdx,
    active: idx === currentIdx,
  }));
});

async function confirmPlan() {
  uni.showModal({
    title: "确认方案",
    content: "确认采纳此AI方案？确认后将进入签约流程。",
    success: async (res) => {
      if (res.confirm) {
        const result = await apiConfirmPlan(demandId.value);
        if (result.ok) {
          uni.showToast({ title: "方案已确认", icon: "success" });
          await fetchDetail();
        }
      }
    },
  });
}

async function rejectPlan() {
  uni.showModal({
    title: "不采纳",
    content: "确认不采纳此方案？运营将重新为您匹配。",
    success: async (res) => {
      if (res.confirm) {
        const result = await apiRejectPlan(demandId.value, "活动公司不采纳");
        if (result.ok) {
          uni.showToast({ title: "已反馈", icon: "none" });
          await fetchDetail();
        }
      }
    },
  });
}

async function doSubmitReview() {
  if (reviewRating.value === 0 || !reviewContent.value.trim()) return;
  submitting.value = true;
  try {
    const res = await submitReview({
      sku_id: demand.value!.sku_id,
      demand_id: demandId.value,
      rating: reviewRating.value,
      content: reviewContent.value.trim()
    });
    if (res.ok) {
      uni.showToast({ title: "评价已提交", icon: "success" });
      reviewRating.value = 0;
      reviewContent.value = "";
    } else {
      uni.showToast({ title: res.error || "提交失败", icon: "none" });
    }
  } catch (e) {
    uni.showToast({ title: "网络错误", icon: "none" });
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  uni.navigateBack();
}

function goEdit() {
  uni.showToast({ title: '编辑功能（待实现）', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: $color-bg-page; }

/* Nav Bar */
.nav-bar {
  position: sticky; top: 0; z-index: $z-nav-bar; height: $nav-bar-height;
  background: $color-bg-card; display: flex; align-items: center; justify-content: center;
  box-shadow: $shadow-sm;
}
.nav-left {
  position: absolute; left: $space-base; top: 50%; transform: translateY(-50%);
  display: flex; align-items: center; gap: 4rpx;
}
.nav-back-text { font-size: $text-base; color: $color-text-primary; }
.nav-title { font-size: $text-lg; font-weight: 600; color: $color-text-primary; }
.nav-right { position: absolute; right: $space-base; top: 50%; transform: translateY(-50%); }
.nav-edit { font-size: $text-base; color: $color-primary; font-weight: 500; }

.content-scroll { height: calc(100vh - #{$nav-bar-height}); }

/* Loading/Error */
.loading-section { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; }
.loading-text { font-size: $text-base; color: $color-text-tertiary; margin-top: $space-sm; }
.error-section { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; }
.error-text { font-size: $text-base; color: $color-text-tertiary; margin: $space-sm 0 $space-md; }
.retry-btn { height: 80rpx; padding: 0 48rpx; background: $color-primary; color: $color-text-inverse; border-radius: $radius-full; font-size: $text-base; line-height: 80rpx; border: none; }

/* Status Card */
.status-card { margin: $space-md $space-base; background: $color-bg-card; border-radius: $radius-lg; padding: $space-lg; box-shadow: $shadow-md; }
.status-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: $space-md; }
.demand-title { font-size: $text-2xl; font-weight: 600; color: $color-text-primary; flex: 1; margin-right: $space-sm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.divider { height: 1rpx; background: $color-divider; margin-bottom: $space-md; }
.info-list { display: flex; flex-direction: column; gap: 12rpx; }
.info-row { display: flex; justify-content: space-between; }
.info-label { font-size: $text-base; color: $color-text-secondary; }
.info-value { font-size: $text-base; color: $color-text-primary; text-align: right; max-width: 60%; }

/* Section Header */
.section-header { margin: $space-md $space-base $space-sm; display: flex; align-items: center; gap: 12rpx; }
.section-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; }
.section-tag { display: inline-block; padding: 4rpx 16rpx; border-radius: $radius-full; font-size: $text-xs; font-weight: 500; background: $state-quoted-bg; color: $state-quoted; }

/* AI Plan Card */
.plan-card { margin: 0 $space-base $space-md; background: $color-bg-card; border-radius: $radius-lg; padding: $space-lg; box-shadow: $shadow-md; }
.plan-body { margin-bottom: $space-md; }
.plan-description { font-size: $text-base; color: $color-text-primary; line-height: 1.7; display: block; margin-bottom: $space-md; }
.plan-performers { font-size: $text-base; color: $color-text-secondary; margin-bottom: 12rpx; }
.plan-label { color: $color-text-tertiary; }
.plan-price { display: flex; align-items: center; gap: 8rpx; margin-bottom: 4rpx; }
.plan-price .plan-label { font-size: $text-base; }
.price-value { font-size: $text-xl; font-weight: 700; color: $color-primary; }
.plan-actions { display: flex; gap: $space-sm; }
.btn-confirm { flex: 1; height: 72rpx; border-radius: $radius-full; background: $color-primary; color: $color-text-inverse; font-size: $text-base; font-weight: 500; border: none; line-height: 72rpx; }
.btn-reject { flex: 1; height: 72rpx; border-radius: $radius-full; background: transparent; color: $color-text-secondary; font-size: $text-base; font-weight: 500; border: 1rpx solid $color-divider; line-height: 72rpx; }

/* Timeline */
.timeline-card { margin: $space-md $space-base; background: $color-bg-card; border-radius: $radius-lg; padding: $space-lg; box-shadow: $shadow-md; }
.tl-section-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; margin-bottom: $space-lg; display: block; }
.timeline { position: relative; padding-left: 40rpx; }
.timeline-bar { position: absolute; left: 12rpx; top: 12rpx; bottom: 12rpx; width: 2px; background: $color-primary-subtle; }
.timeline-item { position: relative; padding-bottom: $space-lg; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-dot { position: absolute; left: -40rpx; top: 4rpx; width: 24rpx; height: 24rpx; border-radius: 50%; z-index: 1; }
.timeline-dot.done { background: $state-success; border: 4rpx solid $state-confirmed-bg; }
.timeline-dot.active { background: $state-quoted; border: 4rpx solid $state-quoted-bg; box-shadow: 0 0 0 4rpx rgba(59,130,246,0.2); }
.timeline-dot.pending { background: $color-text-tertiary; border: 4rpx solid $color-bg-page; }
.tl-title { font-size: $text-base; font-weight: 500; color: $color-text-primary; }
.tl-time { font-size: $text-xs; color: $color-text-tertiary; margin-top: 4rpx; display: block; }

/* 评价卡片 */
.review-card {
  margin: $space-md $space-base;
  background: $color-bg-card;
  border-radius: $radius-lg;
  padding: $space-lg;
  box-shadow: $shadow-md;
}

.review-card-title {
  font-size: $text-xl;
  font-weight: 600;
  color: $color-text-primary;
  display: block;
  margin-bottom: 8rpx;
}

.review-card-hint {
  font-size: $text-sm;
  color: $color-text-tertiary;
  display: block;
  margin-bottom: 28rpx;
  line-height: 1.5;
}

.review-rate-row {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: $space-md;
}

.review-label {
  font-size: $text-base;
  color: $color-text-primary;
  font-weight: 500;
  flex-shrink: 0;
}

.review-textarea-wrap {
  position: relative;
  margin-bottom: $space-md;
}

.review-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: $space-md;
  background: $color-bg-page;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $color-text-primary;
  box-sizing: border-box;
}

.review-count {
  position: absolute;
  right: $space-md;
  bottom: $space-md;
  font-size: $text-xs;
  color: $color-text-tertiary;
}

.btn-submit-review {
  width: 100%;
  height: 80rpx;
  background: $color-primary;
  color: $color-text-inverse;
  font-size: $text-base;
  font-weight: 500;
  border: none;
  border-radius: $radius-full;
  line-height: 80rpx;
  text-align: center;
}

.btn-submit-review[disabled] {
  background: $color-text-tertiary;
  color: $color-text-inverse;
}
</style>
