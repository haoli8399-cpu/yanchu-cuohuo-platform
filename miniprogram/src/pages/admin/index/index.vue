<template>
  <view class="admin-container">
    <view class="admin-header">
      <text class="admin-title">运营后台</text>
    </view>
    <view class="admin-menu">
      <navigator url="/pages/admin/categories/index" class="menu-item">
        <text>分类管理</text>
      </navigator>
      <navigator url="/pages/admin/sku/index" class="menu-item">
        <text>SKU管理</text>
      </navigator>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.admin-container {
  padding: var(--space-base);
}
.admin-header {
  padding: var(--space-xl) 0;
}
.admin-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}
.admin-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.menu-item {
  padding: var(--space-base);
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
}
</style>
