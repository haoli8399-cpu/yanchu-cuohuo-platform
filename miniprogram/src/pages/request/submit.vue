<template>
  <view class="demand-submit-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <van-icon name="arrow-left" size="36rpx" />
        <text>返回</text>
      </view>
      <text class="nav-title">提交需求</text>
      <view class="nav-right">
        <text class="nav-draft" @click="saveDraft">草稿箱</text>
      </view>
    </view>

    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-scroll" :scroll-into-view="scrollInto">

      <!-- 已有待处理需求提示 -->
      <view v-if="pendingDemands.length > 0" class="pending-alert">
        <text class="pending-text">您有 {{ pendingDemands.length }} 个待处理需求</text>
        <text class="pending-action" @click="goPendingList">查看 ></text>
      </view>

      <!-- Card 1: 演出信息 -->
      <view class="form-card" id="card-event">
        <text class="card-title">演出信息</text>

        <!-- 演出类型 -->
        <view class="form-field">
          <label class="form-label">演出类型</label>
          <view class="form-select" @click="showTypePicker = true">
            <text :class="['select-value', { selected: form.event_type }]">{{ form.event_type || '请选择' }}</text>
            <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
          </view>
        </view>

        <!-- 业务类型 -->
        <view class="form-field">
          <label class="form-label">业务类型</label>
          <view class="form-select" @click="showBizPicker = true">
            <text :class="['select-value', { selected: form.biz_type }]">{{ form.biz_type || '请选择' }}</text>
            <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
          </view>
        </view>

        <!-- 演出主题 -->
        <view class="form-field">
          <label class="form-label">演出主题</label>
          <input class="form-input" v-model="form.title" placeholder="如：年会脱口秀晚会" placeholder-style="color: #c4c4cc" />
        </view>

        <!-- 期望演出日期 -->
        <view class="form-field">
          <label class="form-label">期望演出日期</label>
          <view class="form-select" @click="showDatePicker = true">
            <text :class="['select-value', { selected: form.event_date }]">{{ form.event_date || '请选择日期' }}</text>
            <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
          </view>
        </view>

        <!-- 演出地点 -->
        <view class="form-field" style="border-bottom: none; padding-bottom: 0;">
          <label class="form-label">演出地点</label>
          <input class="form-input" v-model="form.location" placeholder="请输入详细地址" placeholder-style="color: #c4c4cc" />
        </view>
      </view>

      <!-- Card 2: 需求详情 -->
      <view class="form-card" id="card-detail">
        <text class="card-title">需求详情</text>

        <!-- 演出时长 -->
        <view class="form-field">
          <label class="form-label">演出时长</label>
          <view class="form-select" @click="showDurationPicker = true">
            <text :class="['select-value', { selected: form.duration }]">{{ form.duration ? form.duration + '分钟' : '请选择' }}</text>
            <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
          </view>
        </view>

        <!-- 预算范围 -->
        <view class="form-field">
          <label class="form-label">预算范围</label>
          <view class="form-select" @click="showBudgetPicker = true">
            <text :class="['select-value', { selected: form.budget_label }]">{{ form.budget_label || '请选择' }}</text>
            <van-icon name="arrow" size="28rpx" color="#c4c4cc" />
          </view>
        </view>

        <!-- 参与人数 -->
        <view class="form-field">
          <label class="form-label">参与人数</label>
          <input class="form-input" v-model="form.audience_count" type="number" placeholder="预计参与人数" placeholder-style="color: #c4c4cc" />
        </view>

        <!-- 特殊要求 -->
        <view class="form-field" style="border-bottom: none; padding-bottom: 0;">
          <label class="form-label">特殊要求</label>
          <textarea class="form-textarea" v-model="form.special_requirements" placeholder="如有特殊表演要求请在此说明..." placeholder-style="color: #c4c4cc" maxlength="500" />
        </view>
      </view>

      <!-- Card 3: 联系信息 -->
      <view class="form-card" id="card-contact">
        <text class="card-title">联系信息</text>

        <view class="form-field">
          <label class="form-label">联系人</label>
          <input class="form-input" v-model="form.contact_name" placeholder="联系人姓名" placeholder-style="color: #c4c4cc" />
        </view>

        <view class="form-field">
          <label class="form-label">联系电话</label>
          <input class="form-input" v-model="form.contact_phone" type="tel" placeholder="联系电话" placeholder-style="color: #c4c4cc" maxlength="11" />
        </view>

        <view class="form-field" style="border-bottom: none; padding-bottom: 0;">
          <label class="form-label">补充说明</label>
          <textarea class="form-textarea" v-model="form.notes" placeholder="其他需要补充的信息..." placeholder-style="color: #c4c4cc" />
        </view>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="bottom-bar">
      <button class="btn-draft" @click="saveDraft">保存草稿</button>
      <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
        <text v-if="!submitting">提交需求</text>
        <van-loading v-else size="28rpx" color="#fff" />
      </button>
    </view>

    <!-- Picker 弹窗 -->
    <van-popup :show="showTypePicker" position="bottom" round @close="showTypePicker = false">
      <view class="picker-wrap">
        <view class="picker-header">
          <text class="picker-cancel" @click="showTypePicker = false">取消</text>
          <text class="picker-title">选择演出类型</text>
          <text class="picker-confirm" @click="showTypePicker = false">确定</text>
        </view>
        <view class="picker-options">
          <view v-for="t in eventTypes" :key="t" class="picker-option" :class="{ active: form.event_type === t }" @click="form.event_type = t">{{ t }}</view>
        </view>
      </view>
    </van-popup>

    <van-popup :show="showBizPicker" position="bottom" round @close="showBizPicker = false">
      <view class="picker-wrap">
        <view class="picker-header">
          <text class="picker-cancel" @click="showBizPicker = false">取消</text>
          <text class="picker-title">选择业务类型</text>
          <text class="picker-confirm" @click="showBizPicker = false">确定</text>
        </view>
        <view class="picker-options">
          <view v-for="t in bizTypes" :key="t" class="picker-option" :class="{ active: form.biz_type === t }" @click="form.biz_type = t">{{ t }}</view>
        </view>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getDemandList } from '@/services/api';
import { submitDemand } from '@/services/api';

const scrollInto = ref('');
const submitting = ref(false);

// 表单数据
const form = reactive({
  sku_id: '',
  event_type: '',
  biz_type: '',
  title: '',
  event_date: '',
  location: '',
  duration: '',
  budget_label: '',
  audience_count: '',
  special_requirements: '',
  contact_name: '',
  contact_phone: '',
  notes: '',
});

// Pickers
const showTypePicker = ref(false);
const showBizPicker = ref(false);
const showDatePicker = ref(false);
const showDurationPicker = ref(false);
const showBudgetPicker = ref(false);

const eventTypes = ['脱口秀', '即兴喜剧', '漫才', '新喜剧', '魔术喜剧', '亲子喜剧'];
const bizTypes = ['商演包场', '企业培训', '品牌活动', '婚礼演出', '其他'];

const pendingDemands = ref<any[]>([]);

onLoad((options: any) => {
  if (options?.skuId) form.sku_id = options.skuId;
  // 如果有编辑中的需求
  if (options?.editId) {
    // TODO: 加载现有需求数据
  }
  loadPendingDemands();
});

async function loadPendingDemands() {
  try {
    const res = await getDemandList({ page: 1, pageSize: 10 });
    if (res.ok) {
      pendingDemands.value = (res.data || []).filter((d: any) =>
        ['pending', 'quoted'].includes(d.status)
      );
    }
  } catch (e) {}
}

function goBack() { uni.navigateBack(); }

function saveDraft() {
  uni.showToast({ title: '草稿已保存', icon: 'none' });
}

async function handleSubmit() {
  // 基本校验
  if (!form.title) {
    uni.showToast({ title: '请填写演出主题', icon: 'none' });
    return;
  }
  if (!form.contact_name || !form.contact_phone) {
    uni.showToast({ title: '请填写联系信息', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    const res = await submitDemand({
      sku_id: form.sku_id || undefined,
      event_type: form.event_type,
      title: form.title,
      event_date: form.event_date,
      location: form.location,
      duration: form.duration ? Number(form.duration) : undefined,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      special_requirements: form.special_requirements,
      notes: form.notes,
    });
    if (res.ok) {
      uni.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' });
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

function goPendingList() {
  uni.switchTab({ url: '/pages/request/list' });
}

onMounted(() => {});
</script>

<style lang="scss" scoped>
.demand-submit-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: var(--color-bg-card);
  position: relative;
  border-bottom: 1rpx solid var(--color-divider);
  .nav-left {
    position: absolute;
    left: 24rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 28rpx;
    color: var(--color-text-primary);
  }
  .nav-title { font-size: 34rpx; font-weight: 600; color: var(--color-text-primary); }
  .nav-right {
    position: absolute;
    right: 24rpx;
    .nav-draft { font-size: 28rpx; color: var(--color-primary); }
  }
}

// 待处理提示
.pending-alert {
  margin: 24rpx 32rpx 0;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .pending-text { font-size: 26rpx; color: var(--color-primary); }
  .pending-action { font-size: 26rpx; color: var(--color-primary); font-weight: 500; }
}

.form-scroll {
  flex: 1;
}

.form-card {
  margin: 24rpx 32rpx 0;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 32rpx;

  .card-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
    margin-bottom: 8rpx;
  }
}

.form-field {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; padding-bottom: 0; }
  &:first-child { padding-top: 0; }
}

.form-label {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  margin-bottom: 12rpx;
  display: block;
}

.form-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  .select-value {
    font-size: 30rpx;
    color: #c4c4cc;
    &.selected { color: var(--color-text-primary); }
  }
}

.form-input {
  height: 96rpx;
  width: 100%;
  font-size: 30rpx;
  color: var(--color-text-primary);
  border: none;
  outline: none;
  background: transparent;
}

.form-textarea {
  width: 100%;
  font-size: 30rpx;
  color: var(--color-text-primary);
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  line-height: 1.5;
}

// 底部固定栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.06);

  .btn-draft {
    flex-shrink: 0;
    padding: 0 40rpx;
    height: 80rpx;
    border-radius: 9999px;
    border: 2rpx solid var(--color-border);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 28rpx;
    line-height: 80rpx;
    text-align: center;
  }

  .btn-submit {
    flex: 1;
    height: 80rpx;
    border-radius: 9999px;
    border: none;
    background: var(--color-primary);
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
    line-height: 80rpx;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
  }
}

// Picker 弹窗
.picker-wrap {
  padding: 24rpx 32rpx 48rpx;
  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .picker-cancel, .picker-confirm { font-size: 28rpx; color: var(--color-primary); }
    .picker-cancel { color: var(--color-text-tertiary); }
    .picker-title { font-size: 32rpx; font-weight: 600; color: var(--color-text-primary); }
  }
  .picker-options { display: flex; flex-direction: column; gap: 16rpx; }
  .picker-option {
    padding: 24rpx;
    border-radius: var(--radius-md);
    font-size: 28rpx;
    color: var(--color-text-primary);
    background: var(--color-bg-page);
    border: 2rpx solid var(--color-border);
    text-align: center;
    &.active { border-color: var(--color-primary); background: rgba(167,139,250,.08); color: var(--color-primary); font-weight: 600; }
  }
}
</style>
