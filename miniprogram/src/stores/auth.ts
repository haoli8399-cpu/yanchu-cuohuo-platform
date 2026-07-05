// ============================================================================
// 演事 uni-app — Auth Store
// ============================================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserInfo } from '@/types';
import { wechatLogin } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);
  const isLoggedIn = computed(() => !!token.value);

  // 角色判断
  const isAgent = computed(() => userInfo.value?.role === 'agent');
  const isPerformer = computed(() => userInfo.value?.role === 'performer');
  const isAdmin = computed(() => userInfo.value?.role === 'admin');

  // 初始化：检查本地存储
  function checkLoginStatus() {
    try {
      const savedToken = uni.getStorageSync('token');
      const savedUser = uni.getStorageSync('userInfo');
      if (savedToken && savedUser) {
        token.value = savedToken;
        userInfo.value = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('读取登录状态失败:', e);
    }
  }

  // 微信登录
  async function login() {
    try {
      // 获取微信登录 code
      const loginRes = await new Promise<UniNamespace.LoginRes>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: reject
        });
      });

      if (!loginRes.code) {
        uni.showToast({ title: '获取微信授权失败', icon: 'none' });
        return false;
      }

      // 调用后端登录 API
      const result = await wechatLogin(loginRes.code);
      if (result.ok && result.data) {
        token.value = result.data.access_token;
        userInfo.value = result.data.user;

        // 持久化存储
        uni.setStorageSync('token', result.data.access_token);
        uni.setStorageSync('userInfo', JSON.stringify(result.data.user));

        uni.showToast({ title: '登录成功', icon: 'success' });
        return true;
      }

      uni.showToast({ title: result.error || '登录失败', icon: 'none' });
      return false;
    } catch (e: any) {
      uni.showToast({ title: e.message || '登录异常', icon: 'none' });
      return false;
    }
  }

  // 退出登录
  function logout() {
    token.value = '';
    userInfo.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  }

  return {
    token, userInfo, isLoggedIn, isAgent, isPerformer, isAdmin,
    checkLoginStatus, login, logout
  };
});
