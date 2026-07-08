# 演立方 YANLI · UI/UX 全面审查报告

> 审查日期：2026-07-08
> 审查范围：小程序 7 页 + PC 端 6 页 = 13 个页面
> 对照基准：设计预览 19 Section + 演立方设计系统 V2.0 规范
> 审查人：SOLO Design Agent

---

## 总览评分

| 检查维度 | 评分 | 说明 |
|:---------|:----:|:-----|
| A. 布局（8px 网格） | **C+** | 小程序较好，PC 端大量非标间距 |
| B. 品牌合规 | **A-** | 禁用词/品牌名零违规；绿色 token 值偏差 |
| C. 组件一致性 | **B-** | Card borderRadius 系统性偏低；按钮圆角不统一 |
| D. 字体 | **B-** | 等宽字体基本到位；全局缺 PingFang SC |
| E. 状态覆盖 | **D** | 全产品线缺少 Loading/Error 状态，最大短板 |

---

## 一、严重问题（必须修复）

### 1.1 全局 font-family 缺少 PingFang SC

**影响范围**：小程序全局 + PC 端全局 + 4/6 PC 页面

| 文件 | 行号 | 问题 |
|:-----|:-----|:-----|
| `miniprogram/src/styles/global.scss` | 4 | `font-family: -apple-system, BlinkMacSystemFont, ...` 缺少 `PingFang SC` |
| `miniprogram/src/styles/variables.scss` | 36 | `$font-family` 定义中缺少 `PingFang SC` |
| `frontend-agent/src/index.css` | 2 | `font-family: -apple-system, BlinkMacSystemFont, ...` 缺少 `PingFang SC` |
| `frontend-agent/src/pages/LandingPage.tsx` | 19 | `fontFamily: 'Inter, PingFang SC'` — Inter 排在 PingFang SC 前面 |
| `frontend-agent/src/pages/SkuBrowse.tsx` | 70 | 同上，Inter 排序错误 |
| `frontend-agent/src/pages/supplier/DailyReport.tsx` | — | 无页面级 fontFamily 声明 |
| `frontend-agent/src/pages/supplier/SalesWarRoom.tsx` | — | 同上 |
| `frontend-agent/src/pages/supplier/SkuManage.tsx` | — | 同上 |
| `frontend-agent/src/pages/supplier/ProfitDashboard.tsx` | — | 同上 |

**修复方案**：全局 `font-family` 改为 `'PingFang SC', Inter, -apple-system, sans-serif`

---

### 1.2 $color-success 与规范不一致

| 文件 | 行号 | 实际值 | 规范值 |
|:-----|:-----|:-------|:-------|
| `miniprogram/src/styles/variables.scss` | 24 | `$color-success: #10b981` | `#16a34a` |

**关联影响**：`discover/index.vue:567` 使用了非标准绿 `#059669`，`sku/list/index.vue:256` 也使用了 `#059669`（独立艺人标签）。三处绿色值不统一。

**修复方案**：统一 `$color-success` 为 `#16a34a`，全局搜索替换 `#059669` 和 `#10b981`

---

### 1.3 user/index.vue 未定义变量导致运行时报错

| 文件 | 行号 | 问题 |
|:-----|:-----|:-----|
| `miniprogram/src/pages/user/index.vue` | 68-78 | 模板引用 `recentOrders`、`orderTab`、`goOrders`、`goOrderDetail`，但 `<script>` 中未声明 |

**修复方案**：在 script 中声明这些响应式变量和方法，或移除模板中对应区块

---

### 1.4 sku/detail 双套底部操作栏

| 文件 | 行号 | 问题 |
|:-----|:-----|:-----|
| `miniprogram/src/pages/sku/detail/index.vue` | 71-85 | `fixed-bottom`（CfNavBar 带的）和 `detail-bottom-bar` 两套底部操作栏并存 |

**修复方案**：只保留一套底部操作栏，删除冗余的 `fixed-bottom` 或 `detail-bottom-bar`

---

### 1.5 全产品线缺少 Loading/Error 状态

| 文件 | Loading | Empty | Error |
|:-----|:-------|:------|:------|
| `discover/index.vue` | 缺失 | 部分有（历史需求） | 缺失 |
| `request/submit/index.vue` | 缺失 | 部分有（SKU空） | 缺失 |
| `sku/list/index.vue` | 缺失 | 缺失 | 缺失 |
| `sku/detail/index.vue` | 缺失 | 部分有（阵容空） | 缺失 |
| `message/index.vue` | 缺失 | 缺失 | 缺失 |
| `user/index.vue` | 缺失 | 缺失 | 缺失 |
| `orders/index.vue` | 缺失 | 缺失 | 缺失 |
| `LandingPage.tsx` | 缺失 | 缺失 | 缺失 |
| `SkuBrowse.tsx` | 缺失 | 缺失 | 缺失 |
| `DailyReport.tsx` | 缺失 | 缺失 | 缺失 |
| `SalesWarRoom.tsx` | 缺失 | 缺失 | 缺失 |
| `SkuManage.tsx` | 缺失 | Ant默认空状态 | 缺失 |
| `ProfitDashboard.tsx` | 缺失 | 缺失 | 缺失 |

**修复方案**：每个页面至少添加 Skeleton 加载态 + 自定义 Empty 组件 + ErrorBoundary

---

## 二、高优先级问题

### 2.1 Card borderRadius 系统性偏差

设计规范要求 Card `border-radius: 12px`，实际实现普遍偏低：

| 文件 | 行号 | 实际值 | 规范值 |
|:-----|:-----|:-------|:-------|
| `LandingPage.tsx` | 79 | `8px` | `12px` |
| `SkuBrowse.tsx` | 76 | `8px` | `12px` |
| `SkuBrowse.tsx` | 88 | `8px` | `12px` |
| `SalesWarRoom.tsx` | — | 未设置（Ant 默认 8px） | `12px` |
| `SkuManage.tsx` | — | 未设置（Ant 默认 8px） | `12px` |
| `ProfitDashboard.tsx` | — | 未设置（Ant 默认 8px） | `12px` |

**修复方案**：在 Ant Design `ConfigProvider` 的 `theme` 中设置 `borderRadius: 12`，全局生效

---

### 2.2 按钮圆角不统一

设计规范要求按钮 `border-radius: 8px`，但多处使用药丸形：

| 文件 | 行号 | 实际值 | 规范值 |
|:-----|:-----|:-------|:-------|
| `miniprogram/.../request/submit/index.vue` | 388 | `$radius-full`（药丸） | `8px` |
| `miniprogram/.../sku/detail/index.vue` | 248 | `$radius-full` | `8px` |
| `miniprogram/.../orders/index.vue` | 283, 298 | `$radius-full` | `8px` |
| `frontend-agent/.../SalesWarRoom.tsx` | 209 | emoji 作为 UI 文本 | 应替换为图标组件 |

---

### 2.3 非标准颜色使用

**PC 端灰色文字不统一**：

| 颜色值 | 使用位置 | 规范对应 |
|:-------|:---------|:---------|
| `#4b5563` | LandingPage:40, SkuBrowse:162, DailyReport 洞察正文 | 无此 token（应用 `--text-sec: #6b7280`） |
| `#6b7280` | SalesWarRoom:187, ProfitDashboard 多处 | 偏差（规范辅助文字为 `--text-sec: #6b7280`，此处合规但与 `#4b5563` 并存） |
| `#111827` | global.scss:$color-gray-900 | 规范正文色为 `--text: #1a1a2e` |

**PC 端背景色不统一**：

| 颜色值 | 使用位置 | 规范对应 |
|:-------|:---------|:---------|
| `#f5f5f5` | index.css:2 | 偏差（规范 `--bg: #f5f5f7`） |
| `#f6f7fb` | SkuBrowse:70 | 非标准色 |
| `#f9fafb` | SkuBrowse:43, SalesWarRoom:121,127 | `--surface-sub` |

**SalesWarRoom 优先级红色**：

| 文件 | 行号 | 实际值 | 规范值 |
|:-----|:-----|:-------|:-------|
| `SalesWarRoom.tsx` | 83 | `#dc2626` | `--red: #ef4444` |

---

### 2.4 px 与 rpx 混用（小程序）

| 文件 | 行号 | 问题 |
|:-----|:-----|:-----|
| `request/submit/index.vue` | 265, 313 | `border-radius: 9999px`（应为 `9999rpx`） |
| `sku/list/index.vue` | 251 | `border-radius: 9999px` |
| `sku/detail/index.vue` | 234 | `border-radius: 9999px` |

**修复方案**：统一使用 SCSS 变量 `$radius-full` 或 `9999rpx`

---

### 2.5 间距偏离 8px 网格

**PC 端高频违规值**（按出现次数排序）：

| 偏差值 | 出现次数 | 涉及文件 | 应改为 |
|:-------|:---------|:---------|:-------|
| `10px` | 12 次 | LandingPage(3), SkuBrowse(3), DailyReport(4), ProfitDashboard(1), SalesWarRoom(1) | `8px` 或 `12px` |
| `14px` | 6 次 | LandingPage(1), SkuBrowse(1), DailyReport(1), SalesWarRoom(3) | `12px` 或 `16px` |
| `6px` | 7 次 | SkuBrowse(1), DailyReport(3), SalesWarRoom(3) | `4px` 或 `8px` |
| `18px` | 5 次 | LandingPage(2), DailyReport(1), SkuBrowse(1), ProfitDashboard(1) | `16px` 或 `20px` |
| `2px/3px` | 5 次 | DailyReport(3), SkuBrowse(1), ProfitDashboard(1) | `4px` |

**小程序高频违规值**：

| 偏差值 | 出现次数 | 涉及文件 | 应改为 |
|:-------|:---------|:---------|:-------|
| `28rpx`(14px) | 2 次 | discover(2) | `24rpx` 或 `32rpx` |
| `10rpx`(5px) | 2 次 | discover(2) | `8rpx` 或 `16rpx` |
| `14rpx`(7px) | 2 次 | discover(1), request(1) | `12rpx` 或 `16rpx` |
| `22rpx`(11px) | 1 次 | request(1) | `20rpx` 或 `24rpx` |

---

## 三、中优先级问题

### 3.1 价格缺少等宽字体

| 文件 | 行号 | 位置 | 问题 |
|:-----|:-----|:-----|:-----|
| `sku/list/index.vue` | 216-220 | `.sku-list-page__card-price` | 主价格无 `JetBrains Mono` |
| `sku/detail/index.vue` | 210 | `.sku-detail-page__price` | 页面最重要的价格无等宽字体 |
| `orders/index.vue` | 269-271 | `.won-card__stat-value` | 成交统计数值无等宽字体 |
| `message/index.vue` | — | 消息中包含价格信息 | 无等宽字体 |

---

### 3.2 全局主文本色不一致

| 文件 | 行号 | 实际值 | 规范值 |
|:-----|:-----|:-------|:-------|
| `global.scss` | 6 | `color: #374151` | `--text: #1a1a2e` |

`#374151`（gray-700）比规范 `#1a1a2e` 偏灰，视觉对比度不足。

---

### 3.3 DailyReport 组件圆角偏差

| 文件 | 行号 | 组件 | 实际值 | 规范值 |
|:-----|:-----|:-----|:-------|:-------|
| `DailyReport.tsx` | 141 | 成交庆祝卡片 | `16px` | `12px`（Card） |
| `DailyReport.tsx` | 167 | "查看完整订单" 按钮 | `4px` | `8px`（Button） |
| `DailyReport.tsx` | 195 | 漏斗容器 | `10px` | `8px` 或 `12px` |

---

### 3.4 SkuBrowse 筛选按钮圆角

| 文件 | 行号 | 实际值 | 规范值 |
|:-----|:-----|:-------|:-------|
| `SkuBrowse.tsx` | 160 | `6px` | `4px` 或 `8px` |

---

### 3.5 硬编码颜色值（统计）

小程序端约 30+ 处硬编码颜色（如 `#fff`、`#9ca3af`、`#f5f3ff` 等），应使用 SCSS 变量。PC 端约 20+ 处内联颜色，应使用 CSS 变量或 Ant Design token。

---

## 四、通过项

### 4.1 禁用词扫描

| 检查范围 | 结果 |
|:---------|:-----|
| 小程序 7 页 + 全局样式 | **零违规** |
| PC 端 6 页 + 全局样式 | **零违规** |
| 搜索词汇 | 赋能/闭环/一站式/生态/CRM/票务/厂牌/沉淀/工作流 |

---

### 4.2 品牌名称一致性

| 检查范围 | 结果 |
|:---------|:-----|
| 全部 13 个页面 | **通过** — 统一使用「演立方」 |
| LandingPage 品牌区 | `演立方 YANLI` — 通过 |
| SkuBrowse | `演立方 YANLI · 商演找演立方` — 通过 |
| 未发现变体 | 无「演立坊」等错误写法 |

---

### 4.3 品牌主色使用

| 色值 | 使用情况 |
|:-----|:---------|
| `#7c3aed`（主品牌紫） | 全部 13 个页面正确使用，Ant ConfigProvider 配置正确 |

---

### 4.4 等宽字体（价格/数字）

| 通过项 | 文件 |
|:-------|:-----|
| discover 首页价格 | `font-family: 'JetBrains Mono', monospace` |
| request/submit 方案价格 + SKU 价格 | 通过 |
| sku/detail 阶梯价格 | 通过 |
| user 个人中心统计 | 通过 |
| orders 订单价格 | 通过 |
| LandingPage | 通过 |
| SkuBrowse | 通过 |
| DailyReport KPI + 金额 | 通过 |
| SalesWarRoom 方案价格 | 通过 |
| SkuManage 标准价 + 渠道价 | 通过 |
| ProfitDashboard 全部数值 | 通过 |

---

### 4.5 小程序 BEM 命名与变量使用

`sites/sku/list`、`message`、`orders` 三页全面使用 `$space-*` / `$text-*` SCSS 变量和 BEM 命名规范，代码质量最高。

---

## 五、逐页审查清单

### 小程序（7 页）

| 页面 | 布局 | 品牌色 | 字体 | 组件 | 状态 | 总评 |
|:-----|:----:|:------:|:----:|:----:|:----:|:----:|
| #mp-home discover/index.vue | B | B | B+ | B | D | B- |
| #mp-demand request/submit | B+ | B | B | B- | C- | B |
| #mp-find sku/list | A- | B | C | A- | D | B- |
| #mp-sku sku/detail | A- | A- | B- | B | C | B |
| #mp-msg message | A | A | C | A | D | B- |
| #mp-mine user | B- | B | B | A | D | **C+** (运行时报错) |
| #mp-order orders | A | A | B | B | C- | B+ |

### PC 端（6 页）

| 页面 | 布局 | 品牌色 | 字体 | 组件 | 状态 | 总评 |
|:-----|:----:|:------:|:----:|:----:|:----:|:----:|
| #pc-home LandingPage | C | B | C | B- | D | C+ |
| #pc-list SkuBrowse | C | B- | C | C | D | C |
| #daily DailyReport | C | B+ | B | C+ | D | C+ |
| #war SalesWarRoom | B- | B | B- | B- | D | C+ |
| #sku SkuManage | A | A- | B | B- | D | B- |
| #profit ProfitDashboard | B | B | B | B- | D | B- |

---

## 六、Top 10 修复优先级

| # | 修复项 | 影响范围 | 优先级 | 工作量 |
|:-:|:-------|:---------|:------:|:------:|
| 1 | 全局 font-family 加入 PingFang SC | 全产品线 | P0 | 0.5h |
| 2 | `$color-success` 统一为 `#16a34a` | 小程序全局 | P0 | 0.5h |
| 3 | 修复 user/index.vue 未定义变量 | 小程序"我的"页 | P0 | 1h |
| 4 | 修复 sku/detail 双套底部栏 | SKU 详情页 | P0 | 0.5h |
| 5 | 全部 13 页添加 Loading/Empty/Error 状态 | 全产品线 | P1 | 3-5h |
| 6 | Ant ConfigProvider borderRadius: 12 | PC 端全局 | P1 | 0.5h |
| 7 | 统一灰色文字 token（消除 #4b5563 并存） | PC 端 | P1 | 1h |
| 8 | 间距全面对齐 8px 网格 | PC 端为主 | P2 | 2-3h |
| 9 | 补全 4 处价格等宽字体 | 小程序 3 页 | P2 | 0.5h |
| 10 | 消除 px/rpx 混用 | 小程序 3 页 | P2 | 0.5h |

---

## 七、设计规范 vs 实现 对照表

| 规范项 | 规范值 | 小程序实际 | PC 实际 | 结论 |
|:-------|:-------|:-----------|:---------|:-----|
| 主色 | `#7c3aed` | 通过 | 通过 | 一致 |
| 成交绿 | `#16a34a` | `#10b981`(偏差) + `#059669`(偏差) | 通过 | 需修复 |
| 错误红 | `#ef4444` | 通过 | `#dc2626`(war 页偏差) | 需修复 |
| 正文色 | `#1a1a2e` | `#374151`(偏差) | `#111827`/`#4b5563`(偏差) | 需修复 |
| 辅助文字 | `#6b7280` | 通过 | 通过(但与 #4b5563 并存) | 需统一 |
| 页面背景 | `#f5f5f7` | 通过 | `#f5f5f5`/`#f6f7fb`(偏差) | 需修复 |
| 中文字体 | PingFang SC | 缺失 | 缺失 | 需修复 |
| 数字字体 | JetBrains Mono | 9/11 处通过 | 6/6 通过 | 小程序补 2 处 |
| Card 圆角 | 12px | 8px(通过,小程序 $radius-md) | 8px(偏差) | PC 需修复 |
| Button 圆角 | 8px | 药丸形(偏差) | 8px(通过) | 小程序需修复 |
| Tag 圆角 | 4px | 通过 | 通过 | 一致 |
| 间距网格 | 8px 基准 | 大部分通过 | 大量偏差 | PC 需修复 |

---

*报告结束。以上问题均为审查发现，未修改任何源文件。*
