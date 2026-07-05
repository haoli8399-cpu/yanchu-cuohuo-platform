<template>
  <view class="agreement-page">
    <view class="section">
      <view class="section-title">用户协议</view>
      <view class="section-content">
        <text class="para">欢迎使用喜剧工厂（以下简称"本平台"）。在注册和使用本平台服务前，请仔细阅读以下协议条款。</text>
        <text class="para-title">一、服务说明</text>
        <text class="para">本平台为活动公司（甲方）与演出艺人（乙方）提供信息撮合服务，包括但不限于：SKU方案浏览、需求发布、AI方案生成、排期管理、结算记录等。</text>
        <text class="para-title">二、用户责任</text>
        <text class="para">用户应保证提供的注册信息真实准确。活动公司应如实描述活动需求及预算。艺人应确认具备履约能力并按时到场演出。</text>
        <text class="para-title">三、平台责任</text>
        <text class="para">本平台负责审核入驻艺人资质、确保证照真实，但不承诺艺人的实际演出效果。平台不对因不可抗力导致的演出取消承担责任。</text>
        <text class="para-title">四、费用与结算</text>
        <text class="para">活动公司按约定价格支付费用，艺人按结算周期收取报酬。平台收取约定的撮合服务费，具体费率以签约时为准。</text>
        <text class="para-title">五、隐私保护</text>
        <text class="para">本平台严格保护用户隐私，未经用户许可不会将联系方式透露给第三方，法律法规另有规定的除外。</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">隐私政策</view>
      <view class="section-content">
        <text class="para-title">1. 信息收集</text>
        <text class="para">我们收集的信息包括：注册手机号、企业信息（活动公司）、艺人资料及表演经历、位置信息（仅用于签到打卡）。</text>
        <text class="para-title">2. 信息使用</text>
        <text class="para">收集的信息仅用于：账号管理、演出撮合匹配、现场签到确认、结算核对。不会用于其他商业目的。</text>
        <text class="para-title">3. 信息存储</text>
        <text class="para">用户数据存储于境内服务器，采用加密传输和存储。账号注销后，相关数据将在30天内清除。</text>
        <text class="para-title">4. 联系方式</text>
        <text class="para">如对隐私政策有任何疑问，可通过「意见反馈」页面联系我们的运营团队。</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.agreement-page {
  min-height: 100vh; background: var(--color-bg-page); padding: 24rpx;
}

.section {
  background: var(--color-bg-card); border-radius: var(--radius-md); padding: 28rpx; margin-bottom: 24rpx;

  .section-title { font-size: 32rpx; font-weight: 700; color: var(--color-text-primary); margin-bottom: 20rpx; }

  .section-content {
    .para { font-size: 26rpx; color: var(--color-text-secondary); line-height: 1.8; display: block; margin-bottom: 16rpx; }
    .para-title { font-size: 28rpx; font-weight: 600; color: var(--color-text-primary); display: block; margin-top: 20rpx; margin-bottom: 8rpx; }
  }
}
</style>
