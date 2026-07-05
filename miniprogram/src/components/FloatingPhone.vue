<template>
  <view class="floating-phone" @click="callPhone">
    <text class="phone-icon">📞</text>
  </view>
</template>

<script setup lang="ts">
const PHONE_NUMBER = "400-xxx-xxxx";

function callPhone() {
  uni.makePhoneCall({
    phoneNumber: PHONE_NUMBER,
    fail: () => {
      uni.showToast({ title: "拨号失败", icon: "none" });
    }
  });
}
</script>

<style lang="scss" scoped>
.floating-phone {
  position: fixed;
  bottom: 160rpx;
  right: 24rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  box-shadow: 0 4rpx 20rpx rgba(124, 58, 237, 0.4);
}
.phone-icon {
  font-size: 40rpx;
}
</style>
