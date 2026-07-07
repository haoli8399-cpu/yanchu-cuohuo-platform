<template>
  <view class="sku-detail-page">
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
        <text class="nav-title">方案详情</text>
        <view class="nav-right">
          <van-icon name="share-o" size="36rpx" />
        </view>
      </view>

      <!-- 大图封面 -->
      <view class="hero-image">
        <view class="hero-placeholder">
          {{ detail.category_label?.charAt(0) || '🎭' }}
        </view>
        <view class="hero-content">
          <text class="hero-title">{{ detail.title }}</text>
          <text class="hero-meta">{{ currentTier }} · {{ detail.duration_minutes }}分钟 · {{ performerCount }}人</text>
        </view>
        <view class="hero-gradient"></view>
      </view>

      <!-- 基本信息卡片 (浮起) -->
      <view class="info-card">
        <view class="info-title-row">
          <text class="info-title">{{ detail.title }}</text>
          <text class="supplier-badge" :class="{ own: supplierInfo.type === 'own' }">{{ supplierInfo.label }}</text>
        </view>

        <!-- Tags Row -->
        <view class="tags-row">
          <text v-if="detail.category_label" class="tag tag-primary">{{ detail.category_label }}</text>
          <text v-for="tag in detail.tags?.slice(0, 2)" :key="tag" class="tag tag-category">{{ tag }}</text>
          <text class="tag tag-gray">{{ detail.duration_minutes }}分钟</text>
        </view>

        <!-- Rating Row -->
        <view class="rating-row">
          <text class="rating-score">{{ detail.rating }}分</text>
          <van-icon v-for="i in 5" :key="i" name="star" size="24rpx" color="#f59e0b" />
          <text class="rating-count">{{ detail.review_count || 0 }}条评价</text>
        </view>

        <!-- Subtitle -->
        <text class="info-subtitle" v-if="detail.description">{{ detail.description }}</text>
      </view>

      <!-- 演出阵容 -->
      <view class="section-card" v-if="detail.cast?.length">
        <text class="section-title">演出阵容</text>
        <view v-for="(performer, idx) in detail.cast" :key="idx" class="performer-row">
          <view class="performer-avatar">{{ performer.name?.charAt(0) || '?' }}</view>
          <view class="performer-info">
            <view class="performer-name-row">
              <text class="performer-name">{{ performer.name }}</text>
              <text v-if="performer.level" class="performer-level">T{{ performer.level }}</text>
            </view>
            <text class="performer-exp" v-if="performer.experience">{{ performer.experience }}</text>
          </view>
        </view>
      </view>

      <!-- 服务详情 -->
      <view class="section-card">
        <text class="section-title">服务详情</text>
        <view class="detail-rows">
          <view class="detail-row">
            <text class="detail-label">演出时长：</text>
            <text class="detail-value">{{ detail.duration_minutes }}分钟</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">适合场景：</text>
            <text class="detail-value">{{ detail.scenario || '企业年会、团建活动、客户答谢' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">服务包含：</text>
            <text class="detail-value">{{ detail.cast?.length || 0 }}名演员{{ detail.includes_equipment ? '、音响设备' : '' }}、互动环节</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">业务类型：</text>
            <text class="detail-value">商演包场</text>
          </view>
        </view>
      </view>

      <!-- 价格说明 -->
      <view class="section-card">
        <text class="section-title">价格说明</text>
        <view class="price-section">
          <text class="price-amount">¥{{ formatPrice(detail.min_price) }}</text>
        </view>
        <text class="channel-price">活动公司渠道价：¥{{ formatPrice(channelPrice(detail.min_price)) }}</text>
        <view class="tier-list">
          <view
            v-for="tier in priceTiers"
            :key="tier"
            class="tier-pill"
            :class="{ active: tier === currentTier }"
          >{{ tier }}</view>
        </view>
        <text class="price-note">最终价格根据具体需求确定，含演员差旅费</text>
      </view>

      <!-- 用户评价 -->
      <view class="section-card" v-if="reviews && reviews.length > 0">
        <view class="section-header-row">
          <text class="section-title">用户评价</text>
          <text class="section-more">好评 {{ reviewStats.average }}分 · {{ reviewStats.total }}条 ›</text>
        </view>
        <view v-for="rev in reviews.slice(0, 3)" :key="rev.id" class="review-item">
          <view class="review-top">
            <text class="review-company">{{ rev.company_name || '匿名用户' }}</text>
            <view class="review-stars">
              <van-icon v-for="i in 5" :key="i" name="star" size="24rpx" :color="i <= rev.rating ? '#f59e0b' : '#e5e5ea'" />
            </view>
          </view>
          <text class="review-content">{{ rev.content }}</text>
        </view>
      </view>

      <!-- 精彩案例 -->
      <view class="section-card" v-if="detail.caseStudies?.length">
        <view class="section-header-row">
          <text class="section-title">精彩案例</text>
          <text class="case-count">{{ detail.caseStudies.length }}个案例</text>
        </view>
        <scroll-view scroll-x class="case-scroll" :show-scrollbar="false">
          <view class="case-scroll-inner">
            <view
              v-for="cs in detail.caseStudies"
              :key="cs.id"
              class="case-card"
              @click="goCaseDetail(cs.id)"
            >
              <view class="case-cover">
                <image v-if="cs.coverImage" :src="cs.coverImage" mode="aspectFill" class="case-cover-img" />
                <view v-else class="case-cover-placeholder">
                  <text class="case-cover-emoji">🎭</text>
                </view>
                <view class="case-cover-badge" v-if="cs.tier">T{{ cs.tier }}</view>
              </view>
              <view class="case-info">
                <text class="case-title" lines="1">{{ cs.title }}</text>
                <view class="case-meta">
                  <text class="case-meta-item" v-if="cs.eventDate">{{ cs.eventDate }}</text>
                  <text class="case-meta-item" v-if="cs.audienceCount">{{ cs.audienceCount }}人</text>
                </view>
                <view class="case-rating" v-if="cs.rating">
                  <van-icon name="star" size="22rpx" color="#f59e0b" />
                  <text class="case-rating-text">{{ cs.rating }}%好评</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 底部 CTA -->
      <view class="bottom-cta">
        <button class="btn-consult" @click="goSubmitDemand">获取报价</button>
        <button class="btn-book" @click="callPhone">联系小演</button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSKUDetail, getReviews, getReviewStats } from '@/services/api';
import type { SKUDetail, Review, ReviewStats } from '@/types';
import { formatPrice } from '@/utils/format';

const detail = ref<SKUDetail | null>(null);
const skuId = ref('');
const loading = ref(true);
const reviews = ref<Review[]>([]);
const reviewStats = ref<ReviewStats>({ average: 0, total: 0, distribution: [] });
const priceTiers = ['T1', 'T2', 'T3', 'T4', 'T5'];

const currentTier = computed(() => {
  const data = detail.value as any;
  return data?.tier || data?.defaultTier || data?.price_tier || 'T3';
});

const performerCount = computed(() => {
  const data = detail.value as any;
  return data?.cast_size_min || data?.minPerformers || detail.value?.cast?.length || 2;
});

const supplierInfo = computed(() => {
  const data = detail.value as any;
  if (data?.is_self_operated || data?.supplier_type === 'self') return { type: 'own', label: '自营' };
  if (data?.supplier_name) return { type: 'broker', label: data.supplier_name };
  return { type: 'broker', label: '星火经纪' };
});

function channelPrice(price?: number) {
  return Math.round(Number(price || 0) * 0.7);
}

onLoad((options: any) => {
  skuId.value = options?.id || '';
  if (skuId.value) fetchDetail();
});

async function fetchDetail() {
  loading.value = true;
  try {
    const res = await getSKUDetail(skuId.value);
    if (res.ok && res.data) {
      detail.value = res.data;
    }
  } catch (e) {
    console.error('加载详情失败:', e);
  } finally {
    loading.value = false;
  }
}

async function fetchReviews() {
  try {
    const [revRes, statsRes] = await Promise.all([
      getReviews(skuId.value),
      getReviewStats(skuId.value)
    ]);
    if (revRes.ok && revRes.data) reviews.value = revRes.data;
    if (statsRes.ok && statsRes.data) reviewStats.value = statsRes.data;
  } catch (e) {
    console.error('加载评价失败:', e);
  }
}

function goBack() { uni.navigateBack(); }
function callPhone() {
  uni.makePhoneCall({ phoneNumber: "400-xxx-xxxx", fail: () => {} });
}
function goSubmitDemand() {
  uni.navigateTo({
    url: `/pages/request/submit?skuId=${skuId.value}`
  });
}
function goCaseDetail(id: string) {
  uni.navigateTo({ url: `/pages/case/detail?id=${id}` });
}

onMounted(() => {
  fetchReviews();
});
</script>

<style lang="scss" scoped>
.sku-detail-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding-bottom: 200rpx;
  position: relative;
}

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 60vh; gap: 16rpx;
  .loading-text { font-size: 28rpx; color: var(--color-text-tertiary); }
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
    color: var(--color-text-secondary);
  }
}

// 大图封面
.hero-image {
  height: 480rpx;
  width: 100%;
  overflow: hidden;
  position: relative;
  .hero-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4c1d95, #7c3aed, #a78bfa);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 160rpx;
    color: rgba(255,255,255,0.3);
  }
  .hero-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 240rpx;
    background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  }
}

.hero-content {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 56rpx;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hero-title {
  font-size: 44rpx;
  line-height: 1.2;
  font-weight: 800;
  color: #ffffff;
}

.hero-meta {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.88);
}

// 基本信息卡片 (浮起)
.info-card {
  position: relative;
  margin: -40rpx 32rpx 24rpx;
  z-index: 1;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);

}

.info-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.info-title {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
  line-height: 1.3;
  flex: 1;
}

.supplier-badge {
  flex-shrink: 0;
  border-radius: $radius-full;
  padding: 6rpx 18rpx;
  background: #f5f5f7;
  color: #6b7280;
  font-size: 22rpx;
  font-weight: 700;
  &.own {
    background: #f5f3ff;
    color: $color-primary;
  }
}

.tags-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  .tag {
    font-size: 22rpx;
    padding: 6rpx 20rpx;
    border-radius: 9999px;
    font-weight: 500;
  }
  .tag-primary { background: var(--color-primary-bg); color: var(--color-primary); }
  .tag-category { background: #eff6ff; color: #3b82f6; }
  .tag-gray { background: #f3f4f6; color: var(--color-text-secondary); }
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
  .rating-score { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); }
  .rating-count { font-size: 24rpx; color: var(--color-text-tertiary); margin-left: 4rpx; }
}

.info-subtitle {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: block;
}

// 区块卡片
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
    margin-bottom: 0;
  }
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;

  .section-more {
    font-size: 24rpx;
    color: var(--color-primary);
  }

  .case-count {
    font-size: 24rpx;
    color: var(--color-text-tertiary);
  }
}

// 演出阵容
.performer-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 28rpx;
  &:last-child { margin-bottom: 0; }

  .performer-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #a78bfa);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #fff;
    flex-shrink: 0;
  }

  .performer-info {
    flex: 1;
    min-width: 0;
  }

  .performer-name-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }

  .performer-name { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); }
  .performer-level {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 9999px;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    font-weight: 500;
  }
  .performer-exp { font-size: 24rpx; color: var(--color-text-tertiary); display: block; }
}

// 服务详情
.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  .detail-row {
    display: flex;
    font-size: 28rpx;
    line-height: 1.6;
    .detail-label {
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }
    .detail-value {
      color: var(--color-text-primary);
    }
  }
}

// 价格说明
.price-section {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 16rpx;
  .price-amount {
    font-size: 56rpx;
    font-weight: 700;
    color: var(--color-primary);
    font-family: 'JetBrains Mono', monospace;
  }
}
.channel-price {
  display: inline-flex;
  margin-bottom: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: $radius-sm;
  background: #f5f5f7;
  color: #6b7280;
  font-size: 24rpx;
}
.tier-list {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.tier-pill {
  flex: 1;
  height: 56rpx;
  border-radius: $radius-full;
  background: #f5f5f7;
  color: $color-text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  &.active {
    background: $color-primary;
    color: #ffffff;
  }
}
.price-note {
  font-size: 24rpx;
  color: var(--color-text-tertiary);
  line-height: 1.5;
  display: block;
}

// 用户评价
.review-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--color-divider);

  &:last-child { border-bottom: none; padding-bottom: 0; }
}

.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.review-company {
  font-size: 26rpx;
  font-weight: 500;
  color: var(--color-text-primary);
}

.review-stars {
  display: flex;
  gap: 4rpx;
}

.review-content {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: block;
}

// 精彩案例
.case-scroll { width: 100%; }
.case-scroll-inner { display: flex; gap: 16rpx; white-space: nowrap; }
.case-card {
  flex-shrink: 0;
  width: 280rpx;
  background: var(--color-bg-page);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.case-cover {
  width: 280rpx;
  height: 180rpx;
  position: relative;
  overflow: hidden;
}
.case-cover-img { width: 100%; height: 100%; }
.case-cover-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  display: flex;
  align-items: center;
  justify-content: center;
}
.case-cover-emoji { font-size: 60rpx; }
.case-cover-badge {
  position: absolute; top: 12rpx; right: 12rpx;
  background: var(--color-primary); color: #fff;
  font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 9999px;
}
.case-info { padding: 16rpx; }
.case-title { font-size: 26rpx; font-weight: 500; color: var(--color-text-primary); }
.case-meta { display: flex; gap: 12rpx; margin-top: 6rpx; }
.case-meta-item { font-size: 22rpx; color: var(--color-text-tertiary); }
.case-rating { display: flex; align-items: center; gap: 4rpx; margin-top: 8rpx; }
.case-rating-text { font-size: 22rpx; color: #f59e0b; }

// 底部 CTA
.bottom-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.06);
  z-index: 50;

  .btn-consult {
    flex: 0 0 auto;
    width: 160rpx;
    height: 88rpx;
    border-radius: 9999px;
    border: 2rpx solid var(--color-primary);
    background: transparent;
    color: var(--color-primary);
    font-size: 28rpx;
    font-weight: 600;
    line-height: 88rpx;
    text-align: center;
  }

  .btn-book {
    flex: 1;
    height: 88rpx;
    border-radius: 9999px;
    border: none;
    background: var(--color-primary);
    color: #fff;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 88rpx;
    text-align: center;
  }
}
</style>
