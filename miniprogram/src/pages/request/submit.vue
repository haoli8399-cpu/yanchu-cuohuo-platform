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

    <!-- 提交方式 Tab 切换 -->
    <view class="submit-tabs">
      <view
        class="submit-tab"
        :class="{ active: submitMode === 'sku' }"
        @click="submitMode = 'sku'"
      >
        <text>📋 选方案提交</text>
      </view>
      <view
        class="submit-tab"
        :class="{ active: submitMode === 'ai' }"
        @click="submitMode = 'ai'"
      >
        <text>💬 描述需求提交</text>
      </view>
    </view>

    <!-- 表单内容：选方案提交 -->
    <scroll-view
      v-if="submitMode === 'sku'"
      scroll-y
      class="form-scroll"
      :scroll-into-view="scrollInto"
    >

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

    <!-- AI 描述需求提交（Phase 2：多轮追问 + 信息提取 + 兜底表单） -->
    <view v-else class="ai-chat-page">
      <scroll-view scroll-y class="ai-chat-scroll" :scroll-into-view="aiScrollInto">
        <!-- 多轮对话消息 -->
        <view
          v-for="msg in aiMessages"
          :key="msg.id"
          :id="'msg-' + msg.id"
          class="ai-message"
          :class="msg.role"
        >
          <view v-if="msg.role === 'ai'" class="ai-avatar">🤖</view>
          <view class="ai-bubble">
            <text class="ai-bubble-text" v-if="msg.text">{{ msg.text }}</text>

            <!-- 追问进度 -->
            <view v-if="msg.kind === 'question' && msg.progress" class="ai-progress">
              <text>追问进度 {{ msg.progress }}</text>
            </view>

            <!-- 快捷回复 -->
            <view v-if="msg.quickReplies && msg.quickReplies.length" class="ai-quick-replies">
              <view
                v-for="(q, qi) in msg.quickReplies"
                :key="qi"
                class="ai-quick-reply"
                @click="onQuickReply(msg, q)"
              >{{ q.label }}</view>
            </view>

            <!-- 日期选择触发 -->
            <view v-if="msg.kind === 'question' && msg.dateTrigger" class="ai-date-trigger" @click="openDatePicker">
              📅 选择活动日期
            </view>

            <!-- 三档推荐方案 -->
            <view v-if="msg.kind === 'plans' && msg.plans" class="ai-plans-inline">
              <view
                v-for="plan in msg.plans"
                :key="plan.level"
                class="ai-plan-card"
                :class="plan.level"
                @click="selectAIPlan(plan)"
              >
                <view class="ai-plan-head">
                  <text class="ai-plan-badge">{{ plan.level_label }}</text>
                  <text class="ai-plan-title">{{ plan.sku_title }}</text>
                </view>
                <view class="ai-plan-meta">
                  <text class="ai-plan-meta-item">级别：{{ plan.tier_label }}</text>
                  <text class="ai-plan-meta-item">时长：{{ plan.duration }}分钟</text>
                </view>
                <view class="ai-plan-price">¥{{ formatPrice(plan.price / 100) }}</view>
                <text class="ai-plan-reason">{{ plan.reason }}</text>
                <view class="ai-plan-cta">点击调整并下单 ›</view>
              </view>
            </view>

            <!-- 信息提取预览 (Task B) -->
            <view v-if="msg.kind === 'extract' && msg.extract" class="ai-extract">
              <view v-for="row in msg.extract" :key="row.key" class="extract-row">
                <text class="extract-label">{{ row.label }}</text>
                <text class="extract-value" :class="{ missing: !row.ok }">
                  {{ row.ok ? row.value + ' ✅' : '未识别 ⚠️' }}
                </text>
                <text v-if="!row.ok && isRequired(row.key)" class="extract-fill" @click="onExtractFill(row)">[请补充]</text>
              </view>
              <view class="extract-actions">
                <button class="extract-confirm" @click="onExtractConfirm">确认</button>
                <button class="extract-more" @click="onExtractMore">补充信息</button>
              </view>
            </view>

            <!-- 兜底最小化表单 (Task C) -->
            <view v-if="msg.kind === 'fallback' && msg.fallbackFields" class="ai-fallback">
              <view v-for="f in msg.fallbackFields" :key="f.key" class="fallback-field">
                <text class="fallback-label">{{ f.label }}</text>
                <view class="fallback-options">
                  <view
                    v-for="(o, oi) in f.options"
                    :key="oi"
                    class="fallback-option"
                    :class="{ active: collected[f.key] === o.value }"
                    @click="onFallbackPick(f.key, o.value)"
                  >{{ o.label }}</view>
                </view>
              </view>
              <button class="fallback-submit" @click="onFallbackSubmit">生成推荐</button>
            </view>
          </view>
        </view>

        <!-- 生成中 -->
        <view v-if="aiLoading" class="ai-loading">
          <van-loading size="32rpx" color="#7c3aed" />
          <text class="ai-loading-text">AI 正在分析需求并生成方案...</text>
        </view>

        <!-- 降级提示 -->
        <view v-if="aiError" class="ai-error">
          <text class="ai-error-text">{{ aiError }}</text>
          <view class="ai-error-btn" @click="submitMode = 'sku'">切换到「选方案提交」 ›</view>
        </view>

        <view style="height: 160rpx;"></view>
      </scroll-view>

      <!-- 粘贴聊天记录模式 -->
      <view v-if="pasteMode" class="ai-paste-bar">
        <textarea class="ai-paste-area" v-model="pasteText" placeholder="粘贴微信聊天记录，AI 自动识别演出类型/人数/预算/日期..." placeholder-style="color:#c4c4cc" />
        <view class="ai-paste-actions">
          <button class="ai-paste-cancel" @click="cancelPaste">取消</button>
          <button class="ai-paste-confirm" @click="handlePaste">识别</button>
        </view>
      </view>

      <!-- 输入栏 -->
      <view v-else class="ai-chat-input-bar">
        <button class="ai-paste-toggle" @click="enterPasteMode">📋</button>
        <input
          class="ai-chat-input"
          v-model="aiPrompt"
          :focus="aiInputFocus"
          placeholder="输入你的演出需求..."
          placeholder-style="color: #c4c4cc;"
          @confirm="onAISend"
        />
        <button class="ai-chat-send" @click="onAISend">发送</button>
      </view>
    </view>

    <!-- 底部固定按钮：仅选方案模式显示 -->
    <view v-if="submitMode === 'sku'" class="bottom-bar">
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

    <!-- AI 日期追问选择器 -->
    <van-popup :show="showDatePicker" position="bottom" round @close="showDatePicker = false">
      <view class="picker-wrap">
        <view class="picker-header">
          <text class="picker-cancel" @click="showDatePicker = false">取消</text>
          <text class="picker-title">选择活动日期</text>
          <text class="picker-confirm" @click="confirmDatePicker">确定</text>
        </view>
        <picker mode="date" :value="tempDate" @change="onDatePick" class="date-picker-native">
          <view class="date-pick-trigger">{{ tempDate || '点击选择日期' }}</view>
        </picker>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getDemandList, getSKUDetail, calculatePrice, askAI } from '@/services/api';
import { submitDemand } from '@/services/api';
import { formatPrice } from '@/utils/format';
import type { TierInfo, AIPlanOption, AIRecommendResult } from '@/types';
import type { AIAskConversationItem, AIAskResponse } from '@/services/api';

const scrollInto = ref('');
const submitting = ref(false);
const submitMode = ref<'sku' | 'ai'>('sku');
// ── AI 对话消息类型 (Phase 2) ──
interface QuickReply { label: string; value: string }
interface ExtractRow { key: string; label: string; value: string; ok: boolean }
type CollectedKey = 'event_type' | 'biz_type' | 'audience_count' | 'budget_label' | 'event_date';
interface FallbackField { key: CollectedKey; label: string; options: QuickReply[] }
interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  kind?: 'text' | 'question' | 'plans' | 'extract' | 'fallback';
  progress?: string;
  quickReplies?: QuickReply[];
  dateTrigger?: boolean;
  fieldKey?: string;
  plans?: AIPlanOption[];
  extract?: ExtractRow[];
  fallbackFields?: FallbackField[];
}
interface FollowupQuestion {
  key: 'audience_count' | 'budget_label' | 'event_date';
  label: string;
  progress: string;
  options: QuickReply[];
  dateTrigger?: boolean;
}

// ── AI 多轮追问状态 (Phase 2) ──
const aiPrompt = ref('');
const aiInputFocus = ref(false);           // AI 模式聚焦输入框
const aiLoading = ref(false);              // AI 生成中
const aiError = ref('');                   // AI 降级提示
const aiMessages = ref<AIMessage[]>([]);   // 多轮对话消息列表
const aiPhase = ref<'chat' | 'extract' | 'fallback' | 'done'>('chat');
const askedCount = ref(0);                 // 已追问轮数（上限 3）
const aiScrollInto = ref('');              // 滚动锚点
const pasteMode = ref(false);              // 粘贴聊天记录模式
const pasteText = ref('');
const tempDate = ref('');

// 已收集的关键信息（展示用标签）
const collected = reactive({
  event_type: '',
  biz_type: '',
  audience_count: '',
  budget_label: '',
  event_date: '',
});

// 必填字段追问顺序：人数 → 预算 → 日期
const FOLLOWUP_QUESTIONS: FollowupQuestion[] = [
  {
    key: 'audience_count',
    label: '① 多少人参加？（用于匹配合适阵容）',
    progress: '①/③',
    options: [
      { label: '50-100人', value: '50-100人' },
      { label: '100-300人', value: '100-300人' },
      { label: '300-500人', value: '300-500人' },
      { label: '500人以上', value: '500人以上' },
    ],
  },
  {
    key: 'budget_label',
    label: '② 预算范围大概多少？',
    progress: '②/③',
    options: [
      { label: '5千以内', value: '5千以内' },
      { label: '5千-1万', value: '5千-1万' },
      { label: '1万-2万', value: '1万-2万' },
      { label: '2万以上', value: '2万以上' },
    ],
  },
  {
    key: 'event_date',
    label: '③ 活动日期是哪天？',
    progress: '③/③',
    options: [],
    dateTrigger: true,
  },
];

function uid() { return 'm' + Math.random().toString(36).slice(2, 9); }
function pad2(n: number | string) { return Number(n) < 10 ? '0' + Number(n) : '' + Number(n); }
function isRequired(key: string) {
  return ['audience_count', 'budget_label', 'event_date'].includes(key);
}
function allRequiredCollected() {
  return ['audience_count', 'budget_label', 'event_date'].every(k => (collected as any)[k]);
}
function nextMissingQuestion(): FollowupQuestion | null {
  for (const q of FOLLOWUP_QUESTIONS) {
    if (!(collected as any)[q.key]) return q;
  }
  return null;
}

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

async function loadSkuDetail(id: string, initTier?: string, initDuration?: number) {
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

      // AI 方案点击进来时，用其指定的级别/时长覆盖默认，并展开自定义区
      selectedTier.value = initTier || defaultTier.value;
      selectedDuration.value = initDuration || defaultDuration.value;
      if (initTier || initDuration) customizing.value = true;

      await calcDefaultPrice(id, selectedTier.value, selectedDuration.value, performerCount.value);
    }
  } catch (e) { /* 静默失败 */ }
}

onLoad((options: any) => {
  // URL 参数 mode=ai 时默认打开 AI 描述需求 Tab 并聚焦输入框
  if (options?.mode === 'ai') {
    submitMode.value = 'ai';
    aiInputFocus.value = true;
  }
  if (options?.prompt) {
    aiPrompt.value = decodeURIComponent(options.prompt);
  }
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

async function onAISend() {
  const text = aiPrompt.value.trim();
  if (!text) {
    uni.showToast({ title: '请输入你的需求', icon: 'none' });
    return;
  }
  aiPrompt.value = '';
  await processInput(text);
}

async function processInput(text: string) {
  pushUser(text);
  extractInto(text);
  aiError.value = '';
  await continueFlow();
}

// 多轮追问主流程：由后端 AI 判断继续追问或直接推荐
async function continueFlow() {
  await askQuestion();
}

async function askQuestion(_missing?: FollowupQuestion | string[] | null) {
  await requestAIAsk();
}

async function onQuickReply(msg: AIMessage, q: QuickReply) {
  const key = msg.fieldKey;
  if (!key) return;
  pushUser(q.label);
  (collected as any)[key] = q.value;
  await requestAIAsk();
}

function openDatePicker() {
  tempDate.value = collected.event_date || formatToday();
  showDatePicker.value = true;
}
function onDatePick(e: any) { tempDate.value = e.detail.value; }
function confirmDatePicker() {
  showDatePicker.value = false;
  if (!tempDate.value) return;
  collected.event_date = tempDate.value;
  pushUser('日期：' + tempDate.value);
  requestAIAsk();
}

async function doRecommend() {
  aiLoading.value = true;
  aiError.value = '';
  try {
    await requestAIAsk(false);
  } catch (e) {
    aiError.value = 'AI 服务暂不可用，请切换到「选方案提交」Tab';
  } finally {
    aiLoading.value = false;
  }
}

// 任务 C：3 轮后仍有必填缺失 → 最小化兜底表单
function showFallback() {
  aiPhase.value = 'fallback';
  const fields: FallbackField[] = FOLLOWUP_QUESTIONS
    .filter(q => !(collected as any)[q.key])
    .map(q => ({
      key: q.key,
      label: q.label.replace(/^[①②③]\s*/, ''),
      options: q.options,
    }));
  pushAI('我还需要以下信息（必填）：', 'fallback', { fallbackFields: fields });
}
function onFallbackPick(key: string, value: string) {
  (collected as any)[key] = value;
}
async function onFallbackSubmit() {
  const summary = buildRecommendPrompt();
  if (summary) pushUser('补充信息：' + summary);
  await doRecommend();   // 用已有信息直接匹配
}

// 任务 B：粘贴聊天记录 → 信息提取预览
function enterPasteMode() { pasteMode.value = true; pasteText.value = ''; }
function cancelPaste() { pasteMode.value = false; pasteText.value = ''; }
async function handlePaste() {
  const text = pasteText.value.trim();
  if (!text) { uni.showToast({ title: '请先粘贴聊天记录', icon: 'none' }); return; }
  pasteMode.value = false;
  pushUser('（已粘贴微信聊天记录）');
  extractInto(text);
  aiPhase.value = 'extract';
  pushAI('AI 已识别以下信息，请确认：', 'extract', { extract: buildExtractRows() });
}
async function onExtractConfirm() {
  aiPhase.value = 'chat';
  await continueFlow();
}
function onExtractMore() {
  aiPhase.value = 'chat';
  askQuestion();
}
function onExtractFill(row: ExtractRow) {
  aiPhase.value = 'chat';
  const q = FOLLOWUP_QUESTIONS.find(x => x.key === row.key);
  if (q) askQuestion(q);
}

function buildAIConversation(): AIAskConversationItem[] {
  return aiMessages.value
    .filter(msg => msg.text && msg.kind !== 'plans' && msg.kind !== 'fallback' && msg.kind !== 'extract')
    .map(msg => ({
      role: msg.role,
      content: msg.text,
    }));
}

function toCollectedKey(field: string): CollectedKey {
  const map: Record<string, CollectedKey> = {
    performance_type: 'event_type',
    activity_type: 'biz_type',
    audience_count: 'audience_count',
    budget: 'budget_label',
    event_date: 'event_date',
  };
  return map[field] || 'budget_label';
}

function questionProgress(fieldKey: CollectedKey): string {
  if (fieldKey === 'audience_count') return '①/③';
  if (fieldKey === 'budget_label') return '②/③';
  if (fieldKey === 'event_date') return '③/③';
  return `${Math.min(askedCount.value + 1, 3)}/③`;
}

function toQuickReplies(options: string[] = []): QuickReply[] {
  return options.map(label => ({ label, value: label }));
}

function showAIPlans(plans: AIRecommendResult) {
  const list: AIPlanOption[] = [plans.budget, plans.recommended, plans.upgrade];
  pushAI('收到，根据你提供的信息，为你推荐以下三档方案：', 'text');
  pushAI('', 'plans', { plans: list });
  aiPhase.value = 'done';
}

function handleAskResult(data: AIAskResponse) {
  if (data.action === 'recommend') {
    showAIPlans(data.plans);
    return;
  }

  if (askedCount.value >= 3) {
    showFallback();
    return;
  }

  const fieldKey = toCollectedKey(data.field);
  const quickReplies = toQuickReplies(data.options);
  askedCount.value++;
  aiPhase.value = 'chat';
  pushAI(data.question, 'question', {
    progress: questionProgress(fieldKey),
    fieldKey,
    quickReplies,
    dateTrigger: fieldKey === 'event_date' && quickReplies.length === 0,
  });
}

async function requestAIAsk(manageLoading = true) {
  if (manageLoading) aiLoading.value = true;
  aiError.value = '';
  try {
    const res = await askAI({ conversation: buildAIConversation() });
    if (res.ok && res.data) {
      handleAskResult(res.data);
    } else {
      aiError.value = res.error || 'AI 服务暂不可用，请切换到「选方案提交」Tab';
    }
  } catch {
    aiError.value = 'AI 服务暂不可用，请切换到「选方案提交」Tab';
  } finally {
    if (manageLoading) aiLoading.value = false;
  }
}

// ── 消息辅助 ──
function pushUser(text: string) {
  aiMessages.value.push({ id: uid(), role: 'user', text });
  scrollToBottom();
}
function pushAI(text: string, kind: AIMessage['kind'] = 'text', extra: Partial<AIMessage> = {}) {
  aiMessages.value.push({ id: uid(), role: 'ai', text, kind, ...extra });
  scrollToBottom();
}
function scrollToBottom() {
  nextTick(() => {
    const last = aiMessages.value[aiMessages.value.length - 1];
    if (last) aiScrollInto.value = 'msg-' + last.id;
  });
}

// ── 信息提取 ──
function buildExtractRows(): ExtractRow[] {
  const defs: { key: keyof typeof collected; label: string }[] = [
    { key: 'event_type', label: '演出类型' },
    { key: 'biz_type', label: '活动类型' },
    { key: 'audience_count', label: '人数' },
    { key: 'budget_label', label: '预算' },
    { key: 'event_date', label: '日期' },
  ];
  return defs.map(d => {
    const v = (collected as any)[d.key] || '';
    return { key: d.key, label: d.label, value: v, ok: !!v };
  });
}

function extractInto(text: string) {
  const t = text || '';
  const et = extractEventType(t); if (et) collected.event_type = et;
  const bt = extractBizType(t); if (bt) collected.biz_type = bt;
  const au = extractAudience(t); if (au) collected.audience_count = au;
  const bd = extractBudget(t); if (bd) collected.budget_label = bd;
  const dt = extractDate(t); if (dt) collected.event_date = dt;
}
function extractEventType(t: string): string {
  if (/脱口秀/.test(t)) return '脱口秀';
  if (/即兴/.test(t)) return '即兴喜剧';
  if (/漫才/.test(t)) return '漫才';
  if (/新喜剧|实验喜剧|sketch/i.test(t)) return '新喜剧';
  if (/魔术/.test(t)) return '魔术喜剧';
  if (/亲子/.test(t)) return '亲子喜剧';
  return '';
}
function extractBizType(t: string): string {
  if (/年会/.test(t)) return '企业年会';
  if (/团建/.test(t)) return '团队建设';
  if (/婚礼|婚庆|结婚/.test(t)) return '婚礼演出';
  if (/品牌|发布会|答谢|冠名/.test(t)) return '品牌活动';
  return '';
}
function extractAudience(t: string): string {
  const m = t.match(/(\d{1,4})\s*[-~到至]\s*(\d{1,4})\s*人/);
  if (m) return `${m[1]}-${m[2]}人`;
  const s = t.match(/(\d{2,5})\s*人/);
  if (s) {
    const n = Number(s[1]);
    if (n < 50) return '50人以下';
    if (n <= 100) return '50-100人';
    if (n <= 300) return '100-300人';
    if (n <= 500) return '300-500人';
    return '500人以上';
  }
  return '';
}
function extractBudget(t: string): string {
  if (/两万以上|2\s*万以上|2万\+|20000|2万以[上外]/.test(t)) return '2万以上';
  if (/1\s*万\s*[-~到至]\s*2\s*万|1-2万|10000-?20000/.test(t)) return '1万-2万';
  if (/5\s*千\s*[-~到至]\s*1\s*万|5千-?1万|5000-?10000/.test(t)) return '5千-1万';
  if (/5\s*千以内|5千以下|不到5千|5000以内|低于5千/.test(t)) return '5千以内';
  const wan = t.match(/(\d+(?:\.\d+)?)\s*万/);
  if (wan) {
    const v = Number(wan[1]);
    if (v >= 2) return '2万以上';
    if (v >= 1) return '1万-2万';
    if (v >= 0.5) return '5千-1万';
    return '5千以内';
  }
  const qian = t.match(/(\d{3,5})\s*(元|块|￥|¥)/);
  if (qian) {
    const v = Number(qian[1]);
    if (v >= 20000) return '2万以上';
    if (v >= 10000) return '1万-2万';
    if (v >= 5000) return '5千-1万';
    return '5千以内';
  }
  return '';
}
function extractDate(t: string): string {
  const m1 = t.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日?/);
  if (m1) return `${new Date().getFullYear()}-${pad2(m1[1])}-${pad2(m1[2])}`;
  const m2 = t.match(/(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})/);
  if (m2) return `${m2[1]}-${pad2(m2[2])}-${pad2(m2[3])}`;
  return '';
}
function formatToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function buildRecommendPrompt(): string {
  const parts: string[] = [];
  if (collected.biz_type) parts.push(collected.biz_type);
  if (collected.event_type) parts.push(collected.event_type);
  parts.push('演出');
  if (collected.audience_count) parts.push('人数' + collected.audience_count);
  if (collected.budget_label) parts.push('预算' + collected.budget_label);
  if (collected.event_date) parts.push('日期' + collected.event_date);
  return parts.join('，');
}

// 点击 AI 推荐卡片 → 进入「选方案提交」配置器，并预填级别/时长供进一步调整
async function selectAIPlan(plan: AIPlanOption) {
  if (!plan.sku_id) {
    uni.showToast({ title: '该方案暂无可配置方案', icon: 'none' });
    return;
  }
  submitMode.value = 'sku';
  form.sku_id = plan.sku_id;
  skuId.value = plan.sku_id;
  await loadSkuDetail(plan.sku_id, plan.tier, plan.duration);
  uni.showToast({ title: '已载入方案，可调整后提交', icon: 'none' });
}

onMounted(() => {
  aiMessages.value = [{
    id: uid(),
    role: 'ai',
    kind: 'text',
    text: '你好！请描述你的演出需求，例如：「年会想搞个脱口秀，300人，预算1万内」，AI 会先确认关键信息再为你配三档方案。也可以点「📋 粘贴记录」识别微信聊天记录。',
  }];
});
</script>

<style lang="scss" scoped>
.demand-submit-page {
  min-height: 100vh;
  background: $color-bg-page;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: $nav-bar-height;
  background: $color-bg-card;
  position: relative;
  border-bottom: 1rpx solid $color-divider;
  .nav-left {
    position: absolute;
    left: $space-md;
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: $text-base;
    color: $color-text-primary;
  }
  .nav-title { font-size: $text-lg; font-weight: 600; color: $color-text-primary; }
  .nav-right {
    position: absolute;
    right: $space-md;
    .nav-draft { font-size: $text-base; color: $color-primary; }
  }
}

// 待处理提示
.pending-alert {
  margin: $space-md $space-base 0;
  background: $color-primary-bg;
  border-radius: $radius-md;
  padding: $space-md;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .pending-text { font-size: $text-base; color: $color-primary; }
  .pending-action { font-size: $text-base; color: $color-primary; font-weight: 500; }
}

.form-scroll {
  flex: 1;
}

.form-card {
  margin: $space-md $space-base 0;
  background: $color-bg-card;
  border-radius: $radius-lg;
  padding: $space-lg;
  box-shadow: $shadow-md;

  .card-title {
    font-size: $text-md;
    font-weight: 600;
    color: $color-text-primary;
    display: block;
    margin-bottom: 8rpx;
  }
}

.form-field {
  padding: $space-md 0;
  border-bottom: 1rpx solid $color-divider;
  &:last-child { border-bottom: none; padding-bottom: 0; }
  &:first-child { padding-top: 0; }
}

.form-label {
  font-size: $text-base;
  color: $color-text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

.form-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  .select-value {
    font-size: $text-md;
    color: $color-text-placeholder;
    &.selected { color: $color-text-primary; }
  }
}

.form-input {
  height: 96rpx;
  width: 100%;
  font-size: $text-md;
  color: $color-text-primary;
  border: none;
  outline: none;
  background: transparent;
}

.form-textarea {
  width: 100%;
  font-size: $text-md;
  color: $color-text-primary;
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
  background: $color-bg-card;
  display: flex;
  gap: $space-md;
  padding: $space-md $space-base;
  padding-bottom: calc(#{$space-md} + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.06);

  .btn-draft {
    flex-shrink: 0;
    padding: 0 40rpx;
    height: 80rpx;
    border-radius: $radius-full;
    border: 2rpx solid $color-border;
    background: transparent;
    color: $color-text-secondary;
    font-size: $text-base;
    line-height: 80rpx;
    text-align: center;
  }

  .btn-submit {
    flex: 1;
    height: 80rpx;
    border-radius: $radius-full;
    border: none;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $text-md;
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
  padding: $space-md $space-base 48rpx;
  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-md;
    .picker-cancel, .picker-confirm { font-size: $text-base; color: $color-primary; }
    .picker-cancel { color: $color-text-tertiary; }
    .picker-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; }
  }
  .picker-options { display: flex; flex-direction: column; gap: $space-sm; }
  .picker-option {
    padding: $space-md;
    border-radius: $radius-md;
    font-size: $text-base;
    color: $color-text-primary;
    background: $color-bg-page;
    border: 2rpx solid $color-border;
    text-align: center;
    &.active { border-color: $color-primary; background: $color-primary-bg; color: $color-primary; font-weight: 600; }
  }
}

// ── SKU 自定义配置区 ──
.sku-config-section {
  margin: $space-md $space-base 0;
  background: $color-bg-card;
  border-radius: $radius-lg;
  padding: $space-lg;
  border-left: 6rpx solid $color-primary;
  box-shadow: $shadow-md;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-sm;
  .config-sku-name {
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
  }
  .config-default-hint {
    font-size: $text-sm;
    color: $color-primary;
    padding: 4rpx 16rpx;
    border: 1rpx solid $color-primary;
    border-radius: $radius-full;
  }
}

.config-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-md;
  .status-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
  .status-text-custom {
    font-size: $text-sm;
    color: $color-primary;
    font-weight: 500;
  }
  .toggle-btn {
    font-size: $text-sm;
    color: $color-primary;
    background: $color-primary-bg;
    border: none;
    padding: 8rpx $space-md;
    border-radius: $radius-full;
    line-height: 1.4;
  }
}

// 默认配置展示
.default-config {
  .config-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-sm 0;
    border-bottom: 1rpx dashed $color-divider;
    &:last-child { border-bottom: none; }
    .cl { font-size: $text-base; color: $color-text-secondary; }
    .cv { font-size: $text-base; color: $color-text-primary; font-weight: 500; }
  }
}

// 自定义配置区
.custom-config {
  .config-group {
    margin-bottom: $space-md;
    &:last-child { margin-bottom: 0; }
  }
  .group-title {
    font-size: $text-base;
    font-weight: 600;
    color: $color-text-primary;
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
  padding: $space-md;
  border-radius: $radius-md;
  background: $color-bg-page;
  border: 2rpx solid $color-border;
  transition: all 0.2s;
  min-height: 44px;
  &.active {
    border-color: $color-primary;
    background: $color-primary-bg;
    .tier-name, .tier-price { color: $color-primary; font-weight: 600; }
  }
  .tier-name {
    font-size: $text-base;
    color: $color-text-primary;
  }
  .tier-price {
    font-size: $text-sm;
    color: $color-text-secondary;
  }
}

.tier-detail {
  margin-top: 12rpx;
  padding: $space-sm $space-md;
  background: $color-primary-bg;
  border-radius: $radius-sm;
  .td-text {
    font-size: $text-sm;
    color: $color-primary;
    display: block;
  }
  .td-scene {
    font-size: $text-xs;
    color: $color-text-tertiary;
    margin-top: 4rpx;
    display: block;
  }
}

// 时长选项
.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
}

.duration-item {
  padding: $space-sm $space-lg;
  border-radius: $radius-full;
  background: $color-bg-page;
  border: 2rpx solid $color-border;
  font-size: $text-base;
  color: $color-text-primary;
  text-align: center;
  transition: all 0.2s;
  min-height: 44px; // 触控 ≥44px
  display: flex;
  align-items: center;
  &.active {
    border-color: $color-primary;
    background: $color-primary;
    color: $color-text-inverse;
    font-weight: 600;
  }
}

// 价格预览
.price-preview {
  margin-top: $space-md;
  padding: $space-md;
  background: linear-gradient(135deg, #fef9f0, #fdf5e6);
  border-radius: $radius-md;
  text-align: center;
  .pp-label {
    font-size: $text-sm;
    color: $color-text-tertiary;
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
    font-size: $text-xs;
    color: $color-text-secondary;
    margin-top: 8rpx;
    display: block;
  }
}
// 提交方式 Tab
.submit-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  background: $color-bg-card;
  border-bottom: 1rpx solid $color-divider;
}

.submit-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: $radius-full;
  font-size: $text-base;
  color: $color-text-secondary;
  background: $color-bg-page;
  font-weight: 500;
  &.active {
    background: $color-primary;
    color: $color-text-inverse;
  }
  &:active { opacity: 0.85; }
}

// AI 聊天页
.ai-chat-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-chat-scroll {
  flex: 1;
  padding: 24rpx 32rpx;
}

.ai-message {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  &.user {
    flex-direction: row-reverse;
    .ai-bubble {
      background: $color-primary;
      color: $color-text-inverse;
      border-bottom-right-radius: 4rpx;
    }
  }
  &.ai .ai-bubble {
    background: $color-bg-card;
    color: $color-text-primary;
    border-bottom-left-radius: 4rpx;
  }
}

.ai-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 9999px;
  background: $color-primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.ai-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  .ai-bubble-text {
    font-size: $text-base;
    line-height: 1.5;
    display: block;
  }
  .ai-bubble-hint {
    font-size: $text-sm;
    color: $color-text-tertiary;
    margin-top: 8rpx;
    display: block;
  }
}

.ai-placeholder {
  margin-top: 60rpx;
  text-align: center;
  text {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}

.ai-chat-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $color-bg-card;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.06);
}

.ai-chat-input {
  flex: 1;
  height: 72rpx;
  background: $color-bg-page;
  border-radius: $radius-full;
  padding: 0 24rpx;
  font-size: $text-base;
  color: $color-text-primary;
  border: 2rpx solid $color-border;
}

.ai-chat-send {
  flex-shrink: 0;
  height: 72rpx;
  padding: 0 32rpx;
  border-radius: $radius-full;
  background: $color-primary;
  color: $color-text-inverse;
  font-size: $text-base;
  font-weight: 500;
  line-height: 72rpx;
  text-align: center;
  border: none;
  &:active { opacity: 0.85; }
}

// AI 生成中
.ai-loading {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 24rpx 0;
  padding: 20rpx 24rpx;
  background: $color-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  .ai-loading-text { font-size: $text-base; color: $color-text-secondary; }
}

// 三档推荐方案
.ai-plans { margin-top: 12rpx; }
.ai-plan-card {
  background: $color-bg-card;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-md;
  border-left: 6rpx solid $color-primary;
  &:active { opacity: 0.92; }
  &.recommended { border-left-color: #e67e22; }
  &.upgrade { border-left-color: #d4af37; }
}
.ai-plan-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  .ai-plan-badge {
    font-size: 22rpx;
    color: #fff;
    background: $color-primary;
    padding: 4rpx 14rpx;
    border-radius: 9999px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .ai-plan-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $color-text-primary;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.ai-plan-card.recommended .ai-plan-badge { background: #e67e22; }
.ai-plan-card.upgrade .ai-plan-badge { background: #d4af37; }
.ai-plan-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 12rpx;
  .ai-plan-meta-item { font-size: 24rpx; color: $color-text-secondary; }
}
.ai-plan-price {
  font-size: 40rpx;
  font-weight: 700;
  color: $color-primary;
  margin-bottom: 8rpx;
}
.ai-plan-reason {
  font-size: 24rpx;
  color: $color-text-secondary;
  line-height: 1.5;
  display: block;
}
.ai-plan-cta {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $color-primary;
  font-weight: 500;
}

// 降级提示
.ai-error {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #fef2f2;
  border-radius: $radius-md;
  border: 1rpx solid #fecaca;
  .ai-error-text {
    font-size: 26rpx;
    color: #dc2626;
    line-height: 1.5;
    display: block;
  }
  .ai-error-btn {
    margin-top: 16rpx;
    display: inline-block;
    font-size: 26rpx;
    color: $color-primary;
    font-weight: 500;
  }
}

// ── Phase 2: 多轮追问 / 信息提取 / 兜底表单 ──
// 放宽 AI 气泡宽度以容纳卡片
.ai-message.ai .ai-bubble { max-width: 86%; }

// 追问进度
.ai-progress {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $color-text-tertiary;
  display: block;
}

// 快捷回复
.ai-quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.ai-quick-reply {
  padding: 12rpx 24rpx;
  background: $color-primary-bg;
  color: $color-primary;
  border-radius: $radius-full;
  font-size: 24rpx;
  border: 2rpx solid $color-primary-light;
  &:active { opacity: 0.8; }
}
.ai-date-trigger {
  margin-top: 16rpx;
  display: inline-block;
  padding: 14rpx 28rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-md;
  font-size: 26rpx;
  &:active { opacity: 0.85; }
}

// 推荐方案内联
.ai-plans-inline { margin-top: 12rpx; width: 100%; }

// 信息提取预览
.ai-extract {
  margin-top: 12rpx;
  width: 100%;
  background: $color-bg-page;
  border-radius: $radius-md;
  padding: 16rpx;
}
.extract-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx dashed $color-divider;
  &:last-of-type { border-bottom: none; }
  .extract-label { font-size: 24rpx; color: $color-text-secondary; width: 120rpx; flex-shrink: 0; }
  .extract-value { font-size: 24rpx; color: $color-text-primary; font-weight: 500; flex: 1; }
  .extract-value.missing { color: $state-warning; }
  .extract-fill { font-size: 24rpx; color: $color-primary; font-weight: 500; }
}
.extract-actions { display: flex; gap: 16rpx; margin-top: 16rpx; }
.extract-confirm, .extract-more {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: $radius-full;
  font-size: 26rpx;
  border: none;
}
.extract-confirm { background: $color-primary; color: #fff; }
.extract-more { background: $color-primary-bg; color: $color-primary; }

// 兜底最小化表单
.ai-fallback {
  margin-top: 12rpx;
  width: 100%;
  background: var(--state-warning-bg);
  border: 1rpx solid #fde68a;
  border-radius: $radius-md;
  padding: 20rpx;
}
.fallback-field { margin-bottom: 20rpx; &:last-of-type { margin-bottom: 0; } }
.fallback-label { font-size: 26rpx; color: $color-text-primary; font-weight: 600; display: block; margin-bottom: 12rpx; }
.fallback-options { display: flex; flex-wrap: wrap; gap: 12rpx; }
.fallback-option {
  padding: 12rpx 24rpx;
  background: #fff;
  border: 2rpx solid $color-border;
  border-radius: $radius-full;
  font-size: 24rpx;
  color: $color-text-primary;
  &.active { border-color: $color-primary; background: $color-primary; color: #fff; font-weight: 600; }
}
.fallback-submit {
  margin-top: 8rpx;
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: 28rpx;
  border: none;
}

// 粘贴记录模式
.ai-paste-bar {
  background: $color-bg-card;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.06);
}
.ai-paste-area {
  width: 100%;
  height: 200rpx;
  background: $color-bg-page;
  border-radius: $radius-md;
  padding: 20rpx;
  font-size: 26rpx;
  color: $color-text-primary;
  border: 2rpx solid $color-border;
  box-sizing: border-box;
}
.ai-paste-actions { display: flex; gap: 16rpx; margin-top: 16rpx; }
.ai-paste-cancel, .ai-paste-confirm {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: $radius-full;
  font-size: 26rpx;
  border: none;
}
.ai-paste-cancel { background: $color-bg-page; color: $color-text-secondary; }
.ai-paste-confirm { background: $color-primary; color: #fff; }

// 输入栏粘贴按钮
.ai-paste-toggle {
  flex-shrink: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-full;
  background: $color-primary-bg;
  color: $color-primary;
  font-size: 32rpx;
  line-height: 72rpx;
  text-align: center;
  border: none;
  padding: 0;
}

// 日期选择器触发
.date-picker-native { width: 100%; }
.date-pick-trigger {
  margin: 24rpx 0;
  padding: 28rpx;
  background: $color-bg-page;
  border-radius: $radius-md;
  text-align: center;
  font-size: 30rpx;
  color: $color-text-primary;
}
</style>
