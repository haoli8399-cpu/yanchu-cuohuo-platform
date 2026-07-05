<template>
  <view class="discover-page">
    <!-- ====== 搜索条 ====== -->
    <view class="search-bar" @click="goSearch">
      <van-icon name="search" size="32rpx" color="#9ca3af" />
      <text class="search-placeholder">搜索演出方案</text>
    </view>

    <!-- ====== Banner 轮播 ====== -->
    <view class="banner-wrap">
      <swiper
        class="banner-swiper"
        circular
        autoplay
        interval="4000"
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#ffffff"
      >
        <swiper-item v-for="banner in banners" :key="banner.id">
          <view class="banner-item">
            <image class="banner-img" :src="banner.image" mode="aspectFill" />
            <view class="banner-overlay">
              <text class="banner-title">{{ banner.title }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- ====== 快捷入口 4个 ====== -->
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

      <view
        v-for="sku in hotSkus"
        :key="sku.id"
        class="rec-card"
        @click="goSkuDetail(sku.id)"
      >
        <image
          class="rec-cover"
          :src="sku.cover_url || '/static/images/show-card-1.jpg'"
          mode="aspectFill"
        />
        <view class="rec-info">
          <text class="rec-title">{{ sku.title }}</text>
          <text class="rec-desc">{{ sku.category_label || sku.category || '演出' }} | {{ sku.desc || '适合年会/团建' }}</text>
          <view class="rec-footer">
            <text class="rec-price">
              ¥{{ sku.price || '—' }}<text class="rec-price-unit">/场</text>
            </text>
            <view class="rec-meta">
              <text class="rec-rating">{{ sku.rating || '4.9' }}分</text>
              <view class="rec-tag">
                <text>{{ sku.category_label || sku.category || '演出' }}</text>
              </view>
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

const banners = [
  { id: '1', image: '/static/images/banner-show.jpg', title: '限时特惠 | 企业年会脱口秀专场' },
  { id: '2', image: '/static/images/banner-show.jpg', title: '新喜剧之夜 | 周末演出推荐' },
];

const hotSkus = ref<(SKUProduct & { rating?: string; desc?: string; price?: number })[]>([]);

onMounted(async () => {
  try {
    const res = await getSKUList();
    if (res.ok) {
      hotSkus.value = (res.data || []).slice(0, 4).map((s: any) => ({
        ...s,
        rating: s.rating || '4.9',
        desc: s.desc || s.category || '演出',
        price: s.min_price,
      }));
    }
  } catch {}
});

const tabBarPages = ['/pages/discover/index', '/pages/sku/list', '/pages/request/list', '/pages/user/index'];

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

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' });
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

/* ===== 搜索条 ===== */
.search-bar {
  margin: 20rpx 32rpx 0;
  background: #fff;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.search-placeholder {
  font-size: 26rpx;
  color: #9ca3af;
}

/* ===== Banner ===== */
.banner-wrap {
  margin: 20rpx 32rpx 0;
}

.banner-swiper {
  width: 100%;
  height: 320rpx;
  border-radius: var(--radius-lg);
  overflow: hidden;
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
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx 24rpx 20rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.banner-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 1.3;
}

/* ===== 快捷入口 4列 ===== */
.entries-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin: 24rpx 32rpx;
}

.entry-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &:active { opacity: 0.85; }
}

.entry-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-search { background-color: #f5f3ff; }
  &.icon-edit   { background-color: #eff6ff; }
  &.icon-list   { background-color: #f0fdf4; }
  &.icon-phone  { background-color: #fff7ed; }
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

  &:active { opacity: 0.85; }
}

.rec-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  background-color: #f3f4f6;
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

.rec-price-unit {
  font-size: 22rpx;
  font-weight: 400;
  color: var(--color-text-tertiary);
}

.rec-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rec-rating {
  font-size: 22rpx;
  color: #f59e0b;
}

.rec-tag {
  font-size: 20rpx;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-radius: var(--tag-radius);
  padding: 4rpx 10rpx;
}
</style>
