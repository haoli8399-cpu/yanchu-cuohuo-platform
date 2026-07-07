<template>
  <view class="sku-detail-page page-with-cta">
    <CfNavBar title="方案详情" :showBack="true" backText="返回" />

    <!-- Hero Image -->
    <image :src="sku.coverImage" mode="aspectFill" class="sku-detail-page__hero" />

    <!-- Basic Info Card -->
    <view class="sku-detail-page__info card" style="margin-top: -40rpx; position: relative; z-index: 1;">
      <text class="sku-detail-page__title">{{ sku.title }}</text>
      <view class="sku-detail-page__tags">
        <view v-for="tag in sku.tags" :key="tag" class="status-tag status-tag--signed"><text>{{ tag }}</text></view>
      </view>
      <view class="sku-detail-page__rating">
        <text class="sku-detail-page__rating-score">{{ sku.rating }}分</text>
        <text class="sku-detail-page__rating-count">{{ sku.ratingCount }}条评价</text>
      </view>
      <text class="sku-detail-page__desc">专业脱口秀演员团队，为企业年会和团建活动量身打造喜剧体验。</text>
    </view>

    <!-- Performer Info -->
    <view class="card sku-detail-page__performers">
      <text class="card-title">演出阵容</text>
      <view v-for="(p, i) in sku.performers" :key="p.id" class="sku-detail-page__performer" :class="{ 'sku-detail-page__performer--border': i < sku.performers.length - 1 }">
        <image :src="p.avatar" mode="aspectFill" class="sku-detail-page__avatar" />
        <view class="sku-detail-page__performer-info">
          <view class="sku-detail-page__performer-name-row">
            <text class="sku-detail-page__performer-name">{{ p.name }}</text>
            <view class="status-tag status-tag--signed"><text>{{ p.tierLevel }}</text></view>
          </view>
          <text class="sku-detail-page__performer-exp">{{ p.experience }}</text>
        </view>
      </view>
      <view v-if="!sku.performers.length" class="sku-detail-page__empty-performer">
        <text class="sku-detail-page__empty-text">暂无演出阵容信息</text>
      </view>
    </view>

    <!-- Service Details -->
    <view class="card">
      <text class="card-title">服务详情</text>
      <view class="sku-detail-page__detail-row">
        <text class="sku-detail-page__detail-label">演出时长</text>
        <text class="sku-detail-page__detail-value">{{ sku.duration }}分钟</text>
      </view>
      <view class="sku-detail-page__detail-row">
        <text class="sku-detail-page__detail-label">适合场景</text>
        <text class="sku-detail-page__detail-value">{{ sku.suitableScene }}</text>
      </view>
      <view class="sku-detail-page__detail-row">
        <text class="sku-detail-page__detail-label">服务包含</text>
        <text class="sku-detail-page__detail-value">演员2名、音响设备、互动环节</text>
      </view>
      <view class="sku-detail-page__detail-row">
        <text class="sku-detail-page__detail-label">业务类型</text>
        <text class="sku-detail-page__detail-value">商演包场</text>
      </view>
    </view>

    <!-- Pricing -->
    <view class="card">
      <text class="card-title">价格说明</text>
      <view class="sku-detail-page__price-row">
        <text class="sku-detail-page__price">¥{{ sku.price.toLocaleString() }}</text>
        <text class="sku-detail-page__price-unit">/场 起</text>
      </view>
      <text class="sku-detail-page__price-note">最终价格根据具体需求确定，含演员差旅费</text>
    </view>

    <!-- Fixed CTA -->
    <view class="fixed-bottom">
      <button class="btn btn-ghost" @tap="handleConsult">咨询</button>
      <button class="btn btn-primary" style="flex: 1;" @tap="handleBook">立即预约</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'
import type { Sku, Performer } from '@/types'

const sku = ref<Sku>({
  id: '1',
  title: '周末脱口秀之夜',
  showType: 'talkshow',
  coverImage: '/static/images/show-card-1.jpg',
  description: '专业脱口秀演员团队，为企业年会和团建活动量身打造喜剧体验。',
  duration: 90,
  price: 8800,
  priceUnit: '场',
  rating: 4.9,
  ratingCount: 126,
  salesCount: 200,
  suitableScene: '企业年会、团建活动、客户答谢',
  businessType: 'commercial',
  performers: [
    { id: '1', name: '张脱口秀', avatar: '/static/images/performer-avatar.jpg', tierLevel: 'T3', experience: '从业8年 | 500+场演出经验', showCount: 500, yearsActive: 8 },
    { id: '2', name: '李即兴', avatar: '/static/images/performer-avatar.jpg', tierLevel: 'T4', experience: '从业5年 | 200+场演出经验', showCount: 200, yearsActive: 5 },
  ],
  tags: ['脱口秀', '企业年会', '90分钟'],
})

function handleConsult() {
  uni.showToast({ title: '咨询功能开发中', icon: 'none' })
}

function handleBook() {
  uni.navigateTo({ url: '/pages/request/submit/index' })
}
</script>

<style lang="scss" scoped>
.sku-detail-page {
  background-color: $color-bg-page;

  &__hero {
    width: 100%;
    height: 480rpx;
  }

  &__title {
    font-size: $text-2xl;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: $space-md;
  }

  &__tags {
    display: flex;
    gap: $space-sm;
    margin-bottom: $space-md;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: $space-md;
    margin-bottom: $space-md;
  }

  &__rating-score { font-size: $text-md; color: $state-pending; font-weight: 600; }
  &__rating-count { font-size: $text-sm; color: $color-text-tertiary; }

  &__desc {
    font-size: $text-base;
    color: $color-text-secondary;
    line-height: 1.6;
  }

  &__performers { margin-top: 0; }

  &__performer {
    display: flex;
    align-items: center;
    padding: $space-md 0;

    &--border {
      border-top: 1rpx solid $color-divider;
    }
  }

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: $space-md;
    flex-shrink: 0;
  }

  &__performer-info { flex: 1; }

  &__performer-name-row {
    display: flex;
    align-items: center;
    gap: $space-sm;
    margin-bottom: 4rpx;
  }

  &__performer-name { font-size: $text-md; font-weight: 500; color: $color-text-primary; }
  &__performer-exp { font-size: $text-sm; color: $color-text-secondary; }
  &__empty-performer { padding: $space-lg 0; text-align: center; }
  &__empty-text { font-size: $text-base; color: $color-text-tertiary; }

  &__detail-row {
    display: flex;
    justify-content: space-between;
    padding: $space-sm 0;
  }

  &__detail-label { font-size: $text-base; color: $color-text-secondary; }
  &__detail-value { font-size: $text-base; color: $color-text-primary; text-align: right; }

  &__price-row {
    display: flex;
    align-items: baseline;
    margin-bottom: $space-sm;
  }

  &__price { font-size: $text-4xl; font-weight: 700; color: $color-primary; }
  &__price-unit { font-size: $text-base; color: $color-text-tertiary; margin-left: 4rpx; }
  &__price-note { font-size: $text-sm; color: $color-text-tertiary; }
}

.card-title {
  font-size: $text-xl;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-md;
  display: block;
}
</style>

.channel-price { font-size: 24rpx; color: $color-text-secondary; margin-top: 4rpx; }
.price-tier-list { margin-top: 20rpx; padding: 0; }
.price-tier-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14rpx 20rpx; border: 2rpx solid $color-border; border-radius: $radius-sm; margin-bottom: 8rpx;
}
.price-tier-item.current { background: $color-primary-subtle; border-color: $color-primary; }
.tier-label { font-size: 26rpx; font-weight: 600; }
.tier-duration { font-size: 22rpx; color: $color-text-secondary; }
.tier-price { font-family: 'JetBrains Mono', monospace; font-size: 28rpx; font-weight: 700; color: $color-primary; }
.tier-badge { font-size: 20rpx; font-weight: 700; padding: 2rpx 10rpx; border-radius: 9999px; background: $color-primary; color: #fff; margin-left: 8rpx; }