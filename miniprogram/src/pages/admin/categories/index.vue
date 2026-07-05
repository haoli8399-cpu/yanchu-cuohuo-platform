<template>
  <view class="admin-categories-page">
    <!-- 新增分类栏 -->
    <view class="add-bar">
      <input
        class="add-input"
        v-model="newName"
        placeholder="输入分类名称"
        maxlength="20"
        @confirm="handleAdd"
      />
      <van-button type="primary" size="small" round :disabled="!newName.trim()" @click="handleAdd">
        新增
      </van-button>
    </view>

    <!-- 分类列表 -->
    <view class="category-list">
      <view v-for="cat in categories" :key="cat.id" class="category-row">
        <view class="drag-handle">
          <van-icon name="bars" size="28rpx" color="#c4c4cc" />
        </view>

        <!-- 查看模式 -->
        <template v-if="editingId !== cat.id">
          <text class="cat-name">{{ cat.label }}</text>
          <van-tag plain size="small" type="primary">sort:{{ cat.sort_order }}</van-tag>
          <view class="row-actions">
            <van-icon name="edit" size="32rpx" color="#7c3aed" @click="startEdit(cat)" />
            <van-icon name="delete" size="32rpx" color="#ef4444" @click="handleDelete(cat)" />
          </view>
        </template>

        <!-- 编辑模式 -->
        <template v-else>
          <input
            class="edit-input"
            v-model="editName"
            placeholder="分类名称"
            maxlength="20"
            @confirm="handleUpdate(cat.id)"
          />
          <view class="row-actions">
            <van-button type="primary" size="mini" @click="handleUpdate(cat.id)">保存</van-button>
            <van-button plain size="mini" @click="cancelEdit">取消</van-button>
          </view>
        </template>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="categories.length === 0 && !loading" class="empty-state">
      <van-icon name="info-o" size="64rpx" color="#c4c4cc" />
      <text class="empty-text">暂无分类，请在顶部添加</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import type { Category } from '@/types';

const categories = ref<Category[]>([]);
const loading = ref(true);
const newName = ref('');
const editingId = ref('');
const editName = ref('');

async function loadCategories() {
  loading.value = true;
  try {
    const res = await getCategories();
    if (res.ok && res.data) {
      categories.value = res.data.sort((a, b) => a.sort_order - b.sort_order);
    }
  } catch {
    uni.showToast({ title: '加载分类失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function handleAdd() {
  const name = newName.value.trim();
  if (!name) return;
  if (categories.value.some(c => c.label === name)) {
    uni.showToast({ title: '分类已存在', icon: 'none' });
    return;
  }
  try {
    const res = await createCategory(name);
    if (res.ok) {
      uni.showToast({ title: '新增成功', icon: 'success' });
      newName.value = '';
      await loadCategories();
    } else {
      uni.showToast({ title: res.error || '新增失败', icon: 'none' });
    }
  } catch {
    uni.showToast({ title: '新增异常', icon: 'none' });
  }
}

function startEdit(cat: Category) {
  editingId.value = cat.id;
  editName.value = cat.label;
}

function cancelEdit() {
  editingId.value = '';
  editName.value = '';
}

async function handleUpdate(id: string) {
  const name = editName.value.trim();
  if (!name) {
    uni.showToast({ title: '名称不能为空', icon: 'none' });
    return;
  }
  if (categories.value.some(c => c.label === name && c.id !== id)) {
    uni.showToast({ title: '分类名称已存在', icon: 'none' });
    return;
  }
  try {
    const res = await updateCategory(id, name);
    if (res.ok) {
      uni.showToast({ title: '更新成功', icon: 'success' });
      cancelEdit();
      await loadCategories();
    } else {
      uni.showToast({ title: res.error || '更新失败', icon: 'none' });
    }
  } catch {
    uni.showToast({ title: '更新异常', icon: 'none' });
  }
}

function handleDelete(cat: Category) {
  uni.showModal({
    title: '删除分类',
    content: `确认删除「${cat.label}」？关联该分类的方案将不受影响，但前端将不再显示。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await deleteCategory(cat.id);
          if (result.ok) {
            uni.showToast({ title: '已删除', icon: 'success' });
            await loadCategories();
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

onMounted(() => {
  loadCategories();
});
</script>

<style lang="scss" scoped>
.admin-categories-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  padding: 24rpx;
}
.add-bar {
  display: flex; gap: 16rpx; align-items: center;
  background: var(--color-bg-card); border-radius: var(--radius-sm);
  padding: 20rpx; margin-bottom: 24rpx;
  .add-input {
    flex: 1; height: 72rpx; background: var(--color-bg-page);
    border-radius: var(--radius-xs); padding: 0 20rpx;
    font-size: 28rpx; color: var(--color-text-primary);
  }
}
.category-list {
  background: var(--color-bg-card); border-radius: var(--radius-sm); overflow: hidden;
}
.category-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid var(--color-border);
  &:last-child { border-bottom: none; }
  &:active { background: #f9fafb; }

  .drag-handle { flex-shrink: 0; }
  .cat-name { flex: 1; font-size: 30rpx; color: var(--color-text-primary); font-weight: 500; }
  .edit-input {
    flex: 1; height: 64rpx; background: var(--color-bg-page);
    border-radius: var(--radius-xs); padding: 0 16rpx;
    font-size: 28rpx; color: var(--color-text-primary);
    border: 2rpx solid var(--color-primary);
  }
  .row-actions { display: flex; gap: 16rpx; align-items: center; flex-shrink: 0; }
}
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 120rpx 0; gap: 16rpx;
  .empty-text { font-size: 28rpx; color: var(--color-text-tertiary); }
}
</style>
