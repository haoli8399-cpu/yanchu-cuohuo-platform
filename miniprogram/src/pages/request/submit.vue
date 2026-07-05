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

      <!-- SKU 自定义配置区（从 SKU 详情页跳转时显示） -->
      <view class="sku-config-section" v-if="skuInfo">
        <!-- SKU 标题行 -->
        <view class="config-header">
          <text class="config-sku-name">{{ skuInfo.title }}</text>
          <text class="config-default-hint" @click="resetConfig">恢复默认</text>
        </view>

        <!-- 默认 vs 自定义切换 -->
        <view class="config-status">
          <text v-if="!customizing" class="status-text">使用默认配置</text>
          <text v-else class="status-text-custom">已自定义</text>
          <button class="toggle-btn" @click="customizing = !customizing">
            {{ customizing ? '收起自定义 ▼' : '我要自定义 ▶' }}
          </button>
        </view>

        <!-- 默认配置展示（不自定义时显示） -->
        <view class="default-config" v-if="!customizing">
          <view class="config-row"><text class="cl">演员级别</text><text class="cv">{{ defaultTierLabel }}</text></view>
          <view class="config-row"><text class="cl">演出时长</text><text class="cv">{{ defaultDuration }}分钟</text></view>
          <view class="config-row"><text class="cl">建议人数</text><text class="cv">{{ performerCount }}人</text></view>
        </view>

        <!-- 自定义配置区（展开时显示） -->
        <view class="custom-config" v-if="customizing">
          <!-- 演员级别选择 -->
          <view class="config-group">
            <text class="group-title">① 选择演员级别</text>
            <view class="tier-options">
              <view v-for="tier in tierInfo" :key="tier.tier"
                class="tier-item" :class="{ active: selectedTier === tier.tier }"
                @click="selectTier(tier.tier)">
                <text class="tier-name">{{ tier.tier }} · {{ tier.label }}</text>
                <text class="tier-price">¥{{ formatPriceCents(tier.unitPrice) }}/15分钟</text>
              </view>
            </view>
            <!-- 选中级别说明 -->
            <view class="tier-detail" v-if="selectedTierObj">
              <text class="td-text">{{ selectedTierObj.description }}</text>
              <text class="td-scene">{{ selectedTierObj.suitableFor }}</text>
            </view>
          </view>

          <!-- 演出时长选择 -->
          <view class="config-group">
            <text class="group-title">② 选择演出时长</text>
            <view class="duration-options">
              <view v-for="d in durationOptions" :key="d"
                class="duration-item" :class="{ active: selectedDuration === d }"
                @click="selectDuration(d)">
                <text>{{ d }}分钟</text>
              </view>
            </view>
          </view>

          <!-- 实时报价 -->
          <view class="price-preview">
            <text class="pp-label">实时报价</text>
            <text class="pp-price">¥{{ formatPriceCents(calculatedPrice) }}</text>
            <text class="pp-note" v-if="isDifferent">相比默认：{{ priceDiffText }}</text>
            <text class="pp-note" v-else>活动公司渠道价：¥{{ formatPriceCents(calculatedCompanyPrice) }}</text>
          </view>
        </view>

        <!-- 不自定义时也显示价格 -->
        <view class="price-preview" v-if="!customizing">
          <text class="pp-label">默认价格</text>
          <text class="pp-price">¥{{ formatPriceCents(defaultTotalPrice) }}</text>
          <text class="pp-note">活动公司渠道价：¥{{ formatPriceCents(defaultCompanyPrice) }}</text>
        </view>
      </view>

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
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getDemandList, getSKUDetail, calculatePrice } from '@/services/api';
import { submitDemand } from '@/services/api';
import { formatPrice } from '@/utils/format';
import type { TierInfo } from '@/types';

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

// ── SKU 自定义配置 ──
const skuId = ref('');
const skuInfo = ref<any>(null);
const customizing = ref(false);

// 可配置项
const tierInfo = ref<TierInfo[]>([]);
const durationOptions = ref<number[]>([30, 45, 60, 75, 90]);
const selectedTier = ref('');
const selectedDuration = ref(60);
const performerCount = ref(2);

// 默认值
const defaultTier = ref('T3');
const defaultDuration = ref(60);

// 价格
const defaultTotalPrice = ref(0);
const defaultCompanyPrice = ref(0);
const calculatedPrice = ref(0);
const calculatedCompanyPrice = ref(0);

// 计算属性
const defaultTierLabel = computed(() => {
  const t = tierInfo.value.find(x => x.tier === defaultTier.value);
  return t ? `${t.tier} · ${t.label}` : defaultTier.value;
});

const selectedTierObj = computed(() => {
  return tierInfo.value.find(x => x.tier === selectedTier.value);
});

const isDifferent = computed(() => {
  return selectedTier.value !== defaultTier.value || selectedDuration.value !== defaultDuration.value;
});

const priceDiffText = computed(() => {
  const diff = calculatedPrice.value - defaultTotalPrice.value;
  if (diff > 0) return `+¥${formatPriceCents(diff)}`;
  if (diff < 0) return `-¥${formatPriceCents(Math.abs(diff))}`;
  return '与默认一致';
});

// 格式化分为元（适配 unitPrice 以分为单位）
function formatPriceCents(cents: number): string {
  return formatPrice(cents / 100);
}

function selectTier(tier: string) {
  selectedTier.value = tier;
  recalculate();
}

function selectDuration(d: number) {
  selectedDuration.value = d;
  recalculate();
}

async function recalculate() {
  if (!skuId.value || !selectedTier.value) return;
  try {
    const res = await calculatePrice({
      skuId: skuId.value,
      tier: selectedTier.value,
      durationMinutes: selectedDuration.value,
      performerCount: performerCount.value
    });
    if (res.ok && res.data) {
      calculatedPrice.value = res.data.totalPrice;
      calculatedCompanyPrice.value = res.data.companyPrice;
    }
  } catch (e) { /* 静默失败 */ }
}

async function calcDefaultPrice(skuId: string, tier: string, duration: number, count: number) {
  try {
    const res = await calculatePrice({ skuId, tier, durationMinutes: duration, performerCount: count });
    if (res.ok && res.data) {
      defaultTotalPrice.value = res.data.totalPrice;
      defaultCompanyPrice.value = res.data.companyPrice;
      // 同步初始 calculated 值
      calculatedPrice.value = res.data.totalPrice;
      calculatedCompanyPrice.value = res.data.companyPrice;
    }
  } catch (e) { /* 静默失败 */ }
}

function resetConfig() {
  selectedTier.value = defaultTier.value;
  selectedDuration.value = defaultDuration.value;
  customizing.value = false;
  calculatedPrice.value = defaultTotalPrice.value;
  calculatedCompanyPrice.value = defaultCompanyPrice.value;
}

async function loadSkuDetail(id: string) {
  try {
    const res = await getSKUDetail(id);
    if (res.ok && res.data) {
      skuInfo.value = res.data;
      // 注入的扩展字段存在时使用
      const data = res.data as any;
      if (data.tierInfo) tierInfo.value = data.tierInfo;
      if (data.defaultTier) defaultTier.value = data.defaultTier;
      if (data.durationOptions) durationOptions.value = data.durationOptions;
      if (data.defaultDuration) defaultDuration.value = data.defaultDuration;
      if (data.minPerformers) performerCount.value = data.minPerformers;

      selectedTier.value = defaultTier.value;
      selectedDuration.value = defaultDuration.value;

      await calcDefaultPrice(id, defaultTier.value, defaultDuration.value, performerCount.value);
    }
  } catch (e) { /* 静默失败 */ }
}

onLoad((options: any) => {
  if (options?.skuId) {
    form.sku_id = options.skuId;
    skuId.value = options.skuId;
    loadSkuDetail(options.skuId);
  }
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

// ── SKU 自定义配置区 ──
.sku-config-section {
  margin: 24rpx 32rpx 0;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 32rpx;
  border-left: 6rpx solid var(--color-primary);
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  .config-sku-name {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .config-default-hint {
    font-size: 24rpx;
    color: var(--color-primary);
    padding: 4rpx 16rpx;
    border: 1rpx solid var(--color-primary);
    border-radius: 9999px;
  }
}

.config-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  .status-text {
    font-size: 24rpx;
    color: var(--color-text-tertiary);
  }
  .status-text-custom {
    font-size: 24rpx;
    color: var(--color-primary);
    font-weight: 500;
  }
  .toggle-btn {
    font-size: 24rpx;
    color: var(--color-primary);
    background: var(--color-primary-bg);
    border: none;
    padding: 8rpx 20rpx;
    border-radius: 9999px;
    line-height: 1.4;
  }
}

// 默认配置展示
.default-config {
  .config-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx dashed var(--color-divider);
    &:last-child { border-bottom: none; }
    .cl { font-size: 26rpx; color: var(--color-text-secondary); }
    .cv { font-size: 26rpx; color: var(--color-text-primary); font-weight: 500; }
  }
}

// 自定义配置区
.custom-config {
  .config-group {
    margin-bottom: 24rpx;
    &:last-child { margin-bottom: 0; }
  }
  .group-title {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 12rpx;
    display: block;
  }
}

// 演员级别选项
.tier-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tier-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-radius: var(--radius-md);
  background: var(--color-bg-page);
  border: 2rpx solid var(--color-border);
  transition: all 0.2s;
  &.active {
    border-color: var(--color-primary);
    background: rgba(167,139,250,.08);
    .tier-name, .tier-price { color: var(--color-primary); font-weight: 600; }
  }
  .tier-name {
    font-size: 26rpx;
    color: var(--color-text-primary);
  }
  .tier-price {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }
}

.tier-detail {
  margin-top: 12rpx;
  padding: 16rpx 20rpx;
  background: var(--color-primary-bg);
  border-radius: var(--radius-sm);
  .td-text {
    font-size: 24rpx;
    color: var(--color-primary);
    display: block;
  }
  .td-scene {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
    margin-top: 4rpx;
    display: block;
  }
}

// 时长选项
.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.duration-item {
  padding: 16rpx 32rpx;
  border-radius: 9999px;
  background: var(--color-bg-page);
  border: 2rpx solid var(--color-border);
  font-size: 26rpx;
  color: var(--color-text-primary);
  text-align: center;
  transition: all 0.2s;
  min-height: 44px; // 触控 ≥44px
  display: flex;
  align-items: center;
  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: #fff;
    font-weight: 600;
  }
}

// 价格预览
.price-preview {
  margin-top: 24rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #fef9f0, #fdf5e6);
  border-radius: var(--radius-md);
  text-align: center;
  .pp-label {
    font-size: 24rpx;
    color: var(--color-text-tertiary);
    display: block;
    margin-bottom: 4rpx;
  }
  .pp-price {
    font-size: 48rpx;
    font-weight: 700;
    color: #e67e22;
    display: block;
  }
  .pp-note {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 8rpx;
    display: block;
  }
}
</style>
