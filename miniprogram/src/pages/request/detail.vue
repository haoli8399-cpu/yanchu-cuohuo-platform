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
            <text class="status-tag" :style="{ background: statusStyle.bg, color: statusStyle.color }">{{ demand.status_label || demand.status }}</text>
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
import { getDemandDetail, confirmPlan as apiConfirmPlan, rejectPlan as apiRejectPlan } from "@/services/api";
import type { DemandRequest } from "@/types";

const demandId = ref("");
const demand = ref<DemandRequest | null>(null);
const loading = ref(true);

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

const statusStyle = computed(() => {
  const map: Record<string, { bg: string; color: string }> = {
    "待报价": { bg: "#fffbeb", color: "#f59e0b" },
    "已报价": { bg: "#eff6ff", color: "#3b82f6" },
    "待确认": { bg: "#ede9fe", color: "#7c3aed" },
    "已确认": { bg: "#f0fdf4", color: "#22c55e" },
    "已签约": { bg: "#f5f3ff", color: "#7c3aed" },
    "已取消": { bg: "#fef2f2", color: "#ef4444" }
  };
  return map[demand.value?.status || ""] || { bg: "#f3f4f6", color: "#9ca3af" };
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

function goBack() {
  uni.navigateBack();
}

function goEdit() {
  uni.showToast({ title: '编辑功能（待实现）', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f5f7; }

/* Nav Bar */
.nav-bar {
  position: sticky; top: 0; z-index: 50; height: 88rpx;
  background: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.nav-left {
  position: absolute; left: 32rpx; top: 50%; transform: translateY(-50%);
  display: flex; align-items: center; gap: 4px;
}
.nav-back-text { font-size: 28rpx; color: var(--color-text-primary, #1a1a2e); }
.nav-title { font-size: 34rpx; font-weight: 600; color: var(--color-text-primary, #1a1a2e); }
.nav-right { position: absolute; right: 32rpx; top: 50%; transform: translateY(-50%); }
.nav-edit { font-size: 28rpx; color: var(--color-primary, #7c3aed); font-weight: 500; }

.content-scroll { height: calc(100vh - 88rpx); }

/* Loading/Error */
.loading-section { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; }
.loading-text { font-size: 28rpx; color: var(--color-text-tertiary, #9ca3af); margin-top: 16rpx; }
.error-section { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; }
.error-text { font-size: 28rpx; color: var(--color-text-tertiary, #9ca3af); margin: 16rpx 0 24rpx; }
.retry-btn { height: 80rpx; padding: 0 48rpx; background: var(--color-primary, #7c3aed); color: #fff; border-radius: 44rpx; font-size: 28rpx; line-height: 80rpx; border: none; }

/* Status Card */
.status-card { margin: 24rpx 32rpx; background: #fff; border-radius: 24rpx; padding: 32rpx; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.status-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.demand-title { font-size: 36rpx; font-weight: 600; color: var(--color-text-primary, #1a1a2e); flex: 1; margin-right: 16rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.status-tag { display: inline-block; padding: 6rpx 20rpx; border-radius: 9999px; font-size: 22rpx; font-weight: 500; flex-shrink: 0; }
.divider { height: 1px; background: var(--color-divider, #f0f0f2); margin-bottom: 24rpx; }
.info-list { display: flex; flex-direction: column; gap: 12rpx; }
.info-row { display: flex; justify-content: space-between; }
.info-label { font-size: 26rpx; color: var(--color-text-secondary, #6b7280); }
.info-value { font-size: 26rpx; color: var(--color-text-primary, #1a1a2e); text-align: right; max-width: 60%; }

/* Section Header */
.section-header { margin: 24rpx 32rpx 16rpx; display: flex; align-items: center; gap: 12rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary, #1a1a2e); }
.section-tag { display: inline-block; padding: 4rpx 16rpx; border-radius: 9999px; font-size: 20rpx; font-weight: 500; background: #eff6ff; color: #3b82f6; }

/* AI Plan Card */
.plan-card { margin: 0 32rpx 24rpx; background: #fff; border-radius: 24rpx; padding: 32rpx; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.plan-body { margin-bottom: 24rpx; }
.plan-description { font-size: 28rpx; color: var(--color-text-primary, #1a1a2e); line-height: 1.7; display: block; margin-bottom: 20rpx; }
.plan-performers { font-size: 26rpx; color: var(--color-text-secondary, #6b7280); margin-bottom: 12rpx; }
.plan-label { color: var(--color-text-tertiary, #9ca3af); }
.plan-price { display: flex; align-items: center; gap: 8rpx; margin-bottom: 4rpx; }
.plan-price .plan-label { font-size: 26rpx; }
.price-value { font-size: 32rpx; font-weight: 700; color: var(--color-primary, #7c3aed); }
.plan-actions { display: flex; gap: 16rpx; }
.btn-confirm { flex: 1; height: 72rpx; border-radius: 9999px; background: var(--color-primary, #7c3aed); color: #fff; font-size: 26rpx; font-weight: 500; border: none; line-height: 72rpx; }
.btn-reject { flex: 1; height: 72rpx; border-radius: 9999px; background: transparent; color: var(--color-text-secondary, #6b7280); font-size: 26rpx; font-weight: 500; border: 1px solid var(--color-divider, #e5e5ea); line-height: 72rpx; }

/* Timeline */
.timeline-card { margin: 24rpx 32rpx; background: #fff; border-radius: 24rpx; padding: 32rpx; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.tl-section-title { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary, #1a1a2e); margin-bottom: 32rpx; display: block; }
.timeline { position: relative; padding-left: 40rpx; }
.timeline-bar { position: absolute; left: 12rpx; top: 12rpx; bottom: 12rpx; width: 2px; background: var(--color-primary-lighter, #ddd6fe); }
.timeline-item { position: relative; padding-bottom: 32rpx; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-dot { position: absolute; left: -40rpx; top: 4rpx; width: 24rpx; height: 24rpx; border-radius: 50%; z-index: 1; }
.timeline-dot.done { background: var(--state-success, #22c55e); border: 4rpx solid #f0fdf4; }
.timeline-dot.active { background: #3b82f6; border: 4rpx solid #eff6ff; box-shadow: 0 0 0 4rpx rgba(59,130,246,0.2); }
.timeline-dot.pending { background: var(--color-text-tertiary, #9ca3af); border: 4rpx solid #f3f4f6; }
.timeline-content { }
.tl-title { font-size: 28rpx; font-weight: 500; color: var(--color-text-primary, #1a1a2e); }
.tl-time { font-size: 22rpx; color: var(--color-text-tertiary, #9ca3af); margin-top: 4rpx; display: block; }
</style>
