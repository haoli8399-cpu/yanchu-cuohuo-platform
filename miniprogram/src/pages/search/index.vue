<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <van-search
        v-model="keyword"
        placeholder="搜索演出方案"
        :focus="true"
        show-action
        @search="onSearch"
        @cancel="goBack"
      />
    </view>

    <!-- 搜索建议（无输入时显示） -->
    <view v-if="!keyword && !searched" class="search-suggestions">
      <view class="suggestion-header">
        <text class="suggestion-title">热门搜索</text>
      </view>
      <view class="hot-tags">
        <text
          v-for="kw in hotKeywords"
          :key="kw.keyword"
          class="hot-tag"
          @click="onHotSearch(kw.keyword)"
        >{{ kw.keyword }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <scroll-view v-if="searched" scroll-y class="results-scroll">
      <view v-if="loading" class="loading-section">
        <van-loading type="spinner" size="48rpx" />
        <text class="loading-text">搜索中...</text>
      </view>

      <template v-else>
        <view v-if="results.length > 0" class="results-list">
          <text class="result-count">找到 {{ total }} 个方案</text>
          <view
            v-for="sku in results"
            :key="sku.id"
            class="result-card"
            @click="goDetail(sku.id)"
          >
            <view class="result-cover">
              <text class="result-cover-text">{{ (sku.title || '演出').slice(0, 2) }}</text>
            </view>
            <view class="result-info">
              <text class="result-title">{{ sku.title }}</text>
              <text class="result-desc">{{ sku.category_label || sku.category }} | {{ sku.duration_minutes }}分钟</text>
              <view class="result-footer">
                <text class="result-price">¥{{ formatPrice(sku.min_price) }}/场起</text>
                <view class="result-meta" v-if="sku.rating">
                  <van-icon name="star" size="22rpx" color="#f59e0b" />
                  <text class="result-rating">{{ sku.rating }}分</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="!loading" class="empty-section">
          <van-icon name="search" size="80rpx" color="#d1d5db" />
          <text class="empty-text">未找到相关方案</text>
          <text class="empty-hint">试试其他关键词</text>
        </view>
      </template>
    </scroll-view>

    <!-- 搜索提示（输入中但未搜索） -->
    <view v-if="keyword && !searched" class="search-hint">
      <text class="hint-text">输入关键词搜索演出方案</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSKUList, getHotKeywords } from '@/services/api';
import type { SKUProduct, HotKeyword } from '@/types';
import { formatPrice } from '@/utils/format';

const keyword = ref('');
const searched = ref(false);
const loading = ref(false);
const results = ref<SKUProduct[]>([]);
const total = ref(0);
const hotKeywords = ref<HotKeyword[]>([]);

onMounted(async () => {
  try {
    const res = await getHotKeywords();
    if (res.ok && res.data) hotKeywords.value = res.data;
  } catch {}
});

function onSearch() {
  const kw = keyword.value.trim();
  if (!kw) return;
  doSearch(kw);
}

function onHotSearch(kw: string) {
  keyword.value = kw;
  doSearch(kw);
}

async function doSearch(kw: string) {
  searched.value = true;
  loading.value = true;
  try {
    const res = await getSKUList({ keyword: kw });
    if (res.ok) {
      results.value = res.data || [];
      total.value = res.total || results.value.length;
    }
  } catch (e) {
    console.error('搜索失败:', e);
  } finally {
    loading.value = false;
  }
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail?id=${id}` });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-bg-card);
}

// 搜索建议
.search-suggestions {
  padding: 24rpx 32rpx;
}

.suggestion-header {
  margin-bottom: 20rpx;
}

.suggestion-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hot-tag {
  font-size: 26rpx;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  border: 1rpx solid var(--color-divider);
  padding: 12rpx 24rpx;
  border-radius: 9999px;
}

// 搜索提示
.search-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;
  .hint-text { font-size: 26rpx; color: var(--color-text-tertiary); }
}

// 结果区域
.results-scroll { height: calc(100vh - 106rpx); }
.loading-section {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 120rpx;
  .loading-text { font-size: 28rpx; color: var(--color-text-tertiary); margin-top: 16rpx; }
}

.results-list { padding: 24rpx 32rpx; }
.result-count { font-size: 24rpx; color: var(--color-text-tertiary); display: block; margin-bottom: 20rpx; }

.result-card {
  display: flex;
  gap: 20rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.result-cover {
  width: 140rpx;
  height: 140rpx;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-cover-text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-primary);
  opacity: 0.6;
}

.result-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.result-desc {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}

.result-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.result-price {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 4rpx;
  .result-rating { font-size: 22rpx; color: var(--color-text-secondary); }
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  .empty-text { font-size: 28rpx; color: var(--color-text-secondary); margin-top: 24rpx; }
  .empty-hint { font-size: 24rpx; color: var(--color-text-tertiary); margin-top: 8rpx; }
}
</style>
