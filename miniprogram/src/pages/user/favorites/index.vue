<template>
  <view class="favorites-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <van-loading type="spinner" size="48rpx" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空态 -->
    <view v-else-if="list.length === 0" class="empty-state">
      <van-icon name="star-o" size="80rpx" color="#d4d4d8" />
      <text class="empty-text">暂无收藏</text>
      <text class="empty-desc">浏览演出方案时点击收藏按钮即可收藏</text>
    </view>

    <!-- 收藏列表 -->
    <scroll-view v-else scroll-y class="favorite-list" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view v-for="item in list" :key="item.id" class="fav-card" @click="goDetail(item.sku_id || item.id)">
        <view class="fav-cover">
          <text class="fav-cover-emoji">{{ item.category_label?.charAt(0) || '🎭' }}</text>
        </view>
        <view class="fav-info">
          <text class="fav-title">{{ item.title }}</text>
          <text class="fav-desc">{{ item.description }}</text>
          <view class="fav-bottom">
            <text class="fav-price">¥{{ formatPrice(item.min_price) }}-{{ formatPrice(item.max_price) }}</text>
            <text class="fav-remove" @click.stop="handleRemove(item.id)">取消收藏</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getFavorites, removeFavorite } from '@/services/api';
import type { SKUProduct } from '@/types';
import { formatPrice } from '@/utils/format';

const list = ref<SKUProduct[]>([]);
const loading = ref(true);
const refreshing = ref(false);

async function fetchFavorites() {
  try {
    const res = await getFavorites();
    if (res.ok) list.value = res.data || [];
  } catch (e) {
    console.error('加载收藏失败:', e);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  await fetchFavorites();
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail?id=${id}` });
}

async function handleRemove(id: string) {
  await removeFavorite(id);
  list.value = list.value.filter(i => i.id !== id);
  uni.showToast({ title: '已取消收藏', icon: 'none' });
}

onMounted(() => fetchFavorites());
</script>

<style lang="scss" scoped>
.favorites-page { min-height: 100vh; background: var(--color-bg-page); }

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 60vh; gap: 16rpx;
  .loading-text { font-size: 28rpx; color: var(--color-text-tertiary); }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 160rpx 0; gap: 16rpx;
  .empty-text { font-size: 30rpx; color: var(--color-text-secondary); font-weight: 500; }
  .empty-desc { font-size: 24rpx; color: var(--color-text-tertiary); }
}

.favorite-list { height: 100vh; padding: 20rpx 32rpx; box-sizing: border-box; }

.fav-card {
  display: flex; background: var(--color-bg-card); border-radius: var(--radius-md);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
  padding: 24rpx; margin-bottom: 20rpx;

  .fav-cover {
    width: 160rpx; height: 200rpx; border-radius: var(--radius-sm);
    background: linear-gradient(135deg, #7c3aed33, #a78bfa33);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 20rpx;
    .fav-cover-emoji { font-size: 56rpx; }
  }

  .fav-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }

  .fav-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fav-desc { font-size: 24rpx; color: var(--color-text-tertiary); margin-top: 8rpx; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  .fav-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx;
    .fav-price { font-size: 26rpx; font-weight: 600; color: var(--state-error); }
    .fav-remove { font-size: 22rpx; color: var(--color-text-tertiary); padding: 8rpx 16rpx; border: 1rpx solid var(--color-border); border-radius: var(--radius-xs); }
  }
}
</style>
