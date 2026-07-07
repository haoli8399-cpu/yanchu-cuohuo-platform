<template>
  <view class="request-submit-page page-with-cta">
    <CfNavBar title="提交需求" :showBack="true" backText="返回">
      <template #right>
        <text class="nav-right-link" @tap="goDrafts">草稿箱</text>
      </template>
    </CfNavBar>

    <view class="request-submit-page__body">
      <!-- 演出信息 -->
      <view class="card">
        <text class="card-title">演出信息</text>
        <view class="form-cell" @tap="showPicker('showType')">
          <text class="form-label">演出类型</text>
          <view class="form-cell__right"><text :class="form.showType ? '' : 'form-placeholder'">{{ form.showType || '请选择' }}</text><text class="form-arrow">></text></view>
        </view>
        <view class="form-cell" @tap="showPicker('businessType')">
          <text class="form-label">业务类型</text>
          <view class="form-cell__right"><text :class="form.businessType ? '' : 'form-placeholder'">{{ form.businessType || '请选择' }}</text><text class="form-arrow">></text></view>
        </view>
        <view class="form-cell"><text class="form-label">演出主题</text><input v-model="form.title" placeholder="如：年会脱口秀晚会" placeholder-class="form-placeholder" /></view>
        <view class="form-cell" @tap="showDatePicker"><text class="form-label">期望演出日期</text><view class="form-cell__right"><text :class="form.date ? '' : 'form-placeholder'">{{ form.date || '请选择日期' }}</text><text class="form-arrow">></text></view></view>
        <view class="form-cell"><text class="form-label">演出地点</text><input v-model="form.location" placeholder="请输入详细地址" placeholder-class="form-placeholder" /></view>
      </view>

      <!-- 需求详情 -->
      <view class="card">
        <text class="card-title">需求详情</text>
        <view class="form-cell" @tap="showPicker('duration')"><text class="form-label">演出时长</text><view class="form-cell__right"><text :class="form.duration ? '' : 'form-placeholder'">{{ form.duration || '请选择' }}</text><text class="form-arrow">></text></view></view>
        <view class="form-cell" @tap="showPicker('budget')"><text class="form-label">预算范围</text><view class="form-cell__right"><text>¥5,000 - ¥10,000</text><text class="form-arrow">></text></view></view>
        <view class="form-cell"><text class="form-label">参与人数</text><input type="number" v-model="form.audienceCount" placeholder="预计参与人数" placeholder-class="form-placeholder" /></view>
        <view class="form-textarea"><text class="form-label">特殊要求</text><textarea v-model="form.remarks" placeholder="如有特殊表演要求请在此说明..." placeholder-class="form-placeholder" :maxlength="500" /></view>
      </view>

      <!-- 联系信息 -->
      <view class="card">
        <text class="card-title">联系信息</text>
        <view class="form-cell"><text class="form-label">联系人</text><input v-model="form.contactName" placeholder="请输入联系人姓名" placeholder-class="form-placeholder" /></view>
        <view class="form-cell"><text class="form-label">联系电话</text><input type="number" v-model="form.contactPhone" placeholder="请输入联系电话" placeholder-class="form-placeholder" /></view>
      </view>
    </view>

    <!-- Fixed CTA -->
    <view class="fixed-bottom">
      <button class="btn btn-default" @tap="saveDraft">保存草稿</button>
      <button class="btn btn-primary" style="flex: 1;" @tap="submitRequest">提交需求</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const form = reactive({
  showType: '',
  businessType: '',
  title: '',
  date: '',
  location: '',
  duration: '',
  audienceCount: '',
  remarks: '',
  contactName: '',
  contactPhone: '',
})

function showPicker(field: string) { uni.showToast({ title: `${field} 选择器`, icon: 'none' }) }
function showDatePicker() { uni.showToast({ title: '日期选择器', icon: 'none' }) }
function goDrafts() { uni.showToast({ title: '草稿箱', icon: 'none' }) }
function saveDraft() { uni.showToast({ title: '已保存草稿', icon: 'success' }) }
function submitRequest() { uni.showToast({ title: '已提交需求', icon: 'success' }); setTimeout(() => uni.navigateBack(), 1500) }
</script>

<style lang="scss" scoped>
.request-submit-page__body { padding-bottom: 16rpx; }

.card-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; margin-bottom: $space-md; display: block; }
.nav-right-link { font-size: $text-md; color: $color-primary; }

.form-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  border-bottom: 1rpx solid $color-divider;

  input { flex: 1; text-align: right; font-size: $text-md; color: $color-text-primary; }

  &__right { display: flex; align-items: center; gap: $space-xs; color: $color-text-primary; font-size: $text-md; }
}

.form-label { font-size: $text-base; color: $color-text-secondary; margin-right: $space-md; flex-shrink: 0; }
.form-placeholder { color: $color-text-placeholder; }
.form-arrow { color: $color-text-tertiary; font-size: $text-sm; margin-left: 4rpx; }

.form-textarea {
  padding: $space-md 0;
  textarea { width: 100%; height: 160rpx; font-size: $text-md; color: $color-text-primary; margin-top: $space-sm; }
}
</style>
