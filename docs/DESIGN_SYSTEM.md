# 演立方 YANLI · 设计系统 V2.0

> 品牌升级日期：2026-07-07
> 品牌：**演立方**（英文 YANLI / 全拼 YANLIFANG / 缩写 YLF）
> 定位语：**AI 商演成交机器**
> 副标题：**一句话需求，快速成交一场演出**
> 占位语：**商演找演立方**
> AI Agent：**小演**

---

## 品牌体系

| 资产 | 定义 |
|------|------|
| 主品牌 | 演立方 |
| 英文名 | YANLI（主）/ YANLIFANG（全拼）/ YLF（缩写） |
| 定位语 | AI 商演成交机器 |
| 副标题 | 一句话需求，快速成交一场演出 |
| 占位语 | 商演找演立方 |
| 品牌人格 | 商演行业的 AI 经纪人（小演） |
| 产品体系 | 演立方商演助手 / 小演 AI Agent / 演立方艺人工作台 / 演立方行业库 |

---

## 色彩系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--brand` | `#7c3aed` | 主品牌紫，CTA按钮/链接/强调 |
| `--brand-light` | `#a78bfa` | 紫浅，hover/背景 |
| `--brand-dark` | `#5b21b6` | 紫深，pressed/active |
| `--brand-50` | `#f5f3ff` | 紫极浅，标签/AI气泡 |
| `--green` | `#16a34a` | 成交绿，won状态 |
| `--amber` | `#f59e0b` | 警示，待跟进 |
| `--red` | `#ef4444` | 错误红 |
| `--blue` | `#3b82f6` | 信息蓝 |
| `--bg` | `#f5f5f7` | 页面底色 |
| `--surface` | `#ffffff` | 卡片白 |
| `--stage` | `#0f0f1a` | 舞台深色，成交庆祝 |
| `--text` | `#1a1a2e` | 正文 |
| `--text-secondary` | `#6b7280` | 辅助文字 |
| `--text-tertiary` | `#9ca3af` | 占位/禁用 |
| `--border` | `#e5e7eb` | 分割线 |

### 商机状态机配色

```
new(#9ca3af) → qualified(#3b82f6) → quoted(#7c3aed) → negotiating(#f59e0b) → pending_client(#ea580c) → won(#16a34a)
lost(#6b7280)
```

---

## 字体系统

| 层级 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| display | 36px | 1.25 | 800 | PC Web首屏大标题 |
| h1 | 28px | 1.25 | 700 | 页面主标题 |
| h2 | 24px | 1.25 | 700 | 区块标题 |
| h3 | 20px | 1.25 | 700 | 卡片标题 |
| body | 14px | 1.5 | 400 | 正文 |
| caption | 12px | 1.5 | 500 | 辅助说明 |
| micro | 10px | 1.5 | 400 | 极小标注 |

- 中文：PingFang SC / Source Han Sans CN
- 英文：Inter / Helvetica Neue
- 数字/金额：JetBrains Mono（等宽），font-weight 600

---

## 间距体系（8px 基准网格）

`4 / 8 / 12 / 16(标准) / 20 / 24 / 32 / 40 / 48 / 64px`

## 圆角 / 阴影

| 类型 | 值 | 用途 |
|------|-----|------|
| 圆角 xs | 4px | 标签 |
| 圆角 sm | 8px | 按钮 |
| 圆角 md | 12px | 卡片 |
| 圆角 lg | 16px | 弹窗 |
| 圆角 full | 9999px | 胶囊 |
| 阴影 sm | 0 1px 2px rgba(0,0,0,0.04) | 卡片悬浮 |
| 阴影 md | 0 4px 16px rgba(0,0,0,0.06) | 弹窗 |
| 阴影 lg | 0 8px 32px rgba(0,0,0,0.08) | 页面容器 |

---

## 组件体系（三层架构）

### 原子层
Button(5变体:主要/次要/文字/危险/禁用) / Tag(自营/成交/待跟进/丢单/第三方) / Badge / StatusDot / Divider / Spinner(立方体加载)

### 复合层
Card / PriceDisplay(等宽+千分位) / OpportunityBadge(状态自动映射) / SupplierBadge(自营紫/第三方灰) / StatCard / EmptyState / LoadingSkeleton / CelebrationCard(成交庆祝,深色舞台) / AIBubble(小演人格,品牌紫气泡)

### 业务层
RequirementInput(首屏核心,粘贴/语音/表单三入口) / SchemeCard(含供应商标识+价格+匹配度) / OpportunityCard(商机卡片,优先级+超时标记) / ChatBubble(小演AI对话) / QuickEntry(活动类型6宫格) / FilterPanel(左侧树形筛选) / PipelineBoard(三栏商机看板) / AIDailyBriefing(成交日报组件)

---

## 品牌动态语言

| 效果 | 用途 | 描述 |
|------|------|------|
| 聚光 | AI加载 | 紫色立方体+顶部聚光扫过，2-3s循环 |
| 舞台灯 | 成交庆祝 | 深色→浅绿渐变，弹跳✓文字，1.5s一次性 |
| 立方体 | AI入口 | 小演头像，慢速旋转+呼吸发光 |
| 黑紫舞台 | 大订单 | 深色底#0f0f1a+紫色光晕 |

---

## 交互规范

- 按钮 hover：background 变色 + 轻微上移 1px，150ms ease-out
- 卡片 hover：边框变 #f5f3ff + 阴影提升
- 状态变化：150ms 过渡
- 触控目标：PC ≥ 32px，移动 ≥ 44px
- 禁用词：赋能/闭环/一站式/生态/沉淀/工作流/CRM/票务/厂牌

---

## Design Token CSS

`docs/tokens/variables.css` — 完整变量定义（品牌色/组件/布局/动画）

---

## 资产清单

| 资产 | 位置 |
|------|------|
| Design Token CSS | `docs/tokens/variables.css` |
| 字体 Inter | Google Fonts / 项目已安装 |
| 字体 JetBrains Mono | Google Fonts / 项目已安装 |
| 组件库 Ant Design 6 | frontend-agent 依赖 |
| 组件库 Vant Weapp | 小程序依赖 |
| 图标 Ant Design Icons | Ant Design 内置 |
| 设计预览 19页 | `桌面/演立方设计预览/index.html` |
| 语音输入组件 | `miniprogram/src/components/CfVoiceInput.vue` |
| Supplier-Console 代码 | `frontend-agent/src/pages/supplier/` |
