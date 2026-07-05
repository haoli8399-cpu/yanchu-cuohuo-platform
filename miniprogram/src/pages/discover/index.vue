<template>
  <view class="discover-page">
    <!-- ====== Banner 轮播 ====== -->
    <swiper
      class="banner-swiper"
      circular
      autoplay
      interval="4000"
      :indicator-dots="false"
      @change="onBannerChange"
    >
      <swiper-item v-for="(banner, idx) in banners" :key="idx">
        <view class="banner-item" :style="{ background: banner.bg }">
          <!-- 图片层 -->
          <image v-if="banner.image" class="banner-img" :src="banner.image" mode="aspectFill" />
          <!-- 渐变遮罩 -->
          <view class="banner-overlay">
            <text class="banner-text">{{ banner.text }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>
    <!-- 分页点 -->
    <view class="banner-dots">
      <view
        v-for="(banner, idx) in banners"
        :key="idx"
        class="dot"
        :class="{ active: currentBanner === idx }"
      ></view>
    </view>

    <!-- ====== 快捷入口 2x2 ====== -->
    <view class="entries-grid">
      <view class="entry-card" @click="goPage('/pages/sku/list')">
        <view class="entry-icon icon-search">
          <van-icon name="search" size="40rpx" color="#7c3aed" />
        </view>
        <text class="entry-label">选方案</text>
      </view>
      <view class="entry-card" @click="goPage('/pages/request/submit')">
        <view class="entry-icon icon-edit">
          <van-icon name="edit" size="40rpx" color="#3b82f6" />
        </view>
        <text class="entry-label">提需求</text>
      </view>
      <view class="entry-card" @click="goPage('/pages/request/list')">
        <view class="entry-icon icon-list">
          <van-icon name="records" size="40rpx" color="#22c55e" />
        </view>
        <text class="entry-label">看进度</text>
      </view>
      <view class="entry-card" @click="callPhone">
        <view class="entry-icon icon-phone">
          <van-icon name="phone-o" size="40rpx" color="#f59e0b" />
        </view>
        <text class="entry-label">咨询</text>
      </view>
    </view>

    <!-- ====== 热门推荐 ====== -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门推荐</text>
        <text class="section-more" @click="goPage('/pages/sku/list')">查看全部 ›</text>
      </view>

      <view v-for="sku in hotSkus" :key="sku.id" class="rec-card" @click="goSkuDetail(sku.id)">
        <!-- 封面图占位 -->
        <view class="rec-cover">
          <text class="rec-cover-text">{{ (sku.name || '演出').slice(0, 2) }}</text>
        </view>
        <view class="rec-info">
          <text class="rec-title">{{ sku.name }}</text>
          <text class="rec-desc">{{ sku.category || '演出' }} | {{ sku.desc || '适合年会/团建' }}</text>
          <view class="rec-footer">
            <text class="rec-price">¥{{ sku.price || '—' }}/场</text>
            <view class="rec-meta">
              <view class="rec-stars">
                <text class="star">★</text>
                <text class="star-num">{{ sku.rating || '4.9' }}分</text>
              </view>
              <text v-if="sku.category" class="rec-tag">{{ sku.category }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <TabBar current="/pages/discover/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSKUList } from "@/services/api";
import type { SKUProduct } from "@/types";

const currentBanner = ref(0);
const banners = [
  { text: "限时特惠 | 企业年会脱口秀专场", bg: "linear-gradient(135deg, #7c3aed, #5b21b6)", image: "" },
  { text: "企业定制专场 | 一站式方案", bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", image: "" },
  { text: "演员入驻招募 | 开启演出之旅", bg: "linear-gradient(135deg, #059669, #047857)", image: "" },
];

const hotSkus = ref<(SKUProduct & { rating?: string; desc?: string })[]>([]);

onMounted(async () => {
  try {
    const res = await getSKUList();
    if (res.ok) {
      hotSkus.value = (res.data || []).slice(0, 4).map((s: any) => ({
        ...s,
        rating: s.rating || '4.9',
        desc: s.desc || s.category || '演出',
      }));
    }
  } catch {}
});

const tabBarPages = ['/pages/discover/index', '/pages/sku/list', '/pages/request/list', '/pages/user/index'];

function onBannerChange(e: any) {
  currentBanner.value = e.detail.current;
}

function goPage(path: string) {
  if (tabBarPages.includes(path)) {
    uni.switchTab({ url: path });
  } else {
    uni.navigateTo({ url: path });
  }
}

function goSkuDetail(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail?id=${id}` });
}

function callPhone() {
  uni.makePhoneCall({ phoneNumber: "400-xxx-xxxx", fail: () => {} });
}
</script>

<style lang="scss" scoped>
.discover-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding-bottom: 120rpx;
}

/* ===== Banner ===== */
.banner-swiper {
  margin: 20rpx 32rpx 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26, 26, 46, 0.7) 0%, rgba(26, 26, 46, 0.2) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24rpx;
}

.banner-text {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.3;
}

/* Banner dots */
.banner-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 16rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 9999px;
  background-color: #d1d5db;
  transition: all 0.3s ease;

  &.active {
    width: 40rpx;
    background-color: #7c3aed;
    border-radius: 9999px;
  }
}

/* ===== 快捷入口 2x2 ===== */
.entries-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin: 24rpx 32rpx;
}

.entry-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.entry-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-search { background-color: #f5f3ff; }
  &.icon-edit { background-color: #eff6ff; }
  &.icon-list { background-color: #f0fdf4; }
  &.icon-phone { background-color: #fffbeb; }
}

.entry-label {
  font-size: 26rpx;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* ===== 热门推荐 ===== */
.section {
  margin: 0 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-more {
  font-size: 26rpx;
  color: var(--color-primary);
}

/* ===== 推荐卡片 ===== */
.rec-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.rec-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rec-cover-text {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-primary);
  opacity: 0.6;
}

.rec-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
}

.rec-title {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-desc {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}

.rec-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.rec-price {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.rec-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rec-stars {
  display: flex;
  align-items: center;
  gap: 4rpx;

  .star {
    font-size: 22rpx;
    color: #f59e0b;
  }

  .star-num {
    font-size: 22rpx;
    color: #f59e0b;
  }
}

.rec-tag {
  font-size: 20rpx;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-radius: var(--tag-radius);
  padding: 4rpx 10rpx;
}
</style>
