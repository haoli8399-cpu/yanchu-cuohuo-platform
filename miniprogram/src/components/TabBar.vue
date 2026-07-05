<template>
  <!-- 活动公司：使用原生tabBar（不渲染自定义组件） -->
  <!-- 演员：使用自定义TabBar + uni.reLaunch -->
  <view v-if="showCustomBar" class="tab-bar">
    <view
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: currentPath === tab.path }"
      @click="switchTab(tab.path)"
    >
      <van-icon :name="currentPath === tab.path ? tab.activeIcon : tab.icon" size="40rpx" class="tab-icon" />
      <text class="tab-label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const props = defineProps<{ current: string }>();

// 角色判断
const isPerformer = computed(() => authStore.isPerformer);
const isAgent = computed(() => authStore.isAgent || authStore.isAdmin);

// 演员需要自定义TabBar，活动公司用原生tabBar
const showCustomBar = computed(() => isPerformer.value);

// 演员Tab（3个）
const performerTabs = [
  { path: '/pages/assignment/list', label: '日程', icon: 'calendar-o', activeIcon: 'calendar' },
  { path: '/pages/settlement/index', label: '收入', icon: 'balance-o', activeIcon: 'balance' },
  { path: '/pages/user/index', label: '我的', icon: 'user-o', activeIcon: 'user' },
];

const tabs = computed(() => performerTabs);

const currentPath = computed(() => props.current);

// 演员端：隐藏原生tabBar（原生只注册了活动公司的4个Tab，演员用不上）
function hideNativeTabBar() {
  try { uni.hideTabBar(); } catch {}
}

onMounted(() => {
  if (isPerformer.value) hideNativeTabBar();
});

// 角色变化时（如登录后切换）也隐藏
watch(isPerformer, (val) => {
  if (val) hideNativeTabBar();
});

function switchTab(path: string) {
  if (path === currentPath.value) return;
  // 演员页面不在原生tabBar中，只能用reLaunch
  uni.reLaunch({ url: path });
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 100rpx; padding-bottom: env(safe-area-inset-bottom);
  background: #ffffff;
  border-top: 1rpx solid var(--color-border);
  display: flex; align-items: center; z-index: 100;
}
.tab-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4rpx;
}
.tab-icon { display: flex; justify-content: center; }
.tab-label { font-size: 20rpx; color: var(--color-text-tertiary); line-height: 1; font-weight: 500; }
.tab-item.active .tab-label { color: var(--color-primary); font-weight: 700; }
</style>
