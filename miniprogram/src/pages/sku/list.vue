<template>
  <view class="sku-list-page">
    <!-- 导航栏 -->
    <CfNavBar title="方案列表" />

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <van-icon name="search" size="28rpx" class="search-icon" />
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索演出方案"
          placeholder-style="color: #c4c4cc; font-size: 28rpx;"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 分类 Tabs -->
    <scroll-view scroll-x class="category-tabs" show-scrollbar="false">
      <view
        v-for="cat in categories"
        :key="cat.value"
        class="category-tab"
        :class="{ active: selectedCategory === cat.value }"
        @click="onCategoryChange(cat.value)"
      >
        {{ cat.label }}
      </view>
    </scroll-view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-tag" @click="onToggleSort">
        <text>{{ sortLabel }}</text>
        <van-icon name="arrow-down" size="20rpx" />
      </view>
      <view class="filter-tag" @click="showPricePicker = true">
        <text>{{ priceLabel }}</text>
        <van-icon name="arrow-down" size="20rpx" />
      </view>
      <view class="filter-tag">咖位筛选
        <van-icon name="arrow-down" size="20rpx" />
      </view>
    </view>

    <!-- 价格区间弹窗 -->
    <van-popup :show="showPricePicker" position="bottom" round @close="showPricePicker = false">
      <view class="price-picker-wrap">
        <view class="price-picker-header">
          <text class="price-picker-cancel" @click="showPricePicker = false">取消</text>
          <text class="price-picker-title">价格范围</text>
          <text class="price-picker-confirm" @click="onPriceRangeConfirm">确定</text>
        </view>
        <view class="price-range-options">
          <view
            v-for="r in priceRanges"
            :key="r.value"
            class="price-range-option"
            :class="{ active: selectedPriceRange === r.value }"
            @click="selectedPriceRange = r.value"
          >
            {{ r.label }}
          </view>
        </view>
      </view>
    </van-popup>

    <!-- 方案列表 -->
    <view class="sku-list-wrap">
      <scroll-view
        scroll-y
        class="sku-list"
        enable-flex
        @scrolltolower="onLoadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view class="sku-list-inner">
          <view v-if="loading && page === 1" class="loading-state">
            <van-loading type="spinner" size="48rpx" custom-class="loading-spinner" />
            <text class="loading-text">加载中...</text>
          </view>

          <template v-else-if="skuList.length > 0">
            <view
              v-for="sku in skuList"
              :key="sku.id"
              class="sku-card"
              @click="goDetail(sku.id)"
            >
              <!-- 封面 -->
              <view class="sku-cover">
                <view class="sku-cover-placeholder">
                  {{ sku.category_label?.charAt(0) || '' }}
                </view>
              </view>
              <view class="sku-card-body">
                <view class="sku-row1">
                  <text class="sku-title">{{ sku.title }}</text>
                  <text v-if="sku.category_label" class="sku-tag">{{ sku.category_label }}</text>
                </view>
                <view class="sku-subtitle" v-if="sku.description">{{ sku.description }}</view>
                <view class="sku-row3">
                  <view class="sku-price">
                    <text class="price-symbol">¥</text>
                    <text class="price-value">{{ formatPrice(sku.min_price) }}</text>
                    <text class="price-unit">/场</text>
                  </view>
                  <view class="sku-rating" v-if="sku.rating">
                    <van-icon name="star" size="20rpx" color="#f59e0b" />
                    <text class="rating-value">{{ sku.rating }}</text>
                    <text class="rating-sold">已售{{ sku.sales_count || 0 }}</text>
                  </view>
                </view>
              </view>
            </view>

            <view v-if="noMore && skuList.length > 0" class="no-more">没有更多了</view>
            <view v-if="loading && page > 1" class="loading-more">
              <van-loading size="28rpx" /> 加载中...
            </view>
          </template>

          <EmptyState v-else icon="bill-o" title="暂无演出方案" description="搜索其他类型试试" />
        </view>
      </scroll-view>
    </view>

    <TabBar current="/pages/sku/list" />
    <FloatingPhone />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSKUList } from '@/services/api';
import type { SKUProduct } from '@/types';
import { formatPrice } from '@/utils/format';
import CfNavBar from '@/components/CfNavBar.vue';

const keyword = ref('');
const selectedCategory = ref('');
const skuList = ref<SKUProduct[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const page = ref(1);
const pageSize = 20;
const noMore = ref(false);

const showPricePicker = ref(false);
const selectedPriceRange = ref('');
const priceRanges = [
  { label: '不限', value: '' },
  { label: '¥3,000以下', value: '0-3000' },
  { label: '¥3,000-8,000', value: '3000-8000' },
  { label: '¥8,000-15,000', value: '8000-15000' },
  { label: '¥15,000以上', value: '15000-' },
];
const priceLabel = computed(() => {
  if (!selectedPriceRange.value) return '价格排序';
  const r = priceRanges.find(p => p.value === selectedPriceRange.value);
  return r ? r.label : '价格排序';
});

type SortMode = 'default' | 'price_asc' | 'price_desc' | 'rating';
const sortMode = ref<SortMode>('default');
const sortLabel = computed(() => {
  const map: Record<SortMode, string> = { default: '推荐', price_asc: '价格↑', price_desc: '价格↓', rating: '评分优先' };
  return map[sortMode.value];
});

const categories = [
  { label: '全部', value: '' },
  { label: '脱口秀', value: '脱口秀' },
  { label: '即兴喜剧', value: '即兴喜剧' },
  { label: '漫才', value: '漫才' },
  { label: '新喜剧', value: '新喜剧' },
  { label: '魔术喜剧', value: '魔术喜剧' },
  { label: '亲子喜剧', value: '亲子喜剧' },
];

function onPriceRangeConfirm() {
  showPricePicker.value = false;
  fetchSKUs(true);
}

function onToggleSort() {
  const order: SortMode[] = ['default', 'price_asc', 'price_desc', 'rating'];
  const idx = order.indexOf(sortMode.value);
  sortMode.value = order[(idx + 1) % order.length];
  fetchSKUs(true);
}

async function fetchSKUs(reset = false) {
  if (!reset && loading.value) return;
  loading.value = true;
  if (reset) { page.value = 1; noMore.value = false; }
  try {
    const res = await getSKUList({
      page: page.value,
      pageSize,
      keyword: keyword.value || undefined,
      category: selectedCategory.value || undefined,
      priceRange: selectedPriceRange.value || undefined,
      sortBy: sortMode.value !== 'default' ? sortMode.value : undefined
    });
    if (res.ok) {
      const list = res.data || [];
      if (reset) skuList.value = list;
      else skuList.value = [...skuList.value, ...list];
      if (list.length < pageSize) noMore.value = true;
    }
  } catch (e) {
    console.error('加载SKU失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onSearch() { fetchSKUs(true); }
function onCategoryChange(cat: string) {
  selectedCategory.value = cat;
  fetchSKUs(true);
}
async function onRefresh() {
  refreshing.value = true;
  await fetchSKUs(true);
}
async function onLoadMore() {
  if (loading.value || noMore.value) return;
  page.value++;
  await fetchSKUs(false);
}
function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail?id=${id}` });
}

onMounted(() => { fetchSKUs(true); });
</script>

<style lang="scss" scoped>
.sku-list-page {
  height: 100vh;
  background: var(--color-bg-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 12rpx 32rpx;
  .search-input-wrap {
    display: flex;
    align-items: center;
    background: var(--color-bg-input);
    border-radius: 9999px;
    height: 72rpx;
    padding: 0 24rpx;
    .search-icon { flex-shrink: 0; margin-right: 16rpx; }
    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: var(--color-text-primary);
    }
  }
}

.category-tabs {
  padding: 12rpx 32rpx 0;
  white-space: nowrap;
  .category-tab {
    display: inline-block;
    padding: 12rpx 32rpx;
    border-radius: 9999px;
    font-size: 26rpx;
    font-weight: 400;
    color: var(--color-text-secondary);
    background: $color-bg-input;
    white-space: nowrap;
    margin-right: 16rpx;
    &.active {
      background: $color-primary;
      color: $color-text-inverse;
      font-weight: 500;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 24rpx;
  overflow-x: auto;
  white-space: nowrap;
  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4rpx;
    border: 1rpx solid var(--color-border);
    border-radius: 9999px;
    padding: 8rpx 24rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }
}

// 价格弹窗
.price-picker-wrap {
  padding: 24rpx 32rpx 48rpx;
  .price-picker-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 24rpx;
    .price-picker-cancel, .price-picker-confirm { font-size: 28rpx; color: var(--color-primary); }
    .price-picker-cancel { color: var(--color-text-tertiary); }
    .price-picker-title { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary); }
  }
  .price-range-options {
    display: flex; flex-direction: column; gap: 16rpx;
    .price-range-option {
      padding: 24rpx;
      border-radius: var(--radius-md);
      font-size: 28rpx;
      color: var(--color-text-primary);
      background: var(--color-bg-page);
      border: 2rpx solid var(--color-border);
      text-align: center;
      &.active { border-color: var(--color-primary); background: rgba(167,139,250,.08); color: var(--color-primary); font-weight: 600; }
    }
  }
}

// 列表区域
.sku-list-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sku-list {
  height: 100%;
  padding: 0 32rpx 180rpx;
  box-sizing: border-box;
}

.sku-list-inner {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-top: 16rpx;
}

.sku-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  width: 100%;
  flex-shrink: 0;
}

.sku-cover {
  width: 100%;
  height: 320rpx;
  overflow: hidden;
  .sku-cover-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, $color-primary-bg, $color-primary-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80rpx;
    color: var(--color-primary-light);
  }
}

.sku-card-body {
  padding: 24rpx;
}

.sku-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .sku-title {
    font-size: 30rpx;
    font-weight: 500;
    color: var(--color-text-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sku-tag {
    background: var(--color-primary-bg);
    color: var(--color-primary);
    border-radius: 9999px;
    padding: 4rpx 16rpx;
    font-size: 22rpx;
    flex-shrink: 0;
    margin-left: 16rpx;
  }
}

.sku-subtitle {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  margin-top: 8rpx;
}

.sku-row3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.sku-price {
  display: flex;
  align-items: baseline;
  .price-symbol { font-size: 24rpx; font-weight: 600; color: var(--color-primary); }
  .price-value { font-size: 36rpx; font-weight: 600; color: var(--color-primary); }
  .price-unit { font-size: 24rpx; color: var(--color-text-tertiary); margin-left: 4rpx; }
}

.sku-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
  .rating-value { font-size: 24rpx; color: $state-warning; font-weight: 500; }
  .rating-sold { font-size: 24rpx; color: var(--color-text-tertiary); margin-left: 4rpx; }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  .loading-text { font-size: 28rpx; color: var(--color-text-tertiary); margin-top: 16rpx; }
}

.no-more { text-align: center; padding: 30rpx 0; font-size: 24rpx; color: var(--color-text-tertiary); }
.loading-more { display: flex; align-items: center; justify-content: center; padding: 30rpx 0; font-size: 24rpx; color: var(--color-text-tertiary); gap: 8rpx; }
</style>
