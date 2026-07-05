<template>
  <view class="case-detail-page">
    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" size="48rpx" />
      <text class="loading-text">加载中...</text>
    </view>

    <template v-if="!loading && detail">
      <!-- 导航栏 -->
      <view class="nav-bar">
        <view class="nav-left" @click="goBack">
          <van-icon name="arrow-left" size="36rpx" />
          <text>返回</text>
        </view>
        <text class="nav-title">案例详情</text>
        <view class="nav-right"></view>
      </view>

      <!-- 封面 Swiper -->
      <view class="cover-section">
        <swiper
          v-if="detail.cover_images?.length"
          class="cover-swiper"
          circular
          :indicator-dots="detail.cover_images.length > 1"
          indicator-color="rgba(255,255,255,0.4)"
          indicator-active-color="#fff"
        >
          <swiper-item v-for="(img, idx) in detail.cover_images" :key="idx">
            <image :src="img" mode="aspectFill" class="cover-img" />
          </swiper-item>
        </swiper>
        <view v-else class="cover-placeholder">
          <text class="cover-placeholder-emoji">🎭</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-card">
        <text class="info-title">{{ detail.title }}</text>
        <text v-if="detail.client_name" class="info-client">{{ detail.client_name }}</text>

        <view class="info-rows">
          <view class="info-row" v-if="detail.event_date">
            <text class="info-label">活动日期</text>
            <text class="info-value">{{ detail.event_date }}</text>
          </view>
          <view class="info-row" v-if="detail.audience_count">
            <text class="info-label">观众人数</text>
            <text class="info-value">{{ detail.audience_count }}人</text>
          </view>
          <view class="info-row" v-if="detail.tier">
            <text class="info-label">演员级别</text>
            <text class="info-value tier-badge">T{{ detail.tier }}</text>
          </view>
          <view class="info-row" v-if="detail.rating != null">
            <text class="info-label">好评率</text>
            <view class="info-value-rating">
              <van-icon name="star" size="24rpx" color="#f59e0b" />
              <text>{{ detail.rating }}%</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 案例描述 -->
      <view class="section-card" v-if="detail.content || detail.description">
        <text class="section-title">案例描述</text>
        <view class="description-body">
          <rich-text v-if="detail.content" :nodes="detail.content" />
          <text v-else class="description-text">{{ detail.description }}</text>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-bar">
        <button v-if="detail.sku_id" class="btn-view-sku" @click="goSKU">
          查看同类型方案
        </button>
        <button v-else class="btn-view-sku btn-disabled" disabled>
          暂无关联方案
        </button>
      </view>
    </template>

    <EmptyState
      v-else-if="!loading"
      icon="bill-o"
      title="案例不存在"
      description="该案例已被移除或链接无效"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getCaseDetail, type CaseDetail } from '@/services/api';

const detail = ref<CaseDetail | null>(null);
const caseId = ref('');
const loading = ref(true);

onLoad((options: any) => {
  caseId.value = options?.id || '';
  if (caseId.value) fetchDetail();
});

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await getCaseDetail(caseId.value);
    if (res.ok && res.data) {
      detail.value = res.data;
    }
  } catch (e) {
    console.error('加载案例详情失败:', e);
  } finally {
    loading.value = false;
  }
}

function goBack() { uni.navigateBack(); }

function goSKU() {
  if (detail.value?.sku_id) {
    uni.navigateTo({ url: `/pages/sku/detail?id=${detail.value.sku_id}` });
  }
}
</script>

<style lang="scss" scoped>
.case-detail-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding-bottom: 160rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16rpx;
  .loading-text {
    font-size: 28rpx;
    color: var(--color-text-tertiary);
  }
}

// 导航栏
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-bottom: 1rpx solid var(--color-divider);
  .nav-left {
    position: absolute;
    left: 24rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 28rpx;
    color: var(--color-text-primary);
  }
  .nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .nav-right {
    position: absolute;
    right: 24rpx;
  }
}

// 封面
.cover-section {
  width: 100%;
  height: 520rpx;
}

.cover-swiper {
  width: 100%;
  height: 100%;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4c1d95, #7c3aed, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder-emoji {
  font-size: 160rpx;
}

// 基本信息卡片
.info-card {
  margin: -40rpx 32rpx 24rpx;
  position: relative;
  z-index: 1;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);

  .info-title {
    font-size: 38rpx;
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
    line-height: 1.3;
    margin-bottom: 12rpx;
  }

  .info-client {
    font-size: 26rpx;
    color: var(--color-text-secondary);
    display: block;
    margin-bottom: 24rpx;
  }
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .info-label {
    font-size: 28rpx;
    color: var(--color-text-secondary);
  }

  .info-value {
    font-size: 28rpx;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .tier-badge {
    padding: 4rpx 16rpx;
    border-radius: 9999px;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    font-weight: 600;
  }

  .info-value-rating {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: var(--color-text-primary);
  }
}

// 案例描述
.section-card {
  margin: 0 32rpx 24rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 32rpx;
  box-shadow: var(--shadow-sm);

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
    margin-bottom: 28rpx;
  }
}

.description-body {
  font-size: 28rpx;
  line-height: 1.7;
  color: var(--color-text-primary);
}

.description-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: var(--color-text-primary);
}

// 底部
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--color-bg-card);
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.06);
  z-index: 50;

  .btn-view-sku {
    width: 100%;
    height: 88rpx;
    border-radius: 9999px;
    border: none;
    background: var(--color-primary);
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 88rpx;
    text-align: center;
  }

  .btn-disabled {
    background: #d4d4d8;
    color: #fff;
  }
}
</style>
