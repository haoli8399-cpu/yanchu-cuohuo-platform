<template>
  <view class="admin-sku-page">
    <!-- 工具栏 -->
    <view class="toolbar">
      <van-button type="primary" size="small" round icon="plus" @click="openCreate">
        新增 SKU
      </van-button>
      <view class="search-box">
        <van-icon name="search" size="28rpx" color="#a1a1aa" />
        <input class="search-input" v-model="keyword" placeholder="搜索方案名称" @input="onSearch" />
      </view>
    </view>

    <!-- 筛选 Tab -->
    <view class="filter-tabs">
      <view
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: statusFilter === tab.value }"
        @click="statusFilter = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- SKU列表 -->
    <view class="sku-list">
      <view v-for="sku in filteredSKUs" :key="sku.id" class="sku-card">
        <image class="sku-cover" :src="sku.cover_url" mode="aspectFill" />
        <view class="sku-body">
          <view class="sku-header">
            <text class="sku-title">{{ sku.title }}</text>
            <view :class="['sku-status', sku.status === '上架' ? 'online' : 'offline']">
              {{ sku.status }}
            </view>
          </view>
          <view class="sku-meta">
            <text class="meta-cat">{{ sku.category }}</text>
            <text class="meta-price">¥{{ sku.min_price }}~{{ sku.max_price }}/场</text>
          </view>
          <text class="sku-desc">{{ sku.description }}</text>
          <view class="sku-actions">
            <van-button size="mini" plain @click="openEdit(sku)">编辑</van-button>
            <van-button size="mini" plain :type="sku.status === '上架' ? 'warning' : 'primary'" @click="toggleStatus(sku)">
              {{ sku.status === '上架' ? '下架' : '上架' }}
            </van-button>
            <van-button size="mini" plain type="danger" @click="handleDelete(sku)">删除</van-button>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredSKUs.length === 0 && !loading" class="empty">
      <van-icon name="info-o" size="80rpx" color="#d4d4d8" />
      <text class="empty-text">暂无 SKU</text>
    </view>

    <!-- 编辑/新增弹窗 -->
    <van-popup
      :show="showPopup"
      position="bottom"
      round
      closeable
      custom-style="max-height: 85vh; overflow-y: auto;"
      @close="closePopup"
    >
      <view class="form-wrap">
        <text class="form-title">{{ editingSku ? '编辑 SKU' : '新增 SKU' }}</text>

        <view class="form-group">
          <text class="form-label">方案名称 *</text>
          <input class="form-input" v-model="form.title" placeholder="如：脱口秀拼盘之夜" />
        </view>

        <view class="form-group">
          <text class="form-label">分类 *</text>
          <picker mode="selector" :range="categoryOptions" :value="form.categoryIndex" @change="onCategoryChange">
            <view class="form-picker">
              {{ form.categoryOptions[form.categoryIndex] || '请选择分类' }}
              <van-icon name="arrow-down" size="24rpx" color="#a1a1aa" />
            </view>
          </picker>
        </view>

        <view class="form-group">
          <text class="form-label">描述</text>
          <textarea class="form-textarea" v-model="form.description" placeholder="演出内容介绍" />
        </view>

        <view class="form-group">
          <text class="form-label">封面图片 URL</text>
          <input class="form-input" v-model="form.cover_url" placeholder="/static/icons/sku-talk-show.png" />
        </view>

        <view class="form-row">
          <view class="form-group half">
            <text class="form-label">最低价 (¥)</text>
            <input class="form-input" v-model="form.min_price" type="number" placeholder="3000" />
          </view>
          <view class="form-group half">
            <text class="form-label">最高价 (¥)</text>
            <input class="form-input" v-model="form.max_price" type="number" placeholder="15000" />
          </view>
        </view>

        <view class="form-row">
          <view class="form-group half">
            <text class="form-label">时长 (分钟)</text>
            <input class="form-input" v-model="form.duration_minutes" type="number" placeholder="90" />
          </view>
          <view class="form-group half">
            <text class="form-label">演员数 (最少)</text>
            <input class="form-input" v-model="form.cast_size_min" type="number" placeholder="4" />
          </view>
        </view>

        <view class="form-row">
          <view class="form-group half">
            <text class="form-label">演员数 (最多)</text>
            <input class="form-input" v-model="form.cast_size_max" type="number" placeholder="6" />
          </view>
          <view class="form-group half">
            <text class="form-label">城市</text>
            <input class="form-input" v-model="form.city" placeholder="成都" />
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">标签（逗号分隔）</text>
          <input class="form-input" v-model="form.tagsText" placeholder="热门,互动强,气氛热烈" />
        </view>

        <view class="form-actions">
          <van-button block round @click="closePopup">取消</van-button>
          <van-button block round type="primary" :loading="saving" :disabled="!form.title.trim()" @click="handleSave">
            保存
          </van-button>
        </view>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { getCategories, getSKUList, createSKU, updateSKU, deleteSKU } from '@/services/api';
import type { SKUProduct, Category } from '@/types';

const loading = ref(true);
const skuList = ref<SKUProduct[]>([]);
const keyword = ref('');
const statusFilter = ref('all');

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '上架', value: '上架' },
  { label: '下架', value: '下架' },
];

const categories = ref<Category[]>([]);
const categoryOptions = ref<string[]>([]);

const filteredSKUs = computed(() => {
  let list = skuList.value;
  if (statusFilter.value !== 'all') {
    list = list.filter(s => s.status === statusFilter.value);
  }
  const kw = keyword.value.trim();
  if (kw) {
    list = list.filter(s => s.title.includes(kw) || s.description.includes(kw));
  }
  return list;
});

// ── 弹窗表单 ──
const showPopup = ref(false);
const editingSku = ref<SKUProduct | null>(null);
const saving = ref(false);

const form = reactive({
  title: '',
  categoryIndex: 0,
  categoryOptions: [] as string[],
  description: '',
  cover_url: '',
  min_price: '',
  max_price: '',
  duration_minutes: '',
  cast_size_min: '',
  cast_size_max: '',
  city: '成都',
  tagsText: '',
});

function resetForm() {
  form.title = '';
  form.categoryIndex = 0;
  form.categoryOptions = categoryOptions.value;
  form.description = '';
  form.cover_url = '';
  form.min_price = '';
  form.max_price = '';
  form.duration_minutes = '';
  form.cast_size_min = '';
  form.cast_size_max = '';
  form.city = '成都';
  form.tagsText = '';
}

function onCategoryChange(e: any) {
  form.categoryIndex = e.detail.value;
}

function openCreate() {
  editingSku.value = null;
  resetForm();
  showPopup.value = true;
}

function openEdit(sku: SKUProduct) {
  editingSku.value = sku;
  const idx = categoryOptions.value.indexOf(sku.category);
  form.title = sku.title;
  form.categoryIndex = idx >= 0 ? idx : 0;
  form.categoryOptions = categoryOptions.value;
  form.description = sku.description;
  form.cover_url = sku.cover_url;
  form.min_price = String(sku.min_price);
  form.max_price = String(sku.max_price);
  form.duration_minutes = String(sku.duration_minutes);
  form.cast_size_min = String(sku.cast_size_min);
  form.cast_size_max = String(sku.cast_size_max);
  form.city = sku.city || '成都';
  form.tagsText = (sku.tags || []).join(',');
  showPopup.value = true;
}

function closePopup() {
  showPopup.value = false;
  editingSku.value = null;
}

async function handleSave() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入方案名称', icon: 'none' });
    return;
  }
  saving.value = true;
  try {
    const cat = categoryOptions.value[form.categoryIndex] || '脱口秀';
    const tags = form.tagsText.split(',').map(t => t.trim()).filter(Boolean);
    const data = {
      title: form.title.trim(),
      category: cat,
      description: form.description.trim(),
      cover_url: form.cover_url.trim() || '/static/icons/sku-talk-show.png',
      min_price: Number(form.min_price) || 0,
      max_price: Number(form.max_price) || 0,
      duration_minutes: Number(form.duration_minutes) || 60,
      cast_size_min: Number(form.cast_size_min) || 1,
      cast_size_max: Number(form.cast_size_max) || 1,
      tags,
      city: form.city.trim() || '成都',
    };

    if (editingSku.value) {
      const res = await updateSKU(editingSku.value.id, data);
      if (!res.ok) {
        uni.showToast({ title: res.error || '更新失败', icon: 'none' });
        return;
      }
      uni.showToast({ title: '更新成功', icon: 'success' });
    } else {
      const res = await createSKU(data);
      if (!res.ok) {
        uni.showToast({ title: res.error || '新增失败', icon: 'none' });
        return;
      }
      uni.showToast({ title: '新增成功', icon: 'success' });
    }

    closePopup();
    await loadSKUs();
  } catch {
    uni.showToast({ title: '操作异常', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

// ── 操作 ──
async function toggleStatus(sku: SKUProduct) {
  const newStatus = sku.status === '上架' ? '下架' : '上架';
  try {
    const res = await updateSKU(sku.id, { status: newStatus } as Partial<SKUProduct>);
    if (res.ok) {
      uni.showToast({ title: `已${newStatus}`, icon: 'success' });
      await loadSKUs();
    } else {
      uni.showToast({ title: res.error || '操作失败', icon: 'none' });
    }
  } catch {
    uni.showToast({ title: '操作异常', icon: 'none' });
  }
}

function handleDelete(sku: SKUProduct) {
  uni.showModal({
    title: '删除 SKU',
    content: `确认删除「${sku.title}」？删除后前端将不再展示。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await deleteSKU(sku.id);
          if (result.ok) {
            uni.showToast({ title: '已删除', icon: 'success' });
            await loadSKUs();
          } else {
            uni.showToast({ title: result.error || '删除失败', icon: 'none' });
          }
        } catch {
          uni.showToast({ title: '删除异常', icon: 'none' });
        }
      }
    }
  });
}

async function loadSKUs() {
  loading.value = true;
  try {
    const res = await getSKUList({ pageSize: 999 });
    if (res.ok && res.data) {
      skuList.value = res.data;
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  // 搜索会实时触发 v-model 更新，computed 自动过滤
}

onMounted(async () => {
  // 加载分类选项
  const catRes = await getCategories();
  if (catRes.ok && catRes.data) {
    categories.value = catRes.data;
    categoryOptions.value = catRes.data.map(c => c.label);
  }
  resetForm();
  await loadSKUs();
});
</script>

<style lang="scss" scoped>
.admin-sku-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding: 24rpx;
}
.toolbar {
  display: flex; gap: 16rpx; align-items: center; margin-bottom: 20rpx;
  .search-box {
    flex: 1; display: flex; align-items: center; gap: 8rpx;
    background: var(--color-bg-page); border-radius: var(--radius-xs);
    padding: 0 20rpx; height: 72rpx;
    .search-input { flex: 1; height: 100%; font-size: 28rpx; color: var(--color-text-primary); }
  }
}
.filter-tabs {
  display: flex; gap: 12rpx; margin-bottom: 20rpx;
  .filter-tab {
    padding: 8rpx 24rpx; border-radius: 999rpx; font-size: 26rpx;
    background: var(--color-bg-page); color: var(--color-text-tertiary);
    &.active { background: rgba(167,139,250,.15); color: var(--color-primary); font-weight: 500; }
  }
}
.sku-list {
  display: flex; flex-direction: column; gap: 20rpx;
}
.sku-card {
  display: flex; gap: 20rpx; background: var(--color-bg-card);
  border-radius: var(--radius-sm); padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,.04);
  .sku-cover {
    width: 160rpx; height: 160rpx; border-radius: var(--radius-xs);
    flex-shrink: 0; background: #f3f4f6;
  }
  .sku-body {
    flex: 1; display: flex; flex-direction: column; gap: 6rpx; min-width: 0;
  }
  .sku-header {
    display: flex; align-items: center; gap: 8rpx;
    .sku-title {
      font-size: 30rpx; font-weight: 600; color: var(--color-text-primary);
      flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .sku-status {
      font-size: 22rpx; padding: 2rpx 14rpx; border-radius: 999rpx; flex-shrink: 0;
      &.online { background: #dcfce7; color: #16a34a; }
      &.offline { background: #f3f4f6; color: #6b7280; }
    }
  }
  .sku-meta {
    display: flex; gap: 16rpx; font-size: 24rpx;
    .meta-cat { color: var(--color-primary); }
    .meta-price { color: #ef4444; font-weight: 500; }
  }
  .sku-desc {
    font-size: 24rpx; color: var(--color-text-tertiary);
    overflow: hidden; text-overflow: ellipsis;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .sku-actions { display: flex; gap: 12rpx; margin-top: 4rpx; }
}
.empty {
  display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; gap: 16rpx;
  .empty-text { font-size: 28rpx; color: var(--color-text-tertiary); }
}
.form-wrap {
  padding: 32rpx 32rpx 60rpx;
}
.form-title {
  font-size: 36rpx; font-weight: 700; color: var(--color-text-primary);
  display: block; margin-bottom: 32rpx;
}
.form-group {
  margin-bottom: 24rpx;
  .form-label { display: block; font-size: 26rpx; color: var(--color-text-secondary); margin-bottom: 8rpx; font-weight: 500; }
  .form-input {
    height: 72rpx; background: var(--color-bg-page); border-radius: var(--radius-xs);
    padding: 0 20rpx; font-size: 28rpx; color: var(--color-text-primary);
    width: 100%; box-sizing: border-box;
  }
  .form-textarea {
    height: 140rpx; background: var(--color-bg-page); border-radius: var(--radius-xs);
    padding: 16rpx 20rpx; font-size: 28rpx; color: var(--color-text-primary);
    width: 100%; box-sizing: border-box; line-height: 1.5;
  }
  .form-picker {
    height: 72rpx; background: var(--color-bg-page); border-radius: var(--radius-xs);
    padding: 0 20rpx; font-size: 28rpx; color: var(--color-text-primary);
    display: flex; align-items: center; justify-content: space-between;
  }
}
.form-row {
  display: flex; gap: 20rpx;
  .half { flex: 1; }
}
.form-actions {
  display: flex; gap: 20rpx; margin-top: 32rpx;
  .van-button { flex: 1; }
}
</style>
