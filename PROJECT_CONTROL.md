# 演立方 (YANLI) — 项目治理文件

## 一、项目范围

| 维度 | 定义 |
|:----|:-----|
| 品牌名 | 演立方（英文 YANLI / 全拼 YANLIFANG / 缩写 YLF） |
| 定位 | AI 商演成交机器 |
| 产品体系 | 演立方商演助手（小程序）←→ 小演 AI Agent ←→ 演立方艺人工作台（supplier-console）←→ 演立方行业库（平台） |
| Phase 1 核心 | supplier-console（内部成交工具）：AI成交日报 / 销售作战台 / SKU管理 / 利润看板 / 订单管理 |

## 二、技术架构

```
演立方 前端架构
├── supplier-console/          # React + Ant Design 6 + Vite
│   ├── src/
│   │   ├── components/        # 业务组件库
│   │   ├── pages/             # 页面
│   │   ├── tokens/            # Design Token (CSS Variables)
│   │   └── layouts/           # 布局模板
│   └── package.json
├── miniprogram/                # uni-app + Vue3 + Vant Weapp
├── frontend-web/               # Vite + React + Ant Design 6 (PC 活动公司端)
├── frontend-admin/             # Umi 4 + @umijs/max (平台管理员)
└── docs/                       # 设计文档
```

## 三、组件库体系（原子设计）

### 原子层（Atoms）
```
Button       — 5变体（主要/次要/文字/危险/禁用）
Tag          — 自营/成交/待跟进/丢单/第三方
Badge        — 数字角标
Icon         — 24px 线性 SVG 图标集
Avatar       — 企业/个人头像
StatusDot    — 绿/紫/琥珀/红/灰 状态点
Divider      — 分割线
Spinner      — 立方体加载动画
```

### 复合层（Molecules）
```
Card             — 通用卡片容器
Input            — 输入框（含微信粘贴模式）
Select           — 下拉选择器
PriceDisplay     — 价格展示（等宽字体+千分位）
OpportunityBadge — 商机状态胶囊（自动映射状态色）
SupplierBadge    — 自营/第三方标识
StatCard         — KPI 数据卡片
Timeline         — 时间线
EmptyState       — 空状态
LoadingSkeleton  — 骨架屏
CelebrationCard  — 成交庆祝卡（舞台深色模式）
BusinessFeedbackCard — 商业反馈卡
```

### 业务层（Organisms）
```
RequirementInput    — 首屏需求输入区（粘贴/语音/表单三入口）
SchemeCard          — 方案卡片（含供应商标识+价格+匹配度）
OpportunityCard     — 商机卡片（状态+优先级+超时标记）
ArtistCard          — 艺人卡片
OrderCard           — 订单卡片
ChatBubble          — AI对话气泡（小演人格+紫色气泡）
QuickEntry          — 活动类型快捷入口（6宫格）
FilterPanel         — 筛选面板（树形/标签）
PipelineBoard       — 商机看板（三栏+拖拽）
AIDailyBriefing     — AI成交日报组件
```

## 四、Design Token（2026-07-07 定版）

_更新路径：docs/tokens/_

| Token | 值 | 用途 |
|:------|:---|:-----|
| `--brand` | `#7c3aed` | 主品牌紫 |
| `--brand-light` | `#a78bfa` | 紫浅（hover/背景） |
| `--brand-dark` | `#5b21b6` | 紫深（pressed） |
| `--brand-50` | `#f5f3ff` | 紫极浅（标签/AI气泡） |
| `--green` | `#16a34a` | 成交绿 |
| `--amber` | `#f59e0b` | 警示 |
| `--red` | `#ef4444` | 错误 |
| `--blue` | `#3b82f6` | 信息 |
| `--stage` | `#0f0f1a` | 舞台深色 |

_完整 Token 见 docs/tokens/variables.css_

## 五、优先级路线图

```
Phase 0 (当前)   组件库搭建 + supplier-console 首批页面
  ├── Design Token 落地
  ├── 原子+复合组件库
  ├── AI成交日报（页面 #1）
  └── 销售作战台（页面 #2）

Phase 1 (第1周)  Supplier-Console 完整
  ├── SKU管理
  ├── 利润看板
  ├── 订单管理
  └── 艺人管理（简化版）

Phase 2 (第2周)  小程序端
  ├── 首页（微信粘贴入口）
  ├── 提需求（AI经纪人对话）
  ├── 找方案 + SKU详情
  └── 消息 + 我的 + 订单详情

Phase 3 (第3周)  PC Web + Platform-Admin
  ├── 品牌官网首页
  ├── PC找方案列表
  └── 平台管理数据看板
```

## 六、开发规范

1. 组件必须导出 TS 类型定义
2. 所有颜色引用 CSS 变量，禁止硬编码 hex
3. 每个组件必须包含 Loading / Empty / Error 三态
4. 触控目标 ≥ 44px（小程序）/ 32px（PC）
5. 中文字体 `PingFang SC`，等宽数字 `JetBrains Mono`
6. 禁止出现品牌禁用词：赋能/闭环/一站式/生态/沉淀/工作流/CRM

## 七、Penpot MCP 集成状态

| 项目 | 状态 | 说明 |
|:----|:----:|:-----|
| HTTP MCP 连接 | ✅ | 通过 nginx localhost:9001/mcp/stream |
| execute_code | ⚠️ | 浏览器 Plugin 需前台激活 |
| export_shape | ❌ | Plugin 不稳定，待修复 |
| 后端 API 暴露 | ❌ | 需修改 docker-compose 或 nginx 配置 |
| **替代方案** | ✅ | 直接建 HTML/CSS 预览 + 代码生成，绕过 Penpot 导出 |

## 八、AI Agent 规则

_详见 AGENT_RULES.md_
